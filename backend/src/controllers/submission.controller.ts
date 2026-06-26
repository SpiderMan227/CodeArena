import { Response, NextFunction } from 'express';
import { Queue } from 'bullmq';
import prisma from '../utils/db';
import { AuthRequest } from '../types';
import { BadRequestError, NotFoundError } from '../utils/errors';

const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';
const redisConnection = {
  host: new URL(REDIS_URL).hostname,
  port: parseInt(new URL(REDIS_URL).port) || 6379,
};

// Initialize BullMQ Queue
const submissionQueue = new Queue('submissions', {
  connection: redisConnection,
});

export const submitCode = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params; // Problem ID
    const { code, language, isSubmit } = req.body;

    if (!code) {
      throw new BadRequestError('Code content is required');
    }

    if (!req.user) {
      throw new BadRequestError('User not authenticated');
    }

    const problem = await prisma.problem.findUnique({
      where: { id },
    });

    if (!problem) {
      throw new NotFoundError('Problem not found');
    }

    // 1. Create a PENDING submission record
    const submission = await prisma.submission.create({
      data: {
        userId: req.user.userId,
        problemId: id,
        code,
        language,
        verdict: 'PENDING',
        isSubmit: isSubmit ?? true,
      },
    });

    // 2. Enqueue the execution task to Redis
    await submissionQueue.add('execute', {
      submissionId: submission.id,
    });

    // 3. Poll database internally for up to 10 seconds for synchronous response resolution
    let attempts = 0;
    const maxAttempts = 10;

    while (attempts < maxAttempts) {
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const result = await prisma.submission.findUnique({
        where: { id: submission.id },
      });

      if (result && result.verdict !== 'PENDING') {
        return res.json({
          submissionId: result.id,
          verdict: result.verdict,
          executionTime: result.executionTime,
          memoryUsed: result.memoryUsed,
          errorOutput: result.errorOutput,
          stdout: result.isSubmit
            ? (result.verdict === 'ACCEPTED' ? 'Program executed successfully.' : undefined)
            : (result.stdout || undefined),
        });
      }

      attempts++;
    }

    // Return pending status if sandbox container is still compiling/executing
    return res.json({
      submissionId: submission.id,
      verdict: 'PENDING',
      message: 'Code Arena execution is currently pending in queue.',
    });
  } catch (error) {
    next(error);
  }
};
