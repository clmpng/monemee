import api from './api';

const productsService = {
  getMyProducts: () => api.get('/products'),
  getProduct: (id) => api.get(`/products/${id}`),
  getPublicProduct: (id) => api.get(`/products/public/${id}`),
  createProduct: (data) => api.post('/products', data),
  updateProduct: (id, data) => api.put(`/products/${id}`, data),
  deleteProduct: (id) => api.delete(`/products/${id}`),
  getTopProducts: () => api.get('/products/top'),
  discoverProducts: (params) => api.get('/products/discover', { params }),
  
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
  }
};

export default productsService;