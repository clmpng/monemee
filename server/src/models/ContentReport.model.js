const db = require('../config/database');
const crypto = require('crypto');

/**
 * Content Report Model
 * Handles database operations for content reports (DSA Art. 16)
 */
const ContentReport = {
  /**
   * Generate unique report ID
   * Format: RPT-XXXXXX (6 alphanumeric chars)
   */
  generateReportId: () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Ohne I, O, 0, 1 (verwechselbar)
    let result = 'RPT-';
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  },

  /**
   * Extract product ID from URL or direct ID
   * @param {string} urlOrId - URL like "https://monemee.de/p/123" or just "123"
   * @returns {number|null} - Product ID or null
   */
  extractProductId: (urlOrId) => {
    if (!urlOrId) return null;

    // Direct number
    if (/^\d+$/.test(urlOrId.trim())) {
      return parseInt(urlOrId.trim());
    }

    // URL pattern: /p/123 or /product/123
    const urlMatch = urlOrId.match(/\/p(?:roduct)?\/(\d+)/);
    if (urlMatch) {
      return parseInt(urlMatch[1]);
    }

    return null;
  },

  /**
   * Create a new content report
   */
  create: async ({
    product_url,
    reason,
    description,
    reporter_email,
    reporter_name,
    reporter_ip
  }) => {
    const reportId = ContentReport.generateReportId();
    const productId = ContentReport.extractProductId(product_url);

    // Priorität basierend auf Grund setzen
    let priority = 'normal';
    if (['illegal', 'hate'].includes(reason)) {
      priority = 'high';
    } else if (reason === 'copyright') {
      priority = 'normal';
    }

    const query = `
      INSERT INTO content_reports (
        report_id, product_id, product_url, reason, description,
        reporter_email, reporter_name, reporter_ip, priority
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *
    `;

    const result = await db.query(query, [
      reportId,
      productId,
      product_url,
      reason,
      description,
      reporter_email,
      reporter_name,
      reporter_ip,
      priority
    ]);

    return result.rows[0];
  },

  /**
   * Get report by public ID
   */
  findByReportId: async (reportId) => {
    const query = `
      SELECT cr.*,
             p.title as product_title,
             p.thumbnail_url as product_thumbnail,
             u.username as seller_username,
             u.email as seller_email
      FROM content_reports cr
      LEFT JOIN products p ON cr.product_id = p.id
      LEFT JOIN users u ON p.user_id = u.id
      WHERE cr.report_id = $1
    `;
    const result = await db.query(query, [reportId]);
    return result.rows[0];
  },

  /**
   * Get all reports with filters
   */
  findAll: async ({
    status,
    reason,
    priority,
    limit = 50,
    offset = 0,
    orderBy = 'created_at',
    orderDir = 'DESC'
  } = {}) => {
    let query = `
      SELECT cr.*,
             p.title as product_title,
             p.thumbnail_url as product_thumbnail,
             u.username as seller_username,
             resolver.username as resolved_by_username
      FROM content_reports cr
      LEFT JOIN products p ON cr.product_id = p.id
      LEFT JOIN users u ON p.user_id = u.id
      LEFT JOIN users resolver ON cr.resolved_by = resolver.id
      WHERE 1=1
    `;
    const params = [];
    let paramIndex = 1;

    if (status) {
      query += ` AND cr.status = $${paramIndex++}`;
      params.push(status);
    }

    if (reason) {
      query += ` AND cr.reason = $${paramIndex++}`;
      params.push(reason);
    }

    if (priority) {
      query += ` AND cr.priority = $${paramIndex++}`;
      params.push(priority);
    }

    // Sortierung
    const validOrderBy = ['created_at', 'updated_at', 'priority', 'status'];
    const validOrderDir = ['ASC', 'DESC'];
    const safeOrderBy = validOrderBy.includes(orderBy) ? orderBy : 'created_at';
    const safeOrderDir = validOrderDir.includes(orderDir.toUpperCase()) ? orderDir.toUpperCase() : 'DESC';

    // Bei priority: custom sort order
    if (safeOrderBy === 'priority') {
      query += ` ORDER BY
        CASE cr.priority
          WHEN 'urgent' THEN 1
          WHEN 'high' THEN 2
          WHEN 'normal' THEN 3
          WHEN 'low' THEN 4
        END ${safeOrderDir}, cr.created_at DESC`;
    } else {
      query += ` ORDER BY cr.${safeOrderBy} ${safeOrderDir}`;
    }

    query += ` LIMIT $${paramIndex++} OFFSET $${paramIndex++}`;
    params.push(limit, offset);

    const result = await db.query(query, params);
    return result.rows;
  },

  /**
   * Get report counts by status
   */
  getCounts: async () => {
    const query = `
      SELECT
        COUNT(*) FILTER (WHERE status = 'pending') as pending,
        COUNT(*) FILTER (WHERE status = 'in_review') as in_review,
        COUNT(*) FILTER (WHERE status = 'resolved') as resolved,
        COUNT(*) FILTER (WHERE status = 'rejected') as rejected,
        COUNT(*) as total
      FROM content_reports
    `;
    const result = await db.query(query);
    return result.rows[0];
  },

  /**
   * Get statistics for dashboard
   */
  getStatistics: async () => {
    const query = `
      SELECT
        COUNT(*) FILTER (WHERE status = 'pending') as pending_count,
        COUNT(*) FILTER (WHERE status = 'in_review') as in_review_count,
        COUNT(*) FILTER (WHERE status = 'resolved') as resolved_count,
        COUNT(*) FILTER (WHERE status = 'rejected') as rejected_count,
        COUNT(*) FILTER (WHERE created_at >= CURRENT_DATE) as today_count,
        COUNT(*) FILTER (WHERE created_at >= CURRENT_DATE - INTERVAL '7 days') as week_count,
        COUNT(*) FILTER (WHERE auto_reviewed = true) as auto_reviewed_count,
        ROUND(AVG(EXTRACT(EPOCH FROM (resolved_at - created_at))/3600)::numeric, 1)
          FILTER (WHERE resolved_at IS NOT NULL) as avg_resolution_hours
      FROM content_reports
    `;
    const result = await db.query(query);
    return result.rows[0];
  },

  /**
   * Update report status
   */
  updateStatus: async (id, { status, resolution_action, resolution_note, resolved_by }) => {
    const query = `
      UPDATE content_reports
      SET
        status = $2,
        resolution_action = COALESCE($3, resolution_action),
        resolution_note = COALESCE($4, resolution_note),
        resolved_by = COALESCE($5, resolved_by),
        resolved_at = CASE WHEN $2 IN ('resolved', 'rejected') THEN CURRENT_TIMESTAMP ELSE resolved_at END
      WHERE id = $1
      RETURNING *
    `;
    const result = await db.query(query, [id, status, resolution_action, resolution_note, resolved_by]);
    return result.rows[0];
  },

  /**
   * Update auto-review results
   */
  updateAutoReview: async (id, { auto_review_result, auto_review_confidence }) => {
    const query = `
      UPDATE content_reports
      SET
        auto_reviewed = true,
        auto_review_result = $2,
        auto_review_confidence = $3,
        auto_review_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING *
    `;
    const result = await db.query(query, [id, auto_review_result, auto_review_confidence]);
    return result.rows[0];
  },

  /**
   * Mark reporter as notified
   */
  markReporterNotified: async (id) => {
    const query = `
      UPDATE content_reports
      SET reporter_notified = true
      WHERE id = $1
      RETURNING *
    `;
    const result = await db.query(query, [id]);
    return result.rows[0];
  },

  /**
   * Get pending reports for a specific product
   */
  findByProductId: async (productId) => {
    const query = `
      SELECT * FROM content_reports
      WHERE product_id = $1
      ORDER BY created_at DESC
    `;
    const result = await db.query(query, [productId]);
    return result.rows;
  }
};

module.exports = ContentReport;
