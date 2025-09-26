import { Router } from 'express';
import {
  createPrayerLog,
  getPrayerLogs,
  getUserPrayerLogs,
  getUserCommittedPrayers,
  deletePrayerLog
} from '../controllers/prayerLogController';
import { authenticate, optionalAuth } from '../middleware/auth';

const router = Router();

// Public routes (with optional auth for access control)
router.get('/prayer-request/:prayerRequestId', optionalAuth, getPrayerLogs);

// Protected routes
router.get('/user', authenticate, getUserPrayerLogs);
router.get('/user/committed', authenticate, getUserCommittedPrayers);
router.post('/', authenticate, createPrayerLog);
router.delete('/:id', authenticate, deletePrayerLog);

export default router;
