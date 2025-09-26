import { Router } from 'express';
import {
  getTodayWordOfDay,
  getWordOfDayByDate,
  getAvailableWordOfDayDates,
  createWordOfDay,
  generateTodayWordOfDay
} from '../controllers/wordOfDayController';
import { authenticate, optionalAuth } from '../middleware/auth';

const router = Router();

// Public routes (with optional auth for personalization)
router.get('/today', optionalAuth, getTodayWordOfDay);
router.get('/dates', getAvailableWordOfDayDates);
router.get('/:date', optionalAuth, getWordOfDayByDate);

// Protected routes (admin only - for now just authenticated)
router.post('/', authenticate, createWordOfDay);
router.post('/generate', authenticate, generateTodayWordOfDay);

export default router;
