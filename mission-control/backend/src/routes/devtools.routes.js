import express from 'express';

const router = express.Router();

// ===== API REQUEST INSPECTOR =====

// GET /api/v1/devtools/api-requests - Get recent API requests
router.get('/api-requests', async (req, res, next) => {
  try {
    const { limit = 100, endpoint, status_code, method } = req.query;

    let query = 'SELECT * FROM api_request_logs WHERE 1=1';
    const params = [];

    if (endpoint) {
      params.push(`%${endpoint}%`);
      query += ` AND endpoint LIKE $${params.length}`;
    }

    if (status_code) {
      params.push(status_code);
      query += ` AND status_code = $${params.length}`;
    }

    if (method) {
      params.push(method);
      query += ` AND method = $${params.length}`;
    }

    params.push(limit);
    query += ` ORDER BY timestamp DESC LIMIT $${params.length}`;

    const result = await req.db.query(query, params);

    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/v1/devtools/api-requests/stats - API request statistics
router.get('/api-requests/stats', async (req, res, next) => {
  try {
    const { period = '24h' } = req.query;

    const periodMap = {
      '1h': '1 hour',
      '24h': '24 hours',
      '7d': '7 days',
      '30d': '30 days'
    };

    const interval = periodMap[period] || '24 hours';

    const stats = await req.db.query(`
      SELECT
        COUNT(*) as total_requests,
        COUNT(*) FILTER (WHERE status_code >= 200 AND status_code < 300) as successful,
        COUNT(*) FILTER (WHERE status_code >= 400 AND status_code < 500) as client_errors,
        COUNT(*) FILTER (WHERE status_code >= 500) as server_errors,
        AVG(response_time) as avg_response_time,
        MAX(response_time) as max_response_time,
        MIN(response_time) as min_response_time
      FROM api_request_logs
      WHERE timestamp > NOW() - INTERVAL '${interval}'
    `);

    const byEndpoint = await req.db.query(`
      SELECT
        endpoint,
        COUNT(*) as count,
        AVG(response_time) as avg_response_time,
        COUNT(*) FILTER (WHERE status_code >= 400) as errors
      FROM api_request_logs
      WHERE timestamp > NOW() - INTERVAL '${interval}'
      GROUP BY endpoint
      ORDER BY count DESC
      LIMIT 20
    `);

    const byMethod = await req.db.query(`
      SELECT
        method,
        COUNT(*) as count
      FROM api_request_logs
      WHERE timestamp > NOW() - INTERVAL '${interval}'
      GROUP BY method
      ORDER BY count DESC
    `);

    const slowRequests = await req.db.query(`
      SELECT
        endpoint,
        method,
        response_time,
        status_code,
        timestamp
      FROM api_request_logs
      WHERE timestamp > NOW() - INTERVAL '${interval}'
        AND response_time > 1000
      ORDER BY response_time DESC
      LIMIT 10
    `);

    res.json({
      success: true,
      data: {
        overview: stats.rows[0],
        byEndpoint: byEndpoint.rows,
        byMethod: byMethod.rows,
        slowRequests: slowRequests.rows
      }
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/v1/devtools/api-requests/:id - Get request details
router.get('/api-requests/:id', async (req, res, next) => {
  try {
    const { id } = req.params;

    const result = await req.db.query(
      'SELECT * FROM api_request_logs WHERE id = $1',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Request not found'
      });
    }

    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    next(error);
  }
});

// ===== DATABASE QUERY PROFILER =====

// GET /api/v1/devtools/db-queries - Get slow queries
router.get('/db-queries', async (req, res, next) => {
  try {
    const { limit = 50, min_duration = 100 } = req.query;

    const result = await req.db.query(`
      SELECT
        query,
        calls,
        total_exec_time,
        mean_exec_time,
        max_exec_time,
        rows as total_rows
      FROM pg_stat_statements
      WHERE mean_exec_time > $1
      ORDER BY mean_exec_time DESC
      LIMIT $2
    `, [min_duration, limit]);

    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    // Fallback if pg_stat_statements not enabled
    const queries = await req.db.query(`
      SELECT * FROM slow_query_log
      ORDER BY executed_at DESC
      LIMIT $1
    `, [limit]);

    res.json({
      success: true,
      data: queries.rows
    });
  }
});

// POST /api/v1/devtools/db-queries/explain - Explain a query
router.post('/db-queries/explain', async (req, res, next) => {
  try {
    const { query } = req.body;

    // Security: Only allow SELECT queries
    if (!query.trim().toUpperCase().startsWith('SELECT')) {
      return res.status(400).json({
        success: false,
        message: 'Only SELECT queries are allowed'
      });
    }

    const explainResult = await req.db.query(`EXPLAIN (FORMAT JSON, ANALYZE) ${query}`);

    res.json({
      success: true,
      data: explainResult.rows[0]
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

// GET /api/v1/devtools/db-queries/stats - Database statistics
router.get('/db-queries/stats', async (req, res, next) => {
  try {
    const tableStats = await req.db.query(`
      SELECT
        schemaname,
        relname as tablename,
        pg_size_pretty(pg_total_relation_size(schemaname||'.'||relname)) AS size,
        n_live_tup as row_count,
        n_tup_ins as inserts,
        n_tup_upd as updates,
        n_tup_del as deletes
      FROM pg_stat_user_tables
      ORDER BY pg_total_relation_size(schemaname||'.'||relname) DESC
      LIMIT 20
    `);

    const indexStats = await req.db.query(`
      SELECT
        schemaname,
        relname as tablename,
        indexrelname as indexname,
        idx_scan as scans,
        idx_tup_read as tuples_read,
        idx_tup_fetch as tuples_fetched
      FROM pg_stat_user_indexes
      ORDER BY idx_scan DESC
      LIMIT 20
    `);

    const connectionStats = await req.db.query(`
      SELECT
        COUNT(*) as total,
        COUNT(*) FILTER (WHERE state = 'active') as active,
        COUNT(*) FILTER (WHERE state = 'idle') as idle,
        COUNT(*) FILTER (WHERE state = 'idle in transaction') as idle_in_transaction
      FROM pg_stat_activity
    `);

    res.json({
      success: true,
      data: {
        tables: tableStats.rows,
        indexes: indexStats.rows,
        connections: connectionStats.rows[0]
      }
    });
  } catch (error) {
    next(error);
  }
});

// ===== WEBHOOK DEBUGGER =====

// GET /api/v1/devtools/webhooks - Get webhook logs
router.get('/webhooks', async (req, res, next) => {
  try {
    const { limit = 100, status } = req.query;

    let query = 'SELECT * FROM webhook_logs WHERE 1=1';
    const params = [];

    if (status) {
      params.push(status);
      query += ` AND status = $${params.length}`;
    }

    params.push(limit);
    query += ` ORDER BY created_at DESC LIMIT $${params.length}`;

    const result = await req.db.query(query, params);

    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/v1/devtools/webhooks/:id/retry - Retry failed webhook
router.post('/webhooks/:id/retry', async (req, res, next) => {
  try {
    const { id } = req.params;

    const webhook = await req.db.query(
      'SELECT * FROM webhook_logs WHERE id = $1',
      [id]
    );

    if (webhook.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Webhook not found'
      });
    }

    const { url, payload, headers } = webhook.rows[0];

    // Retry the webhook
    const startTime = Date.now();
    let status, response, error;

    try {
      const fetchResponse = await fetch(url, {
        method: 'POST',
        headers: headers || { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      status = fetchResponse.ok ? 'success' : 'failed';
      response = await fetchResponse.text();
    } catch (err) {
      status = 'failed';
      error = err.message;
    }

    const duration = Date.now() - startTime;

    // Log the retry
    await req.db.query(`
      INSERT INTO webhook_logs (url, payload, headers, status, response, error, duration, created_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
    `, [url, payload, headers, status, response, error, duration]);

    res.json({
      success: true,
      data: { status, duration, response, error }
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/v1/devtools/webhooks/stats - Webhook statistics
router.get('/webhooks/stats', async (req, res, next) => {
  try {
    const stats = await req.db.query(`
      SELECT
        COUNT(*) as total,
        COUNT(*) FILTER (WHERE status = 'success') as successful,
        COUNT(*) FILTER (WHERE status = 'failed') as failed,
        AVG(duration) as avg_duration
      FROM webhook_logs
      WHERE created_at > NOW() - INTERVAL '24 hours'
    `);

    const byURL = await req.db.query(`
      SELECT
        url,
        COUNT(*) as total,
        COUNT(*) FILTER (WHERE status = 'success') as successful,
        COUNT(*) FILTER (WHERE status = 'failed') as failed
      FROM webhook_logs
      WHERE created_at > NOW() - INTERVAL '24 hours'
      GROUP BY url
      ORDER BY total DESC
      LIMIT 10
    `);

    res.json({
      success: true,
      data: {
        overview: stats.rows[0],
        byURL: byURL.rows
      }
    });
  } catch (error) {
    next(error);
  }
});

// ===== FEATURE FLAGS =====

// GET /api/v1/devtools/feature-flags - Get all feature flags
router.get('/feature-flags', async (req, res, next) => {
  try {
    const result = await req.db.query(`
      SELECT * FROM feature_flags
      ORDER BY name ASC
    `);

    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/v1/devtools/feature-flags - Create feature flag
router.post('/feature-flags', async (req, res, next) => {
  try {
    const { name, description, enabled, rollout_percentage, target_users } = req.body;

    const result = await req.db.query(`
      INSERT INTO feature_flags (name, description, enabled, rollout_percentage, target_users)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `, [name, description, enabled || false, rollout_percentage || 0, target_users || []]);

    res.status(201).json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    next(error);
  }
});

// PUT /api/v1/devtools/feature-flags/:id - Update feature flag
router.put('/feature-flags/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, description, enabled, rollout_percentage, target_users } = req.body;

    const result = await req.db.query(`
      UPDATE feature_flags
      SET name = $1, description = $2, enabled = $3,
          rollout_percentage = $4, target_users = $5, updated_at = NOW()
      WHERE id = $6
      RETURNING *
    `, [name, description, enabled, rollout_percentage, target_users, id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Feature flag not found'
      });
    }

    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    next(error);
  }
});

// PATCH /api/v1/devtools/feature-flags/:id/toggle - Toggle feature flag
router.patch('/feature-flags/:id/toggle', async (req, res, next) => {
  try {
    const { id } = req.params;

    const result = await req.db.query(`
      UPDATE feature_flags
      SET enabled = NOT enabled, updated_at = NOW()
      WHERE id = $1
      RETURNING *
    `, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Feature flag not found'
      });
    }

    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    next(error);
  }
});

// DELETE /api/v1/devtools/feature-flags/:id - Delete feature flag
router.delete('/feature-flags/:id', async (req, res, next) => {
  try {
    const { id } = req.params;

    await req.db.query('DELETE FROM feature_flags WHERE id = $1', [id]);

    res.json({
      success: true,
      message: 'Feature flag deleted'
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/v1/devtools/feature-flags/check/:name - Check if feature is enabled for user
router.get('/feature-flags/check/:name', async (req, res, next) => {
  try {
    const { name } = req.params;
    const { user_id } = req.query;

    const flag = await req.db.query(
      'SELECT * FROM feature_flags WHERE name = $1',
      [name]
    );

    if (flag.rows.length === 0) {
      return res.json({
        success: true,
        enabled: false,
        reason: 'flag_not_found'
      });
    }

    const featureFlag = flag.rows[0];

    // Check if globally enabled
    if (!featureFlag.enabled) {
      return res.json({
        success: true,
        enabled: false,
        reason: 'globally_disabled'
      });
    }

    // Check target users
    if (user_id && featureFlag.target_users && featureFlag.target_users.length > 0) {
      const isTargeted = featureFlag.target_users.includes(parseInt(user_id));
      return res.json({
        success: true,
        enabled: isTargeted,
        reason: isTargeted ? 'targeted_user' : 'not_targeted'
      });
    }

    // Check rollout percentage
    if (featureFlag.rollout_percentage < 100) {
      const hash = user_id ? parseInt(user_id) : Math.random() * 100;
      const enabled = (hash % 100) < featureFlag.rollout_percentage;
      return res.json({
        success: true,
        enabled,
        reason: enabled ? 'rollout' : 'not_in_rollout'
      });
    }

    // Fully enabled
    res.json({
      success: true,
      enabled: true,
      reason: 'fully_enabled'
    });
  } catch (error) {
    next(error);
  }
});

export default router;
