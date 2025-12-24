import React, { useState, useEffect } from 'react';
import { Icon } from '../../components/common';
import { LevelInfoModal, PayoutModal, PayoutHistory } from '../../components/earnings';
import { earningsService, payoutsService } from '../../services';
import { PAYOUT_CONFIG } from '../../config/platform.config';
import styles from '../../styles/pages/Earnings.module.css';

/**
 * Earnings Dashboard Page
 * Shows earnings data, level progress, balance and payout options
 */
function EarningsDashboard() {
  const [activeTab, setActiveTab] = useState('products');
  
  // State for API data
  const [dashboard, setDashboard] = useState(null);
  const [level, setLevel] = useState(null);
  const [balance, setBalance] = useState(null);
  const [topProducts, setTopProducts] = useState([]);
  const [affiliateEarnings, setAffiliateEarnings] = useState([]);
  const [payoutHistory, setPayoutHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Modal states
  const [showLevelInfo, setShowLevelInfo] = useState(false);
  const [showPayoutModal, setShowPayoutModal] = useState(false);
  const [payoutLoading, setPayoutLoading] = useState(false);

  // Fetch all data on mount
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [dashboardRes, levelRes, balanceRes, productsRes, affiliatesRes, payoutsRes] = await Promise.all([
        earningsService.getDashboard(),
        earningsService.getLevelInfo(),
        payoutsService.getBalance(),
        earningsService.getProductEarnings(),
        earningsService.getAffiliateEarnings(),
        payoutsService.getHistory({ limit: 10 })
      ]);

      if (dashboardRes.success) setDashboard(dashboardRes.data);
      if (levelRes.success) setLevel(levelRes.data);
      if (balanceRes.success) setBalance(balanceRes.data);
      if (productsRes.success) setTopProducts(productsRes.data || []);
      if (affiliatesRes.success) setAffiliateEarnings(affiliatesRes.data || []);
      if (payoutsRes.success) setPayoutHistory(payoutsRes.data || []);
    } catch (err) {
      console.error('Error fetching earnings:', err);
      setError('Daten konnten nicht geladen werden');
    } finally {
      setLoading(false);
    }
  };

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount || 0);
  };

  // Calculate level progress
  const levelProgress = level?.progressPercent || 0;

  // Handle payout request
  const handleRequestPayout = async (amount) => {
    try {
      setPayoutLoading(true);
      const response = await payoutsService.requestPayout(amount);
      
      if (response.success) {
        // Refresh data
        await fetchData();
        return response;
      } else {
        throw new Error(response.message || 'Auszahlung fehlgeschlagen');
      }
    } catch (err) {
      throw err;
    } finally {
      setPayoutLoading(false);
    }
  };

  // Handle payout cancel
  const handleCancelPayout = async (payoutId) => {
    if (!window.confirm('Auszahlung wirklich stornieren?')) return;
    
    try {
      const response = await payoutsService.cancelPayout(payoutId);
      if (response.success) {
        await fetchData();
      }
    } catch (err) {
      console.error('Cancel payout error:', err);
    }
  };

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

  const availableBalance = balance?.availableBalance || 0;
  const canPayout = availableBalance >= PAYOUT_CONFIG.absoluteMinPayout;

  return (
    <div className={`page ${styles.earningsPage}`}>
      <div className="page-header">
        <h1 className="page-title">Fortschritt</h1>
        <p className="page-subtitle">Deine Statistiken und Einnahmen</p>
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

      {/* Balance & Payout Card */}
      <div className={styles.balanceCard}>
        <div className={styles.balanceMain}>
          <div className={styles.balanceInfo}>
            <span className={styles.balanceLabel}>Verfügbar zur Auszahlung</span>
            <span className={styles.balanceAmount}>{formatCurrency(availableBalance)}</span>
            {availableBalance > 0 && availableBalance < PAYOUT_CONFIG.minFreePayoutAmount && (
              <span className={styles.balanceHint}>
                Noch {formatCurrency(PAYOUT_CONFIG.minFreePayoutAmount - availableBalance)} bis zur kostenlosen Auszahlung
              </span>
            )}
          </div>
          <button 
            className={styles.payoutButton}
            onClick={() => setShowPayoutModal(true)}
            disabled={!canPayout}
          >
            <Icon name="wallet" size="sm" />
            Auszahlen
          </button>
        </div>
        {balance?.totalPaidOut > 0 && (
          <div className={styles.balanceStats}>
            <span>Bereits ausgezahlt: {formatCurrency(balance.totalPaidOut)}</span>
          </div>
        )}
      </div>

      {/* Level Card */}
      {level && (
        <div className={styles.levelCard}>
          <div className={styles.levelHeader}>
            <div className={styles.levelBadge}>
              <div 
                className={styles.levelIcon}
                style={{ backgroundColor: level.color }}
              >
                <Icon name="star" size="sm" />
              </div>
              <div className={styles.levelInfo}>
                <h3>Level {level.current} – {level.name}</h3>
                <p>
                  {level.nextLevel 
                    ? `${formatCurrency(level.amountToNext)} bis Level ${level.current + 1}` 
                    : 'Maximum erreicht! 🎉'}
                </p>
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
          <div className={styles.levelFooter}>
            <p className={styles.progressText}>
              {formatCurrency(level.progress)} / {formatCurrency(level.nextLevel)}
            </p>
            <button 
              className={styles.levelInfoButton}
              onClick={() => setShowLevelInfo(true)}
            >
              <Icon name="info" size="sm" />
              Alle Level ansehen
            </button>
          </div>
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
          <span>Affiliate</span>
        </button>
        <button 
          className={`${styles.tab} ${activeTab === 'payouts' ? styles.tabActive : ''}`}
          onClick={() => setActiveTab('payouts')}
        >
          <Icon name="creditCard" size="sm" />
          <span>Auszahlungen</span>
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'products' && (
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Top Produkte</h2>
          {topProducts.length > 0 ? (
            <div className={styles.topProductsList}>
              {topProducts.map((product) => (
                <div key={product.id} className={styles.topProductItem}>
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
      )}

      {activeTab === 'affiliates' && (
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

      {activeTab === 'payouts' && (
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Auszahlungshistorie</h2>
          <PayoutHistory 
            payouts={payoutHistory}
            onCancel={handleCancelPayout}
          />
        </section>
      )}

      {/* Sticky Payout CTA (Mobile) */}
      {canPayout && (
        <div className={styles.stickyPayoutCta}>
          <div className={styles.stickyPayoutInfo}>
            <span className={styles.stickyPayoutLabel}>Verfügbar</span>
            <span className={styles.stickyPayoutAmount}>{formatCurrency(availableBalance)}</span>
          </div>
          <button 
            className={styles.stickyPayoutButton}
            onClick={() => setShowPayoutModal(true)}
          >
            Jetzt auszahlen
          </button>
        </div>
      )}

      {/* Modals */}
      <LevelInfoModal 
        isOpen={showLevelInfo}
        onClose={() => setShowLevelInfo(false)}
        currentLevel={level?.current || 1}
      />
      
      <PayoutModal 
        isOpen={showPayoutModal}
        onClose={() => setShowPayoutModal(false)}
        availableBalance={availableBalance}
        onRequestPayout={handleRequestPayout}
        loading={payoutLoading}
      />
    </div>
  );
}

export default EarningsDashboard;
