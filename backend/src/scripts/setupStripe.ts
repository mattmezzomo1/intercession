import Stripe from 'stripe';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Initialize Stripe with proper error handling
const getStripe = () => {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error('STRIPE_SECRET_KEY environment variable is not set');
  }
  return new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: '2025-08-27.basil',
  });
};

async function setupStripeProducts() {
  try {
    console.log('🚀 Setting up Stripe products and prices...');

    const stripe = getStripe();

    // Create Premium product
    const product = await stripe.products.create({
      name: 'Intercede Together Premium',
      description: 'Experiência premium sem anúncios com recursos exclusivos',
      metadata: {
        app: 'intercede-together',
        plan: 'premium'
      }
    });

    console.log('✅ Product created:', product.id);

    // Create monthly price
    const monthlyPrice = await stripe.prices.create({
      product: product.id,
      unit_amount: 499, // R$ 4.99 in cents
      currency: 'brl',
      recurring: {
        interval: 'month',
        interval_count: 1
      },
      nickname: 'Premium Monthly',
      metadata: {
        plan: 'premium',
        interval: 'monthly'
      }
    });

    console.log('✅ Monthly price created:', monthlyPrice.id);

    // Create yearly price (with discount)
    const yearlyPrice = await stripe.prices.create({
      product: product.id,
      unit_amount: 4990, // R$ 49.90 in cents (2 months free)
      currency: 'brl',
      recurring: {
        interval: 'year',
        interval_count: 1
      },
      nickname: 'Premium Yearly',
      metadata: {
        plan: 'premium',
        interval: 'yearly'
      }
    });

    console.log('✅ Yearly price created:', yearlyPrice.id);

    console.log('\n📋 Summary:');
    console.log(`Product ID: ${product.id}`);
    console.log(`Monthly Price ID: ${monthlyPrice.id}`);
    console.log(`Yearly Price ID: ${yearlyPrice.id}`);

    console.log('\n🔧 Add these to your environment variables:');
    console.log(`STRIPE_PRODUCT_ID="${product.id}"`);
    console.log(`STRIPE_PRICE_MONTHLY="${monthlyPrice.id}"`);
    console.log(`STRIPE_PRICE_YEARLY="${yearlyPrice.id}"`);

    console.log('\n✨ Stripe setup completed successfully!');

  } catch (error) {
    console.error('❌ Error setting up Stripe:', error);
    process.exit(1);
  }
}

// Run the setup
setupStripeProducts();
