import multer from 'multer';
import { Request, Response, NextFunction } from 'express';
import { createError } from './errorHandler';

// Configure multer for memory storage (we'll upload to R2, not save locally)
const storage = multer.memoryStorage();

// File filter to only allow images
const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  // Check if file is an image
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed'));
  }
};

// Configure multer
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
    files: 5, // Maximum 5 files
  },
});

// Middleware for single image upload (avatars)
export const uploadSingleImage = upload.single('image');

// Middleware for multiple image upload (prayer requests)
export const uploadMultipleImages = upload.array('images', 5);

// Error handling middleware for multer errors
export const handleUploadError = (error: any, req: Request, res: Response, next: NextFunction) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      throw createError('File size too large. Maximum size is 10MB per file.', 400);
    }
    if (error.code === 'LIMIT_FILE_COUNT') {
      throw createError('Too many files. Maximum 5 files allowed.', 400);
    }
    if (error.code === 'LIMIT_UNEXPECTED_FILE') {
      throw createError('Unexpected file field.', 400);
    }
  }
  
  if (error.message === 'Only image files are allowed') {
    throw createError('Only image files are allowed.', 400);
  }
  
  next(error);
};

// Utility function to validate base64 image data
export const validateBase64Image = (base64String: string): boolean => {
  // Check if it's a valid base64 data URL
  const base64Regex = /^data:image\/(jpeg|jpg|png|gif|webp);base64,/;
  return base64Regex.test(base64String);
};

// Utility function to extract buffer from base64 data URL
export const base64ToBuffer = (base64String: string): { buffer: Buffer; mimeType: string } => {
  if (!validateBase64Image(base64String)) {
    throw new Error('Invalid base64 image format');
  }

  // Extract mime type and base64 data
  const matches = base64String.match(/^data:image\/(jpeg|jpg|png|gif|webp);base64,(.+)$/);
  if (!matches) {
    throw new Error('Invalid base64 image format');
  }

  const mimeType = matches[1];
  const base64Data = matches[2];
  const buffer = Buffer.from(base64Data, 'base64');

  return { buffer, mimeType };
};
