/**
 * Stripe Controller
 * Handles Stripe Connect Onboarding and Webhooks
 * 
 * ZAHLUNGSMODELL (Option A - Destination Charges):
 * - Produktverkäufe gehen direkt zum Seller
 * - Affiliate-Provisionen werden bei MoneMee gesammelt
 */

const stripeService = require('../services/stripe.service');
const UserModel = require('../models/User.model');
const TransactionModel = require('../models/Transaction.model');
const ProductModel = require('../models/Product.model');

const stripeController = {
  
  // ============================================
  // Connect Account Management
  // ============================================

  /**
   * Get Stripe Connect Status für aktuellen User
   * GET /api/v1/stripe/connect/status
   */
  async getConnectStatus(req, res, next) {
    try {
      const userId = req.userId;
      
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Nicht authentifiziert'
        });
      }

      const user = await UserModel.findById(userId);
      
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User nicht gefunden'
        });
      }

      // Wenn User einen Stripe Account hat, Status von Stripe holen
      let stripeAccountDetails = null;
      if (user.stripe_account_id && stripeService.isStripeConfigured()) {
        try {
          stripeAccountDetails = await stripeService.getAccountStatus(user.stripe_account_id);
        } catch (err) {
          console.error('Stripe Account Status Fehler:', err.message);
        }
      }

      res.json({
        success: true,
        data: {
          // Lokaler Status aus DB
          hasStripeAccount: !!user.stripe_account_id,
          accountStatus: user.stripe_account_status || 'not_created',
          chargesEnabled: user.stripe_charges_enabled || false,
          payoutsEnabled: user.stripe_payouts_enabled || false,
          onboardingComplete: user.stripe_onboarding_complete || false,
          
          // Live-Status von Stripe (falls vorhanden)
          stripeDetails: stripeAccountDetails ? {
            chargesEnabled: stripeAccountDetails.charges_enabled,
            payoutsEnabled: stripeAccountDetails.payouts_enabled,
            detailsSubmitted: stripeAccountDetails.details_submitted,
            requirements: stripeAccountDetails.requirements?.currently_due || []
          } : null,
          
          // Config
          stripeConfigured: stripeService.isStripeConfigured(),
          stripeMode: stripeService.STRIPE_MODE
        }
      });

    } catch (error) {
      next(error);
    }
  },

  /**
   * Start Stripe Connect Onboarding
   * POST /api/v1/stripe/connect/start
   */
  async startOnboarding(req, res, next) {
    try {
      const userId = req.userId;
      
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Nicht authentifiziert'
        });
      }

      if (!stripeService.isStripeConfigured()) {
        return res.status(503).json({
          success: false,
          message: 'Stripe ist nicht konfiguriert'
        });
      }

      const user = await UserModel.findById(userId);
      
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User nicht gefunden'
        });
      }

      // Prüfe ob bereits ein Account existiert
      if (user.stripe_account_id) {
        // Account existiert, erstelle neuen Onboarding-Link
        const accountLink = await stripeService.createOnboardingLink(
          user.stripe_account_id,
          '/settings?tab=stripe&status=success',
          '/settings?tab=stripe&status=refresh'
        );

        return res.json({
          success: true,
          data: {
            onboardingUrl: accountLink.url
          }
        });
      }

      // Neuen Connect Account erstellen
      const account = await stripeService.createConnectAccount(user);

      // Onboarding-Link erstellen
      const accountLink = await stripeService.createOnboardingLink(
        account.id,
        '/settings?tab=stripe&status=success',
        '/settings?tab=stripe&status=refresh'
      );

      res.json({
        success: true,
        data: {
          onboardingUrl: accountLink.url
        }
      });

    } catch (error) {
      console.error('Start onboarding error:', error);
      next(error);
    }
  },

  /**
   * Get Onboarding Link (für Fortsetzung)
   * GET /api/v1/stripe/connect/onboarding-link
   */
  async getOnboardingLink(req, res, next) {
    try {
      const userId = req.userId;
      
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Nicht authentifiziert'
        });
      }

      const user = await UserModel.findById(userId);
      
      if (!user || !user.stripe_account_id) {
        return res.status(400).json({
          success: false,
          message: 'Kein Stripe Account vorhanden'
        });
      }

      const accountLink = await stripeService.createOnboardingLink(
        user.stripe_account_id,
        '/settings?tab=stripe&status=success',
        '/settings?tab=stripe&status=refresh'
      );

      res.json({
        success: true,
        data: {
          url: accountLink.url
        }
      });

    } catch (error) {
      next(error);
    }
  },

  /**
   * Get Stripe Dashboard Link
   * GET /api/v1/stripe/connect/dashboard-link
   */
  async getDashboardLink(req, res, next) {
    try {
      const userId = req.userId;
      
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Nicht authentifiziert'
        });
      }

      const user = await UserModel.findById(userId);
      
      if (!user || !user.stripe_account_id) {
        return res.status(400).json({
          success: false,
          message: 'Kein Stripe Account vorhanden'
        });
      }

      const loginLink = await stripeService.createDashboardLink(user.stripe_account_id);

      res.json({
        success: true,
        data: {
          url: loginLink.url
        }
      });

    } catch (error) {
      next(error);
    }
  },

  // ============================================
  // Webhook Handlers
  // ============================================

  /**
   * Stripe Connect Webhook Handler
   * POST /api/v1/stripe/webhooks/connect
   */
  async handleConnectWebhook(req, res, next) {
    const signature = req.headers['stripe-signature'];
    const webhookSecret = process.env.STRIPE_CONNECT_WEBHOOK_SECRET;

    if (!webhookSecret) {
      console.error('[Stripe Webhook] STRIPE_CONNECT_WEBHOOK_SECRET nicht konfiguriert');
      return res.status(500).send('Webhook secret not configured');
    }

    let event;

    try {
      event = stripeService.constructWebhookEvent(req.body, signature, webhookSecret);
    } catch (err) {
      console.error('[Stripe Webhook] Signatur ungültig:', err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    await stripeService.logWebhookEvent(event, 'processing');

    try {
      switch (event.type) {
        case 'account.updated':
          await stripeService.handleAccountUpdated(event.data.object);
          break;

        case 'account.application.deauthorized':
          console.log(`[Stripe Webhook] Account deauthorized: ${event.data.object.id}`);
          break;

        default:
          console.log(`[Stripe Webhook] Unhandled Connect event: ${event.type}`);
      }

      await stripeService.logWebhookEvent(event, 'processed');
      res.json({ received: true });

    } catch (error) {
      console.error('[Stripe Webhook] Verarbeitungsfehler:', error);
      await stripeService.logWebhookEvent(event, 'failed', error.message);
      res.status(500).json({ error: 'Webhook processing failed' });
    }
  },

  /**
   * Stripe Payments Webhook Handler
   * POST /api/v1/stripe/webhooks/payments
   * 
   * Verarbeitet: checkout.session.completed
   */
  async handlePaymentsWebhook(req, res, next) {
    const signature = req.headers['stripe-signature'];
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    if (!webhookSecret) {
      console.error('[Stripe Webhook] STRIPE_WEBHOOK_SECRET nicht konfiguriert');
      return res.status(500).send('Webhook secret not configured');
    }

    let event;

    try {
      event = stripeService.constructWebhookEvent(req.body, signature, webhookSecret);
    } catch (err) {
      console.error('[Stripe Webhook] Signatur ungültig:', err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    await stripeService.logWebhookEvent(event, 'processing');

    try {
      switch (event.type) {
        case 'checkout.session.completed':
          await handleCheckoutCompleted(event.data.object);
          break;

        case 'payment_intent.succeeded':
          console.log(`[Stripe Webhook] Payment succeeded: ${event.data.object.id}`);
          break;

        case 'transfer.created':
          await stripeService.handleTransferCreated(event.data.object);
          break;

        case 'transfer.paid':
          console.log(`[Stripe Webhook] Transfer paid: ${event.data.object.id}`);
          break;

        case 'payout.paid':
          await stripeService.handlePayoutPaid(event.data.object);
          break;

        case 'payout.failed':
          console.error(`[Stripe Webhook] Payout failed: ${event.data.object.id}`);
          break;

        default:
          console.log(`[Stripe Webhook] Unhandled Payment event: ${event.type}`);
      }

      await stripeService.logWebhookEvent(event, 'processed');
      res.json({ received: true });

    } catch (error) {
      console.error('[Stripe Webhook] Verarbeitungsfehler:', error);
      await stripeService.logWebhookEvent(event, 'failed', error.message);
      res.status(500).json({ error: 'Webhook processing failed' });
    }
  }
};

/**
 * Verarbeitet checkout.session.completed Event
 * Erstellt Transaktion und aktualisiert Earnings
 */
async function handleCheckoutCompleted(session) {
  console.log(`[Stripe Webhook] Processing checkout: ${session.id}`);
  
  const metadata = session.metadata;
  
  // Prüfe auf Idempotenz - wurde diese Session schon verarbeitet?
  const existingTransaction = await TransactionModel.findByStripeSessionId(session.id);
  if (existingTransaction) {
    console.log(`[Stripe Webhook] Session ${session.id} already processed, skipping`);
    return;
  }

  // Daten aus Metadata extrahieren
  const productId = parseInt(metadata.product_id);
  const buyerId = parseInt(metadata.buyer_id);
  const sellerId = parseInt(metadata.seller_id);
  const promoterId = metadata.promoter_id ? parseInt(metadata.promoter_id) : null;
  const amount = session.amount_total / 100;
  const platformFee = parseInt(metadata.platform_fee) / 100;
  const affiliateCommission = parseInt(metadata.affiliate_commission) / 100;
  const sellerAmount = amount - platformFee - affiliateCommission;

  // 7 Tage Clearing für Affiliate
  const affiliateAvailableAt = promoterId 
    ? new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) 
    : null;

  // Transaktion erstellen
  const transaction = await TransactionModel.create({
    product_id: productId,
    buyer_id: buyerId,
    seller_id: sellerId,
    promoter_id: promoterId,
    amount: amount,
    platform_fee: platformFee,
    seller_amount: sellerAmount,
    promoter_commission: affiliateCommission,
    stripe_payment_id: session.payment_intent,
    stripe_session_id: session.id,
    affiliate_available_at: affiliateAvailableAt,
    status: 'completed'
  });

  // Product Sales erhöhen
  await ProductModel.incrementSales(productId);

  // Seller Earnings aktualisieren (nur für Level!)
  // Das Geld ist bereits via Destination Charge beim Seller
  await UserModel.updateEarnings(sellerId, sellerAmount);

  // Affiliate Provision hinzufügen (mit 7-Tage Clearing)
  if (promoterId && affiliateCommission > 0) {
    await UserModel.addAffiliateCommission(promoterId, affiliateCommission);
    console.log(`[Stripe Webhook] Affiliate commission: ${affiliateCommission}€ for user ${promoterId}, available at ${affiliateAvailableAt}`);
  }

  console.log(`[Stripe Webhook] Transaction created: #${transaction.id}, Product: ${productId}, Amount: ${amount}€, Seller: ${sellerAmount}€, Affiliate: ${affiliateCommission}€`);
}

module.exports = stripeController;
