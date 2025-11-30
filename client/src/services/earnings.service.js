import api from './api';

const earningsService = {
  // Get dashboard data
  getDashboard: () => api.get('/earnings/dashboard'),
  
  // Get earnings by product
  getProductEarnings: () => api.get('/earnings/products'),
  
  // Get affiliate earnings
  getAffiliateEarnings: () => api.get('/earnings/affiliates'),
  
  // Get level info
  getLevelInfo: () => api.get('/earnings/level')
};

export default earningsService;