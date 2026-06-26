import { Request, Response, NextFunction } from 'express';
import prisma from '../utils/db';
import { AIService } from '../services/ai.service';
import { BadRequestError, NotFoundError } from '../utils/errors';
import { AuthRequest } from '../types';

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

    // Build Hint-Level specific prompt context
    let hintConstraint = '';
    switch (level) {
      case 1:
        hintConstraint = 'Give a tiny, subtle clue or a nudge. Do not suggest algorithms or code. Help them notice details.';
        break;
      case 2:
        hintConstraint = 'Provide a more detailed hint about the data structures or mathematical properties that are useful.';
        break;
      case 3:
        hintConstraint = 'Outline the general algorithmic direction (e.g. "We can use a sliding window approach with two pointers..."). Describe the steps of the algorithm.';
        break;
      case 4:
        hintConstraint = 'Provide a detailed algorithmic approach. You may write light pseudo-code if necessary, but strictly DO NOT output the full C++ source code solution.';
        break;
    }

    const prompt = `You are an expert AI programming tutor.
Problem Title: ${problem.title}
Problem Difficulty: ${problem.difficulty}
Statement:
${problem.statement}
Constraints:
${problem.constraints}

User's current code:
\`\`\`
${code || '// Empty code'}
\`\`\`

Task:
Generate Hint Level ${level}.
Hint Type to generate: ${hintConstraint}

Guidelines:
- Keep the explanation beginner-friendly, positive, and clear.
- Use markdown formatting.
- Be extremely brief and direct: strictly limit your response to 2 to 3 sentences max. Get straight to the point.
- Never give the complete solution code.`;

    const hintText = await AIService.generateContent(prompt);
    return res.json({ hint: hintText, level });
  } catch (error) {
    next(error);
  }
};

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

    if (submission.verdict !== 'COMPILATION_ERROR' && submission.verdict !== 'RUNTIME_ERROR') {
      throw new BadRequestError('This submission did not fail with a compiler or runtime exception.');
    }

    const errorType = submission.verdict === 'COMPILATION_ERROR' ? 'Compilation / Syntax' : 'Runtime (e.g. Segfault, Stack overflow)';

    const prompt = `You are an expert AI programming debugger.
User's code:
\`\`\`
${submission.code}
\`\`\`

Error diagnostics or stderr stack trace:
\`\`\`text
${submission.errorOutput || 'No output recorded'}
\`\`\`

Task:
Explain this ${errorType} error in a beginner-friendly way.
Explain:
1. What the error means.
2. Exactly why it occurred in their code (refer to line numbers/variables if possible).
3. How they can fix it (describe the correction clearly).

Guidelines:
- Keep the response encouraging and constructive.
- Use markdown formatting.
- Be extremely brief: explain the issue and how to fix it in 3 to 4 concise sentences max.
- Do not write the full corrected code.`;

    const explanation = await AIService.generateContent(prompt);
    return res.json({ explanation });
  } catch (error) {
    next(error);
  }
};

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

    if (submission.verdict !== 'WRONG_ANSWER') {
      throw new BadRequestError('This submission did not fail with a Wrong Answer verdict.');
    }

    const prompt = `You are an expert AI programming tutor.
Problem Statement:
${submission.problem.statement}

User's code:
\`\`\`
${submission.code}
\`\`\`

Failed Testcase details (Input / Output discrepancy):
\`\`\`text
${submission.errorOutput || 'Wrong output match'}
\`\`\`

Task:
Explain the logical bug in the user's code that caused this Wrong Answer.
Describe:
1. What variables or logic loops did not evaluate as expected.
2. The specific test case dry run explaining where the math or indexing broke.
3. Steps to rectify the algorithm.

Guidelines:
- Use markdown formatting.
- Be extremely brief: explain the bug and how to fix it in 3 to 4 concise sentences max.
- Strictly DO NOT output the full corrected code.`;

    const explanation = await AIService.generateContent(prompt);
    return res.json({ explanation });
  } catch (error) {
    next(error);
  }
};

export const explainSolution = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params; // Problem ID

    const problem = await prisma.problem.findUnique({
      where: { id },
    });

    if (!problem) {
      throw new NotFoundError('Problem not found');
    }

    const prompt = `You are an expert AI algorithm coach.
Problem Title: ${problem.title}
Statement:
${problem.statement}
Constraints:
${problem.constraints}

Task:
Determine the Time Complexity and Space Complexity of the optimal solution.

Guidelines:
- State the Time Complexity and Space Complexity in Big-O notation based on loops or recursions.
- State in 1 brief sentence whether this is optimal.
- Strictly limit the response to 2 to 3 bullet points max. Do not write paragraphs or detailed design strategies.`;

    const explanation = await AIService.generateContent(prompt);
    return res.json({ explanation });
  } catch (error) {
    next(error);
  }
};
