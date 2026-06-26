import { Router } from 'express';
import {
  createProblem,
  editProblem,
  deleteProblem,
  listProblems,
  getProblemBySlug,
} from '../controllers/problem.controller';
import { submitCode } from '../controllers/submission.controller';
import { requireAuth, requireAdmin } from '../middlewares/auth';

const router = Router();

// Public routes
router.get('/', listProblems);
router.get('/:slug', getProblemBySlug);

// User protected routes
router.post('/:id/submit', requireAuth, submitCode);

// Admin-only routes
router.post('/', requireAuth, requireAdmin, createProblem);
router.put('/:id', requireAuth, requireAdmin, editProblem);
router.delete('/:id', requireAuth, requireAdmin, deleteProblem);

export default router;
