/**
 * Invoice Routes
 * /api/v1/invoices
 */

const express = require('express');
const router = express.Router();
const invoiceController = require('../controllers/invoice.controller');
const { authenticate } = require('../middleware/auth');

/**
 * GET /api/v1/invoices/view/:token
 * Öffentliche Rechnung anzeigen (kein Login)
 */
router.get('/view/:token', invoiceController.getPublicInvoice);

/**
 * GET /api/v1/invoices/transaction/:transactionId
 * Rechnung für Transaktion prüfen (für CheckoutSuccess)
 */
router.get('/transaction/:transactionId', invoiceController.getInvoiceByTransaction);

// Ab hier: Authentifizierung erforderlich
router.use(authenticate);

/**
 * GET /api/v1/invoices
 * Meine Rechnungen abrufen (als Verkäufer)
 */
router.get('/', invoiceController.getMyInvoices);

/**
 * GET /api/v1/invoices/:id
 * Einzelne Rechnung abrufen
 */
router.get('/:id', invoiceController.getInvoice);

module.exports = router;
