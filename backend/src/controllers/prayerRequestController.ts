import { Response } from 'express';
import prisma from '../utils/database';
import { AuthenticatedRequest, PrayerRequestQuery } from '../types';
import { createPrayerRequestSchema, updatePrayerRequestSchema, prayerRequestQuerySchema } from '../utils/validation';
import { createError } from '../middleware/errorHandler';
import { calculateDistance, isValidCoordinates } from '../utils/location';

export const createPrayerRequest = async (req: AuthenticatedRequest, res: Response) => {
  const validatedData = createPrayerRequestSchema.parse(req.body);
  const userId = req.user!.id;

  // Force all prayer requests to be in Portuguese for now
  const portugueseLanguage = await prisma.language.findUnique({
    where: { code: 'pt' }
  });

  if (!portugueseLanguage) {
    throw createError('Portuguese language not found', 500);
  }

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
      languageId: portugueseLanguage.id, // Always use Portuguese
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
  const { page = 1, limit = 10, category, urgent, status, userId, language, latitude, longitude, maxDistance = 12000 } = parsedQuery;
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

  // Store user languages for filtering and sorting
  let userLanguageIds: string[] = [];
  if (req.user && !language) {
    const userLanguages = await prisma.userLanguage.findMany({
      where: { userId: req.user.id },
      select: { languageId: true }
    });

    userLanguageIds = userLanguages.map(ul => ul.languageId);

    // Filter by user's languages (now that all prayers are in Portuguese, this should work)
    if (userLanguageIds.length > 0) {
      where.languageId = {
        in: userLanguageIds
      };
    }
  }

  // Location-based filtering
  let orderBy: any = [{ createdAt: 'desc' }];

  // Note: We don't filter out prayers without location here
  // Instead, we'll handle distance filtering in post-processing
  // This ensures that prayers without location are still visible to all users

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

  // Calculate distances and sort if user location is provided
  let processedRequests = prayerRequests;
  if (isValidCoordinates(latitude, longitude)) {
    processedRequests = prayerRequests
      .map(request => ({
        ...request,
        distance: request.latitude && request.longitude
          ? calculateDistance(latitude!, longitude!, request.latitude, request.longitude)
          : null
      }))
      // Filter by maxDistance only for requests that have location
      .filter(request => {
        // Always include requests without location
        if (!request.distance) return true;
        // For requests with location, apply maxDistance filter
        return !maxDistance || request.distance <= maxDistance;
      })
      .sort((a, b) => {
        // First priority: User's preferred languages
        const aIsUserLanguage = userLanguageIds.includes(a.languageId);
        const bIsUserLanguage = userLanguageIds.includes(b.languageId);

        if (aIsUserLanguage && !bIsUserLanguage) return -1;
        if (!aIsUserLanguage && bIsUserLanguage) return 1;

        // Second priority: Sort by distance (requests with location first)
        if (a.distance && b.distance) {
          // Both have distance - sort by distance
          return a.distance - b.distance;
        }
        if (a.distance && !b.distance) {
          // A has distance, B doesn't - A comes first
          return -1;
        }
        if (!a.distance && b.distance) {
          // A doesn't have distance, B does - B comes first
          return 1;
        }
        // Neither has distance - sort by creation date (newest first)
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
  } else {
    // User doesn't have location - just sort by creation date
    processedRequests = prayerRequests.sort((a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
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
