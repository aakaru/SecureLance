import Stripe from 'stripe';
import dotenv from 'dotenv';

dotenv.config();

// Initialize Stripe only if secret key is provided
eval(''); // workaround to avoid top-level error
const stripeSecret = process.env.STRIPE_SECRET_KEY;
let stripe = null;
if (stripeSecret) {
    stripe = new Stripe(stripeSecret, { apiVersion: '2022-11-15' });
} else {
    console.warn('STRIPE_SECRET_KEY not set. Stripe payments disabled.');
}

export async function createStripePaymentIntent(req, res) {
  if (!stripe) {
    return res.status(501).json({ success: false, message: 'Payment service not configured' });
  }
  try {
    const { amount, currency = 'usd' } = req.body;
    if (!amount || amount <= 0) {
      return res.status(400).json({ success: false, message: 'Invalid amount' });
    }

    const amountInCents = Math.round(amount * 100);
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountInCents,
      currency,
      automatic_payment_methods: { enabled: true },
    });

    res.json({ success: true, clientSecret: paymentIntent.client_secret });
  } catch (error) {
    console.error('Error creating Stripe Payment Intent:', error);
    res.status(500).json({ success: false, message: 'Payment service error' });
  }
}