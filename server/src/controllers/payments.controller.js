const ProductModel = require('../models/Product.model');
const UserModel = require('../models/User.model');
const TransactionModel = require('../models/Transaction.model');
const AffiliateModel = require('../models/Affiliate.model');

/**
 * Payments Controller
 * Handles payment-related HTTP requests
 */
const paymentsController = {
  /**
   * ============================================
   * DUMMY: Simulierter Kauf
   * ============================================
   * 
   * Dieser Endpoint simuliert einen echten Kauf und erstellt alle
   * nötigen Datenbankeinträge (Transaktion, Earnings-Update, etc.)
   * 
   * SPÄTER: Dieser Code wird vom Stripe Webhook aufgerufen,
   * nicht direkt vom Frontend. Die Logik bleibt aber gleich!
   * 
   * POST /api/v1/payments/simulate-purchase
   */
  async simulatePurchase(req, res, next) {
    try {
      const { productId, affiliateCode } = req.body;
      const buyerId = req.userId;
      
      // Auth Check
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
      
    // DUMMY/TESTING: Eigenes Produkt kaufen erlaubt
    // TODO: Vor Production wieder aktivieren!
    // if (product.user_id === buyerId) {
    //   return res.status(400).json({
    //     success: false,
    //     message: 'Du kannst dein eigenes Produkt nicht kaufen'
    //   });
    // }
      
      const sellerId = product.user_id;
      const amount = parseFloat(product.price);
      
      // Seller laden für Level/Fee
      const seller = await UserModel.findById(sellerId);
      if (!seller) {
        return res.status(404).json({
          success: false,
          message: 'Verkäufer nicht gefunden'
        });
      }
      
      // Platform Fee basierend auf Seller-Level
      const platformFeePercent = UserModel.getPlatformFee(seller.level);
      const platformFee = Math.round(amount * (platformFeePercent / 100) * 100) / 100;
      
      // Affiliate Commission berechnen
      let promoterId = null;
      let promoterCommission = 0;
      
      if (affiliateCode) {
        const affiliateLink = await AffiliateModel.findByCode(affiliateCode);
        
        if (affiliateLink && affiliateLink.product_id === productId && affiliateLink.is_active) {
          // Prüfe dass Promoter nicht der Käufer ist
          if (affiliateLink.promoter_id !== buyerId) {
            promoterId = affiliateLink.promoter_id;
            const commissionPercent = affiliateLink.affiliate_commission || product.affiliate_commission || 20;
            promoterCommission = Math.round(amount * (commissionPercent / 100) * 100) / 100;
          }
        }
      }
      
      // Seller-Betrag berechnen
      const sellerAmount = Math.round((amount - platformFee - promoterCommission) * 100) / 100;
      
      // ============================================
      // DUMMY: Hier würde normalerweise Stripe sein
      // ============================================
      const stripePaymentId = `DUMMY_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      // Transaktion erstellen
      const transaction = await TransactionModel.create({
        product_id: productId,
        buyer_id: buyerId,
        seller_id: sellerId,
        promoter_id: promoterId,
        amount: amount,
        platform_fee: platformFee,
        seller_amount: sellerAmount,
        promoter_commission: promoterCommission,
        stripe_payment_id: stripePaymentId,
        status: 'completed'
      });
      
      // Product Sales erhöhen
      await ProductModel.incrementSales(productId);
      
      // Seller Earnings aktualisieren (mit Level-Check)
      await UserModel.updateEarnings(sellerId, sellerAmount);
      
      // Promoter Earnings aktualisieren (falls vorhanden)
      if (promoterId && promoterCommission > 0) {
        await UserModel.updateEarnings(promoterId, promoterCommission);
      }
      
      console.log(`[DUMMY PURCHASE] Product: ${product.title}, Amount: ${amount}€, Seller gets: ${sellerAmount}€, Platform: ${platformFee}€, Affiliate: ${promoterCommission}€`);
      
      res.json({
        success: true,
        data: {
          transactionId: transaction.id,
          product: {
            id: product.id,
            title: product.title
          },
          payment: {
            amount: amount,
            platformFee: platformFee,
            sellerAmount: sellerAmount,
            promoterCommission: promoterCommission
          },
          // DUMMY Flag für Frontend
          isDummy: true
        },
        message: 'Kauf erfolgreich! (Simulation)'
      });
      
    } catch (error) {
      console.error('Simulate purchase error:', error);
      next(error);
    }
  },

  /**
   * Create Stripe checkout session
   * POST /api/v1/payments/create-checkout
   * 
   * TODO: Implementierung mit echtem Stripe
   */
  async createCheckout(req, res, next) {
    // Placeholder für echte Stripe Integration
    res.json({
      success: false,
      message: 'Stripe Checkout noch nicht implementiert. Nutze /simulate-purchase zum Testen.'
    });
  },

  /**
   * Stripe Webhook Handler
   * POST /api/v1/payments/webhook
   * 
   * TODO: Implementierung mit echtem Stripe
   * Die Logik aus simulatePurchase wird hierher verschoben
   */
  async handleWebhook(req, res, next) {
    // Placeholder für echte Stripe Webhook Handling
    res.json({ received: true });
  },

  /**
   * Get user transactions
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
      
      // Transaktionen als Verkäufer
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
  }
};

module.exports = paymentsController;