import express from 'express';

const router = express.Router();

// ===== REVENUE ATTRIBUTION =====

// GET /api/v1/bi/revenue-attribution - Revenue by source/channel
router.get('/revenue-attribution', async (req, res, next) => {
  try {
    const { period = '30d' } = req.query;

    const periodMap = {
      '7d': '7 days',
      '30d': '30 days',
      '90d': '90 days',
      'all': null
    };

    const interval = periodMap[period];

    // Revenue by traffic source (simplified - traffic_source not in current schema)
    // Using promoter presence as proxy for affiliate vs direct sales
    let query = `
      SELECT
        CASE WHEN t.promoter_id IS NOT NULL THEN 'affiliate' ELSE 'direct' END as source,
        COUNT(DISTINCT t.id) as transactions,
        COALESCE(SUM(t.amount), 0) as total_revenue,
        COALESCE(SUM(t.platform_fee), 0) as platform_revenue,
        COALESCE(AVG(t.amount), 0) as avg_transaction_value
      FROM transactions t
      WHERE t.status = 'completed'
    `;

    if (interval) {
      query += ` AND t.created_at > NOW() - INTERVAL '${interval}'`;
    }

    query += `
      GROUP BY CASE WHEN t.promoter_id IS NOT NULL THEN 'affiliate' ELSE 'direct' END
      ORDER BY total_revenue DESC
    `;

    const bySource = await req.db.query(query);

    // Revenue by product category
    let categoryQuery = `
      SELECT
        p.category,
        COUNT(DISTINCT t.id) as transactions,
        COALESCE(SUM(t.amount), 0) as total_revenue,
        COALESCE(SUM(t.platform_fee), 0) as platform_revenue
      FROM transactions t
      LEFT JOIN products p ON p.id = t.product_id
      WHERE t.status = 'completed'
    `;

    if (interval) {
      categoryQuery += ` AND t.created_at > NOW() - INTERVAL '${interval}'`;
    }

    categoryQuery += `
      GROUP BY p.category
      ORDER BY total_revenue DESC
    `;

    const byCategory = await req.db.query(categoryQuery);

    // Revenue by affiliate
    let affiliateQuery = `
      SELECT
        u.username as affiliate,
        COUNT(DISTINCT t.id) as conversions,
        COALESCE(SUM(t.amount), 0) as sales_generated,
        COALESCE(SUM(t.promoter_commission), 0) as commission_paid,
        COALESCE(SUM(t.platform_fee - t.promoter_commission), 0) as net_platform_revenue
      FROM transactions t
      LEFT JOIN users u ON u.id = t.promoter_id
      WHERE t.status = 'completed'
        AND t.promoter_id IS NOT NULL
    `;

    if (interval) {
      affiliateQuery += ` AND t.created_at > NOW() - INTERVAL '${interval}'`;
    }

    affiliateQuery += `
      GROUP BY u.username
      ORDER BY sales_generated DESC
      LIMIT 20
    `;

    const byAffiliate = await req.db.query(affiliateQuery);

    // Revenue by user level
    let levelQuery = `
      SELECT
        u.level,
        COUNT(DISTINCT t.id) as transactions,
        COALESCE(SUM(t.amount), 0) as total_revenue,
        COALESCE(SUM(t.platform_fee), 0) as platform_revenue,
        COALESCE(AVG(t.amount), 0) as avg_transaction_value
      FROM transactions t
      LEFT JOIN users u ON u.id = t.seller_id
      WHERE t.status = 'completed'
    `;

    if (interval) {
      levelQuery += ` AND t.created_at > NOW() - INTERVAL '${interval}'`;
    }

    levelQuery += `
      GROUP BY u.level
      ORDER BY u.level ASC
    `;

    const byLevel = await req.db.query(levelQuery);

    res.json({
      success: true,
      data: {
        bySource: bySource.rows.map(row => ({
          source: row.source,
          transaction_count: parseInt(row.transactions),
          total_revenue: parseFloat(row.total_revenue),
          platform_revenue: parseFloat(row.platform_revenue),
          avg_revenue: parseFloat(row.avg_transaction_value)
        })),
        byCategory: byCategory.rows.map(row => ({
          category: row.category || 'Uncategorized',
          transaction_count: parseInt(row.transactions),
          total_revenue: parseFloat(row.total_revenue),
          platform_revenue: parseFloat(row.platform_revenue)
        })),
        byAffiliate: byAffiliate.rows.map(row => ({
          affiliate: row.affiliate,
          conversions: parseInt(row.conversions),
          sales_generated: parseFloat(row.sales_generated),
          commission_paid: parseFloat(row.commission_paid),
          net_platform_revenue: parseFloat(row.net_platform_revenue)
        })),
        byLevel: byLevel.rows.map(row => ({
          level: row.level,
          transaction_count: parseInt(row.transactions),
          total_revenue: parseFloat(row.total_revenue),
          platform_revenue: parseFloat(row.platform_revenue),
          avg_revenue: parseFloat(row.avg_transaction_value)
        }))
      }
    });
  } catch (error) {
    next(error);
  }
});

