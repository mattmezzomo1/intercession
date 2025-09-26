import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import { AuthenticatedRequest, JWTPayload } from '../types';
import { createError } from './errorHandler';
import { getUserSubscriptionStatus } from './subscription';

const prisma = new PrismaClient();

export const authenticate = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw createError('Access token required', 401);
    }

    const token = authHeader.substring(7);
    
    if (!process.env.JWT_SECRET) {
      throw createError('JWT secret not configured', 500);
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET) as JWTPayload;
    
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
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
        updatedAt: true
      }
    });

    if (!user) {
      throw createError('User not found', 401);
    }

    // Get subscription status
    const subscriptionStatus = await getUserSubscriptionStatus(user.id);

    req.user = user;
    req.isPremium = subscriptionStatus.isPremium;
    req.subscription = subscriptionStatus.subscription;

    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      next(createError('Invalid token', 401));
    } else {
      next(error);
    }
  }
};

export const optionalAuth = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next();
    }

    const token = authHeader.substring(7);
    
    if (!process.env.JWT_SECRET) {
      return next();
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET) as JWTPayload;
    
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
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
        updatedAt: true
      }
    });

    if (user) {
      // Get subscription status
      const subscriptionStatus = await getUserSubscriptionStatus(user.id);

      req.user = user;
      req.isPremium = subscriptionStatus.isPremium;
      req.subscription = subscriptionStatus.subscription;
    }

    next();
  } catch (error) {
    // Ignore auth errors for optional auth
    next();
  }
};
