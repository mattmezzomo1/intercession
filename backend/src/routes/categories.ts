import { Router } from 'express';
import {
  getCategories,
  getCategory,
  createCategory,
  updateCategory,
  deleteCategory
} from '../controllers/categoryController';
import { authenticate } from '../middleware/auth';

const router = Router();

// Public routes
router.get('/', getCategories);
router.get('/:slug', getCategory);

// Protected routes (admin only - for now just authenticated)
router.post('/', authenticate, createCategory);
router.put('/:id', authenticate, updateCategory);
router.delete('/:id', authenticate, deleteCategory);

export default router;
