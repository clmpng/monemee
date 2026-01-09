/**
 * Downloads Routes
 * Digitale Produktauslieferung
 *
 * Öffentliche Routen (Token-basiert):
 * - GET /token/:token - Download via E-Mail-Link
 * - GET /token/:token/info - Token-Info ohne Download
 * - GET /session/:sessionId - Kauf via Stripe Session (für Gäste nach Checkout)
 *
 * Geschützte Routen (authentifiziert):
 * - GET /purchases - Alle Käufe des Users
 * - GET /purchase/:transactionId - Einzelner Kauf mit Modulen
 * - GET /file/:moduleId - Direkt-Download einer Datei
 */

const express = require('express');
const router = express.Router();
const downloadsController = require('../controllers/downloads.controller');
const { authenticate, optionalAuth } = require('../middleware/auth');

// ============================================
// Öffentliche Routen (Token-basiert)
// ============================================

/**
 * Download via Token (E-Mail-Link)
 * GET /api/v1/downloads/token/:token
 */
router.get('/token/:token', downloadsController.downloadByToken);

/**
 * Token-Info abrufen (ohne Download)
 * GET /api/v1/downloads/token/:token/info
 */
router.get('/token/:token/info', downloadsController.getTokenInfo);

/**
 * Kauf via Stripe Session ID (für Gäste nach Checkout)
 * GET /api/v1/downloads/session/:sessionId
 */
router.get('/session/:sessionId', downloadsController.getPurchaseBySession);

// ============================================
// Geschützte Routen (authentifiziert)
// ============================================

/**
 * Alle Käufe des eingeloggten Users
 * GET /api/v1/downloads/purchases
 */
router.get('/purchases', authenticate, downloadsController.getMyPurchases);

/**
 * Einzelner Kauf mit Modulen
 * GET /api/v1/downloads/purchase/:transactionId
 * Optional auth: Für Gäste über Session-Redirect möglich
 */
router.get('/purchase/:transactionId', optionalAuth, downloadsController.getPurchaseContent);

/**
 * Direkt-Download einer Datei (authentifiziert)
 * GET /api/v1/downloads/file/:moduleId
 */
router.get('/file/:moduleId', authenticate, downloadsController.downloadFile);

module.exports = router;
