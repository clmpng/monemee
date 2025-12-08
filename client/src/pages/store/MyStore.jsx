import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
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

  // Get initials from name (max 2 characters)
  const getInitials = (name) => {
    if (!name) return 'U';
    const parts = name.trim().split(' ').filter(Boolean);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
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
        <div className={styles.loadingState}>
          <div className={styles.loadingSpinner} />
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
          <div className={styles.emptyIcon}>
            <Icon name="alertCircle" size={48} />
          </div>
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
            <span className={styles.storeAvatarInitials}>
              {getInitials(user?.name)}
            </span>
          )}
        </div>
        <div className={styles.storeInfo}>
          <h1 className={styles.storeName}>{user?.name || 'Mein Store'}</h1>
          <p className={styles.storeUsername}>@{user?.username || 'username'}</p>
          {user?.bio && <p className={styles.storeBio}>{user.bio}</p>}
          
          {/* Store Actions */}
          <div className={styles.storeActions}>
            <Link to="/settings" className={styles.editStoreButton}>
              <Icon name="settings" size="sm" />
              Profil bearbeiten
            </Link>
            
            {user?.username && (
              <a 
                href={`/store/${user.username}`}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.previewStoreButton}
              >
                <Icon name="externalLink" size="sm" />
                Store-Vorschau
              </a>
            )}
          </div>
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
            <div className={styles.emptyIcon}>
              <Icon name="package" size={48} />
            </div>
            <h3 className={styles.emptyTitle}>Noch keine Produkte</h3>
            <p className={styles.emptyText}>
              Erstelle dein erstes digitales Produkt und starte mit dem Verkaufen!
            </p>
            <Button onClick={handleAddProduct}>
              <Icon name="plus" size="sm" />
              Erstes Produkt erstellen
            </Button>
          </div>
        )}
      </section>
    </div>
  );
}

export default MyStore;
