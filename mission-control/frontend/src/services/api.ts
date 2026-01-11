import axios from 'axios';

// ============================================================================
// MISSION CONTROL API (Admin Dashboard Backend)
// ============================================================================
// In development: Use relative URL to leverage Vite proxy
// In production: Use VITE_API_URL env variable
const API_BASE_URL = import.meta.env.VITE_API_URL || '';

// Mission Control Admin API
export const api = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor (fügt Admin Token hinzu)
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('admin_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor (Handle Errors)
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired -> Logout
      localStorage.removeItem('admin_token');
      window.location.href = '/login';
    }
    return Promise.reject(error.response?.data || error.message);
  }
);

// ============================================================================
// MONEMEE PLATFORM API (Main Application Backend)
// ============================================================================
// Separate API instance for monemee platform data (products, reports, etc.)
// This allows mission-control to run on a different domain than monemee
const MONEMEE_API_URL = import.meta.env.VITE_MONEMEE_API_URL || 'http://localhost:5000/api/v1';

// Monemee Platform API
export const monemeeAPI = axios.create({
  baseURL: MONEMEE_API_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: false, // Enable if using cookies for auth
});

// Response Interceptor (Handle Errors - no auto-logout for monemee API)
monemeeAPI.interceptors.response.use(
  (response) => response.data,
  (error) => {
    console.error('Monemee API Error:', error.response?.data || error.message);
    return Promise.reject(error.response?.data || error.message);
  }
);

// API Methods
export const authAPI = {
  login: (credentials: { username: string; password: string }) =>
    api.post('/auth/login', credentials),
  verify: () => api.post('/auth/verify'),
};

export const dashboardAPI = {
  getOverview: () => api.get('/dashboard/overview'),
  getAlerts: () => api.get('/dashboard/alerts'),
  getLiveFeed: (limit?: number) => api.get(`/dashboard/live-feed?limit=${limit || 20}`),
  broadcast: (message: string, type?: string) =>
    api.post('/dashboard/broadcast', { message, type }),
};

export const usersAPI = {
  getList: (params?: any) => api.get('/users/list', { params }),
  getById: (id: string) => api.get(`/users/${id}`),
  getStats: () => api.get('/users/stats/summary'),
};

export const financialAPI = {
  getOverview: (period?: string) =>
    api.get(`/financial/overview?period=${period || '30d'}`),
  getTransactions: (params?: any) => api.get('/financial/transactions', { params }),
  getPayouts: (status?: string) => api.get(`/financial/payouts?status=${status || 'pending'}`),
};

export const analyticsAPI = {
  getProducts: () => api.get('/analytics/products'),
  getFunnel: () => api.get('/analytics/funnel'),
};

export const securityAPI = {
  getOverview: () => api.get('/security/overview'),
  getAuditLog: (params?: any) => api.get('/security/audit-log', { params }),
};

export const performanceAPI = {
  getDatabase: () => api.get('/performance/database'),
  getAPI: () => api.get('/performance/api'),
};

export const testsAPI = {
  run: (type: string, watch?: boolean, project?: string) =>
    api.post('/tests/run', { type, watch, project: project || 'all' }),
  getHistory: (limit?: number, project?: string) =>
    api.get(`/tests/history?limit=${limit || 20}${project ? `&project=${project}` : ''}`),
  getStatus: () => api.get('/tests/status'),
  getProjects: () => api.get('/tests/projects'),
  coverage: (project?: string) => api.post('/tests/coverage', { project: project || 'all' }),
  stop: (runId?: string) => api.post('/tests/stop', { runId }),
  getRunDetails: (runId: string) => api.get(`/tests/history/${runId}`),
};

export const rulesAPI = {
  getAll: (params?: any) => api.get('/rules', { params }),
  getById: (id: string) => api.get(`/rules/${id}`),
  create: (rule: any) => api.post('/rules', rule),
  update: (id: string, rule: any) => api.put(`/rules/${id}`, rule),
  delete: (id: string) => api.delete(`/rules/${id}`),
  toggle: (id: string) => api.patch(`/rules/${id}/toggle`),
  getStats: () => api.get('/rules/stats'),
  getExecutionHistory: (params?: any) => api.get('/rules/execution/history', { params }),
  test: (rule: any, testData: any) => api.post('/rules/test', { ...rule, testData }),
};

export const leaderboardsAPI = {
  getOverview: () => api.get('/leaderboards/overview'),
  getTopSellers: (params?: any) => api.get('/leaderboards/top-sellers', { params }),
  getTopAffiliates: (params?: any) => api.get('/leaderboards/top-affiliates', { params }),
  getTopProducts: (params?: any) => api.get('/leaderboards/top-products', { params }),
  getFastestGrowing: (params?: any) => api.get('/leaderboards/fastest-growing', { params }),
  getMostActive: (params?: any) => api.get('/leaderboards/most-active', { params }),
};

