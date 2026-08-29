import { Router } from 'express';
import {
  getRuns,
  getRunById,
  updateRunDecision,
} from '../controllers/runs.controller.js';
import { authenticateJWT, requireRole } from '../middlewares/auth.middleware.js';

const router = Router();

// All run routes require JWT authentication
router.use(authenticateJWT);

router.get('/', getRuns);
router.get('/:id', getRunById);
router.patch('/:id/decision', requireRole(['qa_manager']), updateRunDecision);

export default router;
