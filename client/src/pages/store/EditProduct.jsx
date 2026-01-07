import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Icon } from '../../components/common';
import ProductForm from '../../components/products/ProductForm';
import { useProducts } from '../../context/ProductContext';
import { productsService } from '../../services';
import styles from '../../styles/pages/ProductPage.module.css';

/**
 * Edit Product Page
 * Bearbeitung bestehender Produkte mit Modulen
 */
function EditProduct() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getProductFresh, updateProduct } = useProducts();
  const [product, setProduct] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);

  // Lade Produkt-Daten
  useEffect(() => {
    const loadProduct = async () => {
      try {
        setPageLoading(true);
        const productData = await getProductFresh(parseInt(id));
        
        if (!productData) {
          alert('Produkt nicht gefunden');
          navigate('/');
          return;
        }
        
        setProduct(productData);
      } catch (error) {
        console.error('Error loading product:', error);
        alert('Fehler beim Laden des Produkts');
        navigate('/');
      } finally {
        setPageLoading(false);
      }
    };
    
    loadProduct();
  }, [id, getProductFresh, navigate]);

  const handleSubmit = async (productData) => {
    setIsLoading(true);
    
    try {
      // 1. Upload new thumbnail if present
      let thumbnailUrl = product.thumbnail_url;
      if (productData.thumbnailFile) {
        thumbnailUrl = await productsService.uploadFile(productData.thumbnailFile, 'thumbnail');
      }

      // 2. Process modules - upload new files
      const processedModules = await Promise.all(
        (productData.modules || []).map(async (module) => {
          if (module.type === 'file' && module.file) {
            const fileUrl = await productsService.uploadFile(module.file, 'product');
            return {
              ...module,
              file_url: fileUrl,
              file: undefined
            };
          }
          return module;
        })
      );

      // 3. Update product via API
      const result = await updateProduct(parseInt(id), {
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
      console.error('Error updating product:', error);
      alert('Fehler beim Aktualisieren: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    navigate(-1);
  };

  // Loading State
  if (pageLoading) {
    return (
      <div className={styles.page}>
        <div className={styles.loadingContainer}>
          <div className={styles.spinner} />
          <p>Produkt wird geladen...</p>
        </div>
      </div>
    );
  }

  // Not found
  if (!product) {
    return (
      <div className={styles.page}>
        <div className={styles.errorContainer}>
          <Icon name="alertCircle" size="xl" />
          <h2>Produkt nicht gefunden</h2>
          <button onClick={() => navigate('/')} className={styles.errorButton}>
            Zurück zum Store
          </button>
        </div>
      </div>
    );
  }

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
          <h1 className={styles.title}>Produkt bearbeiten</h1>
          <p className={styles.subtitle}>{product.title}</p>
        </div>
        <div className={styles.headerSpacer} />
      </header>

      {/* Form */}
      <main className={styles.main}>
        <ProductForm
          initialData={product}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          isLoading={isLoading}
          showTypeSelection={false}
        />
      </main>
    </div>
  );
}

export default EditProduct;
