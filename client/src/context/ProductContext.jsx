import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import productsService from '../services/products.service';

const ProductContext = createContext(null);

/**
 * Product Provider
 * Manages products state via API
 * Supports modular product content
 */
export function ProductProvider({ children }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch products from API
  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await productsService.getMyProducts();
      setProducts(response.data || []);
    } catch (err) {
      console.error('Error fetching products:', err);
      setError(err.message);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Load products on mount
  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  /**
   * Add new product with modules
   * File uploads should be handled by the calling component
   */
  const addProduct = async (productData) => {
    try {
      const response = await productsService.createProduct(productData);
      const newProduct = response.data;
      
      setProducts(prev => [newProduct, ...prev]);
      return { success: true, data: newProduct };
    } catch (err) {
      console.error('Error creating product:', err);
      throw err;
    }
  };

  /**
   * Update product with modules
   * File uploads should be handled by the calling component
   */
  const updateProduct = async (id, updates) => {
    try {
      const response = await productsService.updateProduct(id, updates);
      const updatedProduct = response.data;
      
      setProducts(prev =>
        prev.map(p => p.id === id ? updatedProduct : p)
      );
      return { success: true, data: updatedProduct };
    } catch (err) {
      console.error('Error updating product:', err);
      throw err;
    }
  };

  /**
   * Delete product
   */
  const deleteProduct = async (id) => {
    try {
      await productsService.deleteProduct(id);
      setProducts(prev => prev.filter(p => p.id !== id));
      return { success: true };
    } catch (err) {
      console.error('Error deleting product:', err);
      throw err;
    }
  };

  /**
   * Get single product by ID
   * Returns product with modules from local state
   * For fresh data, use getProductFresh
   */
  const getProduct = (id) => {
    return products.find(p => p.id === parseInt(id));
  };

  /**
   * Get single product fresh from API
   * Use when editing to ensure latest data with modules
   */
  const getProductFresh = async (id) => {
    try {
      const response = await productsService.getProduct(id);
      return response.data;
    } catch (err) {
      console.error('Error fetching product:', err);
      return null;
    }
  };

  /**
   * Toggle product status (active/draft)
   */
  const toggleStatus = async (id) => {
    const product = products.find(p => p.id === id);
    if (!product) return;
    
    const newStatus = product.status === 'active' ? 'draft' : 'active';
    await updateProduct(id, { status: newStatus });
  };

  /**
   * Add module to product
   */
  const addModule = async (productId, moduleData) => {
    try {
      const response = await productsService.addModule(productId, moduleData);
      
      // Update local state
      setProducts(prev =>
        prev.map(p => {
          if (p.id === productId) {
            return {
              ...p,
              modules: [...(p.modules || []), response.data]
            };
          }
          return p;
        })
      );
      
      return { success: true, data: response.data };
    } catch (err) {
      console.error('Error adding module:', err);
      throw err;
    }
  };

  /**
   * Update module
   */
  const updateModule = async (productId, moduleId, moduleData) => {
    try {
      const response = await productsService.updateModule(productId, moduleId, moduleData);
      
      // Update local state
      setProducts(prev =>
        prev.map(p => {
          if (p.id === productId) {
            return {
              ...p,
              modules: (p.modules || []).map(m => 
                m.id === moduleId ? response.data : m
              )
            };
          }
          return p;
        })
      );
      
      return { success: true, data: response.data };
    } catch (err) {
      console.error('Error updating module:', err);
      throw err;
    }
  };

  /**
   * Delete module
   */
  const deleteModule = async (productId, moduleId) => {
    try {
      await productsService.deleteModule(productId, moduleId);
      
      // Update local state
      setProducts(prev =>
        prev.map(p => {
          if (p.id === productId) {
            return {
              ...p,
              modules: (p.modules || []).filter(m => m.id !== moduleId)
            };
          }
          return p;
        })
      );
      
      return { success: true };
    } catch (err) {
      console.error('Error deleting module:', err);
      throw err;
    }
  };

  // Calculate stats
  const stats = {
    totalProducts: products.length,
    activeProducts: products.filter(p => p.status === 'active').length,
    totalViews: products.reduce((sum, p) => sum + (p.views || 0), 0),
    totalSales: products.reduce((sum, p) => sum + (p.sales || 0), 0),
    totalRevenue: products.reduce((sum, p) => sum + ((p.sales || 0) * (p.price || 0)), 0)
  };

  const value = {
    // State
    products,
    loading,
    error,
    stats,
    
    // Product operations
    addProduct,
    updateProduct,
    deleteProduct,
    getProduct,
    getProductFresh,
    toggleStatus,
    
    // Module operations
    addModule,
    updateModule,
    deleteModule,
    
    // Utilities
    refetch: fetchProducts
  };

  return (
    <ProductContext.Provider value={value}>
      {children}
    </ProductContext.Provider>
  );
}

/**
 * Hook to use product context
 */
export function useProducts() {
  const context = useContext(ProductContext);
  if (!context) {
    throw new Error('useProducts must be used within a ProductProvider');
  }
  return context;
}

export default ProductContext;
