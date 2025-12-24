import api from './api';

/**
 * Payouts Service
 * Handles all payout-related API calls
 */
const payoutsService = {
  /**
   * Get user balance and payout info
   */
  getBalance: () => api.get('/payouts/balance'),
  
  /**
   * Request a payout
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
