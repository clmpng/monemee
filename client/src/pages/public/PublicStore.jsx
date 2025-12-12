import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Icon } from '../../components/common';
import { usersService } from '../../services';
import styles from '../../styles/pages/PublicStore.module.css';

/**
 * Public Store Page - Buyer View
 * Redesigned with modern, trust-building UI
 */
function PublicStore() {
  const { username } = useParams();
  const [store, setStore] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStore = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await usersService.getPublicStore(username);
        
        if (response.success) {
          setStore(response.data.store);
          setProducts(response.data.products || []);
        } else {
          setError('Store nicht gefunden');
        }
      } catch (err) {
        console.error('Error fetching store:', err);
        setError('Store konnte nicht geladen werden');
      } finally {
        setLoading(false);
      }
    };

    if (username) {
      fetchStore();
    }
  }, [username]);

  // Get initials from name
  const getInitials = (name) => {
    if (!name) return '?';
    const parts = name.trim().split(' ').filter(Boolean);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  // Format price
  const formatPrice = (price) => {
    if (!price || price === 0) return 'Kostenlos';
    return new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency: 'EUR'
    }).format(price);
  };

  // Loading State
  if (loading) {
    return (
      <div className={styles.publicStore}>
        <Header />
        <div className={styles.loadingState}>
          <div className={styles.loadingSpinner} />
          <p>Store wird geladen...</p>
        </div>
      </div>
    );
  }

  // Error State
  if (error || !store) {
    return (
      <div className={styles.publicStore}>
        <Header />
        <div className={styles.errorState}>
          <div className={styles.errorIcon}>
            <Icon name="searchX" size={48} />
          </div>
          <h2>Store nicht gefunden</h2>
          <p>Der Store @{username} existiert nicht oder ist nicht verfügbar.</p>
          <Link to="/" className={styles.backLink}>
            <Icon name="chevronLeft" size="sm" />
            Zur Startseite
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.publicStore}>
      <Header />
      
      {/* Hero Section */}
      <section className={styles.hero}>
        <div className={styles.heroBackground} />
        
        <div className={styles.heroContent}>
          {/* Avatar */}
          <div className={styles.avatarWrapper}>
            <div className={styles.avatar}>
              {store.avatar ? (
                <img src={store.avatar} alt={store.name} />
              ) : (
                <span>{getInitials(store.name)}</span>
              )}
            </div>
            {store.level > 1 && (
              <div className={styles.levelBadge}>
                <Icon name="star" size={12} />
              </div>
            )}
          </div>
          
          {/* Profile Info */}
          <h1 className={styles.storeName}>{store.name}</h1>
          <p className={styles.storeHandle}>@{store.username}</p>
          
          {store.bio && (
            <p className={styles.storeBio}>{store.bio}</p>
          )}
          
          {/* Trust Badges */}
          <div className={styles.trustBadges}>
            <div className={styles.trustBadge}>
              <Icon name="lock" size="sm" />
              <span>Sichere Zahlung</span>
            </div>
            <div className={styles.trustBadge}>
              <Icon name="zap" size="sm" />
              <span>Sofort-Download</span>
            </div>
          </div>
        </div>
      </section>

      {/* Products Section */}
      <section className={styles.productsSection}>
        <div className={styles.container}>
          <h2 className={styles.sectionTitle}>
            Produkte
            <span className={styles.productCount}>{products.length}</span>
          </h2>
          
          {products.length > 0 ? (
            <div className={styles.productsGrid}>
              {products.map((product) => (
                <ProductCard 
                  key={product.id} 
                  product={product} 
                  formatPrice={formatPrice}
                />
              ))}
            </div>
          ) : (
            <div className={styles.emptyState}>
              <Icon name="package" size={40} />
              <p>Noch keine Produkte verfügbar.</p>
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className={styles.ctaSection}>
        <div className={styles.container}>
          <div className={styles.ctaCard}>
            <div className={styles.ctaIcon}>
              <Icon name="dollarCircle" size={24} />
            </div>
            <div className={styles.ctaContent}>
              <h3>Auch digitale Produkte verkaufen?</h3>
              <p>Erstelle deinen eigenen Store – kostenlos.</p>
            </div>
            <Link to="/register" className={styles.ctaButton}>
              Mehr erfahren
              <Icon name="chevronRight" size="sm" />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className={styles.footer}>
        <Link to="/" className={styles.footerBrand}>
          <Icon name="dollarCircle" size={18} />
          <span>MoneMee</span>
        </Link>
      </footer>
    </div>
  );
}

/**
 * Header Component
 */
function Header() {
  return (
    <header className={styles.header}>
      <div className={styles.headerContainer}>
        <Link to="/" className={styles.logo}>
          <Icon name="dollarCircle" size={20} />
          <span className={styles.logoText}>MoneMee</span>
        </Link>
        <Link to="/login" className={styles.loginButton}>
          Anmelden
        </Link>
      </div>
    </header>
  );
}

/**
 * Product Card Component
 */
function ProductCard({ product, formatPrice }) {
  const isFree = !product.price || product.price === 0;
  
  return (
    <Link to={`/p/${product.id}`} className={styles.productCard}>
      {/* Thumbnail */}
      <div className={styles.productThumbnail}>
        {product.thumbnail ? (
          <img src={product.thumbnail} alt={product.title} />
        ) : (
          <div className={styles.thumbnailPlaceholder}>
            <Icon name="package" size={28} />
          </div>
        )}
        {isFree && (
          <span className={styles.freeBadge}>Kostenlos</span>
        )}
      </div>
      
      {/* Content */}
      <div className={styles.productContent}>
        <h3 className={styles.productTitle}>{product.title}</h3>
        
        {product.description && (
          <p className={styles.productDescription}>
            {product.description.length > 80 
              ? `${product.description.substring(0, 80)}...` 
              : product.description
            }
          </p>
        )}
        
        <div className={styles.productFooter}>
          <span className={`${styles.productPrice} ${isFree ? styles.productPriceFree : ''}`}>
            {formatPrice(product.price)}
          </span>
          <span className={styles.productCta}>
            {isFree ? 'Herunterladen' : 'Kaufen'}
            <Icon name="chevronRight" size="sm" />
          </span>
        </div>
      </div>
    </Link>
  );
}

export default PublicStore;
