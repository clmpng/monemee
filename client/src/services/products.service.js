// client/src/services/products.service.js
import api from './api';

const productsService = {
  // Get my products
  getMyProducts: () => api.get('/products'),
  
  // Get single product (authenticated)
  getProduct: (id) => api.get(`/products/${id}`),
  
  // Get public product (no auth required, increments views)
  getPublicProduct: (id) => api.get(`/products/public/${id}`),
  
  // Create product
  createProduct: (data) => api.post('/products', data),
  
  // Update product
  updateProduct: (id, data) => api.put(`/products/${id}`, data),
  
  // Delete product
  deleteProduct: (id) => api.delete(`/products/${id}`),
  
  // Get top products
  getTopProducts: () => api.get('/products/top'),
  
  // Discover products (for promoters)
  discoverProducts: (params) => api.get('/products/discover', { params }),
  
  /**
   * Upload file via Backend (umgeht CORS)
   * @param {File} file - File object to upload
   * @param {string} type - 'thumbnail' or 'product'
   * @returns {string} Download URL
   */
  uploadFile: async (file, type = 'product') => {
    if (!file) return null;
    
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', type);
      
      const response = await api.post('/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      return response.data.url;
    } catch (error) {
      console.error('Upload error:', error);
      throw new Error('Datei konnte nicht hochgeladen werden');
    }
  }
};

export default productsService;