import { Response, NextFunction } from 'express';
import prisma from '../utils/db';
import { AuthRequest } from '../types';
import { NotFoundError } from '../utils/errors';

export const getUserDashboard = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      throw new Error('User not authenticated');
    }

    const userId = req.user.userId;

    // 1. Fetch user stats details (contains streak and topic progress)
    const statsProfile = await prisma.userStatistics.findUnique({
      where: { userId },
    });

    if (!statsProfile) {
      throw new NotFoundError('User statistics profile not found');
    }

    // 2. Fetch unique problems solved by difficulty
    const uniqueSolved = await prisma.submission.findMany({
      where: {
        userId,
        verdict: 'ACCEPTED',
        isSubmit: true,
      },
      distinct: ['problemId'],
      select: {
        problem: {
          select: {
            difficulty: true,
          },
        },
      },
    });

    const easySolved = uniqueSolved.filter((s) => s.problem.difficulty === 'EASY').length;
    const mediumSolved = uniqueSolved.filter((s) => s.problem.difficulty === 'MEDIUM').length;
    const hardSolved = uniqueSolved.filter((s) => s.problem.difficulty === 'HARD').length;
    const totalSolved = uniqueSolved.length;

    // 3. Fetch unique problems attempted
    const uniqueAttempted = await prisma.submission.findMany({
      where: { userId, isSubmit: true },
      distinct: ['problemId'],
    });
    const totalAttempted = uniqueAttempted.length;

    // 4. Calculate acceptance rate
    const totalSubmissions = await prisma.submission.count({
      where: { userId, isSubmit: true },
    });
    const acceptedSubmissions = await prisma.submission.count({
      where: { userId, verdict: 'ACCEPTED', isSubmit: true },
    });
    const acceptanceRate = totalSubmissions > 0 ? (acceptedSubmissions / totalSubmissions) * 100 : 0;

    // 5. Build weekly submission chart telemetry (last 7 days)
    const weeklyActivity = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const startOfDay = new Date(date.setHours(0, 0, 0, 0));
      const endOfDay = new Date(date.setHours(23, 59, 59, 999));
      
      const count = await prisma.submission.count({
        where: {
          userId,
          isSubmit: true,
          createdAt: {
            gte: startOfDay,
            lte: endOfDay,
          },
        },
      });

      weeklyActivity.push({
        day: date.toLocaleDateString('en-US', { weekday: 'short' }),
        submissions: count,
      });
    }

    // 6. Topic-wise solved calculation
    // Look up the topics tags completed
    const problemSolves = await prisma.submission.findMany({
      where: {
        userId,
        verdict: 'ACCEPTED',
        isSubmit: true,
      },
      distinct: ['problemId'],
      select: {
        problem: {
          select: {
            tags: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    });

    const topicProgress: Record<string, number> = {};
    problemSolves.forEach((s) => {
      s.problem.tags.forEach((t) => {
        topicProgress[t.name] = (topicProgress[t.name] || 0) + 1;
      });
    });

    return res.json({
      metrics: {
        easySolved,
        mediumSolved,
        hardSolved,
        totalSolved,
        totalAttempted,
        acceptanceRate: Math.round(acceptanceRate * 10) / 10,
        currentStreak: statsProfile.currentStreak,
      },
      weeklyActivity,
      topicProgress,
    });
  } catch (error) {
    next(error);
  }
};

export const getRecentSubmissions = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      throw new Error('User not authenticated');
    }

    const submissions = await prisma.submission.findMany({
      where: { userId: req.user.userId, isSubmit: true },
      orderBy: { createdAt: 'desc' },
      take: 10,
      include: {
        problem: {
          select: {
            title: true,
            slug: true,
          },
        },
      },
    });

    return res.json({ submissions });
  } catch (error) {
    next(error);
  }
};

export const getLeaderboard = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const statsList = await prisma.userStatistics.findMany({
      include: {
        user: {
          select: {
            username: true,
            email: true,
          },
        },
      },
    });

    // Fetch counts grouped by user
    const totalSubGroup = await prisma.submission.groupBy({
      by: ['userId'],
      _count: { id: true },
      where: { isSubmit: true },
    });
    const acceptedSubGroup = await prisma.submission.groupBy({
      by: ['userId'],
      _count: { id: true },
      where: { verdict: 'ACCEPTED', isSubmit: true },
    });

    const totalCounts = Object.fromEntries(totalSubGroup.map((g) => [g.userId, g._count.id]));
    const acceptedCounts = Object.fromEntries(acceptedSubGroup.map((g) => [g.userId, g._count.id]));

    const leaderboardData = statsList.map((stats) => {
      const total = totalCounts[stats.userId] || 0;
      const accepted = acceptedCounts[stats.userId] || 0;
      const acceptanceRate = total > 0 ? Math.round((accepted / total) * 1000) / 10 : 0;
      return {
        ...stats,
        acceptanceRate,
      };
    });

    leaderboardData.sort((a, b) => {
      if (b.solvedCount !== a.solvedCount) {
        return b.solvedCount - a.solvedCount;
      }
      if (b.acceptanceRate !== a.acceptanceRate) {
        return b.acceptanceRate - a.acceptanceRate;
      }
      return b.currentStreak - a.currentStreak;
    });

    const leaderboard = leaderboardData.slice(0, 50);
    return res.json({ leaderboard });
  } catch (error) {
    next(error);
  }
};
