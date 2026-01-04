const InvoiceModel = require('../models/Invoice.model');
const SellerBillingModel = require('../models/SellerBilling.model');

/**
 * Invoice Service
 * Erstellt Rechnungen NUR für gewerbliche Verkäufer
 */
const InvoiceService = {
  /**
   * MwSt-Satz
   */
  VAT_RATE: 19, // Standard-MwSt in Deutschland

  /**
   * Prüft ob für diese Transaktion eine Rechnung erstellt werden soll
   */
  shouldCreateInvoice(seller) {
    return seller.seller_type === 'business';
  },

  /**
   * Rechnung für eine Transaktion erstellen
   * Wird nur aufgerufen wenn Verkäufer gewerblich ist
   */
  async createInvoiceForTransaction({
    transaction,
    product,
    buyer,
    seller,
    billingInfo
  }) {
    console.log(`[Invoice] Erstelle Rechnung für Transaktion #${transaction.id}`);

    // Prüfe ob bereits eine Rechnung existiert
    const existingInvoice = await InvoiceModel.findByTransactionId(transaction.id);
    if (existingInvoice) {
      console.log(`[Invoice] Rechnung existiert bereits: ${existingInvoice.invoice_number}`);
      return existingInvoice;
    }

    // Beträge berechnen
    const grossAmount = parseFloat(transaction.amount);
    let netAmount, taxRate, taxAmount;

    if (billingInfo.is_small_business) {
      // Kleinunternehmer: Keine MwSt
      netAmount = grossAmount;
      taxRate = 0;
      taxAmount = 0;
    } else {
      // Regelbesteuert: MwSt berechnen
      taxRate = this.VAT_RATE;
      netAmount = grossAmount / (1 + taxRate / 100);
      taxAmount = grossAmount - netAmount;
    }

    // Seller-Adresse formatieren
    const sellerAddress = SellerBillingModel.formatAddress(billingInfo);

    // Rechnung erstellen
    const invoice = await InvoiceModel.create({
      transaction_id: transaction.id,
      buyer_id: buyer.id,
      seller_id: seller.id,
      
      net_amount: netAmount.toFixed(2),
      tax_rate: taxRate,
      tax_amount: taxAmount.toFixed(2),
      gross_amount: grossAmount.toFixed(2),
      
      product_title: product.title,
      product_description: product.description || null,
      
      seller_name: billingInfo.business_name,
      seller_address: sellerAddress,
      seller_tax_id: billingInfo.tax_id || null,
      seller_is_small_business: billingInfo.is_small_business,
      
      buyer_email: buyer.email
    });

    console.log(`[Invoice] Rechnung erstellt: ${invoice.invoice_number}`);
    return invoice;
  },

  /**
   * Öffentliche URL für Rechnung generieren
   */
  getPublicUrl(accessToken) {
    const baseUrl = process.env.FRONTEND_URL || 'https://monemee.app';
    return `${baseUrl}/invoice/${accessToken}`;
  },

  /**
   * Rechnungsdaten für HTML-Rendering aufbereiten
   */
  prepareInvoiceData(invoice) {
    const issuedDate = new Date(invoice.issued_at);
    
    return {
      // Rechnungskopf
      invoiceNumber: invoice.invoice_number,
      issuedAt: issuedDate.toLocaleDateString('de-DE'),
      serviceDate: issuedDate.toLocaleDateString('de-DE'), // Leistungsdatum = Kaufdatum
      
      // Verkäufer
      seller: {
        name: invoice.seller_name,
        address: invoice.seller_address,
        taxId: invoice.seller_tax_id,
        isSmallBusiness: invoice.seller_is_small_business
      },
      
      // Käufer
      buyer: {
        email: invoice.buyer_email
      },
      
      // Positionen
      items: [
        {
          description: invoice.product_title,
          quantity: 1,
          unitPrice: parseFloat(invoice.net_amount),
          total: parseFloat(invoice.net_amount)
        }
      ],
      
      // Summen
      totals: {
        net: parseFloat(invoice.net_amount),
        taxRate: parseFloat(invoice.tax_rate),
        tax: parseFloat(invoice.tax_amount),
        gross: parseFloat(invoice.gross_amount),
        currency: invoice.currency
      },
      
      // Hinweise
      notes: invoice.seller_is_small_business
        ? 'Gemäß § 19 UStG wird keine Umsatzsteuer berechnet.'
        : null
    };
  }
};

module.exports = InvoiceService;
