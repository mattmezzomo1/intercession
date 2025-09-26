import { Router } from 'express';
import {
  createIntercession,
  getIntercessions,
  getUserIntercessions,
  deleteIntercession
} from '../controllers/intercessionController';
import { authenticate, optionalAuth } from '../middleware/auth';

const router = Router();

// Public routes (with optional auth for access control)
router.get('/prayer-request/:prayerRequestId', optionalAuth, getIntercessions);

// Protected routes
router.get('/user', authenticate, getUserIntercessions);
router.post('/', authenticate, createIntercession);
router.delete('/:id', authenticate, deleteIntercession);

export default router;
