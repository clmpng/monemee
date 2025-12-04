import React, { useState, useEffect } from 'react';
import { Icon } from '../../components/common';
import { earningsService } from '../../services';
import styles from '../../styles/pages/Earnings.module.css';

/**
 * Earnings Dashboard Page
 * Shows real earnings data from the API
 */
function EarningsDashboard() {
  const [activeTab, setActiveTab] = useState('products');
  
  // State for API data
  const [dashboard, setDashboard] = useState(null);
  const [level, setLevel] = useState(null);
  const [topProducts, setTopProducts] = useState([]);
  const [affiliateEarnings, setAffiliateEarnings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch all data on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const [dashboardRes, levelRes, productsRes, affiliatesRes] = await Promise.all([
          earningsService.getDashboard(),
          earningsService.getLevelInfo(),
          earningsService.getProductEarnings(),
          earningsService.getAffiliateEarnings()
        ]);

        if (dashboardRes.success) setDashboard(dashboardRes.data);
        if (levelRes.success) setLevel(levelRes.data);
        if (productsRes.success) setTopProducts(productsRes.data || []);
        if (affiliatesRes.success) setAffiliateEarnings(affiliatesRes.data || []);
      } catch (err) {
        console.error('Error fetching earnings:', err);
        setError('Daten konnten nicht geladen werden');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount || 0);
  };

  // Calculate level progress
  const levelProgress = level?.nextLevel 
    ? Math.min((level.progress / level.nextLevel) * 100, 100) 
    : 100;

  // Loading State
  if (loading) {
    return (
      <div className={`page ${styles.earningsPage}`}>
        <div className={styles.loadingState}>
          <div className={styles.loadingSpinner} />
          <p>Einnahmen werden geladen...</p>
        </div>
      </div>
    );
  }

  // Error State
  if (error) {
    return (
      <div className={`page ${styles.earningsPage}`}>
        <div className={styles.errorState}>
          <Icon name="alertCircle" size="xl" />
          <h3>Fehler beim Laden</h3>
          <p>{error}</p>
          <button onClick={() => window.location.reload()} className={styles.retryButton}>
            Erneut versuchen
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`page ${styles.earningsPage}`}>
      <div className="page-header">
        <h1 className="page-title">Einnahmen</h1>
        <p className="page-subtitle">Deine Statistiken und Fortschritt</p>
      </div>

      {/* Total Earnings Card */}
      <div className={styles.totalEarnings}>
        <p className={styles.totalLabel}>Gesamteinnahmen</p>
        <p className={styles.totalValue}>{formatCurrency(dashboard?.total)}</p>
        <p className={styles.totalChange}>
          <span className={dashboard?.change >= 0 ? styles.changePositive : styles.changeNegative}>
            <Icon name={dashboard?.change >= 0 ? 'trendingUp' : 'trendingDown'} size="sm" />
            {dashboard?.change >= 0 ? '+' : ''}{dashboard?.change || 0}%
          </span>
          <span> vs. letzten Monat</span>
        </p>
      </div>

      {/* Level Card */}
      {level && (
        <div className={styles.levelCard}>
          <div className={styles.levelHeader}>
            <div className={styles.levelBadge}>
              <div className={styles.levelIcon}>
                <Icon name="star" size="sm" />
              </div>
              <div className={styles.levelInfo}>
                <h3>Level {level.current} - {level.name}</h3>
                <p>{level.nextLevel ? `${formatCurrency(level.nextLevel - level.progress)} bis Level ${level.current + 1}` : 'Maximum erreicht! 🎉'}</p>
              </div>
            </div>
            <div className={styles.levelFee}>
              <div className={styles.feeValue}>{level.fee}%</div>
              <div className={styles.feeLabel}>Platform Fee</div>
            </div>
          </div>
          
          <div className={styles.levelProgress}>
            <div className={styles.progressBar}>
              <div 
                className={styles.progressFill} 
                style={{ width: `${levelProgress}%` }}
              />
            </div>
          </div>
          <p className={styles.progressText}>
            {formatCurrency(level.progress)} / {formatCurrency(level.nextLevel)}
          </p>
        </div>
      )}

      {/* Quick Stats */}
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={`${styles.statIcon} ${styles.statIconPrimary}`}>
            <Icon name="shoppingBag" size="md" />
          </div>
          <div className={styles.statValue}>{dashboard?.totalSales || 0}</div>
          <div className={styles.statLabel}>Verkäufe</div>
        </div>
        <div className={styles.statCard}>
          <div className={`${styles.statIcon} ${styles.statIconSuccess}`}>
            <Icon name="wallet" size="md" />
          </div>
          <div className={styles.statValue}>{formatCurrency(dashboard?.productEarnings)}</div>
          <div className={styles.statLabel}>Produkteinnahmen</div>
        </div>
        <div className={styles.statCard}>
          <div className={`${styles.statIcon} ${styles.statIconWarning}`}>
            <Icon name="link" size="md" />
          </div>
          <div className={styles.statValue}>{dashboard?.totalReferrals || 0}</div>
          <div className={styles.statLabel}>Referrals</div>
        </div>
        <div className={styles.statCard}>
          <div className={`${styles.statIcon} ${styles.statIconDanger}`}>
            <Icon name="gift" size="md" />
          </div>
          <div className={styles.statValue}>{formatCurrency(dashboard?.affiliateEarnings)}</div>
          <div className={styles.statLabel}>Affiliate Einnahmen</div>
        </div>
      </div>

      {/* Tabs */}
      <div className={styles.tabs}>
        <button 
          className={`${styles.tab} ${activeTab === 'products' ? styles.tabActive : ''}`}
          onClick={() => setActiveTab('products')}
        >
          <Icon name="package" size="sm" />
          <span>Meine Produkte</span>
        </button>
        <button 
          className={`${styles.tab} ${activeTab === 'affiliates' ? styles.tabActive : ''}`}
          onClick={() => setActiveTab('affiliates')}
        >
          <Icon name="share2" size="sm" />
          <span>Affiliate-Einnahmen</span>
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'products' ? (
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Top Produkte</h2>
          {topProducts.length > 0 ? (
            <div className={styles.topProductsList}>
              {topProducts.map((product, index) => (
                <div key={product.id} className={styles.topProductItem}>
                  <div className={`${styles.productRank} ${index === 0 ? 'gold' : index === 1 ? 'silver' : index === 2 ? 'bronze' : ''}`}>
                    {index + 1}
                  </div>
                  <div className={styles.productThumb}>
                    {product.thumbnail ? (
                      <img src={product.thumbnail} alt={product.title} />
                    ) : (
                      <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                        <Icon name="image" size="md" />
                      </span>
                    )}
                  </div>
                  <div className={styles.productInfo}>
                    <div className={styles.productName}>{product.title}</div>
                    <div className={styles.productStats}>{product.sales} Verkäufe</div>
                  </div>
                  <div className={styles.productRevenue}>{formatCurrency(product.revenue)}</div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <div className="empty-state-icon">📦</div>
              <h3 className="empty-state-title">Noch keine Verkäufe</h3>
              <p className="empty-state-text">
                Erstelle dein erstes Produkt und starte mit dem Verkaufen!
              </p>
            </div>
          )}
        </section>
      ) : (
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Affiliate-Einnahmen</h2>
          {affiliateEarnings.length > 0 ? (
            <div className={styles.topProductsList}>
              {affiliateEarnings.map((item) => (
                <div key={item.id} className={styles.topProductItem}>
                  <div className={styles.productThumb}>
                    {item.productThumbnail ? (
                      <img src={item.productThumbnail} alt={item.productTitle} />
                    ) : (
                      <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                        <Icon name="image" size="md" />
                      </span>
                    )}
                  </div>
                  <div className={styles.productInfo}>
                    <div className={styles.productName}>{item.productTitle}</div>
                    <div className={styles.productStats}>
                      {new Date(item.date).toLocaleDateString('de-DE')}
                    </div>
                  </div>
                  <div className={styles.productRevenue}>+{formatCurrency(item.commission)}</div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <div className="empty-state-icon">🔗</div>
              <h3 className="empty-state-title">Noch keine Affiliate-Einnahmen</h3>
              <p className="empty-state-text">
                Bewerbe Produkte anderer Creator und verdiene Provisionen!
              </p>
            </div>
          )}
        </section>
      )}
    </div>
  );
}

export default EarningsDashboard;
