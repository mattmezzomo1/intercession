import { Router } from 'express';
import { handleStripeWebhook } from '../controllers/webhookController';

const router = Router();

// Stripe webhook endpoint (no authentication required)
// Note: This route should use raw body parser, not JSON parser
router.post('/stripe', handleStripeWebhook);

export default router;
