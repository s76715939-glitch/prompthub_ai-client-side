import Stripe from 'stripe';

let stripeClient = null;

export function getStripeServer() {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey || secretKey.includes('sk_test_51...')) {
    // Return null if key is placeholder or missing, so API routes can handle fallback gracefully
    return null;
  }

  if (!stripeClient) {
    stripeClient = new Stripe(secretKey, {
      apiVersion: '2023-10-16',
    });
  }

  return stripeClient;
}
