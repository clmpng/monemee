import api from './api';

/**
 * Product Service
 * API calls for product management
 */
const productService = {
  /**
   * Get all products for current user
   */
  async getMyProducts() {
    return api.get('/products');
  },

  /**
   * Get single product by ID
   */
  async getProduct(id) {
    return api.get(`/products/${id}`);
  },

  /**
   * Create new product
   */
  async createProduct(data) {
    return api.post('/products', data);
  },

  /**
   * Update product
   */
  async updateProduct(id, data) {
    return api.put(`/products/${id}`, data);
  },

  /**
   * Delete product
   */
  async deleteProduct(id) {
    return api.delete(`/products/${id}`);
  },

  /**
   * Upload product file
   */
  async uploadFile(id, file) {
    const formData = new FormData();
    formData.append('file', file);
    
    return api.post(`/products/${id}/upload`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  },

  /**
   * Get top/trending products (for promoters)
   */
  async getTopProducts() {
    return api.get('/products/top');
  },

  /**
   * Discover products (for promoters)
   */
  async discoverProducts(params = {}) {
    return api.get('/products/discover', { params });
  }
};

export default productService;