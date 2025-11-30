import api from './api';

const promotionService = {
  // Generate affiliate link
  generateLink: (productId) => api.post('/promotion/generate-link', { productId }),
  
  // Get my promotions
  getMyPromotions: () => api.get('/promotion/my-promotions'),
  
  // Get my network
  getMyNetwork: () => api.get('/promotion/my-network'),
  
  // Discover products
  discoverProducts: (params) => api.get('/promotion/discover', { params }),
  
  // Track click
  trackClick: (code) => api.post('/promotion/track-click', { code })
};

export default promotionService;