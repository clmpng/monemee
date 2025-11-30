const express = require('express');
const router = express.Router();

// Import route modules
const productsRoutes = require('./products.routes');
const earningsRoutes = require('./earnings.routes');
const promotionRoutes = require('./promotion.routes');
const paymentsRoutes = require('./payments.routes');
const usersRoutes = require('./users.routes');

// ============================================
// API Routes
// ============================================

// Products
router.use('/products', productsRoutes);

// Earnings / Statistics
router.use('/earnings', earningsRoutes);

// Promotion / Affiliates
router.use('/promotion', promotionRoutes);

// Payments (Stripe)
router.use('/payments', paymentsRoutes);

// Users
router.use('/users', usersRoutes);

module.exports = router;