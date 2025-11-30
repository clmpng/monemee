const db = require('../config/database');
const crypto = require('crypto');

/**
 * Affiliate Model
 * Raw SQL queries for affiliate_links table
 */
const AffiliateModel = {
  /**
   * Generate unique affiliate code
   */
  generateCode() {
    return crypto.randomBytes(4).toString('hex').toUpperCase();
  },

  /**
   * Find affiliate link by code
   */
  async findByCode(code) {
    const query = `
      SELECT 
        al.*,
        p.title as product_title,
        p.price as product_price,
        p.affiliate_commission,
        u.username as promoter_username
      FROM affiliate_links al
      JOIN products p ON al.product_id = p.id
      JOIN users u ON al.promoter_id = u.id
      WHERE al.code = $1 AND al.is_active = true
    `;
    
    const result = await db.query(query, [code]);
    return result.rows[0] || null;
  },

  /**
   * Find affiliate links by promoter
   */
  async findByPromoterId(promoterId) {
    const query = `
      SELECT 
        al.*,
        p.title as product_title,
        p.price as product_price,
        p.thumbnail_url as product_thumbnail,
        p.affiliate_commission,
        (
          SELECT COUNT(*) FROM transactions t 
          WHERE t.promoter_id = al.promoter_id 
          AND t.product_id = al.product_id
        ) as conversions
      FROM affiliate_links al
      JOIN products p ON al.product_id = p.id
      WHERE al.promoter_id = $1
      ORDER BY al.created_at DESC
    `;
    
    const result = await db.query(query, [promoterId]);
    return result.rows;
  },

  /**
   * Find affiliate links by product (for creators to see who promotes)
   */
  async findByProductId(productId) {
    const query = `
      SELECT 
        al.*,
        u.username as promoter_username,
        u.name as promoter_name,
        u.avatar_url as promoter_avatar,
        (
          SELECT COUNT(*) FROM transactions t 
          WHERE t.promoter_id = al.promoter_id 
          AND t.product_id = al.product_id
        ) as conversions,
        (
          SELECT COALESCE(SUM(promoter_commission), 0) FROM transactions t 
          WHERE t.promoter_id = al.promoter_id 
          AND t.product_id = al.product_id
        ) as total_earned
      FROM affiliate_links al
      JOIN users u ON al.promoter_id = u.id
      WHERE al.product_id = $1
      ORDER BY conversions DESC
    `;
    
    const result = await db.query(query, [productId]);
    return result.rows;
  },

  /**
   * Create new affiliate link
   */
  async create(data) {
    const {
      product_id,
      promoter_id
    } = data;

    // Check if link already exists
    const existingQuery = `
      SELECT * FROM affiliate_links 
      WHERE product_id = $1 AND promoter_id = $2
    `;
    const existing = await db.query(existingQuery, [product_id, promoter_id]);
    
    if (existing.rows.length > 0) {
      return existing.rows[0];
    }

    // Generate unique code
    const code = this.generateCode();

    const query = `
      INSERT INTO affiliate_links (product_id, promoter_id, code)
      VALUES ($1, $2, $3)
      RETURNING *
    `;

    const result = await db.query(query, [product_id, promoter_id, code]);
    return result.rows[0];
  },

  /**
   * Increment click count
   */
  async incrementClicks(code) {
    const query = `
      UPDATE affiliate_links 
      SET clicks = clicks + 1 
      WHERE code = $1
      RETURNING clicks
    `;
    
    const result = await db.query(query, [code]);
    return result.rows[0]?.clicks || 0;
  },

  /**
   * Deactivate affiliate link
   */
  async deactivate(id, promoterId) {
    const query = `
      UPDATE affiliate_links 
      SET is_active = false 
      WHERE id = $1 AND promoter_id = $2
      RETURNING *
    `;
    
    const result = await db.query(query, [id, promoterId]);
    return result.rows[0] || null;
  },

  /**
   * Get top promoters for a creator
   */
  async getTopPromoters(creatorId, limit = 10) {
    const query = `
      SELECT 
        u.id,
        u.username,
        u.name,
        u.avatar_url,
        COUNT(DISTINCT t.id) as total_sales,
        SUM(t.amount) as total_revenue,
        SUM(t.promoter_commission) as total_commission
      FROM transactions t
      JOIN users u ON t.promoter_id = u.id
      WHERE t.seller_id = $1 AND t.promoter_id IS NOT NULL
      GROUP BY u.id, u.username, u.name, u.avatar_url
      ORDER BY total_revenue DESC
      LIMIT $2
    `;
    
    const result = await db.query(query, [creatorId, limit]);
    return result.rows;
  },

  /**
   * Get network stats for a creator
   */
  async getNetworkStats(creatorId) {
    const query = `
      SELECT 
        COUNT(DISTINCT al.promoter_id) as total_promoters,
        COUNT(DISTINCT t.id) as total_affiliate_sales,
        COALESCE(SUM(t.promoter_commission), 0) as total_paid_commission
      FROM affiliate_links al
      JOIN products p ON al.product_id = p.id
      LEFT JOIN transactions t ON t.product_id = al.product_id AND t.promoter_id = al.promoter_id
      WHERE p.user_id = $1
    `;
    
    const result = await db.query(query, [creatorId]);
    return result.rows[0];
  }
};

module.exports = AffiliateModel;