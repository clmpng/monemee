const ProductModel = require('../models/Product.model');
const UserModel = require('../models/User.model');
const TransactionModel = require('../models/Transaction.model');
const AffiliateModel = require('../models/Affiliate.model');
const stripeService = require('../services/stripe.service');
const { getPlatformFee } = require('../config/levels.config');

/**
 * Payments Controller
 * 
 * ZAHLUNGSMODELL (Option A - Destination Charges):
 * 
 * 1. PRODUKTVERKÄUFE:
 *    - Geld geht DIREKT via Stripe zum Seller
 *    - Platform Fee bleibt bei MoneMee (application_fee)
 *    - Seller muss KEINE Auszahlung anfordern
 * 
 * 2. AFFILIATE-PROVISIONEN:
 *    - Werden aus der Platform Fee bezahlt
 *    - Sammeln sich bei MoneMee
 *    - 7-Tage Clearing-Zeit (Betrugsschutz)
 *    - Affiliate muss Auszahlung anfordern
 */
const paymentsController = {
  /**
   * Create Stripe Checkout Session
   * POST /api/v1/payments/create-checkout
   */
  async createCheckout(req, res, next) {
    try {
      const { productId, affiliateCode } = req.body;
      const buyerId = req.userId;
      
      if (!buyerId) {
        return res.status(401).json({
          success: false,
          message: 'Nicht authentifiziert'
        });
      }

      // Produkt laden
      const product = await ProductModel.findById(productId);
      
      if (!product) {
        return res.status(404).json({
          success: false,
          message: 'Produkt nicht gefunden'
        });
      }
      
      if (product.status !== 'active') {
        return res.status(400).json({
          success: false,
          message: 'Produkt ist nicht verfügbar'
        });
      }

      // Seller laden
      const seller = await UserModel.findById(product.user_id);
      if (!seller) {
        return res.status(404).json({
          success: false,
          message: 'Verkäufer nicht gefunden'
        });
      }

      // Prüfe ob Seller Stripe Connect hat
      if (!seller.stripe_account_id) {
        return res.status(400).json({
          success: false,
          message: 'Der Verkäufer hat noch kein Zahlungskonto eingerichtet',
          code: 'SELLER_NO_STRIPE'
        });
      }

      if (!seller.stripe_charges_enabled) {
        return res.status(400).json({
          success: false,
          message: 'Der Verkäufer kann derzeit keine Zahlungen empfangen',
          code: 'SELLER_CHARGES_DISABLED'
        });
      }

      // Buyer laden
      const buyer = await UserModel.findById(buyerId);
      if (!buyer) {
        return res.status(404).json({
          success: false,
          message: 'Käufer nicht gefunden'
        });
      }

      // Affiliate prüfen
      let promoterId = null;
      let promoterCode = null;
      
      if (affiliateCode) {
        const affiliateLink = await AffiliateModel.findByCode(affiliateCode);
        if (affiliateLink && 
            affiliateLink.product_id === parseInt(productId) && 
            affiliateLink.is_active &&
            affiliateLink.promoter_id !== buyerId) {
          promoterId = affiliateLink.promoter_id;
          promoterCode = affiliateCode;
        }
      }

      // Platform Fee aus Single Source of Truth (levels.config)
      const platformFeePercent = getPlatformFee(seller.level);
      
      // Affiliate Commission vom Produkt
      const affiliateCommission = product.affiliate_commission || 0;

      // Stripe Checkout Session erstellen
      const baseUrl = process.env.CLIENT_URL || process.env.FRONTEND_URL || 'http://localhost:3000';
      
      const session = await stripeService.createCheckoutSession({
        product,
        buyer,
        seller,
        promoterId,
        promoterCode,
        platformFeePercent,
        affiliateCommission,
        successUrl: `${baseUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
        cancelUrl: `${baseUrl}/p/${productId}?checkout=cancelled`
      });

      res.json({
        success: true,
        data: {
          sessionId: session.id,
          checkoutUrl: session.url
        }
      });

    } catch (error) {
      console.error('Create checkout error:', error);
      
      if (error.message?.includes('nicht konfiguriert')) {
        return res.status(503).json({
          success: false,
          message: 'Zahlungen sind derzeit nicht verfügbar',
          code: 'STRIPE_NOT_CONFIGURED'
        });
      }
      
      next(error);
    }
  },

  /**
   * Verify Checkout Session (nach Redirect)
   * GET /api/v1/payments/verify-session/:sessionId
   */
  async verifySession(req, res, next) {
    try {
      const { sessionId } = req.params;
      const userId = req.userId;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Nicht authentifiziert'
        });
      }

      // Session von Stripe abrufen
      const stripe = stripeService.stripe;
      const session = await stripe.checkout.sessions.retrieve(sessionId);

      if (!session) {
        return res.status(404).json({
          success: false,
          message: 'Session nicht gefunden'
        });
      }

      // Prüfe ob Session zu diesem User gehört
      if (session.metadata.buyer_id !== userId.toString()) {
        return res.status(403).json({
          success: false,
          message: 'Keine Berechtigung'
        });
      }

      // Transaktion in DB suchen
      const transaction = await TransactionModel.findByStripeSessionId(sessionId);

      res.json({
        success: true,
        data: {
          status: session.payment_status,
          productId: parseInt(session.metadata.product_id),
          amount: session.amount_total / 100,
          transactionId: transaction?.id || null,
          hasTransaction: !!transaction
        }
      });

    } catch (error) {
      console.error('Verify session error:', error);
      next(error);
    }
  },

  /**
   * Get user transactions (as seller)
   * GET /api/v1/payments/transactions
   */
  async getTransactions(req, res, next) {
    try {
      const userId = req.userId;
      
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Nicht authentifiziert'
        });
      }
      
      const salesTransactions = await TransactionModel.findBySellerId(userId, 50, 0);
      
      res.json({
        success: true,
        data: salesTransactions.map(t => ({
          id: t.id,
          type: 'sale',
          productTitle: t.product_title,
          productThumbnail: t.product_thumbnail,
          buyerName: t.buyer_name,
          amount: parseFloat(t.amount),
          sellerAmount: parseFloat(t.seller_amount),
          platformFee: parseFloat(t.platform_fee),
          status: t.status,
          date: t.created_at
        }))
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Get user purchases (as buyer)
   * GET /api/v1/payments/purchases
   */
  async getPurchases(req, res, next) {
    try {
      const userId = req.userId;
      
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Nicht authentifiziert'
        });
      }
      
      const purchases = await TransactionModel.findByBuyerId(userId, 50, 0);
      
      res.json({
        success: true,
        data: purchases.map(t => ({
          id: t.id,
          productId: t.product_id,
          productTitle: t.product_title,
          productThumbnail: t.product_thumbnail,
          sellerName: t.seller_name,
          amount: parseFloat(t.amount),
          status: t.status,
          date: t.created_at
        }))
      });
    } catch (error) {
      next(error);
    }
  },
};

module.exports = paymentsController;