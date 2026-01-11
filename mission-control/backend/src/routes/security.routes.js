import express from 'express';
import { query } from '../config/database.js';

const router = express.Router();

// GET /api/security/overview
router.get('/overview', async (req, res, next) => {
  try {
    // Simulierte Security-Metriken
    // In echter Implementierung: Aus Logs/Security-Events-Tabelle

    const failedLogins = 24; // TODO: Aus Security-Logs
    const suspiciousIPs = 3;
    const webhookFailures = await query(`
      SELECT COUNT(*) as count
      FROM stripe_webhook_events
      WHERE status = 'failed'
        AND created_at > NOW() - INTERVAL '24 hours'
    `);

    res.json({
      success: true,
      data: {
        status: 'all_clear',
        last24h: {
          failedLogins,
          suspiciousIPs,
          corsViolations: 0,
          rateLimited: 145,
          webhookFailures: parseInt(webhookFailures.rows[0].count)
        },
        activeThreats: 0
      }
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/security/audit-log
router.get('/audit-log', async (req, res, next) => {
  try {
    // Placeholder: In echter Implementierung separate audit_logs Tabelle
    const recentActions = await query(`
      SELECT
        'product_created' as action,
        p.created_at as timestamp,
        u.username,
        json_build_object('product_id', p.id, 'title', p.title) as details
      FROM products p
      JOIN users u ON p.user_id = u.id
      ORDER BY p.created_at DESC
      LIMIT 20
    `);

    res.json({
      success: true,
      data: recentActions.rows
    });
  } catch (error) {
    next(error);
  }
});

export default router;
