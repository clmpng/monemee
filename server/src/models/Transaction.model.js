const db = require('../config/database');

/**
 * Transaction Model
 * Raw SQL queries for transactions table
 */
const TransactionModel = {
  /**
   * Find transaction by ID
   */
  async findById(id) {
    const query = `
      SELECT 
        t.*,
        p.title as product_title,
        buyer.name as buyer_name,
        seller.name as seller_name,
        promoter.name as promoter_name
      FROM transactions t
      JOIN products p ON t.product_id = p.id
      JOIN users buyer ON t.buyer_id = buyer.id
      JOIN users seller ON t.seller_id = seller.id
      LEFT JOIN users promoter ON t.promoter_id = promoter.id
      WHERE t.id = $1
    `;
    
    const result = await db.query(query, [id]);
    return result.rows[0] || null;
  },

  /**
   * Find transaction by Stripe Payment Intent ID
   */
  async findByStripePaymentId(stripePaymentId) {
    const query = `
      SELECT * FROM transactions
      WHERE stripe_payment_id = $1
    `;
    
    const result = await db.query(query, [stripePaymentId]);
    return result.rows[0] || null;
  },

  /**
   * Find transaction by Stripe Session ID
   * Used for webhook idempotency check
   */
  async findByStripeSessionId(stripeSessionId) {
    const query = `
      SELECT * FROM transactions
      WHERE stripe_session_id = $1
    `;
    
    const result = await db.query(query, [stripeSessionId]);
    return result.rows[0] || null;
  },

  /**
   * Find transactions by seller (creator)
   */
  async findBySellerId(sellerId, limit = 50, offset = 0) {
    const query = `
      SELECT 
        t.*,
        p.title as product_title,
        p.thumbnail_url as product_thumbnail,
        buyer.name as buyer_name
      FROM transactions t
      JOIN products p ON t.product_id = p.id
      JOIN users buyer ON t.buyer_id = buyer.id
      WHERE t.seller_id = $1
      ORDER BY t.created_at DESC
      LIMIT $2 OFFSET $3
    `;
    
    const result = await db.query(query, [sellerId, limit, offset]);
    return result.rows;
  },

  /**
   * Find transactions by buyer (purchases)
   */
  async findByBuyerId(buyerId, limit = 50, offset = 0) {
    const query = `
      SELECT 
        t.*,
        p.title as product_title,
        p.thumbnail_url as product_thumbnail,
        seller.name as seller_name
      FROM transactions t
      JOIN products p ON t.product_id = p.id
      JOIN users seller ON t.seller_id = seller.id
      WHERE t.buyer_id = $1
      ORDER BY t.created_at DESC
      LIMIT $2 OFFSET $3
    `;
    
    const result = await db.query(query, [buyerId, limit, offset]);
    return result.rows;
  },

  /**
   * Find transactions by promoter (affiliate sales)
   */
  async findByPromoterId(promoterId, limit = 50, offset = 0) {
    const query = `
      SELECT 
        t.*,
        p.title as product_title,
        p.thumbnail_url as product_thumbnail,
        seller.name as seller_name
      FROM transactions t
      JOIN products p ON t.product_id = p.id
      JOIN users seller ON t.seller_id = seller.id
      WHERE t.promoter_id = $1
      ORDER BY t.created_at DESC
      LIMIT $2 OFFSET $3
    `;
    
    const result = await db.query(query, [promoterId, limit, offset]);
    return result.rows;
  },

  /**
   * Create new transaction
   */
  async create(data) {
    const {
      product_id,
      buyer_id,
      seller_id,
      promoter_id = null,
      amount,
      platform_fee,
      seller_amount,
      promoter_commission = 0,
      stripe_payment_id = null,
      stripe_session_id = null,
      status = 'completed'
    } = data;

    const query = `
      INSERT INTO transactions (
        product_id, buyer_id, seller_id, promoter_id,
        amount, platform_fee, seller_amount, promoter_commission,
        stripe_payment_id, stripe_session_id, status
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING *
    `;

    const values = [
      product_id, buyer_id, seller_id, promoter_id,
      amount, platform_fee, seller_amount, promoter_commission,
      stripe_payment_id, stripe_session_id, status
    ];

    const result = await db.query(query, values);
    return result.rows[0];
  },

  /**
   * Update transaction status
   */
  async updateStatus(id, status) {
    const query = `
      UPDATE transactions
      SET status = $1, updated_at = NOW()
      WHERE id = $2
      RETURNING *
    `;
    
    const result = await db.query(query, [status, id]);
    return result.rows[0] || null;
  },

  /**
   * Get earnings summary for user
   */
  async getEarningsSummary(userId) {
    const query = `
      SELECT 
        COALESCE(SUM(seller_amount), 0) as product_earnings,
        COUNT(*) as total_sales
      FROM transactions
      WHERE seller_id = $1 AND status = 'completed'
    `;
    
    const result = await db.query(query, [userId]);
    return result.rows[0];
  },

  /**
   * Get affiliate earnings summary for user
   */
  async getAffiliateEarningsSummary(userId) {
    const query = `
      SELECT 
        COALESCE(SUM(promoter_commission), 0) as affiliate_earnings,
        COUNT(*) as total_referrals
      FROM transactions
      WHERE promoter_id = $1 AND status = 'completed'
    `;
    
    const result = await db.query(query, [userId]);
    return result.rows[0];
  },

  /**
   * Get earnings by time period
   */
  async getEarningsByPeriod(userId, startDate, endDate) {
    const query = `
      SELECT 
        DATE(created_at) as date,
        SUM(seller_amount) as earnings,
        COUNT(*) as sales
      FROM transactions
      WHERE seller_id = $1 
        AND status = 'completed'
        AND created_at >= $2 
        AND created_at <= $3
      GROUP BY DATE(created_at)
      ORDER BY date ASC
    `;
    
    const result = await db.query(query, [userId, startDate, endDate]);
    return result.rows;
  },

  /**
   * Get top products by revenue
   */
  async getTopProductsByRevenue(userId, limit = 5) {
    const query = `
      SELECT 
        p.id,
        p.title,
        p.thumbnail_url,
        COUNT(t.id) as sales,
        SUM(t.seller_amount) as revenue
      FROM transactions t
      JOIN products p ON t.product_id = p.id
      WHERE t.seller_id = $1 AND t.status = 'completed'
      GROUP BY p.id, p.title, p.thumbnail_url
      ORDER BY revenue DESC
      LIMIT $2
    `;
    
    const result = await db.query(query, [userId, limit]);
    return result.rows;
  },

  /**
   * Check if user has purchased a product
   */
  async hasPurchased(buyerId, productId) {
    const query = `
      SELECT id FROM transactions
      WHERE buyer_id = $1 AND product_id = $2 AND status = 'completed'
      LIMIT 1
    `;
    
    const result = await db.query(query, [buyerId, productId]);
    return result.rows.length > 0;
  }
};

module.exports = TransactionModel;
