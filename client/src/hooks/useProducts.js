import { useState, useEffect, useCallback } from 'react';
import { productsService } from '../services';

export function useProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      const response = await productsService.getMyProducts();
      setProducts(response.data);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const createProduct = async (data) => {
    const response = await productsService.createProduct(data);
    setProducts(prev => [response.data, ...prev]);
    return response.data;
  };

  const updateProduct = async (id, data) => {
    const response = await productsService.updateProduct(id, data);
    setProducts(prev => prev.map(p => p.id === id ? response.data : p));
    return response.data;
  };

  const deleteProduct = async (id) => {
    await productsService.deleteProduct(id);
    setProducts(prev => prev.filter(p => p.id !== id));
  };

  return {
    products,
    loading,
    error,
    refetch: fetchProducts,
    createProduct,
    updateProduct,
    deleteProduct
  };
}

export function useProduct(id) {
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!id) return;
    
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const response = await productsService.getProduct(id);
        setProduct(response.data);
        setError(null);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  return { product, loading, error };
}