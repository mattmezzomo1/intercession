import { Response } from 'express';
import prisma from '../utils/database';
import { AuthenticatedRequest } from '../types';
import { createCommentSchema } from '../utils/validation';
import { createError } from '../middleware/errorHandler';

export const createComment = async (req: AuthenticatedRequest, res: Response) => {
  const validatedData = createCommentSchema.parse(req.body);
  const userId = req.user!.id;

  // Check if prayer request exists and is accessible
  const prayerRequest = await prisma.prayerRequest.findUnique({
    where: { id: validatedData.prayerRequestId },
    select: { id: true, privacy: true, userId: true }
  });

  if (!prayerRequest) {
    throw createError('Prayer request not found', 404);
  }

  // Check privacy settings
  if (prayerRequest.privacy !== 'PUBLIC' && prayerRequest.userId !== userId) {
    throw createError('Access denied', 403);
  }

  const comment = await prisma.comment.create({
    data: {
      userId,
      prayerRequestId: validatedData.prayerRequestId,
      content: validatedData.content
    },
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

  res.status(201).json({
    success: true,
    data: comment,
    message: 'Comment created successfully'
  });
};

export const getComments = async (req: AuthenticatedRequest, res: Response) => {
  const { prayerRequestId } = req.params;
  const { page = 1, limit = 10 } = req.query;
  
  const skip = (Number(page) - 1) * Number(limit);

  // Check if prayer request exists and is accessible
  const prayerRequest = await prisma.prayerRequest.findUnique({
    where: { id: prayerRequestId },
    select: { id: true, privacy: true, userId: true }
  });

  if (!prayerRequest) {
    throw createError('Prayer request not found', 404);
  }

  // Check privacy settings
  if (prayerRequest.privacy !== 'PUBLIC' && prayerRequest.userId !== req.user?.id) {
    throw createError('Access denied', 403);
  }

  const [comments, total] = await Promise.all([
    prisma.comment.findMany({
      where: { prayerRequestId },
      skip,
      take: Number(limit),
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            avatar: true
          }
        }
      }
    }),
    prisma.comment.count({
      where: { prayerRequestId }
    })
  ]);

  const totalPages = Math.ceil(total / Number(limit));

  res.json({
    success: true,
    data: comments,
    pagination: {
      page: Number(page),
      limit: Number(limit),
      total,
      totalPages
    }
  });
};

export const updateComment = async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const { content } = req.body;
  const userId = req.user!.id;

  if (!content || content.trim().length === 0) {
    throw createError('Comment content is required', 400);
  }

  if (content.length > 300) {
    throw createError('Comment must be less than 300 characters', 400);
  }

  const comment = await prisma.comment.findUnique({
    where: { id }
  });

  if (!comment) {
    throw createError('Comment not found', 404);
  }

  if (comment.userId !== userId) {
    throw createError('Access denied', 403);
  }

  const updatedComment = await prisma.comment.update({
    where: { id },
    data: { content: content.trim() },
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

  res.json({
    success: true,
    data: updatedComment,
    message: 'Comment updated successfully'
  });
};

export const deleteComment = async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const userId = req.user!.id;

  const comment = await prisma.comment.findUnique({
    where: { id }
  });

  if (!comment) {
    throw createError('Comment not found', 404);
  }

  if (comment.userId !== userId) {
    throw createError('Access denied', 403);
  }

  await prisma.comment.delete({
    where: { id }
  });

  res.json({
    success: true,
    message: 'Comment deleted successfully'
  });
};
