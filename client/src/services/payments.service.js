import api from './api';

/**
 * Payments Service
 * Handles payment-related API calls
 */
const paymentsService = {
  /**
   * DUMMY: Simulierter Kauf
   * Erstellt echte Transaktionen in der DB für Testing
   * 
   * @param {number} productId - ID des Produkts
   * @param {string|null} affiliateCode - Optional: Affiliate-Code
   */
  simulatePurchase: (productId, affiliateCode = null) => 
    api.post('/payments/simulate-purchase', { 
      productId, 
      affiliateCode 
    }),
  
  /**
   * Create Stripe checkout session
   * TODO: Echte Stripe Integration
   */
  createCheckout: (productId, affiliateCode = null) => 
    api.post('/payments/create-checkout', { 
      productId, 
      affiliateCode 
    }),
  
  /**
   * Get user transactions
   */
  getTransactions: () => api.get('/payments/transactions')
};

export default paymentsService;