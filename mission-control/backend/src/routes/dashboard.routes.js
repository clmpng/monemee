import express from 'express';
import { query } from '../config/database.js';
import { broadcastEvent } from '../services/websocket.service.js';

const router = express.Router();

// GET /api/dashboard/overview
router.get('/overview', async (req, res, next) => {
  try {
    // Heutiges Datum
    const today = new Date().toISOString().split('T')[0];

    // Parallel Queries für bessere Performance
    const [
      usersCount,
      revenueToday,
      salesToday,
      systemHealth
    ] = await Promise.all([
      // Total Users
      query('SELECT COUNT(*) as count FROM users'),

      // Revenue Today
      query(
        `SELECT COALESCE(SUM(amount), 0) as total
         FROM transactions
         WHERE DATE(created_at) = $1 AND status = 'completed'`,
        [today]
      ),

      // Sales Today
      query(
        `SELECT COUNT(*) as count
         FROM transactions
         WHERE DATE(created_at) = $1 AND status = 'completed'`,
        [today]
      ),

      // System Health (simuliert - wird später durch echte Health-Checks ersetzt)
      Promise.resolve({ status: 'operational', uptime: 99.8 })
    ]);

    res.json({
      success: true,
      data: {
        users: {
          total: parseInt(usersCount.rows[0].count),
          change: 12 // TODO: Berechne echten Trend
        },
        revenue: {
          today: parseFloat(revenueToday.rows[0].total),
          change: 24 // TODO: Berechne Vergleich zu gestern
        },
        sales: {
          today: parseInt(salesToday.rows[0].count),
          change: -5 // TODO: Berechne Trend
        },
        health: systemHealth
      }
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/dashboard/alerts
router.get('/alerts', async (req, res, next) => {
  try {
    // Kritische Alerts ermitteln
    const alerts = [];

    // Check: Failed Webhooks
    const failedWebhooks = await query(
      `SELECT COUNT(*) as count
       FROM stripe_webhook_events
       WHERE status = 'failed'
       AND created_at > NOW() - INTERVAL '24 hours'`
    );

    if (parseInt(failedWebhooks.rows[0].count) > 0) {
      alerts.push({
        id: 'webhook-failures',
        severity: 'critical',
        title: `${failedWebhooks.rows[0].count} Webhook failures`,
        message: `Stripe webhooks failed in last 24h`,
        action: '/security/webhooks'
      });
    }

    // Check: Database Connection Pool (simuliert)
    // In echter Implementierung: Abfrage des Pool-Status
    const poolUsage = 18; // Beispiel
    if (poolUsage >= 18) {
      alerts.push({
        id: 'db-pool-high',
        severity: 'high',
        title: 'Database connection pool high',
        message: `Pool usage: ${poolUsage}/20`,
        action: '/performance/database'
      });
    }

    res.json({
      success: true,
      data: alerts
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/dashboard/live-feed
router.get('/live-feed', async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit) || 20;

    // Letzte Events (Transaktionen, User-Erstellung, etc.)
    const events = [];

    // Letzte Verkäufe
    const recentSales = await query(
      `SELECT t.id, t.amount, t.created_at,
              p.title as product_title,
              u.username as seller_username
       FROM transactions t
       JOIN products p ON t.product_id = p.id
       JOIN users u ON t.seller_id = u.id
       WHERE t.status = 'completed'
       ORDER BY t.created_at DESC
       LIMIT $1`,
      [Math.floor(limit / 2)]
    );

    recentSales.rows.forEach(sale => {
      events.push({
        type: 'sale',
        icon: '💰',
        message: `Sale: €${sale.amount} (${sale.product_title})`,
        time: sale.created_at,
        severity: 'info'
      });
    });

    // Letzte User-Registrierungen
    const recentUsers = await query(
      `SELECT id, username, created_at
       FROM users
       ORDER BY created_at DESC
       LIMIT $1`,
      [Math.floor(limit / 2)]
    );

    recentUsers.rows.forEach(user => {
      events.push({
        type: 'user',
        icon: '👤',
        message: `New user: ${user.username}`,
        time: user.created_at,
        severity: 'info'
      });
    });

    // Sortiere nach Zeit
    events.sort((a, b) => new Date(b.time) - new Date(a.time));

    res.json({
      success: true,
      data: events.slice(0, limit)
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/dashboard/broadcast
router.post('/broadcast', async (req, res, next) => {
  try {
    const { message, type = 'info' } = req.body;

    if (!message) {
      return res.status(400).json({
        success: false,
        message: 'Message erforderlich'
      });
    }

    // Broadcast via WebSocket
    broadcastEvent.alert({
      severity: type,
      message,
      source: 'admin'
    });

    res.json({
      success: true,
      message: 'Broadcast gesendet'
    });
  } catch (error) {
    next(error);
  }
});

export default router;
