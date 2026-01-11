import express from 'express';

const router = express.Router();

// ===== LEADERBOARDS =====

// GET /api/v1/leaderboards/top-sellers - Top Selling Users
router.get('/top-sellers', async (req, res, next) => {
  try {
    const { period = '30d', limit = 20 } = req.query;

    const periodMap = {
      '7d': '7 days',
      '30d': '30 days',
      '90d': '90 days',
      'all': null,
    };

    const interval = periodMap[period];

    let query = `
      SELECT
        u.id,
        u.username,
        u.email,
        u.level,
        COUNT(DISTINCT t.id) as total_sales,
        COALESCE(SUM(t.amount), 0) as total_revenue,
        COALESCE(AVG(t.amount), 0) as avg_order_value,
        COALESCE(SUM(t.seller_amount), 0) as total_earnings
      FROM users u
      LEFT JOIN transactions t ON t.seller_id = u.id AND t.status = 'completed'
    `;

    if (interval) {
      query += ` AND t.created_at > NOW() - INTERVAL '${interval}'`;
    }

    query += `
      GROUP BY u.id, u.username, u.email, u.level
      HAVING COUNT(DISTINCT t.id) > 0
      ORDER BY total_revenue DESC
      LIMIT $1
    `;

    const result = await req.db.query(query, [limit]);

    res.json({
      success: true,
      data: result.rows.map((row, index) => ({
        ...row,
        rank: index + 1,
        total_revenue: parseFloat(row.total_revenue),
        avg_order_value: parseFloat(row.avg_order_value),
        total_earnings: parseFloat(row.total_earnings),
      })),
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/v1/leaderboards/top-affiliates - Top Affiliate Marketers
router.get('/top-affiliates', async (req, res, next) => {
  try {
    const { period = '30d', limit = 20 } = req.query;

    const periodMap = {
      '7d': '7 days',
      '30d': '30 days',
      '90d': '90 days',
      'all': null,
    };

    const interval = periodMap[period];

    let query = `
      SELECT
        u.id,
        u.username,
        u.email,
        u.level,
        COUNT(DISTINCT t.id) as total_conversions,
        COALESCE(SUM(t.promoter_commission), 0) as total_commission,
        COALESCE(SUM(t.amount), 0) as total_sales_generated,
        COALESCE(AVG(t.promoter_commission), 0) as avg_commission
      FROM users u
      LEFT JOIN transactions t ON t.promoter_id = u.id AND t.status = 'completed'
    `;

    if (interval) {
      query += ` AND t.created_at > NOW() - INTERVAL '${interval}'`;
    }

    query += `
      GROUP BY u.id, u.username, u.email, u.level
      HAVING COUNT(DISTINCT t.id) > 0
      ORDER BY total_commission DESC
      LIMIT $1
    `;

    const result = await req.db.query(query, [limit]);

    res.json({
      success: true,
      data: result.rows.map((row, index) => ({
        ...row,
        rank: index + 1,
        total_commission: parseFloat(row.total_commission),
        total_sales_generated: parseFloat(row.total_sales_generated),
        avg_commission: parseFloat(row.avg_commission),
      })),
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/v1/leaderboards/top-products - Top Products by Sales
router.get('/top-products', async (req, res, next) => {
  try {
    const { period = '30d', limit = 20 } = req.query;

    const periodMap = {
      '7d': '7 days',
      '30d': '30 days',
      '90d': '90 days',
      'all': null,
    };

    const interval = periodMap[period];

    let query = `
      SELECT
        p.id,
        p.title,
        p.price,
        p.category,
        u.username as creator,
        COUNT(DISTINCT t.id) as total_sales,
        COALESCE(SUM(t.amount), 0) as total_revenue,
        p.views,
        CASE
          WHEN p.views > 0 THEN (COUNT(DISTINCT t.id)::float / p.views) * 100
          ELSE 0
        END as conversion_rate
      FROM products p
      LEFT JOIN users u ON u.id = p.user_id
      LEFT JOIN transactions t ON t.product_id = p.id AND t.status = 'completed'
    `;

    if (interval) {
      query += ` AND t.created_at > NOW() - INTERVAL '${interval}'`;
    }

    query += `
      GROUP BY p.id, p.title, p.price, p.category, u.username, p.views
      HAVING COUNT(DISTINCT t.id) > 0
      ORDER BY total_revenue DESC
      LIMIT $1
    `;

    const result = await req.db.query(query, [limit]);

    res.json({
      success: true,
      data: result.rows.map((row, index) => ({
        ...row,
        rank: index + 1,
        price: parseFloat(row.price),
        total_revenue: parseFloat(row.total_revenue),
        conversion_rate: parseFloat(row.conversion_rate),
      })),
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/v1/leaderboards/fastest-growing - Fastest Growing Users
router.get('/fastest-growing', async (req, res, next) => {
  try {
    const { limit = 20 } = req.query;

    const query = `
      WITH recent_revenue AS (
        SELECT
          u.id,
          u.username,
          u.email,
          u.level,
          u.created_at,
          COALESCE(SUM(CASE
            WHEN t.created_at > NOW() - INTERVAL '30 days' THEN t.seller_amount
            ELSE 0
          END), 0) as last_30d_revenue,
          COALESCE(SUM(CASE
            WHEN t.created_at > NOW() - INTERVAL '60 days' AND t.created_at <= NOW() - INTERVAL '30 days'
            THEN t.seller_amount
            ELSE 0
          END), 0) as prev_30d_revenue,
          COALESCE(SUM(t.seller_amount), 0) as total_revenue
        FROM users u
        LEFT JOIN transactions t ON t.seller_id = u.id AND t.status = 'completed'
        WHERE u.created_at > NOW() - INTERVAL '90 days'
        GROUP BY u.id, u.username, u.email, u.level, u.created_at
      )
      SELECT
        id,
        username,
        email,
        level,
        created_at,
        last_30d_revenue,
        prev_30d_revenue,
        total_revenue,
        CASE
          WHEN prev_30d_revenue > 0 THEN
            ((last_30d_revenue - prev_30d_revenue) / prev_30d_revenue) * 100
          WHEN last_30d_revenue > 0 THEN 100
          ELSE 0
        END as growth_rate
      FROM recent_revenue
      WHERE last_30d_revenue > 0
      ORDER BY growth_rate DESC
      LIMIT $1
    `;

    const result = await req.db.query(query, [limit]);

    res.json({
      success: true,
      data: result.rows.map((row, index) => ({
        ...row,
        rank: index + 1,
        last_30d_revenue: parseFloat(row.last_30d_revenue),
        prev_30d_revenue: parseFloat(row.prev_30d_revenue),
        total_revenue: parseFloat(row.total_revenue),
        growth_rate: parseFloat(row.growth_rate),
      })),
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/v1/leaderboards/most-active - Most Active Users
router.get('/most-active', async (req, res, next) => {
  try {
    const { period = '30d', limit = 20 } = req.query;

    const periodMap = {
      '7d': '7 days',
      '30d': '30 days',
      '90d': '90 days',
      'all': null,
    };

    const interval = periodMap[period];

    let query = `
      WITH user_activity AS (
        SELECT
          u.id,
          u.username,
          u.email,
          u.level,
          COUNT(DISTINCT CASE WHEN t.seller_id = u.id THEN t.id END) as sales_count,
          COUNT(DISTINCT CASE WHEN t.promoter_id = u.id THEN t.id END) as promotions_count,
          COUNT(DISTINCT p.id) as products_count
        FROM users u
        LEFT JOIN transactions t ON (t.seller_id = u.id OR t.promoter_id = u.id) AND t.status = 'completed'
    `;

    if (interval) {
      query += ` AND t.created_at > NOW() - INTERVAL '${interval}'`;
    }

    query += `
        LEFT JOIN products p ON p.user_id = u.id
        GROUP BY u.id, u.username, u.email, u.level
      )
      SELECT
        *,
        (sales_count + promotions_count + products_count) as activity_score
      FROM user_activity
      WHERE (sales_count + promotions_count + products_count) > 0
      ORDER BY activity_score DESC
      LIMIT $1
    `;

    const result = await req.db.query(query, [limit]);

    res.json({
      success: true,
      data: result.rows.map((row, index) => ({
        ...row,
        rank: index + 1,
      })),
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/v1/leaderboards/overview - Leaderboard Overview Stats
router.get('/overview', async (req, res, next) => {
  try {
    // Top seller
    const topSeller = await req.db.query(`
      SELECT u.username, COALESCE(SUM(t.amount), 0) as total_revenue
      FROM users u
      LEFT JOIN transactions t ON t.seller_id = u.id AND t.status = 'completed'
      GROUP BY u.id, u.username
      ORDER BY total_revenue DESC
      LIMIT 1
    `);

    // Top affiliate
    const topAffiliate = await req.db.query(`
      SELECT u.username, COALESCE(SUM(t.promoter_commission), 0) as total_commission
      FROM users u
      LEFT JOIN transactions t ON t.promoter_id = u.id AND t.status = 'completed'
      GROUP BY u.id, u.username
      ORDER BY total_commission DESC
      LIMIT 1
    `);

    // Top product
    const topProduct = await req.db.query(`
      SELECT p.title, COALESCE(SUM(t.amount), 0) as total_revenue
      FROM products p
      LEFT JOIN transactions t ON t.product_id = p.id AND t.status = 'completed'
      GROUP BY p.id, p.title
      ORDER BY total_revenue DESC
      LIMIT 1
    `);

    res.json({
      success: true,
      data: {
        topSeller: topSeller.rows[0] || null,
        topAffiliate: topAffiliate.rows[0] || null,
        topProduct: topProduct.rows[0] || null,
      },
    });
  } catch (error) {
    next(error);
  }
});

export default router;
