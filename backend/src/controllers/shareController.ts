import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthenticatedRequest } from '../types';
import { createError } from '../middleware/errorHandler';
import { z } from 'zod';

const prisma = new PrismaClient();

// Validation schemas
const createShareSchema = z.object({
  contentType: z.enum(['WORD_OF_DAY', 'PRAYER_REQUEST']),
  contentId: z.string().min(1),
  expiresAt: z.string().datetime().optional()
});

/**
 * Create a shareable link for content
 */
export const createShare = async (req: AuthenticatedRequest, res: Response) => {
  const validatedData = createShareSchema.parse(req.body);
  const userId = req.user?.id;

  // Verify content exists and user has access
  if (validatedData.contentType === 'WORD_OF_DAY') {
    const wordOfDay = await prisma.wordOfDay.findUnique({
      where: { id: validatedData.contentId }
    });

    if (!wordOfDay) {
      throw createError('Word of day not found', 404);
    }
  } else if (validatedData.contentType === 'PRAYER_REQUEST') {
    const prayerRequest = await prisma.prayerRequest.findUnique({
      where: { id: validatedData.contentId },
      select: { id: true, privacy: true, userId: true }
    });

    if (!prayerRequest) {
      throw createError('Prayer request not found', 404);
    }

    // Check if user has access to share this prayer request
    if (prayerRequest.privacy === 'PRIVATE' && prayerRequest.userId !== userId) {
      throw createError('Access denied', 403);
    }
  }

  // Check if share already exists for this content
  const existingShare = await prisma.sharedContent.findFirst({
    where: {
      contentType: validatedData.contentType,
      contentId: validatedData.contentId,
      isActive: true
    }
  });

  if (existingShare) {
    // Get the first frontend URL from the comma-separated list
    const frontendUrl = process.env.FRONTEND_URL?.split(',')[0]?.trim() || 'http://localhost:8081';

    return res.json({
      success: true,
      data: {
        shareId: existingShare.shareId,
        shareUrl: `${frontendUrl}/shared/${existingShare.shareId}`
      },
      message: 'Share link retrieved successfully'
    });
  }

  // Create new share
  const sharedContent = await prisma.sharedContent.create({
    data: {
      contentType: validatedData.contentType,
      contentId: validatedData.contentId,
      userId,
      expiresAt: validatedData.expiresAt ? new Date(validatedData.expiresAt) : undefined
    }
  });

  // Get the first frontend URL from the comma-separated list
  const frontendUrl = process.env.FRONTEND_URL?.split(',')[0]?.trim() || 'http://localhost:8081';

  res.json({
    success: true,
    data: {
      shareId: sharedContent.shareId,
      shareUrl: `${frontendUrl}/shared/${sharedContent.shareId}`
    },
    message: 'Share link created successfully'
  });
};

/**
 * Get shared content by share ID (public endpoint)
 */
export const getSharedContent = async (req: AuthenticatedRequest, res: Response) => {
  const { shareId } = req.params;

  const sharedContent = await prisma.sharedContent.findUnique({
    where: { shareId },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          avatar: true
        }
      }
    }
  });

  if (!sharedContent || !sharedContent.isActive) {
    throw createError('Shared content not found', 404);
  }

  // Check if content has expired
  if (sharedContent.expiresAt && new Date() > sharedContent.expiresAt) {
    throw createError('Shared content has expired', 410);
  }

  let content = null;

  if (sharedContent.contentType === 'WORD_OF_DAY') {
    content = await prisma.wordOfDay.findUnique({
      where: { id: sharedContent.contentId },
      include: {
        language: true
      }
    });
  } else if (sharedContent.contentType === 'PRAYER_REQUEST') {
    content = await prisma.prayerRequest.findUnique({
      where: { id: sharedContent.contentId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            avatar: true
          }
        },
        category: true,
        language: true,
        images: true,
        _count: {
          select: {
            intercessions: true,
            comments: true
          }
        }
      }
    });

    // Only show public prayer requests or those shared by the owner
    if (content && content.privacy !== 'PUBLIC' && content.userId !== sharedContent.userId) {
      throw createError('Access denied', 403);
    }
  }

  if (!content) {
    throw createError('Content not found', 404);
  }

  res.json({
    success: true,
    data: {
      shareId: sharedContent.shareId,
      contentType: sharedContent.contentType,
      content,
      sharedBy: sharedContent.user,
      createdAt: sharedContent.createdAt
    },
    message: 'Shared content retrieved successfully'
  });
};

/**
 * Get user's shared content
 */
export const getUserSharedContent = async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!.id;
  const page = parseInt(req.query.page as string) || 1;
  const limit = Math.min(parseInt(req.query.limit as string) || 10, 50);
  const skip = (page - 1) * limit;

  const sharedContent = await prisma.sharedContent.findMany({
    where: {
      userId,
      isActive: true
    },
    orderBy: {
      createdAt: 'desc'
    },
    skip,
    take: limit,
    include: {
      user: {
        select: {
          id: true,
          name: true,
          avatar: true
        }
      }
    }
  });

  const total = await prisma.sharedContent.count({
    where: {
      userId,
      isActive: true
    }
  });

  res.json({
    success: true,
    data: sharedContent,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    },
    message: 'User shared content retrieved successfully'
  });
};

/**
 * Delete/deactivate a shared content
 */
export const deleteShare = async (req: AuthenticatedRequest, res: Response) => {
  const { shareId } = req.params;
  const userId = req.user!.id;

  const sharedContent = await prisma.sharedContent.findUnique({
    where: { shareId }
  });

  if (!sharedContent) {
    throw createError('Shared content not found', 404);
  }

  if (sharedContent.userId !== userId) {
    throw createError('Access denied', 403);
  }

  await prisma.sharedContent.update({
    where: { shareId },
    data: { isActive: false }
  });

  res.json({
    success: true,
    message: 'Share link deactivated successfully'
  });
};
