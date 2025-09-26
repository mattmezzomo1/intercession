import { Router } from 'express';
import {
  createShare,
  getSharedContent,
  getUserSharedContent,
  deleteShare
} from '../controllers/shareController';
import { authenticate, optionalAuth } from '../middleware/auth';

const router = Router();

// Public routes
router.get('/:shareId', optionalAuth, getSharedContent);

// Protected routes
router.post('/', authenticate, createShare);
router.get('/user/content', authenticate, getUserSharedContent);
router.delete('/:shareId', authenticate, deleteShare);

export default router;
