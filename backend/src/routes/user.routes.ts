import { Router } from 'express';
import { getUserDashboard, getRecentSubmissions, getLeaderboard } from '../controllers/user.controller';
import { requireAuth } from '../middlewares/auth';

const router = Router();

router.get('/dashboard', requireAuth, getUserDashboard);
router.get('/submissions', requireAuth, getRecentSubmissions);
router.get('/leaderboard', requireAuth, getLeaderboard);

export default router;
