import { Request, Response } from 'express';
import { AuthenticatedRequest } from '../types';
import r2Service from '../services/r2Service';
import { base64ToBuffer, validateBase64Image } from '../middleware/upload';
import { createError } from '../middleware/errorHandler';

/**
 * Upload multiple images for prayer requests
 */
export const uploadPrayerImages = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const files = req.files as Express.Multer.File[];
    
    if (!files || files.length === 0) {
      throw createError('No images provided', 400);
    }

    if (files.length > 5) {
      throw createError('Maximum 5 images allowed', 400);
    }

    // Upload all images to R2
    const uploadPromises = files.map(async (file) => {
      return await r2Service.uploadImage(file.buffer, file.originalname, 'prayer-requests');
    });

    const imageUrls = await Promise.all(uploadPromises);

    res.json({
      success: true,
      data: {
        images: imageUrls
      },
      message: `${imageUrls.length} images uploaded successfully`
    });
  } catch (error) {
    console.error('Error uploading prayer images:', error);
    throw error;
  }
};

/**
 * Upload single avatar image
 */
export const uploadAvatar = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const file = req.file as Express.Multer.File;
    
    if (!file) {
      throw createError('No image provided', 400);
    }

    // Upload avatar to R2
    const imageUrl = await r2Service.uploadImage(file.buffer, file.originalname, 'avatars');

    res.json({
      success: true,
      data: {
        imageUrl
      },
      message: 'Avatar uploaded successfully'
    });
  } catch (error) {
    console.error('Error uploading avatar:', error);
    throw error;
  }
};

/**
 * Upload images from base64 data (for backward compatibility)
 */
export const uploadBase64Images = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { images, type = 'prayer-requests' } = req.body;

    if (!images || !Array.isArray(images)) {
      throw createError('Images array is required', 400);
    }

    if (images.length === 0) {
      throw createError('No images provided', 400);
    }

    if (images.length > 5) {
      throw createError('Maximum 5 images allowed', 400);
    }

    // Validate all images are base64
    for (const image of images) {
      if (!validateBase64Image(image)) {
        throw createError('Invalid base64 image format', 400);
      }
    }

    // Convert base64 to buffers and upload
    const uploadPromises = images.map(async (base64Image: string, index: number) => {
      const { buffer, mimeType } = base64ToBuffer(base64Image);
      const fileName = `image-${Date.now()}-${index}.${mimeType}`;
      
      return await r2Service.uploadImage(
        buffer, 
        fileName, 
        type as 'prayer-requests' | 'avatars'
      );
    });

    const imageUrls = await Promise.all(uploadPromises);

    res.json({
      success: true,
      data: {
        images: imageUrls
      },
      message: `${imageUrls.length} images uploaded successfully`
    });
  } catch (error) {
    console.error('Error uploading base64 images:', error);
    throw error;
  }
};

/**
 * Upload single base64 image (for avatars)
 */
export const uploadBase64Avatar = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { image } = req.body;

    if (!image) {
      throw createError('Image is required', 400);
    }

    if (!validateBase64Image(image)) {
      throw createError('Invalid base64 image format', 400);
    }

    // Convert base64 to buffer and upload
    const { buffer, mimeType } = base64ToBuffer(image);
    const fileName = `avatar-${Date.now()}.${mimeType}`;
    
    const imageUrl = await r2Service.uploadImage(buffer, fileName, 'avatars');

    res.json({
      success: true,
      data: {
        imageUrl
      },
      message: 'Avatar uploaded successfully'
    });
  } catch (error) {
    console.error('Error uploading base64 avatar:', error);
    throw error;
  }
};

/**
 * Delete an image from R2
 */
export const deleteImage = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { imageUrl } = req.body;

    if (!imageUrl) {
      throw createError('Image URL is required', 400);
    }

    await r2Service.deleteImage(imageUrl);

    res.json({
      success: true,
      message: 'Image deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting image:', error);
    throw error;
  }
};

/**
 * Health check for R2 service
 */
export const healthCheck = async (req: Request, res: Response) => {
  try {
    const isHealthy = await r2Service.healthCheck();

    res.json({
      success: true,
      data: {
        r2Service: isHealthy ? 'healthy' : 'unhealthy'
      },
      message: isHealthy ? 'R2 service is working properly' : 'R2 service has issues'
    });
  } catch (error) {
    console.error('Error checking R2 health:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to check R2 service health'
    });
  }
};
