import { Router } from 'express';
import {
  createPrayerRequest,
  getPrayerRequests,
  getPrayerRequest,
  updatePrayerRequest,
  deletePrayerRequest,
  getTrendingPrayerRequests
} from '../controllers/prayerRequestController';
import { authenticate, optionalAuth } from '../middleware/auth';

const router = Router();

// Public routes (with optional auth for personalization)
router.get('/', optionalAuth, getPrayerRequests);
router.get('/trending', optionalAuth, getTrendingPrayerRequests);
router.get('/:id', optionalAuth, getPrayerRequest);

// Protected routes
router.post('/', authenticate, createPrayerRequest);
router.put('/:id', authenticate, updatePrayerRequest);
router.delete('/:id', authenticate, deletePrayerRequest);

export default router;
