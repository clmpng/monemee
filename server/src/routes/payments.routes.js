const express = require('express');
const router = express.Router();
const paymentsController = require('../controllers/payments.controller');
const { authenticate, optionalAuth } = require('../middleware/auth');

// ============================================
// Payments Routes (Stripe)
// ============================================

/**
 * DUMMY: Simulierter Kauf für Testing
 * Erstellt echte Transaktionen in der DB
 * POST /api/v1/payments/simulate-purchase
 * 
 * Body: { productId: number, affiliateCode?: string }
 */
router.post('/simulate-purchase', authenticate, paymentsController.simulatePurchase);

/**
 * Create Stripe checkout session
 * POST /api/v1/payments/create-checkout
 * TODO: Echte Stripe Integration
 */
router.post('/create-checkout', authenticate, paymentsController.createCheckout);

/**
 * Stripe webhook
 * POST /api/v1/payments/webhook
 * WICHTIG: Kein authenticate middleware - Stripe sendet direkt
 */
router.post('/webhook', express.raw({ type: 'application/json' }), paymentsController.handleWebhook);

/**
 * Get user transactions
 * GET /api/v1/payments/transactions
 */
router.get('/transactions', authenticate, paymentsController.getTransactions);

module.exports = router;