import api from './api';

/**
 * Payments Service
 * Handles payment-related API calls
 */
const paymentsService = {
  
  /**
   * Create Stripe Checkout Session
   * Redirects user to Stripe payment page
   * 
   * @param {number} productId - ID des Produkts
   * @param {string|null} affiliateCode - Optional: Affiliate-Code
   * @returns {Promise<{checkoutUrl: string, sessionId: string}>}
   */
  createCheckout: (productId, affiliateCode = null) => 
    api.post('/payments/create-checkout', { 
      productId, 
      affiliateCode 
    }),
  
  /**
   * Verify Checkout Session
   * Called after successful payment redirect
   * 
   * @param {string} sessionId - Stripe Session ID from URL
   * @returns {Promise<{paymentStatus: string, productId: string, amount: number}>}
   */
  verifySession: (sessionId) => 
    api.get(`/payments/verify-session/${sessionId}`),
  
  /**
   * Get user transactions (as seller)
   */
  getTransactions: () => api.get('/payments/transactions'),
  
  /**
   * Get user purchases (as buyer)
   */
  getPurchases: () => api.get('/payments/purchases'),
};

export default paymentsService;
