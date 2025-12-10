import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Icon } from '../../components/common';
import ProductForm from '../../components/products/ProductForm';
import { useProducts } from '../../context/ProductContext';
import { productsService } from '../../services';
import styles from '../../styles/pages/ProductPage.module.css';

/**
 * Add Product Page
 * Modulare Produkterstellung
 */
function AddProduct() {
  const navigate = useNavigate();
  const { addProduct } = useProducts();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (productData) => {
    setIsLoading(true);
    
    try {
      // 1. Upload thumbnail if present
      let thumbnailUrl = null;
      if (productData.thumbnailFile) {
        thumbnailUrl = await productsService.uploadFile(productData.thumbnailFile, 'thumbnail');
      }

      // 2. Upload files for file modules
      const processedModules = await Promise.all(
        (productData.modules || []).map(async (module) => {
          if (module.type === 'file' && module.file) {
            const fileUrl = await productsService.uploadFile(module.file, 'product');
            return {
              ...module,
              file_url: fileUrl,
              file: undefined // Remove file object
            };
          }
          return module;
        })
      );

      // 3. Create product via API
      const result = await addProduct({
        title: productData.title,
        description: productData.description,
        price: productData.price,
        thumbnail_url: thumbnailUrl,
        affiliate_commission: productData.affiliateCommission,
        status: productData.status,
        modules: processedModules
      });

      if (result?.success !== false) {
        navigate('/');
      }
    } catch (error) {
      console.error('Error creating product:', error);
      alert('Fehler beim Erstellen des Produkts: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    navigate(-1);
  };

  return (
    <div className={styles.page}>
      {/* Header */}
      <header className={styles.header}>
        <button 
          onClick={handleCancel}
          className={styles.backButton}
          aria-label="Zurück"
        >
          <Icon name="chevronLeft" size="md" />
        </button>
        <div className={styles.headerContent}>
          <h1 className={styles.title}>Neues Produkt</h1>
          <p className={styles.subtitle}>Erstelle ein digitales Produkt</p>
        </div>
        <div className={styles.headerSpacer} />
      </header>

      {/* Form */}
      <main className={styles.main}>
        <ProductForm
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          isLoading={isLoading}
        />
      </main>
    </div>
  );
}

export default AddProduct;
