import React, { createContext, useContext, useState, useEffect } from 'react';

const ProductContext = createContext(null);

// LocalStorage Key
const STORAGE_KEY = 'monemee_products';

/**
 * Product Provider
 * Manages products state (localStorage for MVP, later API)
 */
export function ProductProvider({ children }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load products from localStorage on mounting
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setProducts(JSON.parse(stored));
      } catch (e) {
        console.error('Error loading products:', e);
      }
    }
    setLoading(false);
  }, []);

  // Save to localStorage whenever products change
  useEffect(() => {
    if (!loading) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
    }
  }, [products, loading]);

  // Add new product
  const addProduct = (productData) => {
    const newProduct = {
      id: Date.now(), // Temporary ID, later from DB
      ...productData,
      views: 0,
      sales: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    setProducts(prev => [newProduct, ...prev]);
    return newProduct;
  };

  // Update product
  const updateProduct = (id, updates) => {
    setProducts(prev =>
      prev.map(p =>
        p.id === id
          ? { ...p, ...updates, updatedAt: new Date().toISOString() }
          : p
      )
    );
  };

  // Delete product
  const deleteProduct = (id) => {
    setProducts(prev => prev.filter(p => p.id !== id));
  };

  // Get single product
  const getProduct = (id) => {
    return products.find(p => p.id === parseInt(id));
  };

  // Toggle product status
  const toggleStatus = (id) => {
    setProducts(prev =>
      prev.map(p =>
        p.id === id
          ? { ...p, status: p.status === 'active' ? 'draft' : 'active' }
          : p
      )
    );
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
    products,
    loading,
    stats,
    addProduct,
    updateProduct,
    deleteProduct,
    getProduct,
    toggleStatus
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