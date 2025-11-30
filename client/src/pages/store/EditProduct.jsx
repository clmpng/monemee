import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import ProductForm from '../../components/products/ProductForm';
import { useProducts } from '../../context/ProductContext';

/**
 * Edit Product Page
 * Wiederverwendet ProductForm mit vorausgefüllten Daten
 */
function EditProduct() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getProduct, updateProduct } = useProducts();
  const [product, setProduct] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Lade Produkt-Daten
  useEffect(() => {
    const loadProduct = async () => {
      const productData = getProduct(parseInt(id));
      if (!productData) {
        alert('Produkt nicht gefunden');
        navigate('/');
        return;
      }
      setProduct(productData);
    };
    
    loadProduct();
  }, [id, getProduct, navigate]);

  const handleSubmit = async (productData) => {
    setIsLoading(true);
    
    try {
      await updateProduct(parseInt(id), productData);
      navigate('/');
    } catch (error) {
      console.error('Error updating product:', error);
      alert('Fehler beim Aktualisieren des Produkts');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    navigate('/');
  };

  // Zeige Loading während Produkt geladen wird
  if (!product) {
    return (
      <div className="page" style={{ textAlign: 'center', paddingTop: '100px' }}>
        <div style={{ fontSize: '32px', marginBottom: '16px' }}>⏳</div>
        <p>Produkt wird geladen...</p>
      </div>
    );
  }

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
            <h1 className="page-title">Produkt bearbeiten</h1>
            <p className="page-subtitle">Aktualisiere dein digitales Produkt</p>
          </div>
        </div>
      </div>

      {/* Form mit initialData */}
      <ProductForm
        initialData={product}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        isLoading={isLoading}
      />
    </div>
  );
}

export default EditProduct;