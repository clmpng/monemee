const AffiliateModel = require('../models/Affiliate.model');
const ProductModel = require('../models/Product.model');

/**
 * Affiliate Service
 * Handles affiliate link generation and tracking
 */
const AffiliateService = {
  /**
   * Generate affiliate link for a product
   */
  async generateLink(productId, promoterId) {
    // Check if product exists and is active
    const product = await ProductModel.findById(productId);
    
    if (!product) {
      throw new Error('Produkt nicht gefunden');
    }

    if (product.status !== 'active') {
      throw new Error('Produkt ist nicht aktiv');
    }

    if (product.user_id === promoterId) {
      throw new Error('Du kannst dein eigenes Produkt nicht bewerben');
    }

    // Create or get existing affiliate link
    const affiliateLink = await AffiliateModel.create({
      product_id: productId,
      promoter_id: promoterId
    });

    // Generate full URL
    const baseUrl = process.env.CLIENT_URL || 'https://monemee.app';
    const fullUrl = `${baseUrl}/p/${productId}?ref=${affiliateLink.code}`;

    return {
      ...affiliateLink,
      fullUrl,
      product: {
        id: product.id,
        title: product.title,
        price: product.price,
        commission: product.affiliate_commission
      }
    };
  },

  /**
   * Track affiliate click
   */
  async trackClick(code) {
    const affiliateLink = await AffiliateModel.findByCode(code);
    
    if (!affiliateLink) {
      return null;
    }

    await AffiliateModel.incrementClicks(code);
    
    return affiliateLink;
  },

  /**
   * Validate affiliate code for purchase
   */
  async validateForPurchase(code, productId) {
    const affiliateLink = await AffiliateModel.findByCode(code);
    
    if (!affiliateLink) {
      return { valid: false, reason: 'Ungültiger Affiliate-Code' };
    }

    if (affiliateLink.product_id !== productId) {
      return { valid: false, reason: 'Code gilt nicht für dieses Produkt' };
    }

    if (!affiliateLink.is_active) {
      return { valid: false, reason: 'Affiliate-Link ist deaktiviert' };
    }

    return {
      valid: true,
      promoterId: affiliateLink.promoter_id,
      commission: affiliateLink.affiliate_commission
    };
  },

  /**
   * Calculate commission for a sale
   */
  calculateCommission(amount, commissionPercent) {
    return Math.round((amount * (commissionPercent / 100)) * 100) / 100;
  },

  /**
   * Get promoter stats
   */
  async getPromoterStats(promoterId) {
    const links = await AffiliateModel.findByPromoterId(promoterId);
    
    const totalClicks = links.reduce((sum, link) => sum + link.clicks, 0);
    const totalConversions = links.reduce((sum, link) => sum + (link.conversions || 0), 0);
    const conversionRate = totalClicks > 0 
      ? Math.round((totalConversions / totalClicks) * 100 * 10) / 10 
      : 0;

    return {
      totalLinks: links.length,
      totalClicks,
      totalConversions,
      conversionRate,
      links
    };
  }
};

module.exports = AffiliateService;