import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ProductCard } from '../../components/products';
import { Button, Icon } from '../../components/common';
import { useProducts } from '../../context/ProductContext';
import { useAuth } from '../../context/AuthContext';
import styles from '../../styles/pages/Store.module.css';

/**
 * MyStore Page - Creator's main store view
 * Redesigned with clean, minimal UI
 */
function MyStore() {
  const navigate = useNavigate();
  const { products, loading, error, stats, deleteProduct } = useProducts();
  const { user } = useAuth();
  const [copied, setCopied] = useState(false);

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
      {/* Hero Card - Clean Design */}
      <div className={styles.heroCard}>
        <div className={styles.heroContent}>
          {/* Avatar */}
          <div className={styles.avatarWrapper}>
            <div className={styles.avatar}>
              {user?.avatar ? (
                <img src={user.avatar} alt={user?.name} />
              ) : (
                <span>{getInitials(user?.name)}</span>
              )}
            </div>
            {user?.level > 1 && (
              <div className={styles.levelBadge}>
                <Icon name="star" size="xs" />
                <span>{user.level}</span>
              </div>
            )}
          </div>

          {/* Info */}
          <div className={styles.heroInfo}>
            <h1 className={styles.userName}>{user?.name || 'Mein Store'}</h1>
            <p className={styles.userHandle}>@{user?.username || 'username'}</p>
            
            {/* Store Link - dezent inline */}
            {storeUrl && (
              <div className={styles.storeLinkInline}>
                <Icon name="link" size={14} />
                <span>{storeUrl}</span>
                <button 
                  className={styles.copyButtonSmall}
                  onClick={handleCopyLink}
                  title="Link kopieren"
                >
                  <Icon name={copied ? 'check' : 'copy'} size={14} />
                </button>
                {copied && <span className={styles.copiedHint}>Kopiert!</span>}
              </div>
            )}
            
            {user?.bio && <p className={styles.userBio}>{user.bio}</p>}
            
            {/* Actions */}
            <div className={styles.heroActions}>
              <Link to="/settings?tab=store" className={styles.actionButton}>
                <Icon name="edit" size="sm" />
                <span>Store bearbeiten</span>
              </Link>
              {user?.username && (
                <a 
                  href={`/store/${user.username}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`${styles.actionButton} ${styles.actionButtonSecondary}`}
                >
                  <Icon name="externalLink" size="sm" />
                  <span>Vorschau</span>
                </a>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={`${styles.statIcon} ${styles.statIconSuccess}`}>
            <Icon name="wallet" size="md" />
          </div>
          <div className={styles.statContent}>
            <span className={styles.statValue}>{formatCurrency(stats.totalRevenue)}</span>
            <span className={styles.statLabel}>Einnahmen</span>
          </div>
        </div>
        
        <div className={styles.statCard}>
          <div className={`${styles.statIcon} ${styles.statIconPrimary}`}>
            <Icon name="eye" size="md" />
          </div>
          <div className={styles.statContent}>
            <span className={styles.statValue}>{stats.totalViews || 0}</span>
            <span className={styles.statLabel}>Views</span>
          </div>
        </div>
        
        <div className={styles.statCard}>
          <div className={`${styles.statIcon} ${styles.statIconWarning}`}>
            <Icon name="shoppingBag" size="md" />
          </div>
          <div className={styles.statContent}>
            <span className={styles.statValue}>{stats.totalSales || 0}</span>
            <span className={styles.statLabel}>Verkäufe</span>
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
