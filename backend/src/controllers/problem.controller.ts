import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import prisma from '../utils/db';
import { slugify } from '../utils/slugify';
import { BadRequestError, NotFoundError } from '../utils/errors';

const testCaseSchema = z.object({
  input: z.string(),
  expectedOutput: z.string(),
  isSample: z.boolean().default(false),
});

const hintSchema = z.object({
  level: z.number().int().min(1).max(4),
  content: z.string(),
});

const editorialSchema = z.object({
  content: z.string(),
  codeSolution: z.string().optional(),
});

const createProblemSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  difficulty: z.enum(['EASY', 'MEDIUM', 'HARD']),
  statement: z.string().min(1, 'Statement is required'),
  inputFormat: z.string().min(1, 'Input format is required'),
  outputFormat: z.string().min(1, 'Output format is required'),
  constraints: z.string().min(1, 'Constraints are required'),
  tags: z.array(z.string()).default([]),
  testCases: z.array(testCaseSchema).min(1, 'At least one testcase is required'),
  hints: z.array(hintSchema).default([]),
  editorial: editorialSchema.optional(),
});

const updateProblemSchema = createProblemSchema.partial();

export const createProblem = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = createProblemSchema.parse(req.body);
    const slug = slugify(data.title);

    // Verify unique slug
    const existingProblem = await prisma.problem.findUnique({
      where: { slug },
    });

    if (existingProblem) {
      throw new BadRequestError('A problem with a similar title already exists');
    }

    const problem = await prisma.$transaction(async (tx) => {
      return await tx.problem.create({
        data: {
          title: data.title,
          slug,
          difficulty: data.difficulty,
          statement: data.statement,
          inputFormat: data.inputFormat,
          outputFormat: data.outputFormat,
          constraints: data.constraints,
          tags: {
            connectOrCreate: data.tags.map((tagName) => ({
              where: { name: tagName },
              create: { name: tagName },
            })),
          },
          testCases: {
            create: data.testCases,
          },
          hints: {
            create: data.hints,
          },
          editorial: data.editorial
            ? {
                create: {
                  content: data.editorial.content,
                  codeSolution: data.editorial.codeSolution,
                },
              }
            : undefined,
        },
        include: {
          tags: true,
          testCases: true,
          hints: true,
          editorial: true,
        },
      });
    });

    return res.status(201).json({ problem });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return next(new BadRequestError(error.errors[0].message));
    }
    next(error);
  }
};

export const editProblem = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const data = updateProblemSchema.parse(req.body);

    const existingProblem = await prisma.problem.findUnique({
      where: { id },
    });

    if (!existingProblem) {
      throw new NotFoundError('Problem not found');
    }

    const updatedProblem = await prisma.$transaction(async (tx) => {
      // 1. Update basic fields & tags
      const problem = await tx.problem.update({
        where: { id },
        data: {
          title: data.title,
          slug: data.title ? slugify(data.title) : undefined,
          difficulty: data.difficulty,
          statement: data.statement,
          inputFormat: data.inputFormat,
          outputFormat: data.outputFormat,
          constraints: data.constraints,
          tags: data.tags
            ? {
                set: [], // Disconnect all current tags
                connectOrCreate: data.tags.map((tagName) => ({
                  where: { name: tagName },
                  create: { name: tagName },
                })),
              }
            : undefined,
        },
      });

      // 2. Update testcases if provided
      if (data.testCases) {
        await tx.testCase.deleteMany({ where: { problemId: id } });
        await tx.testCase.createMany({
          data: data.testCases.map((tc) => ({
            ...tc,
            problemId: id,
          })),
        });
      }

      // 3. Update hints if provided
      if (data.hints) {
        await tx.hint.deleteMany({ where: { problemId: id } });
        await tx.hint.createMany({
          data: data.hints.map((h) => ({
            ...h,
            problemId: id,
          })),
        });
      }

      // 4. Update editorial if provided
      if (data.editorial) {
        await tx.editorial.upsert({
          where: { problemId: id },
          update: {
            content: data.editorial.content,
            codeSolution: data.editorial.codeSolution,
          },
          create: {
            problemId: id,
            content: data.editorial.content,
            codeSolution: data.editorial.codeSolution,
          },
        });
      }

      // Fetch the final updated record
      return await tx.problem.findUnique({
        where: { id },
        include: {
          tags: true,
          testCases: true,
          hints: true,
          editorial: true,
        },
      });
    });

    return res.json({ problem: updatedProblem });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return next(new BadRequestError(error.errors[0].message));
    }
    next(error);
  }
};

export const deleteProblem = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const problem = await prisma.problem.findUnique({
      where: { id },
    });

    if (!problem) {
      throw new NotFoundError('Problem not found');
    }

    // Cascade deletes handle the related tables due to model configurations
    await prisma.problem.delete({
      where: { id },
    });

    return res.json({ message: 'Problem deleted successfully' });
  } catch (error) {
    next(error);
  }
};

export const listProblems = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { search, difficulty, tag, sortBy, order, page, limit } = req.query;

    const pageNum = parseInt(page as string) || 1;
    const limitNum = parseInt(limit as string) || 20;
    const skip = (pageNum - 1) * limitNum;

    // Build Prisma query clauses dynamically
    const whereClause: any = {};

    if (search) {
      whereClause.OR = [
        { title: { contains: search as string, mode: 'insensitive' } },
        { slug: { contains: search as string, mode: 'insensitive' } },
      ];
    }

    if (difficulty) {
      whereClause.difficulty = difficulty;
    }

    if (tag) {
      whereClause.tags = {
        some: {
          name: tag as string,
        },
      };
    }

    // Sorting
    const allowedSortFields = ['title', 'difficulty', 'createdAt'];
    const sortField = allowedSortFields.includes(sortBy as string) ? (sortBy as string) : 'createdAt';
    const sortOrder = order === 'asc' ? 'asc' : 'desc';

    const [problems, totalCount] = await prisma.$transaction([
      prisma.problem.findMany({
        where: whereClause,
        include: {
          tags: true,
          // Exclude raw testcases or statistics here for performance
        },
        orderBy: {
          [sortField]: sortOrder,
        },
        skip,
        take: limitNum,
      }),
      prisma.problem.count({
        where: whereClause,
      }),
    ]);

    const totalPages = Math.ceil(totalCount / limitNum);

    return res.json({
      problems,
      pagination: {
        page: pageNum,
        limit: limitNum,
        totalCount,
        totalPages,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getProblemBySlug = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { slug } = req.params;

    const problem = await prisma.problem.findUnique({
      where: { slug },
      include: {
        tags: true,
        // Only fetch sample testcases to protect secret testcases
        testCases: {
          where: { isSample: true },
        },
        hints: {
          orderBy: { level: 'asc' },
        },
      },
    });

    if (!problem) {
      throw new NotFoundError('Problem not found');
    }

    return res.json({ problem });
  } catch (error) {
    next(error);
  }
};
