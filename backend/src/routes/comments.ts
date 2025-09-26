import { Router } from 'express';
import {
  createComment,
  getComments,
  updateComment,
  deleteComment
} from '../controllers/commentController';
import { authenticate, optionalAuth } from '../middleware/auth';

const router = Router();

// Public routes (with optional auth for access control)
router.get('/prayer-request/:prayerRequestId', optionalAuth, getComments);

// Protected routes
router.post('/', authenticate, createComment);
router.put('/:id', authenticate, updateComment);
router.delete('/:id', authenticate, deleteComment);

export default router;