// ===== CUSTOMER SEGMENTATION =====

// GET /api/v1/bi/customer-segments - Auto-generated customer segments
router.get('/customer-segments', async (req, res, next) => {
  try {
    // Whales (Top 10% by revenue)
    const whales = await req.db.query(`
      WITH user_revenue AS (
        SELECT
          u.id,
          u.username,
          u.email,
          u.level,
          COALESCE(SUM(t.seller_amount), 0) as total_revenue
        FROM users u
        LEFT JOIN transactions t ON t.seller_id = u.id AND t.status = 'completed'
        GROUP BY u.id, u.username, u.email, u.level
      ),
      revenue_threshold AS (
        SELECT PERCENTILE_CONT(0.9) WITHIN GROUP (ORDER BY total_revenue) as threshold
        FROM user_revenue
      )
      SELECT
        ur.id,
        ur.username,
        ur.email,
        ur.level,
        ur.total_revenue,
        'whale' as segment
      FROM user_revenue ur, revenue_threshold rt
      WHERE ur.total_revenue >= rt.threshold AND ur.total_revenue > 0
      ORDER BY ur.total_revenue DESC
      LIMIT 50
    `);

    // Champions (High engagement + high revenue)
    const champions = await req.db.query(`
      SELECT
        u.id,
        u.username,
        u.email,
        u.level,
        COALESCE(SUM(t.seller_amount), 0) as total_revenue,
        COUNT(DISTINCT t.id) as transaction_count,
        COUNT(DISTINCT p.id) as product_count,
        'champion' as segment
      FROM users u
      LEFT JOIN transactions t ON t.seller_id = u.id AND t.status = 'completed'
      LEFT JOIN products p ON p.user_id = u.id
      WHERE u.created_at < NOW() - INTERVAL '30 days'
      GROUP BY u.id, u.username, u.email, u.level
      HAVING COALESCE(SUM(t.seller_amount), 0) > 500
        AND COUNT(DISTINCT t.id) > 10
        AND COUNT(DISTINCT p.id) > 3
      ORDER BY total_revenue DESC
      LIMIT 50
    `);

    // At Risk (Previously active, now inactive)
    const atRisk = await req.db.query(`
      SELECT
        u.id,
        u.username,
        u.email,
        u.level,
        COALESCE(SUM(CASE
          WHEN t.created_at > NOW() - INTERVAL '90 days' AND t.created_at <= NOW() - INTERVAL '30 days'
          THEN t.seller_amount
          ELSE 0
        END), 0) as past_revenue,
        MAX(t.created_at) as last_transaction,
        'at_risk' as segment
      FROM users u
      LEFT JOIN transactions t ON t.seller_id = u.id AND t.status = 'completed'
      WHERE u.created_at < NOW() - INTERVAL '60 days'
      GROUP BY u.id, u.username, u.email, u.level
      HAVING MAX(t.created_at) < NOW() - INTERVAL '30 days'
        AND MAX(t.created_at) > NOW() - INTERVAL '90 days'
        AND COALESCE(SUM(CASE
          WHEN t.created_at > NOW() - INTERVAL '90 days' AND t.created_at <= NOW() - INTERVAL '30 days'
          THEN t.seller_amount
          ELSE 0
        END), 0) > 100
      ORDER BY past_revenue DESC
      LIMIT 50
    `);

    // New Prospects (< 7 days old)
    const newProspects = await req.db.query(`
      SELECT
        u.id,
        u.username,
        u.email,
        u.level,
        u.created_at,
        COUNT(DISTINCT p.id) as product_count,
        COUNT(DISTINCT t.id) as transaction_count,
        'new_prospect' as segment
      FROM users u
      LEFT JOIN products p ON p.user_id = u.id
      LEFT JOIN transactions t ON t.seller_id = u.id AND t.status = 'completed'
      WHERE u.created_at > NOW() - INTERVAL '7 days'
      GROUP BY u.id, u.username, u.email, u.level, u.created_at
      ORDER BY u.created_at DESC
      LIMIT 50
    `);

    // One-Hit Wonders (1 sale, then nothing)
    const oneHitWonders = await req.db.query(`
      SELECT
        u.id,
        u.username,
        u.email,
        u.level,
        COUNT(DISTINCT t.id) as transaction_count,
        MAX(t.created_at) as last_sale,
        COALESCE(SUM(t.seller_amount), 0) as total_revenue,
        'one_hit_wonder' as segment
      FROM users u
      LEFT JOIN transactions t ON t.seller_id = u.id AND t.status = 'completed'
      WHERE u.created_at < NOW() - INTERVAL '30 days'
      GROUP BY u.id, u.username, u.email, u.level
      HAVING COUNT(DISTINCT t.id) = 1
        AND MAX(t.created_at) < NOW() - INTERVAL '30 days'
      ORDER BY last_sale DESC
      LIMIT 50
    `);

    // Dormant (No activity in 90+ days)
    const dormant = await req.db.query(`
      WITH user_activity AS (
        SELECT
          u.id,
          u.username,
          u.email,
          u.level,
          u.created_at,
          GREATEST(
            u.created_at,
            COALESCE(MAX(t.created_at), u.created_at),
            COALESCE(MAX(p.created_at), u.created_at)
          ) as last_activity
        FROM users u
        LEFT JOIN transactions t ON (t.seller_id = u.id OR t.promoter_id = u.id)
        LEFT JOIN products p ON p.user_id = u.id
        WHERE u.created_at < NOW() - INTERVAL '90 days'
        GROUP BY u.id, u.username, u.email, u.level, u.created_at
      )
      SELECT
        id,
        username,
        email,
        level,
        created_at,
        last_activity,
        'dormant' as segment
      FROM user_activity
      WHERE last_activity < NOW() - INTERVAL '90 days'
      ORDER BY last_activity DESC
      LIMIT 50
    `);

    res.json({
      success: true,
      data: {
        whales: {
          count: whales.rows.length,
          users: whales.rows.map(row => ({
            ...row,
            total_revenue: parseFloat(row.total_revenue)
          }))
        },
        champions: {
          count: champions.rows.length,
          users: champions.rows.map(row => ({
            ...row,
            total_revenue: parseFloat(row.total_revenue)
          }))
        },
        atRisk: {
          count: atRisk.rows.length,
          users: atRisk.rows.map(row => ({
            ...row,
            past_revenue: parseFloat(row.past_revenue)
          }))
        },
        newProspects: {
          count: newProspects.rows.length,
          users: newProspects.rows
        },
        oneHitWonders: {
          count: oneHitWonders.rows.length,
          users: oneHitWonders.rows.map(row => ({
            ...row,
            total_revenue: parseFloat(row.total_revenue)
          }))
        },
        dormant: {
          count: dormant.rows.length,
          users: dormant.rows
        }
      }
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/v1/bi/customer-lifetime-value - Customer Lifetime Value analysis
router.get('/customer-lifetime-value', async (req, res, next) => {
  try {
    const { limit = 100 } = req.query;

    const clv = await req.db.query(`
      SELECT
        u.id,
        u.username,
        u.email,
        u.level,
        u.created_at,
        EXTRACT(DAY FROM (NOW() - u.created_at)) as days_since_signup,
        COUNT(DISTINCT t.id) as total_transactions,
        COALESCE(SUM(t.seller_amount), 0) as lifetime_revenue,
        COALESCE(AVG(t.seller_amount), 0) as avg_transaction_value,
        CASE
          WHEN EXTRACT(DAY FROM (NOW() - u.created_at)) > 0
          THEN COALESCE(SUM(t.seller_amount), 0) / EXTRACT(DAY FROM (NOW() - u.created_at))
          ELSE 0
        END as revenue_per_day,
        CASE
          WHEN COUNT(DISTINCT t.id) > 1
          THEN EXTRACT(DAY FROM (MAX(t.created_at) - MIN(t.created_at))) / NULLIF(COUNT(DISTINCT t.id) - 1, 0)
          ELSE NULL
        END as avg_days_between_purchases
      FROM users u
      LEFT JOIN transactions t ON t.seller_id = u.id AND t.status = 'completed'
      WHERE u.created_at < NOW() - INTERVAL '30 days'
      GROUP BY u.id, u.username, u.email, u.level, u.created_at
      HAVING COUNT(DISTINCT t.id) > 0
      ORDER BY lifetime_revenue DESC
      LIMIT $1
    `, [limit]);

    res.json({
      success: true,
      data: clv.rows.map(row => ({
        ...row,
        lifetime_revenue: parseFloat(row.lifetime_revenue),
        avg_transaction_value: parseFloat(row.avg_transaction_value),
        revenue_per_day: parseFloat(row.revenue_per_day),
        avg_days_between_purchases: row.avg_days_between_purchases ? parseFloat(row.avg_days_between_purchases) : null
      }))
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/v1/bi/cohort-analysis - Cohort retention analysis
router.get('/cohort-analysis', async (req, res, next) => {
  try {
    const cohorts = await req.db.query(`
      WITH cohorts AS (
        SELECT
          DATE_TRUNC('month', u.created_at) as cohort_month,
          u.id as user_id
        FROM users u
        WHERE u.created_at > NOW() - INTERVAL '12 months'
      ),
      activity AS (
        SELECT
          c.cohort_month,
          c.user_id,
          DATE_TRUNC('month', t.created_at) as activity_month
        FROM cohorts c
        LEFT JOIN transactions t ON t.seller_id = c.user_id AND t.status = 'completed'
        WHERE t.created_at IS NOT NULL
      )
      SELECT
        cohort_month,
        COUNT(DISTINCT user_id) as cohort_size,
        DATE_PART('month', AGE(activity_month, cohort_month)) as month_number,
        COUNT(DISTINCT user_id) as active_users,
        ROUND((COUNT(DISTINCT user_id)::float / COUNT(DISTINCT user_id) OVER (PARTITION BY cohort_month)) * 100, 2) as retention_rate
      FROM activity
      GROUP BY cohort_month, activity_month
      ORDER BY cohort_month DESC, month_number ASC
    `);

    res.json({
      success: true,
      data: cohorts.rows
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/v1/bi/product-cross-sell - Product cross-sell analysis
router.get('/product-cross-sell', async (req, res, next) => {
  try {
    const crossSell = await req.db.query(`
      WITH product_pairs AS (
        SELECT
          t1.product_id as product_a,
          t2.product_id as product_b,
          COUNT(DISTINCT t1.buyer_id) as buyers_count
        FROM transactions t1
        JOIN transactions t2 ON t1.buyer_id = t2.buyer_id AND t1.product_id < t2.product_id
        WHERE t1.status = 'completed' AND t2.status = 'completed'
        GROUP BY t1.product_id, t2.product_id
        HAVING COUNT(DISTINCT t1.buyer_id) >= 2
      )
      SELECT
        p1.title as product_a_title,
        p2.title as product_b_title,
        pp.buyers_count as frequently_bought_together
      FROM product_pairs pp
      LEFT JOIN products p1 ON p1.id = pp.product_a
      LEFT JOIN products p2 ON p2.id = pp.product_b
      ORDER BY pp.buyers_count DESC
      LIMIT 20
    `);

    res.json({
      success: true,
      data: crossSell.rows
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/v1/bi/churn-prediction - Users at risk of churning
router.get('/churn-prediction', async (req, res, next) => {
  try {
    const churnRisk = await req.db.query(`
      SELECT
        u.id,
        u.username,
        u.email,
        u.level,
        u.total_earnings,
        MAX(t.created_at) as last_transaction,
        EXTRACT(DAY FROM (NOW() - MAX(t.created_at))) as days_since_last_transaction,
        COUNT(DISTINCT t.id) as total_transactions,
        CASE
          WHEN MAX(t.created_at) < NOW() - INTERVAL '60 days' AND MAX(t.created_at) > NOW() - INTERVAL '90 days'
            THEN 'high'
          WHEN MAX(t.created_at) < NOW() - INTERVAL '30 days' AND MAX(t.created_at) >= NOW() - INTERVAL '60 days'
            THEN 'medium'
          WHEN MAX(t.created_at) < NOW() - INTERVAL '14 days' AND MAX(t.created_at) >= NOW() - INTERVAL '30 days'
            THEN 'low'
          ELSE 'minimal'
        END as churn_risk
      FROM users u
      LEFT JOIN transactions t ON t.seller_id = u.id AND t.status = 'completed'
      WHERE u.created_at < NOW() - INTERVAL '30 days'
      GROUP BY u.id, u.username, u.email, u.level, u.total_earnings
      HAVING MAX(t.created_at) IS NOT NULL
        AND MAX(t.created_at) < NOW() - INTERVAL '14 days'
      ORDER BY days_since_last_transaction DESC
      LIMIT 100
    `);

    res.json({
      success: true,
      data: churnRisk.rows.map(row => ({
        ...row,
        total_earnings: parseFloat(row.total_earnings)
      }))
    });
  } catch (error) {
    next(error);
  }
});

export default router;
