import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ProductForm from '../../components/products/ProductForm';
import { useProducts } from '../../context/ProductContext';

/**
 * Add Product Page
 */
function AddProduct() {
  const navigate = useNavigate();
  const { addProduct } = useProducts();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (productData) => {
    setIsLoading(true);
    
    try {
      // Add product (currently localStorage, later API)
      addProduct(productData);
      
      // Navigate back to store
      navigate('/');
    } catch (error) {
      console.error('Error creating product:', error);
      alert('Fehler beim Erstellen des Produkts');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    navigate('/');
  };

  return (
    <div className="page" style={{ maxWidth: '600px' }}>
      {/* Header */}
      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <button 
            onClick={handleCancel}
            style={{ 
              fontSize: '24px', 
              color: 'var(--color-text-secondary)',
              background: 'none',
              border: 'none',
              cursor: 'pointer'
            }}
          >
            ←
          </button>
          <div>
            <h1 className="page-title">Neues Produkt</h1>
            <p className="page-subtitle">Erstelle ein digitales Produkt zum Verkauf</p>
          </div>
        </div>
      </div>

      {/* Form */}
      <ProductForm
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        isLoading={isLoading}
      />
    </div>
  );
}

export default AddProduct;