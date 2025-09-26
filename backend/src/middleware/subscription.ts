import { Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthenticatedRequest } from '../types';
import { createError } from './errorHandler';

const prisma = new PrismaClient();

// Check if user has premium subscription
export const checkPremiumSubscription = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      throw createError('Authentication required', 401);
    }

    const subscription = await prisma.subscription.findFirst({
      where: {
        userId: req.user.id,
        status: 'ACTIVE',
        currentPeriodEnd: {
          gte: new Date()
        }
      }
    });

    // Add premium status to request
    req.isPremium = !!subscription;
    req.subscription = subscription;

    next();
  } catch (error) {
    next(error);
  }
};

// Require premium subscription
export const requirePremium = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      throw createError('Authentication required', 401);
    }

    const subscription = await prisma.subscription.findFirst({
      where: {
        userId: req.user.id,
        status: 'ACTIVE',
        currentPeriodEnd: {
          gte: new Date()
        }
      }
    });

    if (!subscription) {
      throw createError('Premium subscription required', 403);
    }

    req.isPremium = true;
    req.subscription = subscription;

    next();
  } catch (error) {
    next(error);
  }
};

// Get user subscription status (utility function)
export const getUserSubscriptionStatus = async (userId: string) => {
  const subscription = await prisma.subscription.findFirst({
    where: {
      userId,
      status: 'ACTIVE',
      currentPeriodEnd: {
        gte: new Date()
      }
    }
  });

  return {
    isPremium: !!subscription,
    subscription
  };
};
