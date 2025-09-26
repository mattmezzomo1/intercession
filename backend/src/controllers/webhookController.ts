import { Request, Response } from 'express';
import Stripe from 'stripe';
import prisma from '../utils/database';
import { createError } from '../middleware/errorHandler';

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20',
});

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export const handleStripeWebhook = async (req: Request, res: Response) => {
  const sig = req.headers['stripe-signature'] as string;
  let event: Stripe.Event;

  try {
    // Verify webhook signature
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    // Check if we've already processed this event
    const existingEvent = await prisma.webhookEvent.findUnique({
      where: { stripeEventId: event.id }
    });

    if (existingEvent && existingEvent.processed) {
      console.log(`Event ${event.id} already processed`);
      return res.json({ received: true });
    }

    // Store the event
    await prisma.webhookEvent.upsert({
      where: { stripeEventId: event.id },
      update: {
        eventType: event.type,
        data: JSON.stringify(event.data),
        updatedAt: new Date()
      },
      create: {
        stripeEventId: event.id,
        eventType: event.type,
        data: JSON.stringify(event.data),
        processed: false
      }
    });

    // Handle the event
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutSessionCompleted(event.data.object as Stripe.Checkout.Session);
        break;
      
      case 'customer.subscription.created':
        await handleSubscriptionCreated(event.data.object as Stripe.Subscription);
        break;
      
      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object as Stripe.Subscription);
        break;
      
      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
        break;
      
      case 'invoice.payment_succeeded':
        await handleInvoicePaymentSucceeded(event.data.object as Stripe.Invoice);
        break;
      
      case 'invoice.payment_failed':
        await handleInvoicePaymentFailed(event.data.object as Stripe.Invoice);
        break;
      
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    // Mark event as processed
    await prisma.webhookEvent.update({
      where: { stripeEventId: event.id },
      data: { processed: true }
    });

    res.json({ received: true });
  } catch (error: any) {
    console.error('Error processing webhook:', error);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
};

async function handleCheckoutSessionCompleted(session: Stripe.Checkout.Session) {
  console.log('Processing checkout session completed:', session.id);
  
  const userId = session.metadata?.userId;
  if (!userId) {
    console.error('No userId in session metadata');
    return;
  }

  // The subscription will be handled by the subscription.created event
  // Here we just log the successful checkout
  console.log(`Checkout completed for user ${userId}`);
}

async function handleSubscriptionCreated(subscription: Stripe.Subscription) {
  console.log('Processing subscription created:', subscription.id);
  
  const customer = await stripe.customers.retrieve(subscription.customer as string);
  if (!customer || customer.deleted) {
    console.error('Customer not found');
    return;
  }

  const userId = (customer as Stripe.Customer).metadata?.userId;
  if (!userId) {
    console.error('No userId in customer metadata');
    return;
  }

  // Create subscription in database
  await prisma.subscription.create({
    data: {
      userId,
      stripeSubscriptionId: subscription.id,
      stripePriceId: subscription.items.data[0].price.id,
      stripeCustomerId: subscription.customer as string,
      status: subscription.status.toUpperCase() as any,
      plan: 'PREMIUM',
      currentPeriodStart: new Date(subscription.current_period_start * 1000),
      currentPeriodEnd: new Date(subscription.current_period_end * 1000),
      cancelAtPeriodEnd: subscription.cancel_at_period_end
    }
  });

  console.log(`Subscription created for user ${userId}`);
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  console.log('Processing subscription updated:', subscription.id);
  
  await prisma.subscription.updateMany({
    where: { stripeSubscriptionId: subscription.id },
    data: {
      status: subscription.status.toUpperCase() as any,
      currentPeriodStart: new Date(subscription.current_period_start * 1000),
      currentPeriodEnd: new Date(subscription.current_period_end * 1000),
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
      canceledAt: subscription.canceled_at ? new Date(subscription.canceled_at * 1000) : null,
      updatedAt: new Date()
    }
  });

  console.log(`Subscription updated: ${subscription.id}`);
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  console.log('Processing subscription deleted:', subscription.id);
  
  await prisma.subscription.updateMany({
    where: { stripeSubscriptionId: subscription.id },
    data: {
      status: 'CANCELED',
      canceledAt: new Date(),
      updatedAt: new Date()
    }
  });

  console.log(`Subscription deleted: ${subscription.id}`);
}

async function handleInvoicePaymentSucceeded(invoice: Stripe.Invoice) {
  console.log('Processing invoice payment succeeded:', invoice.id);
  
  const customer = await stripe.customers.retrieve(invoice.customer as string);
  if (!customer || customer.deleted) {
    console.error('Customer not found');
    return;
  }

  const userId = (customer as Stripe.Customer).metadata?.userId;
  if (!userId) {
    console.error('No userId in customer metadata');
    return;
  }

  // Find subscription
  const subscription = await prisma.subscription.findFirst({
    where: { stripeSubscriptionId: invoice.subscription as string }
  });

  // Create payment record
  await prisma.payment.create({
    data: {
      userId,
      subscriptionId: subscription?.id,
      stripePaymentId: invoice.payment_intent as string,
      stripeInvoiceId: invoice.id,
      amount: invoice.amount_paid,
      currency: invoice.currency.toUpperCase(),
      status: 'SUCCEEDED',
      description: `Payment for ${invoice.lines.data[0]?.description || 'Premium subscription'}`
    }
  });

  console.log(`Payment succeeded for user ${userId}, amount: ${invoice.amount_paid}`);
}

async function handleInvoicePaymentFailed(invoice: Stripe.Invoice) {
  console.log('Processing invoice payment failed:', invoice.id);
  
  const customer = await stripe.customers.retrieve(invoice.customer as string);
  if (!customer || customer.deleted) {
    console.error('Customer not found');
    return;
  }

  const userId = (customer as Stripe.Customer).metadata?.userId;
  if (!userId) {
    console.error('No userId in customer metadata');
    return;
  }

  // Find subscription
  const subscription = await prisma.subscription.findFirst({
    where: { stripeSubscriptionId: invoice.subscription as string }
  });

  // Create payment record
  await prisma.payment.create({
    data: {
      userId,
      subscriptionId: subscription?.id,
      stripeInvoiceId: invoice.id,
      amount: invoice.amount_due,
      currency: invoice.currency.toUpperCase(),
      status: 'FAILED',
      description: `Failed payment for ${invoice.lines.data[0]?.description || 'Premium subscription'}`
    }
  });

  console.log(`Payment failed for user ${userId}, amount: ${invoice.amount_due}`);
}
