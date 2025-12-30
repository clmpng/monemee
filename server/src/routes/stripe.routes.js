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
 * GET /api/v1/stripe/connect/onboarding-link
 * Neuer Onboarding-Link (für Fortsetzung)
 */
router.get('/connect/onboarding-link', authenticate, stripeController.getOnboardingLink);

/**
 * GET /api/v1/stripe/connect/dashboard-link
 * Gibt einen Link zum Stripe Express Dashboard zurück
 */
router.get('/connect/dashboard-link', authenticate, stripeController.getDashboardLink);

// ============================================
// Webhook Routes (nicht authentifiziert!)
// WICHTIG: Diese Routes verwenden express.raw() Middleware
// ============================================

/**
 * POST /api/v1/stripe/webhooks/connect
 * Webhook für Connect Account Events
 */
router.post(
  '/webhooks/connect',
  express.raw({ type: 'application/json' }),
  stripeController.handleConnectWebhook
);

/**
 * POST /api/v1/stripe/webhooks/payments
 * Webhook für Payment Events
 */
router.post(
  '/webhooks/payments',
  express.raw({ type: 'application/json' }),
  stripeController.handlePaymentsWebhook
);

module.exports = router;
