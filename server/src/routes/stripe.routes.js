/**
 * Stripe Routes
 * Endpoints für Stripe Connect Onboarding und Webhooks
 */

const express = require('express');
const router = express.Router();
const stripeController = require('../controllers/stripe.controller');
const { authenticate } = require('../middleware/auth');

// ============================================
// Connect Account Routes (authentifiziert)
// ============================================

/**
 * GET /api/v1/stripe/connect/status
 * Holt den aktuellen Stripe Connect Status
 */
router.get('/connect/status', authenticate, stripeController.getConnectStatus);

/**
 * POST /api/v1/stripe/connect/start
 * Startet das Stripe Connect Onboarding
 * Erstellt Account falls nicht vorhanden und gibt Onboarding-URL zurück
 */
router.post('/connect/start', authenticate, stripeController.startOnboarding);

/**
 * POST /api/v1/stripe/connect/continue
 * Setzt das Onboarding fort (neuer Link falls alter abgelaufen)
 */
router.post('/connect/continue', authenticate, stripeController.continueOnboarding);

/**
 * GET /api/v1/stripe/connect/dashboard
 * Gibt einen Link zum Stripe Express Dashboard zurück
 * Nur verfügbar wenn Onboarding abgeschlossen
 */
router.get('/connect/dashboard', authenticate, stripeController.getDashboardLink);

// ============================================
// Webhook Routes (nicht authentifiziert!)
// WICHTIG: Diese Routes verwenden express.raw() Middleware
// ============================================

/**
 * POST /api/v1/stripe/webhooks/connect
 * Webhook für Connect Account Events
 * - account.updated
 * - account.application.deauthorized
 */
router.post(
  '/webhooks/connect',
  express.raw({ type: 'application/json' }),
  stripeController.handleConnectWebhook
);

/**
 * POST /api/v1/stripe/webhooks/payments
 * Webhook für Payment Events
 * - checkout.session.completed
 * - transfer.created
 * - transfer.paid
 * - payout.paid
 * - payout.failed
 */
router.post(
  '/webhooks/payments',
  express.raw({ type: 'application/json' }),
  stripeController.handlePaymentsWebhook
);

module.exports = router;