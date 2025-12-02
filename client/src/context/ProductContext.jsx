import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import productsService from '../services/products.service';

const ProductContext = createContext(null);

/**
 * Product Provider
 * Manages products state via API
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

  // Add new product
  const addProduct = async (productData) => {
    try {
      // Falls Dateien vorhanden, erst hochladen
      let thumbnailUrl = null;
      let fileUrl = null;
      
      if (productData.thumbnailFile) {
        thumbnailUrl = await productsService.uploadFile(productData.thumbnailFile, 'thumbnail');
      }
      
      if (productData.productFile) {
        fileUrl = await productsService.uploadFile(productData.productFile, 'product');
      }

      // Produkt erstellen mit URLs statt Base64
      const dataToSend = {
        title: productData.title,
        description: productData.description,
        price: productData.price,
        thumbnail_url: thumbnailUrl,
        file_url: fileUrl,
        file_name: productData.fileName,
        file_size: productData.fileSize,
        affiliate_commission: productData.affiliateCommission,
        status: productData.status
      };

      const response = await productsService.createProduct(dataToSend);
      const newProduct = response.data;
      
      setProducts(prev => [newProduct, ...prev]);
      return newProduct;
    } catch (err) {
      console.error('Error creating product:', err);
      throw err;
    }
  };

  // Update product
  const updateProduct = async (id, updates) => {
    try {
      // Falls neue Dateien, erst hochladen
      let thumbnailUrl = updates.thumbnail_url;
      let fileUrl = updates.file_url;
      
      if (updates.thumbnailFile) {
        thumbnailUrl = await productsService.uploadFile(updates.thumbnailFile, 'thumbnail');
      }
      
      if (updates.productFile) {
        fileUrl = await productsService.uploadFile(updates.productFile, 'product');
      }

      const dataToSend = {
        ...updates,
        thumbnail_url: thumbnailUrl,
        file_url: fileUrl
      };
      
      // Entferne File-Objekte vor dem Senden
      delete dataToSend.thumbnailFile;
      delete dataToSend.productFile;

      const response = await productsService.updateProduct(id, dataToSend);
      const updatedProduct = response.data;
      
      setProducts(prev =>
        prev.map(p => p.id === id ? updatedProduct : p)
      );
      return updatedProduct;
    } catch (err) {
      console.error('Error updating product:', err);
      throw err;
    }
  };

  // Delete product
  const deleteProduct = async (id) => {
    try {
      await productsService.deleteProduct(id);
      setProducts(prev => prev.filter(p => p.id !== id));
    } catch (err) {
      console.error('Error deleting product:', err);
      throw err;
    }
  };

  // Get single product
  const getProduct = (id) => {
    return products.find(p => p.id === parseInt(id));
  };

  // Toggle product status
  const toggleStatus = async (id) => {
    const product = products.find(p => p.id === id);
    if (!product) return;
    
    const newStatus = product.status === 'active' ? 'draft' : 'active';
    await updateProduct(id, { status: newStatus });
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
    error,
    stats,
    addProduct,
    updateProduct,
    deleteProduct,
    getProduct,
    toggleStatus,
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