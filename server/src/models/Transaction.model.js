const db = require('../config/database');

/**
 * Transaction Model
 * Raw SQL queries for transactions table
 */
const TransactionModel = {
  /**
   * Find transaction by ID
   * Unterstützt Gast-Käufe (buyer_id kann NULL sein)
   */
  async findById(id) {
    const query = `
      SELECT
        t.*,
        p.title as product_title,
        COALESCE(buyer.name, t.buyer_email) as buyer_name,
        COALESCE(buyer.email, t.buyer_email) as buyer_email_display,
        seller.name as seller_name,
        promoter.name as promoter_name
      FROM transactions t
      JOIN products p ON t.product_id = p.id
      LEFT JOIN users buyer ON t.buyer_id = buyer.id
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
   * Unterstützt Gast-Käufe (buyer_id kann NULL sein)
   */
  async findBySellerId(sellerId, limit = 50, offset = 0) {
    const query = `
      SELECT
        t.*,
        p.title as product_title,
        p.thumbnail_url as product_thumbnail,
        COALESCE(buyer.name, t.buyer_email) as buyer_name
      FROM transactions t
      JOIN products p ON t.product_id = p.id
      LEFT JOIN users buyer ON t.buyer_id = buyer.id
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
   * Unterstützt Gast-Käufe: buyer_id kann NULL sein, buyer_email wird dann verwendet
   */
  async create(data) {
    const {
      product_id,
      buyer_id = null,        // NULL für Gäste
      buyer_email = null,     // E-Mail für Gäste (von Stripe)
      seller_id,
      promoter_id = null,
      amount,
      platform_fee,
      seller_amount,
      promoter_commission = 0,
      stripe_payment_id = null,
      stripe_session_id = null,
      affiliate_available_at = null,
      status = 'completed'
    } = data;

    const query = `
      INSERT INTO transactions (
        product_id, buyer_id, buyer_email, seller_id, promoter_id,
        amount, platform_fee, seller_amount, promoter_commission,
        stripe_payment_id, stripe_session_id, affiliate_available_at, status
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
      RETURNING *
    `;

    const values = [
      product_id, buyer_id, buyer_email, seller_id, promoter_id,
      amount, platform_fee, seller_amount, promoter_commission,
      stripe_payment_id, stripe_session_id, affiliate_available_at, status
    ];

    const result = await db.query(query, values);
    return result.rows[0];
  },

  /**
   * Find transactions by buyer email (für Gast-Käufe)
   */
  async findByBuyerEmail(email, limit = 50, offset = 0) {
    const query = `
      SELECT
        t.*,
        p.title as product_title,
        p.thumbnail_url as product_thumbnail,
        seller.name as seller_name
      FROM transactions t
      JOIN products p ON t.product_id = p.id
      JOIN users seller ON t.seller_id = seller.id
      WHERE t.buyer_email = $1
      ORDER BY t.created_at DESC
      LIMIT $2 OFFSET $3
    `;

    const result = await db.query(query, [email, limit, offset]);
    return result.rows;
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
   * Get earnings by time period (daily breakdown)
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
   * Get detailed statistics for a period
   * Returns daily data with all metrics for charts
   */
  async getDetailedStatistics(userId, startDate, endDate) {
    const query = `
      SELECT 
        DATE(created_at) as date,
        COALESCE(SUM(seller_amount), 0) as earnings,
        COALESCE(SUM(amount), 0) as revenue,
        COUNT(*) as sales,
        COALESCE(AVG(amount), 0) as avg_order_value
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
   * Get period comparison (current vs previous)
   */
  async getPeriodComparison(userId, currentStart, currentEnd, previousStart, previousEnd) {
    const query = `
      WITH current_period AS (
        SELECT 
          COALESCE(SUM(seller_amount), 0) as earnings,
          COALESCE(SUM(amount), 0) as revenue,
          COUNT(*) as sales,
          COALESCE(AVG(amount), 0) as avg_order_value
        FROM transactions
        WHERE seller_id = $1 
          AND status = 'completed'
          AND created_at >= $2 
          AND created_at <= $3
      ),
      previous_period AS (
        SELECT 
          COALESCE(SUM(seller_amount), 0) as earnings,
          COALESCE(SUM(amount), 0) as revenue,
          COUNT(*) as sales,
          COALESCE(AVG(amount), 0) as avg_order_value
        FROM transactions
        WHERE seller_id = $1 
          AND status = 'completed'
          AND created_at >= $4 
          AND created_at <= $5
      )
      SELECT 
        c.earnings as current_earnings,
        c.revenue as current_revenue,
        c.sales as current_sales,
        c.avg_order_value as current_avg,
        p.earnings as previous_earnings,
        p.revenue as previous_revenue,
        p.sales as previous_sales,
        p.avg_order_value as previous_avg
      FROM current_period c, previous_period p
    `;
    
    const result = await db.query(query, [
      userId, 
      currentStart, 
      currentEnd, 
      previousStart, 
      previousEnd
    ]);
    return result.rows[0];
  },

  /**
   * Get total views for user's products in a period
   */
  async getViewsInPeriod(userId, startDate, endDate) {
    // Note: This requires a product_views table or tracking
    // For now, we'll return product views from the products table
    const query = `
      SELECT COALESCE(SUM(views), 0) as total_views
      FROM products
      WHERE user_id = $1
    `;
    
    const result = await db.query(query, [userId]);
    return parseInt(result.rows[0]?.total_views || 0);
  },

  /**
   * Get top products by revenue with percentage
   */
  async getTopProductsByRevenue(userId, limit = 5) {
    const query = `
      WITH product_stats AS (
        SELECT 
          p.id,
          p.title,
          p.thumbnail_url,
          p.views,
          COUNT(t.id) as sales,
          COALESCE(SUM(t.seller_amount), 0) as revenue
        FROM products p
        LEFT JOIN transactions t ON t.product_id = p.id 
          AND t.seller_id = $1 
          AND t.status = 'completed'
        WHERE p.user_id = $1
        GROUP BY p.id, p.title, p.thumbnail_url, p.views
      ),
      total_revenue AS (
        SELECT COALESCE(SUM(revenue), 0) as total FROM product_stats
      )
      SELECT 
        ps.*,
        CASE 
          WHEN tr.total > 0 THEN ROUND((ps.revenue / tr.total * 100)::numeric, 1)
          ELSE 0 
        END as percentage,
        CASE 
          WHEN ps.views > 0 THEN ROUND((ps.sales::numeric / ps.views * 100)::numeric, 2)
          ELSE 0 
        END as conversion_rate
      FROM product_stats ps, total_revenue tr
      ORDER BY ps.revenue DESC
      LIMIT $2
    `;
    
    const result = await db.query(query, [userId, limit]);
    return result.rows;
  },

  /**
   * Get recent sales activity
   * Unterstützt Gast-Käufe
   */
  async getRecentSales(userId, limit = 10) {
    const query = `
      SELECT
        t.id,
        t.amount,
        t.seller_amount,
        t.promoter_commission,
        t.promoter_id,
        t.buyer_email,
        t.created_at,
        p.title as product_title,
        p.thumbnail_url as product_thumbnail,
        COALESCE(buyer.name, t.buyer_email) as buyer_name,
        promoter.name as promoter_name,
        promoter.username as promoter_username
      FROM transactions t
      JOIN products p ON t.product_id = p.id
      LEFT JOIN users buyer ON t.buyer_id = buyer.id
      LEFT JOIN users promoter ON t.promoter_id = promoter.id
      WHERE t.seller_id = $1 AND t.status = 'completed'
      ORDER BY t.created_at DESC
      LIMIT $2
    `;

    const result = await db.query(query, [userId, limit]);
    return result.rows;
  },

  /**
   * Check if user has purchased a product
   * Unterstützt sowohl buyer_id als auch buyer_email
   */
  async hasPurchased(buyerId, productId) {
    const query = `
      SELECT id FROM transactions
      WHERE buyer_id = $1 AND product_id = $2 AND status = 'completed'
      LIMIT 1
    `;

    const result = await db.query(query, [buyerId, productId]);
    return result.rows.length > 0;
  },

  /**
   * Check if email has purchased a product (für Gäste)
   */
  async hasPurchasedByEmail(email, productId) {
    const query = `
      SELECT id FROM transactions
      WHERE buyer_email = $1 AND product_id = $2 AND status = 'completed'
      LIMIT 1
    `;

    const result = await db.query(query, [email, productId]);
    return result.rows.length > 0;
  }
};

module.exports = TransactionModel;
