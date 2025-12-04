import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ProductCard } from '../../components/products';
import { Button, Icon } from '../../components/common';
import { useProducts } from '../../context/ProductContext';
import { useAuth } from '../../context/AuthContext';
import styles from '../../styles/pages/Store.module.css';

/**
 * MyStore Page - Creator's main store view
 */
function MyStore() {
  const navigate = useNavigate();
  const { products, loading, error, stats, deleteProduct, toggleStatus } = useProducts();
  const { user } = useAuth();

  // Handlers
  const handleAddProduct = () => {
    navigate('/products/new');
  };

  const handleEditProduct = (product) => {
    navigate(`/products/${product.id}/edit`);
  };

  const handleDeleteProduct = (product) => {
    if (window.confirm(`"${product.title}" wirklich löschen?`)) {
      deleteProduct(product.id);
    }
  };

  // Get initials
  const getInitials = (name) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  };

    // Loading State
    if (loading) {
      return (
        <div className={`page ${styles.storePage}`}>
          <div className={styles.emptyProducts}>
            <div className={styles.emptyIcon}>⏳</div>
            <p>Produkte werden geladen...</p>
          </div>
        </div>
      );
    }
  
    // Error State
    if (error) {
      return (
        <div className={`page ${styles.storePage}`}>
          <div className={styles.emptyProducts}>
            <div className={styles.emptyIcon}>⚠️</div>
            <h3 className={styles.emptyTitle}>Fehler beim Laden</h3>
            <p className={styles.emptyText}>{error}</p>
            <Button onClick={() => window.location.reload()}>
              Erneut versuchen
            </Button>
          </div>
        </div>
      );
    }

  return (
    <div className={`page ${styles.storePage}`}>
      {/* Store Header / Profile */}
      <div className={styles.storeHeader}>
       <div className={styles.storeAvatar}>
          {user?.avatar ? (
            <img src={user.avatar} alt={user?.name} className={styles.storeAvatarImage} />
          ) : (
            getInitials(user?.name)
          )}
        </div>
        <div className={styles.storeInfo}>
          <h1 className={styles.storeName}>{user?.name || 'Mein Store'}</h1>
          <p className={styles.storeUsername}>@{user?.username || 'username'}</p>
          {user?.bio && <p className={styles.storeBio}>{user.bio}</p>}
          
          <button className={styles.editStoreButton}>
            ⚙️ Store bearbeiten
          </button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className={styles.quickStats}>
        <div className={styles.quickStat}>
          <div className={styles.quickStatValue}>{formatCurrency(stats.totalRevenue)}</div>
          <div className={styles.quickStatLabel}>Umsatz</div>
        </div>
        <div className={styles.quickStat}>
          <div className={styles.quickStatValue}>{stats.totalViews}</div>
          <div className={styles.quickStatLabel}>Views</div>
        </div>
        <div className={styles.quickStat}>
          <div className={styles.quickStatValue}>{stats.totalSales}</div>
          <div className={styles.quickStatLabel}>Verkäufe</div>
        </div>
      </div>

      {/* Products Section */}
      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Meine Produkte ({products.length})</h2>
        </div>

        <div className={styles.productsGrid}>
          {/* Add Product Card - always first */}
          <ProductCard.Add onClick={handleAddProduct} />
          
          {/* Product Cards */}
          {products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onEdit={handleEditProduct}
              onDelete={handleDeleteProduct}
            />
          ))}
        </div>

        {/* Empty State (wenn keine Produkte) */}
        {products.length === 0 && (
          <div className={styles.emptyProducts}>
            <div className={styles.emptyIcon}>📦</div>
            <h3 className={styles.emptyTitle}>Noch keine Produkte</h3>
            <p className={styles.emptyText}>
              Erstelle dein erstes digitales Produkt und starte mit dem Verkaufen!
            </p>
            <Button onClick={handleAddProduct}>
              + Erstes Produkt erstellen
            </Button>
          </div>
        )}
      </section>
    </div>
  );
}

export default MyStore;