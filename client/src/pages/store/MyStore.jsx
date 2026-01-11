import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ProductCard } from '../../components/products';
import { Button, Icon } from '../../components/common';
import { useProducts } from '../../context/ProductContext';
import { useAuth } from '../../context/AuthContext';
import styles from '../../styles/pages/Store.module.css';

/**
 * MyStore Page - Creator's main store view
 * Redesigned with consistent page-header and compact profile
 */
function MyStore() {
  const navigate = useNavigate();
  const { products, loading, error, stats, deleteProduct } = useProducts();
  const { user } = useAuth();
  const [copied, setCopied] = useState(false);
  const [avatarError, setAvatarError] = useState(false);

  // Reset avatar error when user avatar changes
  useEffect(() => {
    setAvatarError(false);
  }, [user?.avatar]);

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

  // Copy store link
  const handleCopyLink = async () => {
    const storeUrl = `${window.location.origin}/store/${user?.username}`;
    try {
      await navigator.clipboard.writeText(storeUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Copy failed:', err);
    }
  };

  // Get initials from name
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
    }).format(amount || 0);
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
        <div className={styles.errorState}>
          <div className={styles.errorIcon}>
            <Icon name="alertCircle" size={48} />
          </div>
          <h3>Fehler beim Laden</h3>
          <p>{error}</p>
          <Button onClick={() => window.location.reload()}>
            Erneut versuchen
          </Button>
        </div>
      </div>
    );
  }

  const isNewUser = products.length === 0;
  const storeUrl = user?.username ? `monemee.app/@${user.username}` : null;

  return (
    <div className={`page ${styles.storePage}`}>
      {/* Profile Card with integrated Stats */}
      <div className={styles.profileCard}>
        {/* Top Section: Avatar + Info */}
        <div className={styles.profileTop}>
          <div className={styles.profileAvatar}>
            {user?.avatar && !avatarError ? (
              <img
                src={user.avatar}
                alt={user?.name}
                onError={() => setAvatarError(true)}
              />
            ) : (
              <span>{getInitials(user?.name)}</span>
            )}
            {user?.level > 1 && (
              <div className={styles.profileLevelBadge}>
                <Icon name="star" size={10} />
              </div>
            )}
          </div>

          <div className={styles.profileInfo}>
            <h2 className={styles.profileName}>{user?.name || 'Mein Store'}</h2>
            <p className={styles.profileHandle}>@{user?.username || 'username'}</p>
            
            {/* Store Link - Subtle inline */}
            {storeUrl && (
              <button 
                className={styles.storeLinkSubtle}
                onClick={handleCopyLink}
                title="Link kopieren"
              >
                <Icon name="link" size={12} />
                <span>{storeUrl}</span>
                {copied ? (
                  <span className={styles.copiedBadge}>Kopiert!</span>
                ) : (
                  <Icon name="copy" size={12} className={styles.copyIcon} />
                )}
              </button>
            )}
          </div>
        </div>

        {/* Stats Row - Clickable, links to /earnings */}
        <Link to="/earnings" className={styles.profileStats}>
          <div className={styles.profileStatItem}>
            <span className={styles.profileStatValue}>{formatCurrency(stats.totalRevenue)}</span>
            <span className={styles.profileStatLabel}>Umsatz</span>
          </div>
          <div className={styles.profileStatDivider} />
          <div className={styles.profileStatItem}>
            <span className={styles.profileStatValue}>{stats.totalViews || 0}</span>
            <span className={styles.profileStatLabel}>Views</span>
          </div>
          <div className={styles.profileStatDivider} />
          <div className={styles.profileStatItem}>
            <span className={styles.profileStatValue}>{stats.totalSales || 0}</span>
            <span className={styles.profileStatLabel}>Verkäufe</span>
          </div>
          <Icon name="chevronRight" size={16} className={styles.statsChevron} />
        </Link>

        {/* Store Actions */}
        <div className={styles.storeActions}>
          <span className={styles.storeActionsLabel}>Store verwalten</span>
          <div className={styles.storeActionsButtons}>
            <Link to="/settings?tab=store" className={styles.storeActionBtn}>
              <Icon name="palette" size={16} />
              <span>Design ändern</span>
            </Link>
            {user?.username && (
              <a
                href={`/store/${user.username}`}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.storeActionBtn}
              >
                <Icon name="eye" size={16} />
                <span>Vorschau ansehen</span>
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Welcome Section for New Users */}
      {isNewUser && (
        <div className={styles.welcomeSection}>
          <div className={styles.welcomeIcon}>
            <Icon name="rocket" size={32} />
          </div>
          <h2 className={styles.welcomeTitle}>Willkommen bei MoneMee!</h2>
          <p className={styles.welcomeText}>
            Du bist nur noch einen Schritt davon entfernt, mit deinem Wissen Geld zu verdienen. 
            Erstelle jetzt dein erstes digitales Produkt!
          </p>
          
          <div className={styles.welcomeSteps}>
            <div className={styles.welcomeStep}>
              <div className={styles.stepNumber}>1</div>
              <div className={styles.stepContent}>
                <h4>Produkt erstellen</h4>
                <p>E-Book, Template, Kurs – was auch immer du teilen möchtest.</p>
              </div>
            </div>
            <div className={styles.welcomeStep}>
              <div className={styles.stepNumber}>2</div>
              <div className={styles.stepContent}>
                <h4>Link teilen</h4>
                <p>Teile deinen Store-Link auf Social Media oder per Nachricht.</p>
              </div>
            </div>
            <div className={styles.welcomeStep}>
              <div className={styles.stepNumber}>3</div>
              <div className={styles.stepContent}>
                <h4>Geld verdienen</h4>
                <p>Bei jedem Verkauf landet der Gewinn direkt bei dir.</p>
              </div>
            </div>
          </div>
          
          <Button onClick={handleAddProduct} size="lg" className={styles.welcomeCta}>
            <Icon name="plus" size="sm" />
            Erstes Produkt erstellen
          </Button>
        </div>
      )}

      {/* Products Section */}
      <section className={styles.productsSection}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>
            Meine Produkte
            {products.length > 0 && (
              <span className={styles.productCount}>{products.length}</span>
            )}
          </h2>
          {products.length > 0 && (
            <Button onClick={handleAddProduct} size="sm">
              <Icon name="plus" size="sm" />
              Neu
            </Button>
          )}
        </div>

        {products.length > 0 ? (
          <div className={styles.productsGrid}>
            {products.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onEdit={handleEditProduct}
                onDelete={handleDeleteProduct}
              />
            ))}
          </div>
        ) : (
          !isNewUser && (
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
                Produkt erstellen
              </Button>
            </div>
          )
        )}
      </section>
    </div>
  );
}

export default MyStore;
