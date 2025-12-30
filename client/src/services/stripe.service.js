import api from './api';

/**
 * Stripe Service
 * Handles Stripe Connect related API calls
 */
const stripeService = {
  /**
   * Get Stripe Connect status
   * Returns current onboarding state and capabilities
   */
  getConnectStatus: () => api.get('/stripe/connect/status'),
  
  /**
   * Start Stripe Connect onboarding
   * Returns URL to redirect user to Stripe
   */
  startOnboarding: () => api.post('/stripe/connect/start'),
  
  /**
   * Continue onboarding (get new link if expired)
   */
  continueOnboarding: () => api.post('/stripe/connect/continue'),
  
  /**
   * Get Stripe Express Dashboard link
   * Only available after onboarding is complete
   */
  getDashboardLink: () => api.get('/stripe/connect/dashboard-link')
};

export default stripeService;