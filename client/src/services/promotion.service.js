import api from './api';

const promotionService = {
  generateLink: (productId) => api.post('/promotion/generate-link', { productId }),
  getMyPromotions: () => api.get('/promotion/my-promotions'),
  getMyNetwork: () => api.get('/promotion/my-network'),
  trackClick: (code) => api.post('/promotion/track-click', { code }),
  invite: (email) => api.post('/promotion/invite', { email })
};

export default promotionService;