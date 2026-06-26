import { spawn } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

export interface SandboxResult {
  verdict: 'ACCEPTED' | 'WRONG_ANSWER' | 'TIME_LIMIT_EXCEEDED' | 'MEMORY_LIMIT_EXCEEDED' | 'RUNTIME_ERROR' | 'COMPILATION_ERROR';
  executionTime?: number; // ms
  memoryUsed?: number;    // KB
  stdout?: string;
  stderr?: string;
  errorOutput?: string;
}

export class DockerSandbox {
  private tempDir: string;
  private imageTag = 'codearena-sandbox';

  constructor() {
    // Create the temporary directory inside the worker folder for reliable Docker mounts on Windows
    this.tempDir = path.join(__dirname, '../../temp');
    if (!fs.existsSync(this.tempDir)) {
      fs.mkdirSync(this.tempDir, { recursive: true });
    }
  }

  /**
   * Prepares execution files and returns the specific submission folder.
   */
  private prepareFiles(submissionId: string, code: string, language: string): string {
    const submissionPath = path.join(this.tempDir, `submission_${submissionId}`);
    if (!fs.existsSync(submissionPath)) {
      fs.mkdirSync(submissionPath, { recursive: true });
    }
    const ext = language === 'python' ? 'py' : language === 'c' ? 'c' : 'cpp';
    fs.writeFileSync(path.join(submissionPath, `solution.${ext}`), code);
    return submissionPath;
  }

  /**
   * Cleans up files.
   */
  public cleanupFiles(submissionId: string) {
    const submissionPath = path.join(this.tempDir, `submission_${submissionId}`);
    if (fs.existsSync(submissionPath)) {
      fs.rmSync(submissionPath, { recursive: true, force: true });
    }
  }

  /**
   * Compiles code inside compiler container.
   */
  public async compile(submissionId: string, code: string, language: string): Promise<{ success: boolean; stderr?: string; submissionPath: string }> {
    const submissionPath = this.prepareFiles(submissionId, code, language);

    if (language === 'python') {
      return { success: true, submissionPath };
    }

    // Resolve Windows paths for volume mounts if running on Windows
    const hostMountPath = path.resolve(submissionPath).replace(/\\/g, '/');
    const compiler = language === 'c' ? 'gcc' : 'g++';
    const filename = language === 'c' ? 'solution.c' : 'solution.cpp';

    return new Promise((resolve) => {
      const compileProcess = spawn('docker', [
        'run',
        '--rm',
        '-v', `${hostMountPath}:/app`,
        '-w', '/app',
        this.imageTag,
        compiler, '-O3', filename, '-o', 'solution'
      ]);

      let stderr = '';

      compileProcess.stderr.on('data', (data) => {
        stderr += data.toString();
      });

      compileProcess.on('close', (code) => {
        if (code === 0) {
          resolve({ success: true, submissionPath });
        } else {
          resolve({ success: false, stderr, submissionPath });
        }
      });
    });
  }

  /**
   * Executes binary against a testcase.
   */
  public async runTestCase(
    submissionPath: string,
    input: string,
    language: string,
    timeLimitMs: number = 2000,
    memoryLimitKb: number = 262144 // 256MB default
  ): Promise<SandboxResult> {
    const hostMountPath = path.resolve(submissionPath).replace(/\\/g, '/');

    return new Promise((resolve) => {
      const memoryLimitMb = Math.ceil(memoryLimitKb / 1024);
      const executionCmd = language === 'python' ? ['python3', 'solution.py'] : ['./solution'];

      // Spawn Docker sandbox execution container
      const runProcess = spawn('docker', [
        'run',
        '--rm',
        '-i',
        '--network', 'none',
        '-m', `${memoryLimitMb}m`,
        '--memory-swap', `${memoryLimitMb}m`,
        '--cpus', '1.0',
        '--pids-limit', '32',
        '-v', `${hostMountPath}:/app`,
        '-w', '/app',
        this.imageTag,
        ...executionCmd
      ]);

      let stdout = '';
      let stderr = '';
      const startTime = process.hrtime();
      let killedByTimeout = false;

      // Handle Timeout
      const timer = setTimeout(() => {
        killedByTimeout = true;
        runProcess.kill();
        // Force cleanup container process
        spawn('docker', ['ps', '-q', '--filter', `ancestor=${this.imageTag}`]).stdout.on('data', (data) => {
          const containerIds = data.toString().trim().split('\n');
          containerIds.forEach((id) => {
            if (id) spawn('docker', ['kill', id]);
          });
        });
      }, timeLimitMs);

      // Pipe inputs
      runProcess.stdin.write(input);
      runProcess.stdin.end();

      runProcess.stdout.on('data', (data) => {
        stdout += data.toString();
      });

      runProcess.stderr.on('data', (data) => {
        stderr += data.toString();
      });

      runProcess.on('close', (code, signal) => {
        clearTimeout(timer);
        const diff = process.hrtime(startTime);
        const timeInMs = Math.round(diff[0] * 1000 + diff[1] / 1000000);

        if (killedByTimeout) {
          return resolve({
            verdict: 'TIME_LIMIT_EXCEEDED',
            executionTime: timeLimitMs,
            stderr,
          });
        }

        // Exit code 137 indicates Docker OOM-Killed (Memory Limit Exceeded)
        if (code === 137) {
          return resolve({
            verdict: 'MEMORY_LIMIT_EXCEEDED',
            memoryUsed: memoryLimitKb,
            stderr,
          });
        }

        if (code !== 0) {
          return resolve({
            verdict: 'RUNTIME_ERROR',
            executionTime: timeInMs,
            stderr,
            errorOutput: stderr || `Process exited with code ${code} (Signal: ${signal})`,
          });
        }

        resolve({
          verdict: 'ACCEPTED',
          executionTime: timeInMs,
          stdout,
          stderr,
        });
      });
    });
  }
}
