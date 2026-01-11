import express from 'express';
import pool from '../config/database.js';

const router = express.Router();

// GET /api/performance/database
router.get('/database', async (req, res, next) => {
  try {
    // Pool-Status
    const poolStatus = {
      totalConnections: pool.totalCount,
      idleConnections: pool.idleCount,
      waitingClients: pool.waitingCount,
      maxConnections: 20 // Aus config
    };

    // Simulierte Slow Queries (TODO: Aus echtem Query-Logging)
    const slowQueries = [
      {
        query: 'getEarningsByPeriod (all)',
        avgDuration: 450,
        count: 12
      },
      {
        query: 'getTopProductsByRevenue',
        avgDuration: 280,
        count: 8
      }
    ];

    res.json({
      success: true,
      data: {
        pool: poolStatus,
        slowQueries
      }
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/performance/api
router.get('/api', async (req, res, next) => {
  try {
    // Simulierte API-Metriken
    // TODO: Implementiere echtes Request-Logging/Tracking

    const endpoints = [
      { endpoint: 'GET /products', calls: 1240, avgMs: 45, p95: 120, errors: 0.1 },
      { endpoint: 'GET /earnings/dashboard', calls: 342, avgMs: 285, p95: 450, errors: 0 },
      { endpoint: 'POST /payments', calls: 87, avgMs: 620, p95: 1200, errors: 2.3 },
      { endpoint: 'GET /promotion', calls: 156, avgMs: 120, p95: 250, errors: 0 }
    ];

    res.json({
      success: true,
      data: {
        endpoints,
        slowEndpoints: endpoints.filter(e => e.avgMs > 500)
      }
    });
  } catch (error) {
    next(error);
  }
});

export default router;
