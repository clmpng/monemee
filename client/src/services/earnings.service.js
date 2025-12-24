import api from './api';

const earningsService = {
  // Get dashboard data
  getDashboard: () => api.get('/earnings/dashboard'),
  
  // Get earnings by product
  getProductEarnings: () => api.get('/earnings/products'),
  
  // Get affiliate earnings
  getAffiliateEarnings: () => api.get('/earnings/affiliates'),
  
  // Get level info for current user
  getLevelInfo: () => api.get('/earnings/level'),
  
  // Get all levels info (public)
  getAllLevels: () => api.get('/earnings/levels')
};

export default earningsService;
