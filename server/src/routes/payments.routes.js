const express = require('express');
const router = express.Router();
const paymentsController = require('../controllers/payments.controller');
const { authenticate, optionalAuth } = require('../middleware/auth');
const { paymentLimiter } = require('../middleware/rateLimit');

// ============================================
// Payments Routes
//
// Produkt-Zahlungen via Stripe Checkout
// Webhooks laufen über /api/v1/stripe/webhooks/payments
// ============================================

/**
 * Create Stripe Checkout Session
 * POST /api/v1/payments/create-checkout
 * SECURITY: Rate-Limited (20/Stunde)
 * NOTE: optionalAuth - Gast-Checkout erlaubt (E-Mail wird von Stripe erfasst)
 */
router.post('/create-checkout', paymentLimiter, optionalAuth, paymentsController.createCheckout);

/**
 * Verify Checkout Session (nach Redirect von Stripe)
 * GET /api/v1/payments/verify-session/:sessionId
 * NOTE: optionalAuth - Gäste können Session über session_id verifizieren
 */
router.get('/verify-session/:sessionId', optionalAuth, paymentsController.verifySession);

/**
 * Get user transactions (als Verkäufer)
 * GET /api/v1/payments/transactions
 */
router.get('/transactions', authenticate, paymentsController.getTransactions);

/**
 * Get user purchases (als Käufer)
 * GET /api/v1/payments/purchases
 */
router.get('/purchases', authenticate, paymentsController.getPurchases);

module.exports = router;
