import { Router } from 'express';
import {
  createInternalRun,
  updateInternalRun,
  createPullRequestRecord,
} from '../controllers/internal.controller.js';
import { verifyInternalKey } from '../middlewares/internal-key.middleware.js';

const router = Router();

// Internal routes are protected by X-Internal-Key
router.use(verifyInternalKey);

router.post('/runs', createInternalRun);
router.patch('/runs/:id', updateInternalRun);
router.post('/runs/:id/pr-record', createPullRequestRecord);

export default router;
