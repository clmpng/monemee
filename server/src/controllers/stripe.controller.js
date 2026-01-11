/**
 * Stripe Controller
 * Handles all Stripe-related HTTP requests
 *
 * ERWEITERT mit:
 * - Verbesserter Webhook-Validierung
 * - Automatischer Rechnungsstellung
 * - Admin-Alerts
 * - Gast-Checkout Support
 * - Digitale Produktauslieferung (E-Mail + Download-Tokens)
 */

const stripeService = require('../services/stripe.service');
const SellerBillingModel = require('../models/SellerBilling.model');
const InvoiceService = require('../services/invoice.service');
const TransactionModel = require('../models/Transaction.model');
const ProductModel = require('../models/Product.model');
const ProductModuleModel = require('../models/ProductModule.model');
const UserModel = require('../models/User.model');
const DownloadTokenModel = require('../models/DownloadToken.model');
const emailService = require('../services/email.service');

const stripeController = {
  // ============================================
  // Connect Account Endpoints
  // ============================================

  /**
   * Get Connect account status
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
          message: 'Benutzer nicht gefunden'
        });
      }

      // Wenn kein Stripe Account vorhanden
      if (!user.stripe_account_id) {
        return res.json({
          success: true,
          data: {
            stripeConfigured: stripeService.isStripeConfigured(),
            hasStripeAccount: false,
            status: 'none',
            chargesEnabled: false,
            payoutsEnabled: false,
            onboardingComplete: false
          }
        });
      }

      // Aktuellen Status von Stripe abrufen
      const accountStatus = await stripeService.getAccountStatus(user.stripe_account_id);

      res.json({
        success: true,
        data: {
          stripeConfigured: stripeService.isStripeConfigured(),
          hasStripeAccount: true,
          accountId: user.stripe_account_id,
          status: accountStatus.status,
          chargesEnabled: accountStatus.charges_enabled,
          payoutsEnabled: accountStatus.payouts_enabled,
          onboardingComplete: accountStatus.details_submitted,
          stripeDetails: {
            requirements: accountStatus.requirements?.currently_due || []
          }
        }
      });

    } catch (error) {
      console.error('Get connect status error:', error);
      next(error);
    }
  },

  /**
   * Start Stripe Connect onboarding
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

      const user = await UserModel.findById(userId);
      
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'Benutzer nicht gefunden'
        });
      }

      // Prüfe ob bereits ein Account existiert
      if (user.stripe_account_id) {
        // Nur neuen Onboarding-Link erstellen
        const accountLink = await stripeService.createOnboardingLink(user.stripe_account_id);
        return res.json({
          success: true,
          data: {
            onboardingUrl: accountLink.url,
            expiresAt: accountLink.expires_at
          }
        });
      }

      // Neuen Connect Account erstellen
      const account = await stripeService.createConnectAccount(user);

      // Account ID in DB speichern
      await stripeService.updateUserStripeStatus(userId, {
        stripe_account_id: account.id,
        stripe_account_status: 'pending'
      });

      // Onboarding-Link erstellen
      const accountLink = await stripeService.createOnboardingLink(account.id);

      res.json({
        success: true,
        data: {
          onboardingUrl: accountLink.url,
          expiresAt: accountLink.expires_at
        }
      });

    } catch (error) {
      console.error('Start onboarding error:', error);
      next(error);
    }
  },

  /**
   * Get new onboarding link
   * GET /api/v1/stripe/connect/onboarding-link
   */
  async getOnboardingLink(req, res, next) {
    try {
      const userId = req.userId;
      const user = await UserModel.findById(userId);

      if (!user?.stripe_account_id) {
        return res.status(400).json({
          success: false,
          message: 'Kein Stripe Account vorhanden'
        });
      }

      const accountLink = await stripeService.createOnboardingLink(user.stripe_account_id);

      res.json({
        success: true,
        data: {
          url: accountLink.url,
          expiresAt: accountLink.expires_at
        }
      });

    } catch (error) {
      console.error('Get onboarding link error:', error);
      next(error);
    }
  },

  /**
   * Get Stripe Express Dashboard link
   * GET /api/v1/stripe/connect/dashboard-link
   */
  async getDashboardLink(req, res, next) {
    try {
      const userId = req.userId;
      const user = await UserModel.findById(userId);

      if (!user?.stripe_account_id) {
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
      console.error('Get dashboard link error:', error);
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
   * ERWEITERT mit verbesserter Validierung
   */
  async handlePaymentsWebhook(req, res, next) {
    const signature = req.headers['stripe-signature'];
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    if (!webhookSecret) {
      console.error('[Stripe Webhook] STRIPE_WEBHOOK_SECRET nicht konfiguriert');
      return res.status(500).send('Webhook secret not configured');
    }

    let event;

    // 1. Signatur validieren
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
          await handleCheckoutCompleted(event.data.object, event.id);
          break;

        case 'payment_intent.succeeded':
          console.log(`[Stripe Webhook] Payment succeeded: ${event.data.object.id}`);
          break;

        case 'payment_intent.payment_failed':
          console.log(`[Stripe Webhook] Payment failed: ${event.data.object.id}`);
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

        case 'charge.refunded':
          console.log(`[Stripe Webhook] Charge refunded: ${event.data.object.id}`);
          // TODO: Transaktion als refunded markieren
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

// ============================================
// Enhanced Checkout Handler
// ============================================

/**
 * Verarbeitet checkout.session.completed Event
 * MIT VERBESSERTER VALIDIERUNG UND RECHNUNGSSTELLUNG
 */
/**
 * Verarbeitet checkout.session.completed Event
 * Erstellt Rechnung NUR wenn Verkäufer gewerblich ist
 * ERWEITERT: Unterstützt Gast-Checkout und sendet Kaufbestätigungs-E-Mail
 */
async function handleCheckoutCompleted(session, eventId) {
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
  // buyer_id kann leer sein bei Gast-Checkout
  const buyerId = metadata.buyer_id ? parseInt(metadata.buyer_id) : null;
  const sellerId = parseInt(metadata.seller_id);
  const promoterId = metadata.promoter_id ? parseInt(metadata.promoter_id) : null;
  const amount = session.amount_total / 100;
  const platformFee = parseInt(metadata.platform_fee) / 100;
  const affiliateCommission = parseInt(metadata.affiliate_commission) / 100;
  const sellerAmount = amount - platformFee - affiliateCommission;
  const isGuest = metadata.is_guest === 'true' || !buyerId;

  // Käufer-E-Mail aus Stripe Session (immer vorhanden)
  const buyerEmail = session.customer_details?.email || null;

  console.log(`[Stripe Webhook] Checkout: Product ${productId}, Buyer ${buyerId || 'GUEST'}, Email: ${buyerEmail}`);

  // 7 Tage Clearing für Affiliate
  const affiliateAvailableAt = promoterId
    ? new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    : null;

  // Transaktion erstellen (mit buyer_email für Gäste)
  const transaction = await TransactionModel.create({
    product_id: productId,
    buyer_id: buyerId,           // null für Gäste
    buyer_email: buyerEmail,     // E-Mail von Stripe
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
  await UserModel.updateEarnings(sellerId, sellerAmount);

  // Affiliate Provision hinzufügen (mit 7-Tage Clearing)
  if (promoterId && affiliateCommission > 0) {
    await UserModel.addAffiliateCommission(promoterId, affiliateCommission);
    console.log(`[Stripe Webhook] Affiliate commission: ${affiliateCommission}€ for user ${promoterId}`);
  }

  console.log(`[Stripe Webhook] Transaction created: #${transaction.id}`);

  // ========================================
  // RECHNUNG: Nur für gewerbliche Verkäufer
  // ========================================

  const seller = await UserModel.findById(sellerId);
  let createdInvoice = null; // Invoice speichern für E-Mail

  console.log(`[Stripe Webhook] Seller type for user ${sellerId}: ${seller.seller_type}`);

  if (seller.seller_type === 'business') {
    try {
      const product = await ProductModel.findById(productId);
      const buyer = await UserModel.findById(buyerId);
      const billingInfo = await SellerBillingModel.findByUserId(sellerId);

      console.log(`[Stripe Webhook] Billing info for seller ${sellerId}:`, {
        hasBillingInfo: !!billingInfo,
        isComplete: billingInfo ? SellerBillingModel.isComplete(billingInfo) : false,
        billingData: billingInfo ? {
          business_name: billingInfo.business_name,
          street: billingInfo.street,
          zip: billingInfo.zip,
          city: billingInfo.city,
          is_small_business: billingInfo.is_small_business,
          has_tax_id: !!billingInfo.tax_id
        } : null
      });

      if (billingInfo && SellerBillingModel.isComplete(billingInfo)) {
        createdInvoice = await InvoiceService.createInvoiceForTransaction({
          transaction,
          product,
          buyer,
          seller,
          billingInfo
        });

        console.log(`[Stripe Webhook] Invoice created: ${createdInvoice.invoice_number}`);
      } else {
        console.warn(`[Stripe Webhook] Seller ${sellerId} is business but billing incomplete - no invoice created`);
        if (!billingInfo) {
          console.warn(`[Stripe Webhook] → No billing info found in database`);
        } else {
          console.warn(`[Stripe Webhook] → Billing info incomplete. Missing fields.`);
        }
      }
    } catch (invoiceError) {
      // Rechnungsfehler ist nicht kritisch - Transaktion wurde erstellt
      console.error('[Stripe Webhook] Invoice creation failed:', invoiceError);
      console.error('[Stripe Webhook] Invoice error stack:', invoiceError.stack);
    }
  } else {
    console.log(`[Stripe Webhook] Seller ${sellerId} is private - Stripe Receipt only`);
  }

  // ========================================
  // DIGITALE PRODUKTAUSLIEFERUNG
  // Download-Tokens erstellen und E-Mail senden
  // ========================================

  if (buyerEmail) {
    try {
      const product = await ProductModel.findById(productId);
      const seller = await UserModel.findById(sellerId);

      // Module laden
      const modules = await ProductModuleModel.findByProductId(productId);
      const downloadableModules = modules.filter(m => m.type === 'file' && m.file_url);

      // Download-Tokens erstellen (nur für Dateien)
      let downloadLinks = [];
      if (downloadableModules.length > 0) {
        const tokens = await DownloadTokenModel.createForTransaction({
          transactionId: transaction.id,
          buyerId: buyerId,
          buyerEmail: buyerEmail,
          productId: productId,
          modules: downloadableModules
        });

        const baseUrl = process.env.CLIENT_URL || 'http://localhost:3000';
        downloadLinks = tokens.map(t => ({
          title: t.module_title || 'Download',
          url: `${baseUrl}/api/v1/downloads/token/${t.token}`,
          expiresAt: t.expires_at
        }));

        console.log(`[Stripe Webhook] ${downloadLinks.length} Download-Tokens erstellt`);
      }

      // Kaufbestätigungs-E-Mail senden
      const emailResult = await emailService.sendPurchaseConfirmation({
        buyerEmail: buyerEmail,
        productTitle: product.title,
        productThumbnail: product.thumbnail_url,
        sellerName: seller.name || seller.username,
        amount: amount,
        downloadLinks: downloadLinks,
        invoiceUrl: getInvoiceUrl(createdInvoice)
      });

      if (emailResult.success) {
        console.log(`[Stripe Webhook] Kaufbestätigung gesendet an ${buyerEmail}`);
      } else {
        console.warn(`[Stripe Webhook] E-Mail-Versand fehlgeschlagen: ${emailResult.reason || emailResult.error}`);
      }

    } catch (emailError) {
      // E-Mail-Fehler sind nicht kritisch - Transaktion war erfolgreich
      console.error('[Stripe Webhook] Produktauslieferung-Fehler:', emailError);
    }
  } else {
    console.warn(`[Stripe Webhook] Keine E-Mail-Adresse für Käufer - keine E-Mail gesendet`);
  }

  console.log(`[Stripe Webhook] ✓ Checkout complete: Session ${session.id}, Transaction #${transaction.id}${isGuest ? ' (GUEST)' : ''}`);
}

/**
 * Hilfsfunktion: Invoice-URL generieren
 */
function getInvoiceUrl(invoice) {
  if (!invoice || !invoice.access_token) return null;
  return InvoiceService.getPublicUrl(invoice.access_token);
}

module.exports = stripeController;
