/**
 * Stripe Configuration
 * Payment processing setup
 * 
 * HINWEIS: Die eigentliche Checkout-Logik liegt in stripe.service.js
 * Diese Datei enthält nur grundlegende Konfiguration und Helper.
 */

const Stripe = require('stripe');

// Initialize Stripe with secret key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2023-10-16'
});

/**
 * Create a Stripe Connect account for a creator
 */
const createConnectAccount = async (user) => {
  try {
    const account = await stripe.accounts.create({
      type: 'express',
      country: 'DE',
      email: user.email,
      capabilities: {
        card_payments: { requested: true },
        transfers: { requested: true }
      },
      business_type: 'individual',
      metadata: {
        monemee_user_id: user.id.toString()
      }
    });

    return account;
  } catch (error) {
    console.error('Stripe Connect account creation error:', error);
    throw error;
  }
};

/**
 * Create account link for onboarding
 */
const createAccountLink = async (accountId, refreshUrl, returnUrl) => {
  try {
    const accountLink = await stripe.accountLinks.create({
      account: accountId,
      refresh_url: refreshUrl,
      return_url: returnUrl,
      type: 'account_onboarding'
    });

    return accountLink;
  } catch (error) {
    console.error('Stripe account link creation error:', error);
    throw error;
  }
};

/**
 * Handle webhook events
 */
const constructWebhookEvent = (payload, signature) => {
  return stripe.webhooks.constructEvent(
    payload,
    signature,
    process.env.STRIPE_WEBHOOK_SECRET
  );
};

module.exports = {
  stripe,
  createConnectAccount,
  createAccountLink,
  constructWebhookEvent
};