const express = require('express');
const router = express.Router();
const earningsController = require('../controllers/earnings.controller');

// ============================================
// Earnings Routes
// ============================================

// GET /api/v1/earnings/dashboard - Get earnings dashboard data
router.get('/dashboard', earningsController.getDashboard);

// GET /api/v1/earnings/products - Get earnings by product
router.get('/products', earningsController.getProductEarnings);

// GET /api/v1/earnings/affiliates - Get affiliate earnings
router.get('/affiliates', earningsController.getAffiliateEarnings);

// GET /api/v1/earnings/level - Get level info
router.get('/level', earningsController.getLevelInfo);

module.exports = router;