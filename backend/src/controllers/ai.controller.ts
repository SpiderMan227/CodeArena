import { Response, NextFunction } from 'express';
import prisma from '../utils/db';
import { AIService } from '../services/ai.service';
import { BadRequestError, NotFoundError } from '../utils/errors';
import { AuthRequest } from '../types';

/**
 * Handles generating hints at levels 1-4 for a problem.
 */
export const getHint = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params; // Problem ID
    const { code, level } = req.body; // User's code and hint level (1-4)

    if (level < 1 || level > 4) {
      throw new BadRequestError('Hint level must be between 1 and 4');
    }

    const problem = await prisma.problem.findUnique({
      where: { id },
    });

    if (!problem) {
      throw new NotFoundError('Problem not found');
    }

    const hintText = await AIService.getHint(problem, code, level);
    return res.json({ hint: hintText, level });
  } catch (error) {
    next(error);
  }
};

/**
 * Handles explaining compilation or runtime errors for a submission.
 */
export const explainError = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { submissionId } = req.params;

    const submission = await prisma.submission.findUnique({
      where: { id: submissionId },
      include: { problem: true },
    });

    if (!submission) {
      throw new NotFoundError('Submission not found');
    }

    const explanation = await AIService.explainError(
      submission.code,
      submission.errorOutput || '',
      submission.verdict
    );

    return res.json({ explanation });
  } catch (error) {
    next(error);
  }
};

/**
 * Handles explaining logical bugs / Wrong Answer verdicts.
 */
export const explainWA = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { submissionId } = req.params;

    const submission = await prisma.submission.findUnique({
      where: { id: submissionId },
      include: { problem: true },
    });

    if (!submission) {
      throw new NotFoundError('Submission not found');
    }

    const explanation = await AIService.explainWA(
      submission.problem.statement,
      submission.code,
      submission.errorOutput || ''
    );

    return res.json({ explanation });
  } catch (error) {
    next(error);
  }
};

/**
 * Handles explaining complexity/algorithmic solutions.
 */
export const explainSolution = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params; // Problem ID

    const problem = await prisma.problem.findUnique({
      where: { id },
    });

    if (!problem) {
      throw new NotFoundError('Problem not found');
    }

    const explanation = await AIService.explainSolution(problem);
    return res.json({ explanation });
  } catch (error) {
    next(error);
  }
};
