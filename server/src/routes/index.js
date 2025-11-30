const express = require('express');
const router = express.Router();

// Import route modules
const productsRoutes = require('./products.routes');
const earningsRoutes = require('./earnings.routes');
const promotionRoutes = require('./promotion.routes');
const paymentsRoutes = require('./payments.routes');

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

// Auth routes (später hinzufügen)
// router.use('/auth', authRoutes);

// Users routes (später hinzufügen)
// router.use('/users', usersRoutes);

module.exports = router;