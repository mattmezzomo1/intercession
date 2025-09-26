import { Response } from 'express';
import prisma from '../utils/database';
import { AuthenticatedRequest, PrayerRequestQuery } from '../types';
import { createPrayerRequestSchema, updatePrayerRequestSchema, prayerRequestQuerySchema } from '../utils/validation';
import { createError } from '../middleware/errorHandler';
import { calculateDistance, isValidCoordinates } from '../utils/location';

export const createPrayerRequest = async (req: AuthenticatedRequest, res: Response) => {
  const validatedData = createPrayerRequestSchema.parse(req.body);
  const userId = req.user!.id;

  // If no location provided, use user's location
  let { latitude, longitude, city, country } = validatedData;
  if (!latitude || !longitude) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { latitude: true, longitude: true, city: true, country: true }
    });
    
    latitude = latitude || user?.latitude || undefined;
    longitude = longitude || user?.longitude || undefined;
    city = city || user?.city || undefined;
    country = country || user?.country || undefined;
  }

  const prayerRequest = await prisma.prayerRequest.create({
    data: {
      title: validatedData.title,
      content: validatedData.content,
      urgent: validatedData.urgent,
      privacy: validatedData.privacy,
      userId,
      categoryId: validatedData.categoryId,
      languageId: validatedData.languageId,
      latitude,
      longitude,
      city,
      country,
      images: validatedData.images ? {
        create: validatedData.images.map(url => ({ url }))
      } : undefined
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          avatar: true,
          createdAt: true,
          updatedAt: true
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

  res.status(201).json({
    success: true,
    data: prayerRequest,
    message: 'Prayer request created successfully'
  });
};

export const getPrayerRequests = async (req: AuthenticatedRequest, res: Response) => {
  const parsedQuery = prayerRequestQuerySchema.parse(req.query);
  const { page = 1, limit = 10, category, urgent, status, userId, language, latitude, longitude, maxDistance = 50 } = parsedQuery;
  const currentUserId = req.user?.id;

  const skip = (page - 1) * limit;

  // Build where clause
  const where: any = {
    privacy: 'PUBLIC', // Only show public prayers for now
    ...(category && { category: { slug: category } }),
    ...(urgent !== undefined && { urgent }),
    ...(status && { status }),
    ...(userId && { userId }),
    ...(language && { language: { code: language } })
  };

  // If user is authenticated, exclude prayers they've already interceded for
  if (currentUserId) {
    const userIntercessions = await prisma.intercession.findMany({
      where: { userId: currentUserId },
      select: { prayerRequestId: true }
    });

    const intercededPrayerIds = userIntercessions.map(i => i.prayerRequestId);

    if (intercededPrayerIds.length > 0) {
      where.id = {
        notIn: intercededPrayerIds
      };
    }
  }

  // If user is authenticated, include their languages
  if (req.user && !language) {
    const userLanguages = await prisma.userLanguage.findMany({
      where: { userId: req.user.id },
      select: { languageId: true }
    });
    
    if (userLanguages.length > 0) {
      where.languageId = {
        in: userLanguages.map(ul => ul.languageId)
      };
    }
  }

  // Location-based filtering
  let orderBy: any = [{ createdAt: 'desc' }];
  
  if (isValidCoordinates(latitude, longitude)) {
    // Add distance filter if maxDistance is specified
    if (maxDistance) {
      // This is a simplified approach - in production, you'd want to use a proper spatial query
      where.AND = [
        { latitude: { not: null } },
        { longitude: { not: null } }
      ];
    }
  }

  const [prayerRequests, total] = await Promise.all([
    prisma.prayerRequest.findMany({
      where,
      skip,
      take: limit,
      orderBy,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            avatar: true,
            createdAt: true,
            updatedAt: true
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
    }),
    prisma.prayerRequest.count({ where })
  ]);

  // Calculate distances if user location is provided
  let processedRequests = prayerRequests;
  if (isValidCoordinates(latitude, longitude)) {
    processedRequests = prayerRequests
      .map(request => ({
        ...request,
        distance: request.latitude && request.longitude
          ? calculateDistance(latitude!, longitude!, request.latitude, request.longitude)
          : null
      }))
      .filter(request => !maxDistance || !request.distance || request.distance <= maxDistance)
      .sort((a, b) => {
        // Sort by distance first, then by creation date
        if (a.distance && b.distance) {
          return a.distance - b.distance;
        }
        if (a.distance && !b.distance) return -1;
        if (!a.distance && b.distance) return 1;
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
  }

  // Add hasUserInterceded flag (will be false since we filtered out interceded prayers)
  const processedRequestsWithFlags = processedRequests.map(request => ({
    ...request,
    hasUserInterceded: false
  }));

  const totalPages = Math.ceil(total / limit);

  res.json({
    success: true,
    data: processedRequestsWithFlags,
    pagination: {
      page,
      limit,
      total,
      totalPages
    }
  });
};

export const getPrayerRequest = async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;

  const prayerRequest = await prisma.prayerRequest.findUnique({
    where: { id },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          avatar: true,
          createdAt: true,
          updatedAt: true
        }
      },
      category: true,
      language: true,
      images: true,
      intercessions: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              avatar: true
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      },
      comments: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              avatar: true
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      },
      _count: {
        select: {
          intercessions: true,
          comments: true
        }
      }
    }
  });

  if (!prayerRequest) {
    throw createError('Prayer request not found', 404);
  }

  // Check privacy settings
  if (prayerRequest.privacy !== 'PUBLIC' && prayerRequest.userId !== req.user?.id) {
    throw createError('Access denied', 403);
  }

  res.json({
    success: true,
    data: prayerRequest
  });
};

