const db = require('../config/database');
const crypto = require('crypto');

/**
 * Invoice Model
 * Rechnungen für gewerbliche Verkäufer
 */
const InvoiceModel = {
  /**
   * Rechnung erstellen
   */
  async create({
    transaction_id,
    buyer_id,
    seller_id,
    net_amount,
    tax_rate = 0,
    tax_amount = 0,
    gross_amount,
    currency = 'EUR',
    product_title,
    product_description = null,
    seller_name,
    seller_address,
    seller_tax_id = null,
    seller_is_small_business = false,
    buyer_email
  }) {
    // Rechnungsnummer generieren
    const numberResult = await db.query('SELECT generate_invoice_number() as invoice_number');
    const invoice_number = numberResult.rows[0].invoice_number;

    // Access Token generieren (für öffentlichen Link)
    const access_token = crypto.randomBytes(32).toString('hex');
    
    // Token gültig für 1 Jahr
    const token_expires_at = new Date();
    token_expires_at.setFullYear(token_expires_at.getFullYear() + 1);

    const query = `
      INSERT INTO invoices (
        transaction_id, buyer_id, seller_id, invoice_number,
        access_token, token_expires_at,
        net_amount, tax_rate, tax_amount, gross_amount, currency,
        product_title, product_description,
        seller_name, seller_address, seller_tax_id, seller_is_small_business,
        buyer_email
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)
      RETURNING *
    `;

    const values = [
      transaction_id,
      buyer_id,
      seller_id,
      invoice_number,
      access_token,
      token_expires_at,
      net_amount,
      tax_rate,
      tax_amount,
      gross_amount,
      currency,
      product_title,
      product_description,
      seller_name,
      seller_address,
      seller_tax_id,
      seller_is_small_business,
      buyer_email
    ];

    const result = await db.query(query, values);
    return result.rows[0];
  },

  /**
   * Rechnung nach ID finden
   */
  async findById(id) {
    const query = `SELECT * FROM invoices WHERE id = $1`;
    const result = await db.query(query, [id]);
    return result.rows[0] || null;
  },

  /**
   * Rechnung nach Access Token finden (öffentlicher Zugang)
   */
  async findByAccessToken(token) {
    const query = `
      SELECT * FROM invoices
      WHERE access_token = $1
        AND (token_expires_at IS NULL OR token_expires_at > NOW())
    `;
    
    const result = await db.query(query, [token]);
    return result.rows[0] || null;
  },

  /**
   * Rechnung nach Rechnungsnummer finden
   */
  async findByInvoiceNumber(invoiceNumber) {
    const query = `SELECT * FROM invoices WHERE invoice_number = $1`;
    const result = await db.query(query, [invoiceNumber]);
    return result.rows[0] || null;
  },

  /**
   * Rechnung nach Transaction ID finden
   */
  async findByTransactionId(transactionId) {
    const query = `SELECT * FROM invoices WHERE transaction_id = $1`;
    const result = await db.query(query, [transactionId]);
    return result.rows[0] || null;
  },

  /**
   * Rechnungen für einen Verkäufer
   */
  async findBySellerId(sellerId, limit = 50, offset = 0) {
    const query = `
      SELECT 
        i.*,
        t.created_at as transaction_date
      FROM invoices i
      JOIN transactions t ON i.transaction_id = t.id
      WHERE i.seller_id = $1
      ORDER BY i.issued_at DESC
      LIMIT $2 OFFSET $3
    `;

    const result = await db.query(query, [sellerId, limit, offset]);
    return result.rows;
  },

  /**
   * Anzahl Rechnungen für einen Verkäufer
   */
  async countBySellerId(sellerId) {
    const query = `SELECT COUNT(*) as count FROM invoices WHERE seller_id = $1`;
    const result = await db.query(query, [sellerId]);
    return parseInt(result.rows[0].count);
  },

  /**
   * Rechnung für Käufer-Ansicht formatieren
   */
  formatForBuyer(invoice) {
    if (!invoice) return null;

    return {
      invoiceNumber: invoice.invoice_number,
      issuedAt: invoice.issued_at,
      
      // Beträge
      netAmount: parseFloat(invoice.net_amount),
      taxRate: parseFloat(invoice.tax_rate),
      taxAmount: parseFloat(invoice.tax_amount),
      grossAmount: parseFloat(invoice.gross_amount),
      currency: invoice.currency,
      
      // Produkt
      productTitle: invoice.product_title,
      productDescription: invoice.product_description,
      
      // Verkäufer
      sellerName: invoice.seller_name,
      sellerAddress: invoice.seller_address,
      sellerTaxId: invoice.seller_tax_id,
      isSmallBusiness: invoice.seller_is_small_business,
      
      // Käufer
      buyerEmail: invoice.buyer_email
    };
  },

  /**
   * Rechnung für Verkäufer-Liste formatieren
   */
  formatForSellerList(invoice) {
    if (!invoice) return null;

    return {
      id: invoice.id,
      invoiceNumber: invoice.invoice_number,
      issuedAt: invoice.issued_at,
      buyerEmail: invoice.buyer_email,
      productTitle: invoice.product_title,
      grossAmount: parseFloat(invoice.gross_amount),
      currency: invoice.currency,
      accessToken: invoice.access_token
    };
  }
};

module.exports = InvoiceModel;
