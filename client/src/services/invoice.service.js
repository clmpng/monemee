import api from './api';

/**
 * Invoice Service
 * API calls for invoices
 */
const invoiceService = {
  /**
   * Get my invoices (as seller)
   */
  async getMyInvoices({ limit = 50, offset = 0 } = {}) {
    const response = await api.get('/invoices', {
      params: { limit, offset }
    });
    return response.data;
  },

  /**
   * Get single invoice by ID
   */
  async getInvoice(id) {
    const response = await api.get(`/invoices/${id}`);
    return response.data;
  },

  /**
   * Get public invoice by access token (no auth needed)
   */
  async getPublicInvoice(token) {
    const response = await api.get(`/invoices/view/${token}`);
    return response.data;
  },

  /**
   * Check if transaction has invoice (for CheckoutSuccess)
   */
  async getInvoiceByTransaction(transactionId) {
    const response = await api.get(`/invoices/transaction/${transactionId}`);
    return response.data;
  }
};

export default invoiceService;
