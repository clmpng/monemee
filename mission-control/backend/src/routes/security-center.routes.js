import express from 'express';
import bcrypt from 'bcrypt';

const router = express.Router();

// ===== IP MANAGEMENT =====

// GET /api/v1/security-center/blocked-ips - Get all blocked IPs
router.get('/blocked-ips', async (req, res, next) => {
  try {
    const result = await req.db.query(`
      SELECT * FROM blocked_ips
      ORDER BY blocked_at DESC
    `);

    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/v1/security-center/blocked-ips - Block an IP
router.post('/blocked-ips', async (req, res, next) => {
  try {
    const { ip_address, reason } = req.body;

    const result = await req.db.query(`
      INSERT INTO blocked_ips (ip_address, reason, blocked_at)
      VALUES ($1, $2, NOW())
      ON CONFLICT (ip_address) DO UPDATE
      SET reason = $2, blocked_at = NOW()
      RETURNING *
    `, [ip_address, reason]);

    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    next(error);
  }
});

// DELETE /api/v1/security-center/blocked-ips/:ip - Unblock an IP
router.delete('/blocked-ips/:ip', async (req, res, next) => {
  try {
    const { ip } = req.params;

    await req.db.query('DELETE FROM blocked_ips WHERE ip_address = $1', [ip]);

    res.json({
      success: true,
      message: 'IP unblocked successfully'
    });
  } catch (error) {
    next(error);
  }
});

// ===== SESSION MANAGEMENT =====

// GET /api/v1/security-center/active-sessions - Get all active sessions
router.get('/active-sessions', async (req, res, next) => {
  try {
    const result = await req.db.query(`
      SELECT
        s.id,
        s.user_id,
        u.username,
        u.email,
        s.ip_address,
        s.user_agent,
        s.created_at,
        s.last_activity,
        EXTRACT(EPOCH FROM (NOW() - s.last_activity)) as idle_seconds
      FROM user_sessions s
      LEFT JOIN users u ON u.id = s.user_id
      WHERE s.expires_at > NOW()
      ORDER BY s.last_activity DESC
    `);

    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    next(error);
  }
});

// DELETE /api/v1/security-center/sessions/:id - Force logout (kill session)
router.delete('/sessions/:id', async (req, res, next) => {
  try {
    const { id } = req.params;

    await req.db.query('DELETE FROM user_sessions WHERE id = $1', [id]);

    res.json({
      success: true,
      message: 'Session terminated successfully'
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/v1/security-center/sessions/kill-user/:userId - Kill all sessions for user
router.post('/sessions/kill-user/:userId', async (req, res, next) => {
  try {
    const { userId } = req.params;

    const result = await req.db.query(
      'DELETE FROM user_sessions WHERE user_id = $1 RETURNING *',
      [userId]
    );

    res.json({
      success: true,
      message: `Killed ${result.rowCount} sessions`,
      count: result.rowCount
    });
  } catch (error) {
    next(error);
  }
});

// ===== FAILED LOGIN ATTEMPTS =====

// GET /api/v1/security-center/failed-logins - Get recent failed login attempts
router.get('/failed-logins', async (req, res, next) => {
  try {
    const { limit = 100 } = req.query;

    const result = await req.db.query(`
      SELECT
        ip_address,
        username,
        attempt_time,
        user_agent,
        reason
      FROM failed_login_attempts
      ORDER BY attempt_time DESC
      LIMIT $1
    `, [limit]);

    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/v1/security-center/failed-logins/stats - Failed login statistics
router.get('/failed-logins/stats', async (req, res, next) => {
  try {
    const stats = await req.db.query(`
      SELECT
        COUNT(*) as total_attempts,
        COUNT(DISTINCT ip_address) as unique_ips,
        COUNT(*) FILTER (WHERE attempt_time > NOW() - INTERVAL '1 hour') as last_hour,
        COUNT(*) FILTER (WHERE attempt_time > NOW() - INTERVAL '24 hours') as last_24h
      FROM failed_login_attempts
    `);

    const topIPs = await req.db.query(`
      SELECT
        ip_address,
        COUNT(*) as attempt_count,
        MAX(attempt_time) as last_attempt
      FROM failed_login_attempts
      WHERE attempt_time > NOW() - INTERVAL '24 hours'
      GROUP BY ip_address
      ORDER BY attempt_count DESC
      LIMIT 10
    `);

    res.json({
      success: true,
      data: {
        overview: stats.rows[0],
        topIPs: topIPs.rows
      }
    });
  } catch (error) {
    next(error);
  }
});

// ===== 2FA MANAGEMENT =====

// GET /api/v1/security-center/2fa-status - Get 2FA adoption stats
router.get('/2fa-status', async (req, res, next) => {
  try {
    const result = await req.db.query(`
      SELECT
        COUNT(*) as total_users,
        COUNT(*) FILTER (WHERE two_factor_enabled = true) as users_with_2fa,
        ROUND((COUNT(*) FILTER (WHERE two_factor_enabled = true)::float / COUNT(*)) * 100, 2) as adoption_rate
      FROM users
    `);

    const recentEnrollments = await req.db.query(`
      SELECT
        u.username,
        u.email,
        u.two_factor_enabled_at
      FROM users u
      WHERE u.two_factor_enabled = true
      ORDER BY u.two_factor_enabled_at DESC
      LIMIT 10
    `);

    res.json({
      success: true,
      data: {
        stats: result.rows[0],
        recentEnrollments: recentEnrollments.rows
      }
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/v1/security-center/2fa/enforce/:userId - Force enable 2FA for user
router.post('/2fa/enforce/:userId', async (req, res, next) => {
  try {
    const { userId } = req.params;

    await req.db.query(
      'UPDATE users SET two_factor_required = true WHERE id = $1',
      [userId]
    );

    res.json({
      success: true,
      message: '2FA enforcement enabled for user'
    });
  } catch (error) {
    next(error);
  }
});

// ===== SUSPICIOUS ACTIVITY =====

// GET /api/v1/security-center/suspicious-activity - Detect suspicious patterns
router.get('/suspicious-activity', async (req, res, next) => {
  try {
    // Multiple failed logins from same IP
    const suspiciousIPs = await req.db.query(`
      SELECT
        ip_address,
        COUNT(*) as failed_attempts,
        MAX(attempt_time) as last_attempt,
        array_agg(DISTINCT username) as attempted_usernames
      FROM failed_login_attempts
      WHERE attempt_time > NOW() - INTERVAL '1 hour'
      GROUP BY ip_address
      HAVING COUNT(*) >= 5
      ORDER BY failed_attempts DESC
    `);

    // Unusual transaction amounts
    const unusualTransactions = await req.db.query(`
      SELECT
        t.id,
        t.amount,
        t.product_title,
        u.username as buyer,
        t.created_at
      FROM transactions t
      LEFT JOIN users u ON u.id = t.buyer_id
      WHERE t.amount > 1000
        AND t.created_at > NOW() - INTERVAL '24 hours'
      ORDER BY t.amount DESC
      LIMIT 10
    `);

    // Users with rapid activity
    const rapidActivity = await req.db.query(`
      SELECT
        u.id,
        u.username,
        u.email,
        COUNT(DISTINCT t.id) as transactions_24h,
        COUNT(DISTINCT p.id) as products_created_24h
      FROM users u
      LEFT JOIN transactions t ON t.seller_id = u.id AND t.created_at > NOW() - INTERVAL '24 hours'
      LEFT JOIN products p ON p.user_id = u.id AND p.created_at > NOW() - INTERVAL '24 hours'
      WHERE u.created_at > NOW() - INTERVAL '7 days'
      GROUP BY u.id, u.username, u.email
      HAVING COUNT(DISTINCT t.id) > 20 OR COUNT(DISTINCT p.id) > 10
      ORDER BY transactions_24h DESC
    `);

    res.json({
      success: true,
      data: {
        suspiciousIPs: suspiciousIPs.rows,
        unusualTransactions: unusualTransactions.rows,
        rapidActivity: rapidActivity.rows
      }
    });
  } catch (error) {
    next(error);
  }
});

// ===== PASSWORD POLICY =====

// GET /api/v1/security-center/password-policy - Get current policy
router.get('/password-policy', async (req, res, next) => {
  try {
    // This would come from a settings table
    const policy = {
      min_length: 8,
      require_uppercase: true,
      require_lowercase: true,
      require_numbers: true,
      require_special: true,
      max_age_days: 90,
      prevent_reuse_count: 5
    };

    res.json({
      success: true,
      data: policy
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/v1/security-center/password-policy - Update policy
router.post('/password-policy', async (req, res, next) => {
  try {
    const policy = req.body;

    // Save to settings table (simplified for now)
    // await req.db.query('UPDATE settings SET password_policy = $1', [JSON.stringify(policy)]);

    res.json({
      success: true,
      message: 'Password policy updated',
      data: policy
    });
  } catch (error) {
    next(error);
  }
});

// ===== RATE LIMITING =====

// GET /api/v1/security-center/rate-limits - Get rate limit violations
router.get('/rate-limits', async (req, res, next) => {
  try {
    const result = await req.db.query(`
      SELECT
        ip_address,
        endpoint,
        COUNT(*) as violation_count,
        MAX(timestamp) as last_violation
      FROM rate_limit_violations
      WHERE timestamp > NOW() - INTERVAL '24 hours'
      GROUP BY ip_address, endpoint
      ORDER BY violation_count DESC
      LIMIT 50
    `);

    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    next(error);
  }
});

// ===== SECURITY OVERVIEW =====

// GET /api/v1/security-center/overview - Security dashboard overview
router.get('/overview', async (req, res, next) => {
  try {
    const blockedIPsCount = await req.db.query('SELECT COUNT(*) as count FROM blocked_ips');
    const activeSessions = await req.db.query('SELECT COUNT(*) as count FROM user_sessions WHERE expires_at > NOW()');
    const failedLogins24h = await req.db.query(`
      SELECT COUNT(*) as count FROM failed_login_attempts
      WHERE attempt_time > NOW() - INTERVAL '24 hours'
    `);
    const users2FA = await req.db.query('SELECT COUNT(*) as count FROM users WHERE two_factor_enabled = true');
    const totalUsers = await req.db.query('SELECT COUNT(*) as count FROM users');

    res.json({
      success: true,
      data: {
        blockedIPs: parseInt(blockedIPsCount.rows[0].count),
        activeSessions: parseInt(activeSessions.rows[0].count),
        failedLogins24h: parseInt(failedLogins24h.rows[0].count),
        users2FA: parseInt(users2FA.rows[0].count),
        totalUsers: parseInt(totalUsers.rows[0].count),
        twoFactorAdoption: totalUsers.rows[0].count > 0
          ? Math.round((users2FA.rows[0].count / totalUsers.rows[0].count) * 100)
          : 0
      }
    });
  } catch (error) {
    next(error);
  }
});

export default router;
