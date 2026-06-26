import { Worker, Job } from 'bullmq';
import dotenv from 'dotenv';
import prisma from './utils/db';
import { DockerSandbox } from './sandbox/docker';

dotenv.config();

const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';
const redisConnection = {
  host: new URL(REDIS_URL).hostname,
  port: parseInt(new URL(REDIS_URL).port) || 6379,
};

const sandbox = new DockerSandbox();

const cleanOutput = (str: string): string => {
  return str.replace(/\r\n/g, '\n').replace(/\s+$/gm, '').trim();
};

const processSubmission = async (job: Job) => {
  const { submissionId } = job.data;
  console.log(`[worker]: Processing submission ID: ${submissionId}`);

  try {
    // 1. Fetch submission data
    const submission = await prisma.submission.findUnique({
      where: { id: submissionId },
      include: {
        problem: {
          include: {
            testCases: true, // Includes both sample and hidden testcases
          },
        },
      },
    });

    if (!submission) {
      console.error(`[worker]: Submission not found for ID: ${submissionId}`);
      return;
    }

    // 2. Compilation Phase
    console.log(`[worker]: Compiling submission code...`);
    const compileResult = await sandbox.compile(submissionId, submission.code, submission.language);

    if (!compileResult.success) {
      console.log(`[worker]: Compilation failed.`);
      await prisma.submission.update({
        where: { id: submissionId },
        data: {
          verdict: 'COMPILATION_ERROR',
          errorOutput: compileResult.stderr || 'Compilation error.',
        },
      });

      // Update User Statistics (attempt count incremented)
      await incrementUserStats(submission.userId, submission.problemId, submissionId, false);

      sandbox.cleanupFiles(submissionId);
      return;
    }

    // 3. Execution Phase (For each testcase)
    console.log(`[worker]: Compilation successful. Starting testcases...`);
    const isSubmit = submission.isSubmit ?? true;
    const testCases = submission.problem.testCases.filter(tc => isSubmit ? true : tc.isSample);
    
    const executionResults = [];
    const batchSize = 5;
    console.log(`[worker]: Running ${testCases.length} testcases in parallel batches of size ${batchSize}...`);
    
    for (let i = 0; i < testCases.length; i += batchSize) {
      const batch = testCases.slice(i, i + batchSize);
      const batchPromises = batch.map(async (tc, batchIdx) => {
        const index = i + batchIdx;
        const result = await sandbox.runTestCase(compileResult.submissionPath, tc.input, submission.language);
        return { index, tc, result };
      });
      const batchResults = await Promise.all(batchPromises);
      executionResults.push(...batchResults);
    }

    // Sort results by index to ensure chronological processing
    executionResults.sort((a, b) => a.index - b.index);

    let finalVerdict: any = 'ACCEPTED';
    let maxTime = 0;
    let maxMemory = 0;
    let firstFailedError: string | null = null;
    let accumulatedStdout = '';

    for (let i = 0; i < executionResults.length; i++) {
      const { tc, result } = executionResults[i];

      if (result.verdict !== 'ACCEPTED') {
        finalVerdict = result.verdict;
        firstFailedError = result.errorOutput || `Failed at testcase #${i + 1}`;
        maxTime = Math.max(maxTime, result.executionTime || 0);
        maxMemory = Math.max(maxMemory, result.memoryUsed || 0);
        if (!isSubmit) {
          accumulatedStdout += `Test Case #${i + 1} (${result.verdict}):\nInput:\n${tc.input}\nExpected:\n${tc.expectedOutput}\nActual:\n${result.stdout || ''}\nError:\n${result.errorOutput || ''}\n\n`;
        }
        break;
      }

      // Check output match
      const cleanedStdout = cleanOutput(result.stdout || '');
      const cleanedExpected = cleanOutput(tc.expectedOutput);

      maxTime = Math.max(maxTime, result.executionTime || 0);
      maxMemory = Math.max(maxMemory, result.memoryUsed || 0);

      if (!isSubmit) {
        accumulatedStdout += `Test Case #${i + 1} (PASSED):\nInput:\n${tc.input}\nExpected:\n${tc.expectedOutput}\nActual:\n${result.stdout || ''}\n\n`;
      }

      if (cleanedStdout !== cleanedExpected) {
        finalVerdict = 'WRONG_ANSWER';
        firstFailedError = `Wrong Answer at testcase #${i + 1}.\nInput:\n${tc.input.slice(0, 100)}\nExpected:\n${tc.expectedOutput.slice(0, 100)}\nActual:\n${(result.stdout || '').slice(0, 100)}`;
        break;
      }
    }

    // 4. Update Database Verdict details
    console.log(`[worker]: Finished evaluation. Final Verdict: ${finalVerdict}`);
    await prisma.submission.update({
      where: { id: submissionId },
      data: {
        verdict: finalVerdict,
        executionTime: maxTime,
        memoryUsed: maxMemory,
        errorOutput: firstFailedError,
        stdout: isSubmit ? null : accumulatedStdout,
      },
    });

    // 5. Update user analytics stats
    if (isSubmit) {
      await incrementUserStats(submission.userId, submission.problemId, submissionId, finalVerdict === 'ACCEPTED');
    }

    // 6. Cleanup local folders
    sandbox.cleanupFiles(submissionId);
  } catch (err: any) {
    console.error(`[worker]: Fatal error processing submission:`, err);
    await prisma.submission.update({
      where: { id: submissionId },
      data: {
        verdict: 'RUNTIME_ERROR',
        errorOutput: err.message || 'Sandbox engine failure.',
      },
    });
    sandbox.cleanupFiles(submissionId);
  }
};

const incrementUserStats = async (userId: string, problemId: string, submissionId: string, isSolved: boolean) => {
  try {
    const stats = await prisma.userStatistics.findUnique({
      where: { userId },
    });

    if (stats) {
      // Check if this is the first attempt at this problem
      const alreadyAttempted = await prisma.submission.findFirst({
        where: {
          userId,
          problemId,
          NOT: { id: submissionId },
        },
      });

      // Check if this is the first accepted submission for this problem
      let incrementSolved = false;
      if (isSolved) {
        const alreadySolved = await prisma.submission.findFirst({
          where: {
            userId,
            problemId,
            verdict: 'ACCEPTED',
            NOT: { id: submissionId },
          },
        });
        if (!alreadySolved) {
          incrementSolved = true;
        }
      }

      await prisma.userStatistics.update({
        where: { userId },
        data: {
          attemptedCount: alreadyAttempted ? stats.attemptedCount : stats.attemptedCount + 1,
          solvedCount: incrementSolved ? stats.solvedCount + 1 : stats.solvedCount,
        },
      });
    }
  } catch (err) {
    console.error(`[worker]: Failed to update user statistics:`, err);
  }
};

// Start the worker listener
const worker = new Worker('submissions', processSubmission, {
  connection: redisConnection,
});

worker.on('completed', (job) => {
  console.log(`[worker]: Job completed: ${job.id}`);
});

worker.on('failed', (job, err) => {
  console.error(`[worker]: Job failed: ${job?.id}, Error:`, err);
});

console.log(`[worker]: Listening on BullMQ queue 'submissions'...`);
