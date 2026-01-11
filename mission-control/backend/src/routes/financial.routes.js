import express from 'express';
import { query } from '../config/database.js';

const router = express.Router();

// GET /api/financial/overview
router.get('/overview', async (req, res, next) => {
  try {
    const { period = '30d' } = req.query;

    // Zeitraum berechnen
    const periodMap = {
      '7d': '7 days',
      '30d': '30 days',
      '90d': '90 days',
      '365d': '365 days'
    };
    const interval = periodMap[period] || '30 days';

    const [revenue, breakdown] = await Promise.all([
      // Total Revenue
      query(`
        SELECT
          COALESCE(SUM(amount), 0) as total_revenue,
          COALESCE(SUM(platform_fee), 0) as platform_fees,
          COALESCE(SUM(seller_amount), 0) as seller_payouts,
          COALESCE(SUM(promoter_commission), 0) as affiliate_commissions,
          COUNT(*) as total_transactions
        FROM transactions
        WHERE created_at > NOW() - INTERVAL '${interval}'
          AND status = 'completed'
      `),

      // Revenue by Level
      query(`
        SELECT
          u.level,
          COALESCE(SUM(t.platform_fee), 0) as platform_fees,
          COUNT(t.id) as transactions
        FROM transactions t
        JOIN users u ON t.seller_id = u.id
        WHERE t.created_at > NOW() - INTERVAL '${interval}'
          AND t.status = 'completed'
        GROUP BY u.level
        ORDER BY u.level
      `)
    ]);

    res.json({
      success: true,
      data: {
        summary: revenue.rows[0],
        byLevel: breakdown.rows
      }
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/financial/transactions
router.get('/transactions', async (req, res, next) => {
  try {
    const { page = 1, limit = 50, status } = req.query;
    const offset = (page - 1) * limit;

    const statusFilter = status ? `AND status = '${status}'` : '';

    const result = await query(`
      SELECT
        t.id, t.amount, t.platform_fee, t.seller_amount,
        t.promoter_commission, t.status, t.created_at,
        p.title as product_title,
        seller.username as seller_username,
        promoter.username as promoter_username
      FROM transactions t
      JOIN products p ON t.product_id = p.id
      JOIN users seller ON t.seller_id = seller.id
      LEFT JOIN users promoter ON t.promoter_id = promoter.id
      WHERE 1=1 ${statusFilter}
      ORDER BY t.created_at DESC
      LIMIT $1 OFFSET $2
    `, [limit, offset]);

    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/financial/payouts
router.get('/payouts', async (req, res, next) => {
  try {
    const { status = 'pending' } = req.query;

    const result = await query(`
      SELECT
        p.id, p.amount, p.fee, p.net_amount, p.status,
        p.created_at, p.processed_at,
        u.username, u.email
      FROM payouts p
      JOIN users u ON p.user_id = u.id
      WHERE p.status = $1
      ORDER BY p.created_at DESC
    `, [status]);

    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    next(error);
  }
});

export default router;
