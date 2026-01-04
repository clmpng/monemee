import api from './api';

/**
 * Billing Service
 * API calls for seller type and billing info
 */
const billingService = {
  /**
   * Get billing info for current user
   */
  async getBillingInfo() {
    const response = await api.get('/users/billing');
    return response.data;
  },

  /**
   * Set seller type (private/business)
   */
  async setSellerType(sellerType) {
    const response = await api.put('/users/seller-type', { sellerType });
    return response.data;
  },

  /**
   * Update billing info (for business sellers)
   */
  async updateBillingInfo(data) {
    const response = await api.put('/users/billing', data);
    return response.data;
  },

  /**
   * Check if user can sell
   */
  async checkCanSell() {
    const response = await api.get('/users/can-sell');
    return response.data;
  }
};

export default billingService;
