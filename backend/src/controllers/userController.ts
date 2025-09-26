import { Request, Response } from 'express';
import prisma from '../utils/database';
import { AuthenticatedRequest, UserStats } from '../types';
import { createError } from '../middleware/errorHandler';
import { updateProfileSchema } from '../utils/validation';

export const getProfile = async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!.id;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      name: true,
      avatar: true,
      latitude: true,
      longitude: true,
      city: true,
      country: true,
      timezone: true,
      userType: true,
      userMotivations: true,
      bankAccount: true,
      pixKey: true,
      createdAt: true,
      updatedAt: true,
      languages: {
        include: {
          language: true
        },
        orderBy: [
          { isPrimary: 'desc' },
          { language: { name: 'asc' } }
        ]
      }
    }
  });

  if (!user) {
    throw createError('User not found', 404);
  }

  res.json({
    success: true,
    data: user
  });
};

export const updateProfile = async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!.id;
  const validatedData = updateProfileSchema.parse(req.body);

  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: {
      ...(validatedData.name && { name: validatedData.name }),
      ...(validatedData.avatar !== undefined && { avatar: validatedData.avatar }),
      ...(validatedData.latitude !== undefined && { latitude: validatedData.latitude }),
      ...(validatedData.longitude !== undefined && { longitude: validatedData.longitude }),
      ...(validatedData.city !== undefined && { city: validatedData.city }),
      ...(validatedData.country !== undefined && { country: validatedData.country }),
      ...(validatedData.timezone !== undefined && { timezone: validatedData.timezone }),
      ...(validatedData.bankAccount !== undefined && { bankAccount: validatedData.bankAccount }),
      ...(validatedData.pixKey !== undefined && { pixKey: validatedData.pixKey })
    },
    select: {
      id: true,
      email: true,
      name: true,
      avatar: true,
      latitude: true,
      longitude: true,
      city: true,
      country: true,
      timezone: true,
      userType: true,
      userMotivations: true,
      bankAccount: true,
      pixKey: true,
      createdAt: true,
      updatedAt: true,
      languages: {
        include: {
          language: true
        },
        orderBy: [
          { isPrimary: 'desc' },
          { language: { name: 'asc' } }
        ]
      }
    }
  });

  res.json({
    success: true,
    data: updatedUser,
    message: 'Profile updated successfully'
  });
};

export const getPublicProfile = async (req: Request, res: Response) => {
  const { userId } = req.params;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      avatar: true,
      city: true,
      country: true,
      userType: true,
      userMotivations: true,
      pixKey: true,
      createdAt: true,
      // Estatísticas públicas
      _count: {
        select: {
          prayerRequests: true,
          intercessions: true,
          comments: true
        }
      }
    }
  });

  if (!user) {
    throw createError('User not found', 404);
  }

  // Não mascarar a chave PIX para permitir cópia completa
  // A chave PIX deve estar disponível para doações
  const pixKey = user.pixKey;

  const publicProfile = {
    ...user,
    pixKey,
    stats: {
      prayersShared: user._count.prayerRequests,
      intercessionsMade: user._count.intercessions,
      commentsLeft: user._count.comments
    }
  };

  // Remove o _count do objeto final
  const { _count, ...profileData } = publicProfile;

  res.json({
    success: true,
    data: profileData
  });
};

export const getUserStats = async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!.id;

  const [prayersShared, intercessionsMade, commentsLeft] = await Promise.all([
    prisma.prayerRequest.count({
      where: { userId }
    }),
    prisma.intercession.count({
      where: { userId }
    }),
    prisma.comment.count({
      where: { userId }
    })
  ]);

  // Calculate streak (consecutive days with activity)
  // Temporarily disabled due to database column naming issues
  let streak = 0;

  const stats: UserStats = {
    prayersShared,
    intercessionsMade,
    commentsLeft,
    streak
  };

  res.json({
    success: true,
    data: stats
  });
};

// Geocoding endpoints to avoid CORS issues
export const geocodeCity = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { city } = req.query;

    if (!city || typeof city !== 'string') {
      throw createError('City parameter is required', 400);
    }

    const encodedCity = encodeURIComponent(city);
    const url = `https://nominatim.openstreetmap.org/search?q=${encodedCity}&format=json&limit=1&addressdetails=1`;

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'IntercedeTogetherApp/1.0'
      }
    });

    if (!response.ok) {
      throw createError('Geocoding service unavailable', 503);
    }

    const data = await response.json();

    res.json({
      success: true,
      data: data
    });
  } catch (error) {
    console.error('Geocoding error:', error);
    throw createError('Failed to geocode city', 500);
  }
};

export const reverseGeocode = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { lat, lon } = req.query;

    if (!lat || !lon || typeof lat !== 'string' || typeof lon !== 'string') {
      throw createError('Latitude and longitude parameters are required', 400);
    }

    const url = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json&addressdetails=1`;

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'IntercedeTogetherApp/1.0'
      }
    });

    if (!response.ok) {
      throw createError('Reverse geocoding service unavailable', 503);
    }

    const data = await response.json();

    res.json({
      success: true,
      data: data
    });
  } catch (error) {
    console.error('Reverse geocoding error:', error);
    throw createError('Failed to reverse geocode coordinates', 500);
  }
};

export const getUserPrayerRequests = async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!.id;
  const { page = 1, limit = 10, status } = req.query;
  
  const skip = (Number(page) - 1) * Number(limit);
  
  const where: any = { userId };
  if (status && ['ACTIVE', 'ANSWERED', 'ARCHIVED'].includes(status as string)) {
    where.status = status;
  }

  const [prayerRequests, total] = await Promise.all([
    prisma.prayerRequest.findMany({
      where,
      skip,
      take: Number(limit),
      orderBy: { createdAt: 'desc' },
      include: {
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

  const totalPages = Math.ceil(total / Number(limit));

  res.json({
    success: true,
    data: prayerRequests,
    pagination: {
      page: Number(page),
      limit: Number(limit),
      total,
      totalPages
    }
  });
};

export const deleteAccount = async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!.id;

  // This will cascade delete all related records due to the schema constraints
  await prisma.user.delete({
    where: { id: userId }
  });

  res.json({
    success: true,
    message: 'Account deleted successfully'
  });
};