export const updatePrayerRequest = async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const validatedData = updatePrayerRequestSchema.parse(req.body);
  const userId = req.user!.id;

  // Check if prayer request exists and belongs to user
  const existingRequest = await prisma.prayerRequest.findUnique({
    where: { id }
  });

  if (!existingRequest) {
    throw createError('Prayer request not found', 404);
  }

  if (existingRequest.userId !== userId) {
    throw createError('Access denied', 403);
  }

  const updatedRequest = await prisma.prayerRequest.update({
    where: { id },
    data: validatedData,
    include: {
      user: {
        select: {
          id: true,
          name: true,
          avatar: true,
          createdAt: true,
          updatedAt: true
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

  res.json({
    success: true,
    data: updatedRequest,
    message: 'Prayer request updated successfully'
  });
};

export const deletePrayerRequest = async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const userId = req.user!.id;

  // Check if prayer request exists and belongs to user
  const existingRequest = await prisma.prayerRequest.findUnique({
    where: { id }
  });

  if (!existingRequest) {
    throw createError('Prayer request not found', 404);
  }

  if (existingRequest.userId !== userId) {
    throw createError('Access denied', 403);
  }

  await prisma.prayerRequest.delete({
    where: { id }
  });

  res.json({
    success: true,
    message: 'Prayer request deleted successfully'
  });
};

export const getTrendingPrayerRequests = async (req: AuthenticatedRequest, res: Response) => {
  const parsedQuery = prayerRequestQuerySchema.parse(req.query);
  const { page = 1, limit = 10, language } = parsedQuery;
  const userId = req.user?.id;

  const skip = (page - 1) * limit;

  // Build where clause for trending (last 7 days with most intercessions)
  const where: any = {
    privacy: 'PUBLIC',
    createdAt: {
      gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // Last 7 days
    },
    ...(language && { language: { code: language } })
  };

  // If user is authenticated, include their languages
  if (req.user && !language) {
    const userLanguages = await prisma.userLanguage.findMany({
      where: { userId: req.user.id },
      select: { languageId: true }
    });

    if (userLanguages.length > 0) {
      where.languageId = {
        in: userLanguages.map(ul => ul.languageId)
      };
    }
  }

  const [prayerRequests, total] = await Promise.all([
    prisma.prayerRequest.findMany({
      where,
      skip,
      take: limit,
      orderBy: [
        { intercessions: { _count: 'desc' } },
        { comments: { _count: 'desc' } },
        { createdAt: 'desc' }
      ],
      include: {
        user: {
          select: {
            id: true,
            name: true,
            avatar: true,
            createdAt: true,
            updatedAt: true
          }
        },
        category: true,
        language: true,
        images: true,
        comments: {
          take: 3,
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
        },
        intercessions: {
          take: 3,
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
        },
        _count: {
          select: {
            intercessions: true,
            comments: true
          }
        }
      }
    }),
    prisma.prayerRequest.count({ where })
  ]);

  // Add hasUserInterceded flag and correct comment counts
  const prayerRequestsWithFlags = await Promise.all(
    prayerRequests.map(async (request) => {
      let hasUserInterceded = false;

      if (userId) {
        // Check if current user has interceded (check all intercessions, not just those with comments)
        const userIntercession = await prisma.intercession.findFirst({
          where: { userId, prayerRequestId: request.id }
        });
        hasUserInterceded = !!userIntercession;
      }

      // Count intercessions with comments
      const intercessionsWithCommentsCount = await prisma.intercession.count({
        where: {
          prayerRequestId: request.id,
          comment: { not: null }
        }
      });

      // Update the _count to include intercession comments
      const updatedCount = {
        ...request._count,
        comments: (request._count.comments || 0) + intercessionsWithCommentsCount
      };

      return {
        ...request,
        hasUserInterceded,
        _count: updatedCount
      };
    })
  );

  const totalPages = Math.ceil(total / limit);

  res.json({
    success: true,
    data: prayerRequestsWithFlags,
    pagination: {
      page,
      limit,
      total,
      totalPages
    }
  });
};
