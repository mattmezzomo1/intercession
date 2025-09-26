import { Request, Response } from 'express';
import Stripe from 'stripe';
import prisma from '../utils/database';
import { AuthenticatedRequest } from '../types';
import { createError } from '../middleware/errorHandler';
import { ApiResponse } from '../types';

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20',
});

// Create checkout session for premium subscription
export const createCheckoutSession = async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!.id;
  const { priceId = 'price_premium_monthly' } = req.body;

  try {
    // Check if user already has an active subscription
    const existingSubscription = await prisma.subscription.findFirst({
      where: {
        userId,
        status: 'ACTIVE'
      }
    });

    if (existingSubscription) {
      throw createError('User already has an active subscription', 400);
    }

    // Create or get Stripe customer
    let stripeCustomer;
    const existingCustomer = await stripe.customers.list({
      email: req.user!.email,
      limit: 1
    });

    if (existingCustomer.data.length > 0) {
      stripeCustomer = existingCustomer.data[0];
    } else {
      stripeCustomer = await stripe.customers.create({
        email: req.user!.email,
        name: req.user!.name,
        metadata: {
          userId: userId
        }
      });
    }

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer: stripeCustomer.id,
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${process.env.FRONTEND_URL}/subscription/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL}/subscription/cancel`,
      metadata: {
        userId: userId
      }
    });

    const response: ApiResponse = {
      success: true,
      data: {
        sessionId: session.id,
        url: session.url
      },
      message: 'Checkout session created successfully'
    };

    res.json(response);
  } catch (error: any) {
    console.error('Error creating checkout session:', error);
    throw createError(error.message || 'Failed to create checkout session', 500);
  }
};

// Get user subscription status
export const getSubscriptionStatus = async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!.id;

  try {
    const subscription = await prisma.subscription.findFirst({
      where: {
        userId,
        status: 'ACTIVE'
      },
      include: {
        payments: {
          orderBy: {
            createdAt: 'desc'
          },
          take: 5
        }
      }
    });

    const response: ApiResponse = {
      success: true,
      data: {
        isPremium: !!subscription,
        subscription: subscription || null
      },
      message: 'Subscription status retrieved successfully'
    };

    res.json(response);
  } catch (error: any) {
    console.error('Error getting subscription status:', error);
    throw createError(error.message || 'Failed to get subscription status', 500);
  }
};

// Cancel subscription
export const cancelSubscription = async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!.id;

  try {
    const subscription = await prisma.subscription.findFirst({
      where: {
        userId,
        status: 'ACTIVE'
      }
    });

    if (!subscription) {
      throw createError('No active subscription found', 404);
    }

    if (subscription.stripeSubscriptionId) {
      // Cancel at period end in Stripe
      await stripe.subscriptions.update(subscription.stripeSubscriptionId, {
        cancel_at_period_end: true
      });
    }

    // Update subscription in database
    await prisma.subscription.update({
      where: {
        id: subscription.id
      },
      data: {
        cancelAtPeriodEnd: true,
        updatedAt: new Date()
      }
    });

    const response: ApiResponse = {
      success: true,
      data: null,
      message: 'Subscription will be canceled at the end of the current period'
    };

    res.json(response);
  } catch (error: any) {
    console.error('Error canceling subscription:', error);
    throw createError(error.message || 'Failed to cancel subscription', 500);
  }
};

// Reactivate subscription
export const reactivateSubscription = async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!.id;

  try {
    const subscription = await prisma.subscription.findFirst({
      where: {
        userId,
        status: 'ACTIVE',
        cancelAtPeriodEnd: true
      }
    });

    if (!subscription) {
      throw createError('No subscription to reactivate found', 404);
    }

    if (subscription.stripeSubscriptionId) {
      // Reactivate in Stripe
      await stripe.subscriptions.update(subscription.stripeSubscriptionId, {
        cancel_at_period_end: false
      });
    }

    // Update subscription in database
    await prisma.subscription.update({
      where: {
        id: subscription.id
      },
      data: {
        cancelAtPeriodEnd: false,
        updatedAt: new Date()
      }
    });

    const response: ApiResponse = {
      success: true,
      data: null,
      message: 'Subscription reactivated successfully'
    };

    res.json(response);
  } catch (error: any) {
    console.error('Error reactivating subscription:', error);
    throw createError(error.message || 'Failed to reactivate subscription', 500);
  }
};

// Get payment history
export const getPaymentHistory = async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!.id;
  const { page = 1, limit = 10 } = req.query;

  try {
    const payments = await prisma.payment.findMany({
      where: {
        userId
      },
      orderBy: {
        createdAt: 'desc'
      },
      skip: (Number(page) - 1) * Number(limit),
      take: Number(limit)
    });

    const total = await prisma.payment.count({
      where: {
        userId
      }
    });

    const response: ApiResponse = {
      success: true,
      data: {
        payments,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit))
        }
      },
      message: 'Payment history retrieved successfully'
    };

    res.json(response);
  } catch (error: any) {
    console.error('Error getting payment history:', error);
    throw createError(error.message || 'Failed to get payment history', 500);
  }
};
