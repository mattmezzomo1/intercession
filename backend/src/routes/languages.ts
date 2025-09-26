import { Router } from 'express';
import {
  getLanguages,
  getUserLanguages,
  updateUserLanguages
} from '../controllers/languageController';
import { authenticate } from '../middleware/auth';

const router = Router();

// Public routes
router.get('/', getLanguages);

// Protected routes
router.get('/user', authenticate, getUserLanguages);
router.put('/user', authenticate, updateUserLanguages);

export default router;
