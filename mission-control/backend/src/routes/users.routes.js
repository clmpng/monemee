import express from 'express';
import { query } from '../config/database.js';

const router = express.Router();

// GET /api/users/list
router.get('/list', async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 50,
      search = '',
      level,
      role,
      status
    } = req.query;

    const offset = (page - 1) * limit;
    const params = [];
    let whereConditions = [];
    let paramIndex = 1;

    // Filter: Search
    if (search) {
      whereConditions.push(`(username ILIKE $${paramIndex} OR email ILIKE $${paramIndex})`);
      params.push(`%${search}%`);
      paramIndex++;
    }

    // Filter: Level
    if (level) {
      whereConditions.push(`level = $${paramIndex}`);
      params.push(parseInt(level));
      paramIndex++;
    }

    // Filter: Role
    if (role) {
      whereConditions.push(`role = $${paramIndex}`);
      params.push(role);
      paramIndex++;
    }

    // Filter: Status (Active = hat sales in letzten 30 Tagen)
    if (status === 'active') {
      whereConditions.push(`id IN (
        SELECT DISTINCT seller_id
        FROM transactions
        WHERE created_at > NOW() - INTERVAL '30 days'
      )`);
    }

    const whereClause = whereConditions.length > 0
      ? `WHERE ${whereConditions.join(' AND ')}`
      : '';

    // Query
    const usersQuery = `
      SELECT
        u.id, u.username, u.email, u.role, u.level,
        u.total_earnings, u.created_at,
        u.stripe_account_status, u.stripe_charges_enabled,
        (SELECT COUNT(*) FROM products WHERE user_id = u.id) as products_count,
        (SELECT COUNT(*) FROM transactions WHERE seller_id = u.id AND status = 'completed') as sales_count
      FROM users u
      ${whereClause}
      ORDER BY u.total_earnings DESC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;

    params.push(parseInt(limit), parseInt(offset));

    // Total Count
    const countQuery = `SELECT COUNT(*) as total FROM users u ${whereClause}`;
    const countParams = params.slice(0, -2); // Ohne limit/offset

    const [usersResult, countResult] = await Promise.all([
      query(usersQuery, params),
      query(countQuery, countParams)
    ]);

    res.json({
      success: true,
      data: {
        users: usersResult.rows,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: parseInt(countResult.rows[0].total),
          totalPages: Math.ceil(countResult.rows[0].total / limit)
        }
      }
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/users/:id
router.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;

    // User Basic Info
    const userResult = await query(
      `SELECT * FROM users WHERE id = $1`,
      [id]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const user = userResult.rows[0];

    // Parallel Queries für Detail-Daten
    const [
      productsResult,
      salesResult,
      affiliateResult,
      earningsResult
    ] = await Promise.all([
      // Products
      query(
        `SELECT id, title, status, price, sales, views, created_at
         FROM products WHERE user_id = $1
         ORDER BY created_at DESC`,
        [id]
      ),

      // Sales Stats
      query(
        `SELECT
           COUNT(*) as total_sales,
           COALESCE(SUM(seller_amount), 0) as total_revenue,
           COALESCE(AVG(amount), 0) as avg_order_value
         FROM transactions
         WHERE seller_id = $1 AND status = 'completed'`,
        [id]
      ),

      // Affiliate Stats
      query(
        `SELECT
           COUNT(*) as total_conversions,
           COALESCE(SUM(promoter_commission), 0) as total_commission
         FROM transactions
         WHERE promoter_id = $1 AND status = 'completed'`,
        [id]
      ),

      // Earnings Trend (Last 30 Days)
      query(
        `SELECT
           DATE(created_at) as date,
           COALESCE(SUM(seller_amount), 0) as earnings,
           COUNT(*) as sales
         FROM transactions
         WHERE seller_id = $1
           AND status = 'completed'
           AND created_at > NOW() - INTERVAL '30 days'
         GROUP BY DATE(created_at)
         ORDER BY date DESC`,
        [id]
      )
    ]);

    res.json({
      success: true,
      data: {
        user,
        products: productsResult.rows,
        stats: {
          sales: salesResult.rows[0],
          affiliate: affiliateResult.rows[0],
          earningsTrend: earningsResult.rows
        }
      }
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/users/stats/summary
router.get('/stats/summary', async (req, res, next) => {
  try {
    const [
      totalUsers,
      activeUsers,
      levelDistribution,
      roleDistribution
    ] = await Promise.all([
      // Total Users
      query('SELECT COUNT(*) as count FROM users'),

      // Active Users (last 30d)
      query(`
        SELECT COUNT(DISTINCT seller_id) as count
        FROM transactions
        WHERE created_at > NOW() - INTERVAL '30 days'
      `),

      // Level Distribution
      query(`
        SELECT level, COUNT(*) as count
        FROM users
        GROUP BY level
        ORDER BY level
      `),

      // Role Distribution
      query(`
        SELECT role, COUNT(*) as count
        FROM users
        GROUP BY role
      `)
    ]);

    res.json({
      success: true,
      data: {
        totalUsers: parseInt(totalUsers.rows[0].count),
        activeUsers: parseInt(activeUsers.rows[0].count),
        churnRate: 8, // TODO: Calculate real churn
        levelDistribution: levelDistribution.rows,
        roleDistribution: roleDistribution.rows
      }
    });
  } catch (error) {
    next(error);
  }
});

export default router;
