const AffiliateModel = require('../models/Affiliate.model');
const ProductModel = require('../models/Product.model');

/**
 * Promotion Controller
 * Handles all affiliate/promotion related HTTP requests
 */
const promotionController = {
  /**
   * Generate affiliate link
   * POST /api/v1/promotion/generate-link
   */
  async generateLink(req, res, next) {
    try {
      const userId = req.userId || 1;
      const { productId } = req.body;
      
      if (!productId) {
        return res.status(400).json({
          success: false,
          message: 'Product ID erforderlich'
        });
      }
      
      // Check if product exists
      const product = await ProductModel.findById(productId);
      if (!product) {
        return res.status(404).json({
          success: false,
          message: 'Produkt nicht gefunden'
        });
      }
      
      // Create or get existing affiliate link
      const affiliateLink = await AffiliateModel.create({
        product_id: productId,
        promoter_id: userId
      });
      
      const baseUrl = process.env.CLIENT_URL || 'http://localhost:3000';
      
      res.json({
        success: true,
        data: {
          link: `${baseUrl}/p/${productId}?ref=${affiliateLink.code}`,
          code: affiliateLink.code,
          commission: product.affiliate_commission
        }
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Get my promoted products
   * GET /api/v1/promotion/my-promotions
   */
  async getMyPromotions(req, res, next) {
    try {
      const userId = req.userId || 1;
      
      const promotions = await AffiliateModel.findByPromoterId(userId);
      
      res.json({
        success: true,
        data: promotions.map(p => ({
          id: p.id,
          productId: p.product_id,
          productTitle: p.product_title,
          productPrice: parseFloat(p.product_price || 0),
          productThumbnail: p.product_thumbnail,
          commission: p.affiliate_commission,
          code: p.code,
          clicks: p.clicks || 0,
          conversions: parseInt(p.conversions || 0),
          isActive: p.is_active,
          createdAt: p.created_at
        }))
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Get my promoter network (who promotes for me)
   * GET /api/v1/promotion/my-network
   */
  async getMyNetwork(req, res, next) {
    try {
      const userId = req.userId || 1;
      
      // Get all products by user
      const products = await ProductModel.findByUserId(userId);
      
      if (products.length === 0) {
        return res.json({
          success: true,
          data: []
        });
      }
      
      // Get promoters for each product
      const networkPromises = products.map(p => AffiliateModel.findByProductId(p.id));
      const networkResults = await Promise.all(networkPromises);
      
      // Flatten and aggregate by promoter
      const promoterMap = new Map();
      
      networkResults.flat().forEach(promo => {
        if (!promo) return;
        
        const existing = promoterMap.get(promo.promoter_id);
        if (existing) {
          existing.conversions += parseInt(promo.conversions || 0);
          existing.totalEarned += parseFloat(promo.total_earned || 0);
          existing.productsPromoted += 1;
        } else {
          promoterMap.set(promo.promoter_id, {
            id: promo.promoter_id,
            username: promo.promoter_username,
            name: promo.promoter_name,
            avatar: promo.promoter_avatar,
            conversions: parseInt(promo.conversions || 0),
            totalEarned: parseFloat(promo.total_earned || 0),
            productsPromoted: 1
          });
        }
      });
      
      res.json({
        success: true,
        data: Array.from(promoterMap.values()).sort((a, b) => b.conversions - a.conversions)
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Track affiliate link click
   * POST /api/v1/promotion/track-click
   */
  async trackClick(req, res, next) {
    try {
      const { code } = req.body;
      
      if (!code) {
        return res.status(400).json({
          success: false,
          message: 'Affiliate code erforderlich'
        });
      }
      
      await AffiliateModel.incrementClicks(code);
      
      res.json({
        success: true,
        message: 'Click tracked'
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Invite promoter (placeholder)
   * POST /api/v1/promotion/invite
   */
  async invite(req, res, next) {
    try {
      const { email } = req.body;
      
      // TODO: Implement email invitation system
      res.json({
        success: true,
        message: 'Einladungssystem kommt bald'
      });
    } catch (error) {
      next(error);
    }
  }
};

module.exports = promotionController;