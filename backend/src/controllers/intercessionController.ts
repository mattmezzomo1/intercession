import { Response } from 'express';
import prisma from '../utils/database';
import { AuthenticatedRequest } from '../types';
import { createIntercessionSchema } from '../utils/validation';
import { createError } from '../middleware/errorHandler';

export const createIntercession = async (req: AuthenticatedRequest, res: Response) => {
  const validatedData = createIntercessionSchema.parse(req.body);
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

  // Check if user already interceded for this prayer
  const existingIntercession = await prisma.intercession.findFirst({
    where: {
      userId,
      prayerRequestId: validatedData.prayerRequestId
    }
  });

  if (existingIntercession) {
    throw createError('You have already interceded for this prayer request', 409);
  }

  const intercession = await prisma.intercession.create({
    data: {
      userId,
      prayerRequestId: validatedData.prayerRequestId,
      comment: validatedData.comment
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
    data: intercession,
    message: 'Intercession created successfully'
  });
};

export const getIntercessions = async (req: AuthenticatedRequest, res: Response) => {
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

  const [intercessions, total] = await Promise.all([
    prisma.intercession.findMany({
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
    prisma.intercession.count({
      where: { prayerRequestId }
    })
  ]);

  const totalPages = Math.ceil(total / Number(limit));

  res.json({
    success: true,
    data: intercessions,
    pagination: {
      page: Number(page),
      limit: Number(limit),
      total,
      totalPages
    }
  });
};

export const getUserIntercessions = async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!.id;
  const { page = 1, limit = 10 } = req.query;

  const skip = (Number(page) - 1) * Number(limit);

  const [intercessions, total] = await Promise.all([
    prisma.intercession.findMany({
      where: { userId },
      skip,
      take: Number(limit),
      orderBy: { createdAt: 'desc' },
      include: {
        prayerRequest: {
          select: {
            id: true,
            content: true,
            category: {
              select: {
                name: true,
                slug: true
              }
            },
            user: {
              select: {
                id: true,
                name: true,
                avatar: true
              }
            },
            createdAt: true
          }
        }
      }
    }),
    prisma.intercession.count({
      where: { userId }
    })
  ]);

  const totalPages = Math.ceil(total / Number(limit));

  res.json({
    success: true,
    data: intercessions,
    pagination: {
      page: Number(page),
      limit: Number(limit),
      total,
      totalPages
    }
  });
};

export const deleteIntercession = async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const userId = req.user!.id;

  const intercession = await prisma.intercession.findUnique({
    where: { id }
  });

  if (!intercession) {
    throw createError('Intercession not found', 404);
  }

  if (intercession.userId !== userId) {
    throw createError('Access denied', 403);
  }

  await prisma.intercession.delete({
    where: { id }
  });

  res.json({
    success: true,
    message: 'Intercession deleted successfully'
  });
};
