/**
 * Stripe Configuration
 * Payment processing setup
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
        earnflow_user_id: user.id.toString()
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
 * Create checkout session for product purchase
 */
const createCheckoutSession = async ({
  product,
  buyer,
  seller,
  promoterCode = null,
  successUrl,
  cancelUrl
}) => {
  try {
    // Calculate fees
    const amount = Math.round(product.price * 100); // Convert to cents
    const platformFeePercent = 12; // Default, should be based on seller level
    const platformFee = Math.round(amount * (platformFeePercent / 100));
    
    let affiliateCommission = 0;
    if (promoterCode) {
      affiliateCommission = Math.round(amount * (product.affiliate_commission / 100));
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'eur',
            product_data: {
              name: product.title,
              description: product.description || undefined,
              images: product.thumbnail_url ? [product.thumbnail_url] : undefined
            },
            unit_amount: amount
          },
          quantity: 1
        }
      ],
      mode: 'payment',
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: {
        product_id: product.id.toString(),
        buyer_id: buyer.id.toString(),
        seller_id: seller.id.toString(),
        promoter_code: promoterCode || '',
        platform_fee: platformFee.toString(),
        affiliate_commission: affiliateCommission.toString()
      },
      // Transfer to seller's connected account
      payment_intent_data: {
        application_fee_amount: platformFee + affiliateCommission,
        transfer_data: {
          destination: seller.stripe_account_id
        }
      }
    });

    return session;
  } catch (error) {
    console.error('Stripe checkout session creation error:', error);
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
  createCheckoutSession,
  constructWebhookEvent
};