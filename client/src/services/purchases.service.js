/**
 * Purchases Service
 * API-Calls für Käufe und Downloads
 */

import api from './api';

const purchasesService = {
  /**
   * Alle Käufe des eingeloggten Users
   * GET /api/v1/downloads/purchases
   */
  getMyPurchases: () => api.get('/downloads/purchases'),

  /**
   * Einzelner Kauf mit Modulen
   * GET /api/v1/downloads/purchase/:transactionId
   */
  getPurchaseContent: (transactionId) =>
    api.get(`/downloads/purchase/${transactionId}`),

  /**
   * Kauf über Stripe Session ID (für Gäste nach Checkout)
   * GET /api/v1/downloads/session/:sessionId
   */
  getPurchaseBySession: (sessionId) =>
    api.get(`/downloads/session/${sessionId}`),

  /**
   * Token-Info abrufen (ohne Download)
   * GET /api/v1/downloads/token/:token/info
   */
  getTokenInfo: (token) =>
    api.get(`/downloads/token/${token}/info`),

  /**
   * Download-URL für authentifizierte User
   * Redirect zu /api/v1/downloads/file/:moduleId
   */
  getDownloadUrl: (moduleId) =>
    `${api.defaults.baseURL}/downloads/file/${moduleId}`,

  /**
   * Token-Download URL (für E-Mail-Links)
   */
  getTokenDownloadUrl: (token) =>
    `${api.defaults.baseURL}/downloads/token/${token}`
};

export default purchasesService;
