/**
 * Stripe Controller
 * Handles Stripe Connect Onboarding and Webhooks
 */

const stripeService = require('../services/stripe.service');
const UserModel = require('../models/User.model');

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
            requirements: stripeAccountDetails.requirements?.currently_due || [],
            pendingVerification: stripeAccountDetails.requirements?.pending_verification || []
          } : null,
          
          // Konfiguration
          stripeConfigured: stripeService.isStripeConfigured(),
          stripeMode: stripeService.STRIPE_MODE
        }
      });

    } catch (error) {
      next(error);
    }
  },

  /**
   * Startet Stripe Connect Onboarding
   * POST /api/v1/stripe/connect/start
   * 
   * Erstellt Account falls nicht vorhanden und gibt Onboarding-URL zurück
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

      // Prüfen ob Stripe konfiguriert ist
      if (!stripeService.isStripeConfigured()) {
        return res.status(503).json({
          success: false,
          message: 'Stripe ist derzeit nicht verfügbar. Bitte versuche es später erneut.',
          code: 'STRIPE_NOT_CONFIGURED'
        });
      }

      const user = await UserModel.findById(userId);
      
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User nicht gefunden'
        });
      }

      let stripeAccountId = user.stripe_account_id;

      // Falls noch kein Account existiert, erstellen
      if (!stripeAccountId) {
        const account = await stripeService.createConnectAccount(user);
        stripeAccountId = account.id;
      }

      // Onboarding-Link erstellen
      const accountLink = await stripeService.createOnboardingLink(stripeAccountId);

      res.json({
        success: true,
        data: {
          onboardingUrl: accountLink.url,
          expiresAt: new Date(accountLink.expires_at * 1000).toISOString()
        }
      });

    } catch (error) {
      console.error('Start Onboarding Error:', error);
      
      // Spezifische Stripe-Fehler behandeln
      if (error.type === 'StripeInvalidRequestError') {
        return res.status(400).json({
          success: false,
          message: 'Stripe-Anfrage fehlgeschlagen: ' + error.message
        });
      }
      
      next(error);
    }
  },

  /**
   * Fortsetzung des Onboardings (falls abgebrochen)
   * POST /api/v1/stripe/connect/continue
   */
  async continueOnboarding(req, res, next) {
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
          message: 'Stripe ist derzeit nicht verfügbar'
        });
      }

      const user = await UserModel.findById(userId);
      
      if (!user || !user.stripe_account_id) {
        return res.status(400).json({
          success: false,
          message: 'Kein Stripe-Konto vorhanden. Bitte starte das Onboarding neu.'
        });
      }

      // Neuen Onboarding-Link erstellen
      const accountLink = await stripeService.createOnboardingLink(user.stripe_account_id);

      res.json({
        success: true,
        data: {
          onboardingUrl: accountLink.url,
          expiresAt: new Date(accountLink.expires_at * 1000).toISOString()
        }
      });

    } catch (error) {
      next(error);
    }
  },

  /**
   * Link zum Stripe Express Dashboard
   * GET /api/v1/stripe/connect/dashboard
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

      if (!stripeService.isStripeConfigured()) {
        return res.status(503).json({
          success: false,
          message: 'Stripe ist derzeit nicht verfügbar'
        });
      }

      const user = await UserModel.findById(userId);
      
      if (!user || !user.stripe_account_id) {
        return res.status(400).json({
          success: false,
          message: 'Kein Stripe-Konto vorhanden'
        });
      }

      // Prüfen ob Onboarding abgeschlossen
      if (!user.stripe_onboarding_complete) {
        return res.status(400).json({
          success: false,
          message: 'Bitte schließe zuerst das Onboarding ab',
          code: 'ONBOARDING_INCOMPLETE'
        });
      }

      const loginLink = await stripeService.createDashboardLink(user.stripe_account_id);

      res.json({
        success: true,
        data: {
          dashboardUrl: loginLink.url
        }
      });

    } catch (error) {
      next(error);
    }
  },

  // ============================================
  // Webhooks
  // ============================================

  /**
   * Stripe Connect Webhook Handler
   * POST /api/v1/stripe/webhooks/connect
   * 
   * Events:
   * - account.updated: Connect Account Status geändert
   * - account.application.deauthorized: User hat Verbindung getrennt
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

    // Event loggen
    await stripeService.logWebhookEvent(event, 'processing');

    try {
      switch (event.type) {
        case 'account.updated':
          await stripeService.handleAccountUpdated(event.data.object);
          break;

        case 'account.application.deauthorized':
          // User hat die Verbindung in seinem Stripe Dashboard getrennt
          console.log(`[Stripe Webhook] Account deauthorized: ${event.data.object.id}`);
          // Hier könntest du den Account-Status zurücksetzen
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
   * Events:
   * - checkout.session.completed: Zahlung erfolgreich
   * - payment_intent.succeeded: Payment Intent erfolgreich
   * - transfer.created: Transfer erstellt
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

    // Event loggen
    await stripeService.logWebhookEvent(event, 'processing');

    try {
      switch (event.type) {
        case 'checkout.session.completed': {
          const transactionData = await stripeService.handleCheckoutCompleted(event.data.object);
          // TODO: Transaktion in DB erstellen (siehe payments.controller)
          console.log('[Stripe Webhook] Checkout completed, Transaktion:', transactionData);
          break;
        }

        case 'transfer.created':
          await stripeService.handleTransferCreated(event.data.object);
          break;

        case 'transfer.paid':
          // Transfer wurde erfolgreich ausgeführt
          console.log(`[Stripe Webhook] Transfer paid: ${event.data.object.id}`);
          break;

        case 'payout.paid':
          await stripeService.handlePayoutPaid(event.data.object);
          break;

        case 'payout.failed':
          console.error(`[Stripe Webhook] Payout failed: ${event.data.object.id}`);
          // Hier Fehlerbehandlung implementieren
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

module.exports = stripeController;