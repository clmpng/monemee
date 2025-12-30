import api from './api';

/**
 * Payouts Service
 * Handles all payout-related API calls
 * 
 * WICHTIG: Payouts sind NUR für Affiliate-Provisionen!
 * Produkt-Einnahmen werden automatisch via Stripe ausgezahlt.
 */
const payoutsService = {
  /**
   * Get affiliate balance and payout info
   * (Ersetzt getBalance - nur für Affiliate-Provisionen)
   */
  getAffiliateBalance: () => api.get('/payouts/affiliate-balance'),
  
  /**
   * Legacy: Get user balance (deprecated, use getAffiliateBalance)
   */
  getBalance: () => api.get('/payouts/affiliate-balance'),
  
  /**
   * Request a payout (nur für Affiliate-Provisionen)
   */
  requestPayout: (amount) => api.post('/payouts/request', { amount }),
  
  /**
   * Get payout history
   */
  getHistory: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return api.get(`/payouts/history${queryString ? '?' + queryString : ''}`);
  },
  
  /**
   * Cancel a pending payout
   */
  cancelPayout: (payoutId) => api.post(`/payouts/${payoutId}/cancel`),
  
  /**
   * Get platform configuration (levels, payout rules)
   */
  getConfig: () => api.get('/payouts/config')
};

export default payoutsService;
