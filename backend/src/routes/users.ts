import { Router } from 'express';
import {
  getProfile,
  getPublicProfile,
  updateProfile,
  getUserStats,
  getUserPrayerRequests,
  deleteAccount,
  geocodeCity,
  reverseGeocode
} from '../controllers/userController';
import { authenticate } from '../middleware/auth';

const router = Router();

// Public routes (no authentication required)
router.get('/public/:userId', getPublicProfile);

// Protected routes (require authentication)
router.use(authenticate);

router.get('/profile', getProfile);
router.put('/profile', updateProfile);
router.get('/stats', getUserStats);
router.get('/prayer-requests', getUserPrayerRequests);
router.delete('/account', deleteAccount);

// Geocoding routes
router.get('/geocode', geocodeCity);
router.get('/reverse-geocode', reverseGeocode);

export default router;
