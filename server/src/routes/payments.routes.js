const express = require('express');
const router = express.Router();
const paymentsController = require('../controllers/payments.controller');
const { authenticate } = require('../middleware/auth');

// ============================================
// Payments Routes
// 
// Produkt-Zahlungen via Stripe Checkout
// Webhooks laufen über /api/v1/stripe/webhooks/payments
// ============================================

/**
 * Create Stripe Checkout Session
 * POST /api/v1/payments/create-checkout
 */
router.post('/create-checkout', authenticate, paymentsController.createCheckout);

/**
 * Verify Checkout Session (nach Redirect von Stripe)
 * GET /api/v1/payments/verify-session/:sessionId
 */
router.get('/verify-session/:sessionId', authenticate, paymentsController.verifySession);

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
