import express from 'express';
import { query } from '../config/database.js';

const router = express.Router();

// GET /api/analytics/products
router.get('/products', async (req, res, next) => {
  try {
    const result = await query(`
      SELECT
        p.id, p.title, p.price, p.sales, p.views,
        p.category, p.created_at,
        COALESCE(SUM(t.seller_amount), 0) as total_revenue,
        CASE WHEN p.views > 0
          THEN ROUND((p.sales::numeric / p.views::numeric) * 100, 2)
          ELSE 0
        END as conversion_rate,
        u.username as creator
      FROM products p
      JOIN users u ON p.user_id = u.id
      LEFT JOIN transactions t ON t.product_id = p.id AND t.status = 'completed'
      WHERE p.status = 'active'
      GROUP BY p.id, u.username
      ORDER BY total_revenue DESC
      LIMIT 10
    `);

    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/analytics/funnel
router.get('/funnel', async (req, res, next) => {
  try {
    const [registered, createdProduct, published, firstSale, levelTwo] = await Promise.all([
      query('SELECT COUNT(*) as count FROM users'),
      query('SELECT COUNT(DISTINCT user_id) as count FROM products'),
      query(`SELECT COUNT(DISTINCT user_id) as count FROM products WHERE status = 'active'`),
      query('SELECT COUNT(DISTINCT seller_id) as count FROM transactions WHERE status = \'completed\''),
      query('SELECT COUNT(*) as count FROM users WHERE level >= 2')
    ]);

    const totalUsers = parseInt(registered.rows[0].count);

    res.json({
      success: true,
      data: {
        registered: { count: totalUsers, percentage: 100 },
        createdProduct: {
          count: parseInt(createdProduct.rows[0].count),
          percentage: Math.round((createdProduct.rows[0].count / totalUsers) * 100)
        },
        published: {
          count: parseInt(published.rows[0].count),
          percentage: Math.round((published.rows[0].count / totalUsers) * 100)
        },
        firstSale: {
          count: parseInt(firstSale.rows[0].count),
          percentage: Math.round((firstSale.rows[0].count / totalUsers) * 100)
        },
        levelTwo: {
          count: parseInt(levelTwo.rows[0].count),
          percentage: Math.round((levelTwo.rows[0].count / totalUsers) * 100)
        }
      }
    });
  } catch (error) {
    next(error);
  }
});

export default router;
