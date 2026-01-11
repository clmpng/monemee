const express = require('express');
const router = express.Router();

// Import route modules
const productsRoutes = require('./products.routes');
const earningsRoutes = require('./earnings.routes');
const promotionRoutes = require('./promotion.routes');
const paymentsRoutes = require('./payments.routes');
const usersRoutes = require('./users.routes');
const messagesRoutes = require('./messages.routes');
const payoutsRoutes = require('./payouts.routes');
const stripeRoutes = require('./stripe.routes');
const invoicesRoutes = require('./invoices.routes');
const downloadsRoutes = require('./downloads.routes');
const reportsRoutes = require('./reports.routes');

// ============================================
// API Routes
// ============================================

// Products
router.use('/products', productsRoutes);

// Earnings / Statistics
router.use('/earnings', earningsRoutes);

// Promotion / Affiliates
router.use('/promotion', promotionRoutes);

// Payments (Legacy - für simulierte Käufe)
router.use('/payments', paymentsRoutes);

// Payouts (Auszahlungen)
router.use('/payouts', payoutsRoutes);

// Stripe Connect & Webhooks
router.use('/stripe', stripeRoutes);

//Invoices
router.use('/invoices', invoicesRoutes);

// Users
router.use('/users', usersRoutes);

// Messages
router.use('/messages', messagesRoutes);

// Downloads (digitale Produktauslieferung)
router.use('/downloads', downloadsRoutes);

// Reports (DSA Art. 16 - Melde- und Abhilfeverfahren)
router.use('/reports', reportsRoutes);

module.exports = router;