const express = require('express');
const router = express.Router();
const payoutsController = require('../controllers/payouts.controller');
const { authenticate } = require('../middleware/auth');

// ============================================
// Payout Routes (NUR für Affiliate-Provisionen!)
// ============================================

// GET /api/v1/payouts/config - Get platform config (levels, fees)
// Öffentlich, damit Landing Page Level-Info anzeigen kann
router.get('/config', payoutsController.getConfig);

// GET /api/v1/payouts/affiliate-balance - Get affiliate balance info
router.get('/affiliate-balance', authenticate, payoutsController.getAffiliateBalance);

// GET /api/v1/payouts/history - Get payout history
router.get('/history', authenticate, payoutsController.getHistory);

// POST /api/v1/payouts/request - Request a payout (nur für Affiliate-Provisionen)
router.post('/request', authenticate, payoutsController.requestPayout);

// POST /api/v1/payouts/:id/cancel - Cancel a pending payout
router.post('/:id/cancel', authenticate, payoutsController.cancelPayout);

module.exports = router;
