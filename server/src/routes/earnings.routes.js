const express = require('express');
const router = express.Router();
const earningsController = require('../controllers/earnings.controller');
const { authenticate } = require('../middleware/auth');

// ============================================
// Earnings Routes
// WICHTIG: Alle Routes erfordern Authentifizierung!
// ============================================

// GET /api/v1/earnings/dashboard - Get earnings dashboard data
router.get('/dashboard', authenticate, earningsController.getDashboard);

// GET /api/v1/earnings/products - Get earnings by product
router.get('/products', authenticate, earningsController.getProductEarnings);

// GET /api/v1/earnings/affiliates - Get affiliate earnings
router.get('/affiliates', authenticate, earningsController.getAffiliateEarnings);

// GET /api/v1/earnings/level - Get level info
router.get('/level', authenticate, earningsController.getLevelInfo);

module.exports = router;