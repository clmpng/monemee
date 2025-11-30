import api from './api';

const productsService = {
  // Get my products
  getMyProducts: () => api.get('/products'),
  
  // Get single product
  getProduct: (id) => api.get(`/products/${id}`),
  
  // Create product
  createProduct: (data) => api.post('/products', data),
  
  // Update product
  updateProduct: (id, data) => api.put(`/products/${id}`, data),
  
  // Delete product
  deleteProduct: (id) => api.delete(`/products/${id}`),
  
  // Get top products
  getTopProducts: () => api.get('/products/top'),
  
  // Discover products (for promoters)
  discoverProducts: (params) => api.get('/products/discover', { params })
};

export default productsService;