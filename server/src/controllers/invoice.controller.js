/**
 * Invoice Controller
 * Handles invoice retrieval
 */

const InvoiceModel = require('../models/Invoice.model');
const InvoiceService = require('../services/invoice.service');

const invoiceController = {
  /**
   * Get invoices for current seller
   * GET /api/v1/invoices
   */
  async getMyInvoices(req, res, next) {
    try {
      const userId = req.userId;
      const { limit = 50, offset = 0 } = req.query;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Nicht authentifiziert'
        });
      }

      const invoices = await InvoiceModel.findBySellerId(
        userId,
        parseInt(limit),
        parseInt(offset)
      );

      const total = await InvoiceModel.countBySellerId(userId);

      res.json({
        success: true,
        data: {
          invoices: invoices.map(InvoiceModel.formatForSellerList),
          pagination: {
            total,
            limit: parseInt(limit),
            offset: parseInt(offset),
            hasMore: parseInt(offset) + invoices.length < total
          }
        }
      });

    } catch (error) {
      console.error('Get invoices error:', error);
      next(error);
    }
  },

  /**
   * Get single invoice by ID (für Verkäufer)
   * GET /api/v1/invoices/:id
   */
  async getInvoice(req, res, next) {
    try {
      const userId = req.userId;
      const { id } = req.params;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Nicht authentifiziert'
        });
      }

      const invoice = await InvoiceModel.findById(parseInt(id));

      if (!invoice) {
        return res.status(404).json({
          success: false,
          message: 'Rechnung nicht gefunden'
        });
      }

      // Nur der Verkäufer darf seine Rechnungen sehen
      if (invoice.seller_id !== userId) {
        return res.status(403).json({
          success: false,
          message: 'Keine Berechtigung'
        });
      }

      res.json({
        success: true,
        data: {
          invoice: InvoiceService.prepareInvoiceData(invoice),
          accessToken: invoice.access_token,
          publicUrl: InvoiceService.getPublicUrl(invoice.access_token)
        }
      });

    } catch (error) {
      console.error('Get invoice error:', error);
      next(error);
    }
  },

  /**
   * Get public invoice by access token (kein Login nötig)
   * GET /api/v1/invoices/view/:token
   */
  async getPublicInvoice(req, res, next) {
    try {
      const { token } = req.params;

      if (!token || token.length !== 64) {
        return res.status(400).json({
          success: false,
          message: 'Ungültiger Token'
        });
      }

      const invoice = await InvoiceModel.findByAccessToken(token);

      if (!invoice) {
        return res.status(404).json({
          success: false,
          message: 'Rechnung nicht gefunden oder Link abgelaufen'
        });
      }

      res.json({
        success: true,
        data: {
          invoice: InvoiceService.prepareInvoiceData(invoice)
        }
      });

    } catch (error) {
      console.error('Get public invoice error:', error);
      next(error);
    }
  },

  /**
   * Get invoice for a transaction (used by CheckoutSuccess)
   * GET /api/v1/invoices/transaction/:transactionId
   */
  async getInvoiceByTransaction(req, res, next) {
    try {
      const { transactionId } = req.params;

      const invoice = await InvoiceModel.findByTransactionId(parseInt(transactionId));

      if (!invoice) {
        return res.json({
          success: true,
          data: {
            hasInvoice: false,
            invoice: null
          }
        });
      }

      res.json({
        success: true,
        data: {
          hasInvoice: true,
          publicUrl: InvoiceService.getPublicUrl(invoice.access_token),
          invoiceNumber: invoice.invoice_number
        }
      });

    } catch (error) {
      console.error('Get invoice by transaction error:', error);
      next(error);
    }
  }
};

module.exports = invoiceController;
