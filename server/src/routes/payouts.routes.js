const express = require('express');
const router = express.Router();
const payoutsController = require('../controllers/payouts.controller');
const { authenticate } = require('../middleware/auth');

// ============================================
// Payout Routes
// Alle Routes erfordern Authentifizierung
// ============================================

// GET /api/v1/payouts/config - Get platform config (levels, fees)
// Öffentlich, damit Landing Page Level-Info anzeigen kann
router.get('/config', payoutsController.getConfig);

// GET /api/v1/payouts/balance - Get user balance info
router.get('/balance', authenticate, payoutsController.getBalance);

// GET /api/v1/payouts/history - Get payout history
router.get('/history', authenticate, payoutsController.getHistory);

// POST /api/v1/payouts/request - Request a payout
router.post('/request', authenticate, payoutsController.requestPayout);

// POST /api/v1/payouts/:id/cancel - Cancel a pending payout
router.post('/:id/cancel', authenticate, payoutsController.cancelPayout);

module.exports = router;
