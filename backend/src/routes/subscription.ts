import { Router } from 'express';
import { 
  createCheckoutSession,
  getSubscriptionStatus,
  cancelSubscription,
  reactivateSubscription,
  getPaymentHistory
} from '../controllers/subscriptionController';
import { authenticate } from '../middleware/auth';

const router = Router();

// All subscription routes require authentication
router.use(authenticate);

// Create checkout session for premium subscription
router.post('/checkout', createCheckoutSession);

// Get user subscription status
router.get('/status', getSubscriptionStatus);

// Cancel subscription (at period end)
router.post('/cancel', cancelSubscription);

// Reactivate subscription
router.post('/reactivate', reactivateSubscription);

// Get payment history
router.get('/payments', getPaymentHistory);

export default router;
