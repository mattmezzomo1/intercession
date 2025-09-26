import { Response } from 'express';
import prisma from '../utils/database';
import { createError } from '../middleware/errorHandler';
import { AuthenticatedRequest } from '../types';
import { createPrayerLogSchema, paginationSchema } from '../utils/validation';

export const createPrayerLog = async (req: AuthenticatedRequest, res: Response) => {
  const validatedData = createPrayerLogSchema.parse(req.body);
  const userId = req.user!.id;

  // Parse date or use today
  let prayerDate: Date;
  if (validatedData.date) {
    prayerDate = new Date(validatedData.date);
  } else {
    prayerDate = new Date();
  }
  
  // Set to start of day
  prayerDate.setHours(0, 0, 0, 0);

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

  // Check if user already prayed for this request on this date
  const existingLog = await prisma.prayerLog.findFirst({
    where: {
      userId,
      prayerRequestId: validatedData.prayerRequestId,
      date: prayerDate
    }
  });

  if (existingLog) {
    throw createError('You have already prayed for this request today', 409);
  }

  const prayerLog = await prisma.prayerLog.create({
    data: {
      userId,
      prayerRequestId: validatedData.prayerRequestId,
      date: prayerDate
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          avatar: true
        }
      },
      prayerRequest: {
        select: {
          id: true,
          title: true,
          content: true
        }
      }
    }
  });

  res.status(201).json({
    success: true,
    data: prayerLog,
    message: 'Prayer log created successfully'
  });
};

export const getPrayerLogs = async (req: AuthenticatedRequest, res: Response) => {
  const { prayerRequestId } = req.params;
  const { page = 1, limit = 10 } = paginationSchema.parse(req.query);

  const skip = (page - 1) * limit;

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

  const [prayerLogs, total] = await Promise.all([
    prisma.prayerLog.findMany({
      where: { prayerRequestId },
      skip,
      take: limit,
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
    prisma.prayerLog.count({
      where: { prayerRequestId }
    })
  ]);

  const totalPages = Math.ceil(total / limit);

  res.json({
    success: true,
    data: prayerLogs,
    pagination: {
      page,
      limit,
      total,
      totalPages
    }
  });
};

export const getUserPrayerLogs = async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!.id;
  const { page = 1, limit = 10 } = paginationSchema.parse(req.query);

  const skip = (page - 1) * limit;

  const [prayerLogs, total] = await Promise.all([
    prisma.prayerLog.findMany({
      where: { userId },
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        prayerRequest: {
          select: {
            id: true,
            title: true,
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
    prisma.prayerLog.count({
      where: { userId }
    })
  ]);

  const totalPages = Math.ceil(total / limit);

  res.json({
    success: true,
    data: prayerLogs,
    pagination: {
      page,
      limit,
      total,
      totalPages
    }
  });
};

export const getUserCommittedPrayers = async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!.id;
  const { page = 1, limit = 10 } = paginationSchema.parse(req.query);

  const skip = (page - 1) * limit;

  // Get today's date for checking if user already prayed today
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Get user's intercessions (prayers they committed to)
  const [intercessions, total] = await Promise.all([
    prisma.intercession.findMany({
      where: { userId },
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        prayerRequest: {
          select: {
            id: true,
            title: true,
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

  // Check which prayers the user already prayed for today
  const prayerRequestIds = intercessions.map(i => i.prayerRequestId);
  const todayPrayerLogs = await prisma.prayerLog.findMany({
    where: {
      userId,
      prayerRequestId: { in: prayerRequestIds },
      date: today
    },
    select: { prayerRequestId: true }
  });

  const prayedTodaySet = new Set(todayPrayerLogs.map(log => log.prayerRequestId));

  // Add prayedToday flag to each intercession
  const intercessionsWithStatus = intercessions.map(intercession => ({
    ...intercession,
    prayedToday: prayedTodaySet.has(intercession.prayerRequestId)
  }));

  const totalPages = Math.ceil(total / limit);

  res.json({
    success: true,
    data: intercessionsWithStatus,
    pagination: {
      page,
      limit,
      total,
      totalPages
    }
  });
};

export const deletePrayerLog = async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const userId = req.user!.id;

  const prayerLog = await prisma.prayerLog.findUnique({
    where: { id },
    select: { id: true, userId: true }
  });

  if (!prayerLog) {
    throw createError('Prayer log not found', 404);
  }

  if (prayerLog.userId !== userId) {
    throw createError('Access denied', 403);
  }

  await prisma.prayerLog.delete({
    where: { id }
  });

  res.json({
    success: true,
    message: 'Prayer log deleted successfully'
  });
};
