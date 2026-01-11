import api from './api';

/**
 * Reports Service
 * Handles content report submissions (DSA Art. 16)
 */
const reportsService = {
  /**
   * Submit a content report
   * @param {Object} data - Report data
   * @param {string} data.product_url - URL or ID of the reported product
   * @param {string} data.reason - Reason for the report
   * @param {string} data.description - Detailed description
   * @param {string} [data.reporter_email] - Optional reporter email
   * @param {string} [data.reporter_name] - Optional reporter name
   * @returns {Promise<Object>} - Response with reportId
   */
  submitReport: (data) => api.post('/reports', data),

  /**
   * Get report status (for reporters who provided email)
   * @param {string} reportId - The report ID
   * @param {string} email - Reporter email for verification
   * @returns {Promise<Object>} - Report status
   */
  getReportStatus: (reportId, email) =>
    api.get(`/reports/${reportId}/status`, { params: { email } })
};

export default reportsService;
