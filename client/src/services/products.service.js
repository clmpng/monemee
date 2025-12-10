import api from './api';

/**
 * Products Service
 * Handles all product-related API calls
 */
const productsService = {
  // ============================================
  // Product CRUD
  // ============================================
  
  /**
   * Get all products for current user
   */
  getMyProducts: () => api.get('/products'),
  
  /**
   * Get single product by ID
   */
  getProduct: (id) => api.get(`/products/${id}`),
  
  /**
   * Get public product (for customers)
   */
  getPublicProduct: (id) => api.get(`/products/public/${id}`),
  
  /**
   * Create new product with modules
   */
  createProduct: (data) => api.post('/products', data),
  
  /**
   * Update product
   */
  updateProduct: (id, data) => api.put(`/products/${id}`, data),
  
  /**
   * Delete product
   */
  deleteProduct: (id) => api.delete(`/products/${id}`),
  
  /**
   * Get top/trending products
   */
  getTopProducts: () => api.get('/products/top'),
  
  /**
   * Discover products (for promoters)
   */
  discoverProducts: (params) => api.get('/products/discover', { params }),

  // ============================================
  // Module Operations
  // ============================================
  
  /**
   * Add module to product
   */
  addModule: (productId, moduleData) => 
    api.post(`/products/${productId}/modules`, moduleData),
  
  /**
   * Update module
   */
  updateModule: (productId, moduleId, moduleData) => 
    api.put(`/products/${productId}/modules/${moduleId}`, moduleData),
  
  /**
   * Delete module
   */
  deleteModule: (productId, moduleId) => 
    api.delete(`/products/${productId}/modules/${moduleId}`),
  
  /**
   * Reorder modules
   */
  reorderModules: (productId, moduleIds) => 
    api.put(`/products/${productId}/modules/reorder`, { moduleIds }),

  // ============================================
  // File Upload
  // ============================================
  
  /**
   * Upload file to server
   * @param {File} file - The file to upload
   * @param {string} type - 'thumbnail' or 'product'
   * @returns {Promise<string>} - The uploaded file URL
   */
  uploadFile: async (file, type = 'product') => {
    if (!file) return null;
    
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', type);
      
      const response = await api.post('/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      return response.data?.url || response.url;
    } catch (error) {
      console.error('Upload error:', error);
      throw new Error('Datei konnte nicht hochgeladen werden');
    }
  },

  /**
   * Upload multiple files
   * @param {File[]} files - Array of files to upload
   * @param {string} type - 'thumbnail' or 'product'
   * @returns {Promise<string[]>} - Array of uploaded file URLs
   */
  uploadFiles: async (files, type = 'product') => {
    const uploadPromises = files.map(file => productsService.uploadFile(file, type));
    return Promise.all(uploadPromises);
  }
};

export default productsService;