export const securityCenterAPI = {
  getOverview: () => api.get('/security-center/overview'),
  // IP Management
  getBlockedIPs: () => api.get('/security-center/blocked-ips'),
  blockIP: (ip_address: string, reason: string) =>
    api.post('/security-center/blocked-ips', { ip_address, reason }),
  unblockIP: (ip: string) => api.delete(`/security-center/blocked-ips/${ip}`),
  // Session Management
  getActiveSessions: () => api.get('/security-center/active-sessions'),
  killSession: (id: string) => api.delete(`/security-center/sessions/${id}`),
  killUserSessions: (userId: string) =>
    api.post(`/security-center/sessions/kill-user/${userId}`),
  // Failed Logins
  getFailedLogins: (params?: any) => api.get('/security-center/failed-logins', { params }),
  getFailedLoginsStats: () => api.get('/security-center/failed-logins/stats'),
  // 2FA
  get2FAStatus: () => api.get('/security-center/2fa-status'),
  enforce2FA: (userId: string) => api.post(`/security-center/2fa/enforce/${userId}`),
  // Suspicious Activity
  getSuspiciousActivity: () => api.get('/security-center/suspicious-activity'),
  // Rate Limits
  getRateLimits: () => api.get('/security-center/rate-limits'),
};

export const devtoolsAPI = {
  // API Inspector
  getAPIRequests: (params?: any) => api.get('/devtools/api-requests', { params }),
  getAPIRequestStats: (params?: any) => api.get('/devtools/api-requests/stats', { params }),
  getAPIRequestById: (id: string) => api.get(`/devtools/api-requests/${id}`),
  // DB Profiler
  getDBQueries: (params?: any) => api.get('/devtools/db-queries', { params }),
  explainQuery: (query: string) => api.post('/devtools/db-queries/explain', { query }),
  getDBStats: () => api.get('/devtools/db-queries/stats'),
  // Webhooks
  getWebhooks: (params?: any) => api.get('/devtools/webhooks', { params }),
  retryWebhook: (id: string) => api.post(`/devtools/webhooks/${id}/retry`),
  getWebhookStats: () => api.get('/devtools/webhooks/stats'),
  // Feature Flags
  getFeatureFlags: () => api.get('/devtools/feature-flags'),
  createFeatureFlag: (flag: any) => api.post('/devtools/feature-flags', flag),
  updateFeatureFlag: (id: string, flag: any) =>
    api.put(`/devtools/feature-flags/${id}`, flag),
  toggleFeatureFlag: (id: string) => api.patch(`/devtools/feature-flags/${id}/toggle`),
  deleteFeatureFlag: (id: string) => api.delete(`/devtools/feature-flags/${id}`),
  checkFeatureFlag: (name: string, userId?: string) =>
    api.get(`/devtools/feature-flags/check/${name}`, { params: { user_id: userId } }),
};

export const businessIntelligenceAPI = {
  getRevenueAttribution: (params?: any) =>
    api.get('/bi/revenue-attribution', { params }),
  getCustomerSegments: () => api.get('/bi/customer-segments'),
  getCustomerLifetimeValue: (params?: any) =>
    api.get('/bi/customer-lifetime-value', { params }),
  getCohortAnalysis: (params?: any) => api.get('/bi/cohort-analysis', { params }),
  getProductCrossSell: (params?: any) => api.get('/bi/product-cross-sell', { params }),
  getChurnPrediction: () => api.get('/bi/churn-prediction'),
};

// Content Reports API (DSA Art. 16)
// Uses monemeeAPI because reports are managed in the main platform
export const reportsAPI = {
  // Get all reports with filters
  getAll: (params?: any) => monemeeAPI.get('/reports', { params }),
  // Get single report
  getById: (id: string) => monemeeAPI.get(`/reports/${id}`),
  // Update report (status, resolution)
  update: (id: string, data: any) => monemeeAPI.patch(`/reports/${id}`, data),
  // Get statistics
  getStatistics: () => monemeeAPI.get('/reports/statistics'),
  // Get auto-review config
  getAutoReviewConfig: () => monemeeAPI.get('/reports/auto-review/config'),
  // Update auto-review config
  updateAutoReviewConfig: (config: any) => monemeeAPI.put('/reports/auto-review/config', config),
  // Trigger manual auto-review
  triggerAutoReview: (reportId: string) => monemeeAPI.post(`/reports/${reportId}/auto-review`),
};

export default api;
