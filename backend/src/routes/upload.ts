import { Router } from 'express';
import {
  uploadPrayerImages,
  uploadAvatar,
  uploadBase64Images,
  uploadBase64Avatar,
  deleteImage,
  healthCheck
} from '../controllers/uploadController';
import { authenticate } from '../middleware/auth';
import { 
  uploadMultipleImages, 
  uploadSingleImage, 
  handleUploadError 
} from '../middleware/upload';

const router = Router();

// Health check (public)
router.get('/health', healthCheck);

// Protected routes (require authentication)
router.use(authenticate);

// File upload routes (using multer)
router.post('/prayer-images', uploadMultipleImages, handleUploadError, uploadPrayerImages);
router.post('/avatar', uploadSingleImage, handleUploadError, uploadAvatar);

// Base64 upload routes (for backward compatibility)
router.post('/base64/images', uploadBase64Images);
router.post('/base64/avatar', uploadBase64Avatar);

// Delete image
router.delete('/image', deleteImage);

export default router;
