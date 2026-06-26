import { Router } from 'express';
import {
  getHint,
  explainError,
  explainWA,
  explainSolution,
} from '../controllers/ai.controller';
import { requireAuth } from '../middlewares/auth';

const router = Router();

router.post('/problems/:id/hint', requireAuth, getHint);
router.post('/submissions/:submissionId/explain-error', requireAuth, explainError);
router.post('/submissions/:submissionId/explain-wa', requireAuth, explainWA);
router.post('/problems/:id/explain-solution', requireAuth, explainSolution);

export default router;
