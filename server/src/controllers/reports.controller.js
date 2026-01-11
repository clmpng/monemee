const ContentReport = require('../models/ContentReport.model');

/**
 * Reports Controller
 * Handles content report submissions and management (DSA Art. 16)
 */

/**
 * Submit a new content report
 * POST /api/v1/reports
 * Public endpoint (no auth required)
 */
const submitReport = async (req, res, next) => {
  try {
    const {
      product_url,
      reason,
      description,
      reporter_email,
      reporter_name
    } = req.body;

    // Validierung
    if (!product_url || !reason || !description) {
      return res.status(400).json({
        success: false,
        message: 'Bitte fülle alle Pflichtfelder aus'
      });
    }

    // Gültige Meldegründe
    const validReasons = ['copyright', 'fraud', 'illegal', 'harmful', 'hate', 'privacy', 'other'];
    if (!validReasons.includes(reason)) {
      return res.status(400).json({
        success: false,
        message: 'Ungültiger Meldegrund'
      });
    }

    // Beschreibung mindestens 20 Zeichen
    if (description.trim().length < 20) {
      return res.status(400).json({
        success: false,
        message: 'Beschreibung muss mindestens 20 Zeichen lang sein'
      });
    }

    // IP-Adresse für Rate-Limiting und Abuse-Prevention
    const reporterIp = req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress;

    // Report erstellen
    const report = await ContentReport.create({
      product_url: product_url.trim(),
      reason,
      description: description.trim(),
      reporter_email: reporter_email?.trim() || null,
      reporter_name: reporter_name?.trim() || null,
      reporter_ip: reporterIp
    });

    // TODO: E-Mail-Benachrichtigung an Admin senden
    // TODO: Bei bestimmten Kategorien (illegal, hate) automatisch eskalieren

    res.status(201).json({
      success: true,
      message: 'Meldung erfolgreich eingereicht',
      data: {
        reportId: report.report_id
      }
    });
  } catch (error) {
    console.error('Submit report error:', error);
    next(error);
  }
};

/**
 * Get report status (for reporters)
 * GET /api/v1/reports/:reportId/status
 * Requires email verification
 */
const getReportStatus = async (req, res, next) => {
  try {
    const { reportId } = req.params;
    const { email } = req.query;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'E-Mail erforderlich'
      });
    }

    const report = await ContentReport.findByReportId(reportId);

    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Meldung nicht gefunden'
      });
    }

    // Prüfen ob E-Mail übereinstimmt
    if (report.reporter_email?.toLowerCase() !== email.toLowerCase()) {
      return res.status(403).json({
        success: false,
        message: 'Keine Berechtigung'
      });
    }

    res.json({
      success: true,
      data: {
        reportId: report.report_id,
        status: report.status,
        reason: report.reason,
        createdAt: report.created_at,
        resolvedAt: report.resolved_at,
        resolutionAction: report.resolution_action
      }
    });
  } catch (error) {
    console.error('Get report status error:', error);
    next(error);
  }
};

/**
 * Get all reports (Admin)
 * GET /api/v1/reports
 * Requires admin auth (via mission-control)
 */
const getAllReports = async (req, res, next) => {
  try {
    const {
      status,
      reason,
      priority,
      limit = 50,
      offset = 0,
      orderBy = 'created_at',
      orderDir = 'DESC'
    } = req.query;

    const reports = await ContentReport.findAll({
      status,
      reason,
      priority,
      limit: parseInt(limit),
      offset: parseInt(offset),
      orderBy,
      orderDir
    });

    const counts = await ContentReport.getCounts();

    res.json({
      success: true,
      data: {
        reports,
        counts,
        pagination: {
          limit: parseInt(limit),
          offset: parseInt(offset),
          total: parseInt(counts.total)
        }
      }
    });
  } catch (error) {
    console.error('Get all reports error:', error);
    next(error);
  }
};

/**
 * Get single report (Admin)
 * GET /api/v1/reports/:id
 */
const getReport = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Suche nach ID oder report_id
    let report;
    if (/^\d+$/.test(id)) {
      // Numerische ID
      const query = `
        SELECT cr.*,
               p.title as product_title,
               p.thumbnail_url as product_thumbnail,
               p.description as product_description,
               u.username as seller_username,
               u.email as seller_email,
               resolver.username as resolved_by_username
        FROM content_reports cr
        LEFT JOIN products p ON cr.product_id = p.id
        LEFT JOIN users u ON p.user_id = u.id
        LEFT JOIN users resolver ON cr.resolved_by = resolver.id
        WHERE cr.id = $1
      `;
      const db = require('../config/database');
      const result = await db.query(query, [id]);
      report = result.rows[0];
    } else {
      report = await ContentReport.findByReportId(id);
    }

    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Meldung nicht gefunden'
      });
    }

    res.json({
      success: true,
      data: report
    });
  } catch (error) {
    console.error('Get report error:', error);
    next(error);
  }
};

/**
 * Update report status (Admin)
 * PATCH /api/v1/reports/:id
 */
const updateReport = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, resolution_action, resolution_note } = req.body;

    // Gültige Status-Werte
    const validStatuses = ['pending', 'in_review', 'resolved', 'rejected'];
    if (status && !validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Ungültiger Status'
      });
    }

    const report = await ContentReport.updateStatus(id, {
      status,
      resolution_action,
      resolution_note,
      resolved_by: req.adminId || req.userId // Admin ID aus mission-control Auth
    });

    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Meldung nicht gefunden'
      });
    }

    // TODO: Bei Statusänderung Benachrichtigung an Reporter senden

    res.json({
      success: true,
      message: 'Meldung aktualisiert',
      data: report
    });
  } catch (error) {
    console.error('Update report error:', error);
    next(error);
  }
};

/**
 * Get report statistics (Admin)
 * GET /api/v1/reports/statistics
 */
const getStatistics = async (req, res, next) => {
  try {
    const stats = await ContentReport.getStatistics();

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Get statistics error:', error);
    next(error);
  }
};

module.exports = {
  submitReport,
  getReportStatus,
  getAllReports,
  getReport,
  updateReport,
  getStatistics
};
