// client/src/pages/earnings/EarningsDashboard.jsx
import React, { useState, useEffect } from 'react';
import { Icon } from '../../components/common';
import { LevelInfoModal, PayoutModal, PayoutHistory } from '../../components/earnings';
import { earningsService, payoutsService, stripeService } from '../../services';
import { PAYOUT_CONFIG } from '../../config/platform.config';
import styles from '../../styles/pages/Earnings.module.css';

/**
 * Earnings Dashboard Page
 * 
 * Zwei Tabs:
 * 1. PRODUKTE: Produktverkäufe (automatische Auszahlung via Stripe)
 * 2. PROVISIONEN: Affiliate-Einnahmen (manuelle Auszahlung)
 */
function EarningsDashboard() {
  // Tab State
  const [activeTab, setActiveTab] = useState('products');
  
  // API Data States
  const [dashboard, setDashboard] = useState(null);
  const [level, setLevel] = useState(null);
  const [affiliateData, setAffiliateData] = useState(null);
  const [topProducts, setTopProducts] = useState([]);
  const [affiliateSales, setAffiliateSales] = useState([]);
  const [payoutHistory, setPayoutHistory] = useState([]);
  const [stripeStatus, setStripeStatus] = useState(null);
  
  // UI States
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Modal States
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

      const [
        dashboardRes, 
        levelRes, 
        affiliateRes, 
        productsRes, 
        affiliateSalesRes, 
        payoutsRes,
        stripeRes
      ] = await Promise.all([
        earningsService.getDashboard(),
        earningsService.getLevelInfo(),
        payoutsService.getAffiliateBalance(),
        earningsService.getProductEarnings().catch(() => ({ success: true, data: [] })),
        earningsService.getAffiliateEarnings().catch(() => ({ success: true, data: [] })),
        payoutsService.getHistory({ limit: 10 }),
        stripeService.getConnectStatus().catch(() => ({ success: false }))
      ]);

      if (dashboardRes.success) setDashboard(dashboardRes.data);
      if (levelRes.success) setLevel(levelRes.data);
      if (affiliateRes.success) setAffiliateData(affiliateRes.data);
      if (productsRes.success) setTopProducts(productsRes.data || []);
      if (affiliateSalesRes.success) setAffiliateSales(affiliateSalesRes.data || []);
      if (payoutsRes.success) setPayoutHistory(payoutsRes.data || []);
      if (stripeRes.success) setStripeStatus(stripeRes.data);

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

  // Format date
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('de-DE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  // Calculate level progress
  const levelProgress = level?.progressPercent || 0;

  // Handle payout request
  const handleRequestPayout = async (amount) => {
    try {
      setPayoutLoading(true);
      const response = await payoutsService.requestPayout(amount);
      
      if (response.success) {
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

  // Open Stripe Dashboard
  const handleOpenStripeDashboard = async () => {
    try {
      const response = await stripeService.getDashboardLink();
      if (response.success && response.data?.url) {
        window.open(response.data.url, '_blank');
      }
    } catch (err) {
      console.error('Error opening Stripe dashboard:', err);
    }
  };

  // Loading State
  if (loading) {
    return (
      <div className={`page ${styles.earningsPage}`}>
        <div className={styles.loadingState}>
          <div className={styles.loadingSpinner} />
          <p>Daten werden geladen...</p>
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

  // Affiliate balance data
  const affiliateBalance = affiliateData?.availableBalance || 0;
  const affiliatePending = affiliateData?.pendingBalance || 0;
  const canPayout = affiliateBalance >= PAYOUT_CONFIG.absoluteMinPayout && stripeStatus?.payoutsEnabled;

  return (
    <div className={`page ${styles.earningsPage}`}>
      {/* Header */}
      <div className="page-header">
        <h1 className="page-title">Fortschritt</h1>
        <p className="page-subtitle">Deine Einnahmen und Level-Fortschritt</p>
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
            <span className={styles.progressText}>
              {formatCurrency(level.progress)} / {formatCurrency(level.nextLevel)}
            </span>
            <button 
              className={styles.levelInfoButton}
              onClick={() => setShowLevelInfo(true)}
            >
              <Icon name="info" size="sm" />
              Alle Level
            </button>
          </div>
        </div>
      )}

      {/* Tab Navigation */}
      <div className={styles.tabs}>
        <button 
          className={`${styles.tab} ${activeTab === 'products' ? styles.tabActive : ''}`}
          onClick={() => setActiveTab('products')}
        >
          <Icon name="shoppingBag" size="sm" />
          <span>Produkte</span>
        </button>
        <button 
          className={`${styles.tab} ${activeTab === 'affiliates' ? styles.tabActive : ''}`}
          onClick={() => setActiveTab('affiliates')}
        >
          <Icon name="link" size="sm" />
          <span>Provisionen</span>
        </button>
      </div>

      {/* ==================== PRODUKTE TAB ==================== */}
      {activeTab === 'products' && (
        <>
          {/* Stats Grid */}
          <div className={styles.statsGrid}>
            <div className={styles.statCard}>
              <div className={`${styles.statIcon} ${styles.statIconSuccess}`}>
                <Icon name="dollarSign" size="sm" />
              </div>
              <div className={styles.statValue}>{formatCurrency(dashboard?.productEarnings)}</div>
              <div className={styles.statLabel}>Gesamteinnahmen</div>
            </div>
            <div className={styles.statCard}>
              <div className={`${styles.statIcon} ${styles.statIconPrimary}`}>
                <Icon name="shoppingCart" size="sm" />
              </div>
              <div className={styles.statValue}>{dashboard?.totalSales || 0}</div>
              <div className={styles.statLabel}>Verkäufe</div>
            </div>
          </div>

          {/* Stripe Info Card mit Dashboard Link */}
          <div className={styles.stripeInfoCard}>
            <div className={styles.stripeInfoIcon}>
              <Icon name="checkCircle" size="md" />
            </div>
            <div className={styles.stripeInfoContent}>
              <h4>Automatische Auszahlung via Stripe</h4>
              <p>
                Deine Produkteinnahmen werden automatisch auf dein Bankkonto überwiesen. 
                Du musst nichts weiter tun.
              </p>
            </div>
            {stripeStatus?.payoutsEnabled ? (
              <button 
                className={styles.stripeInfoButton}
                onClick={handleOpenStripeDashboard}
              >
                <Icon name="externalLink" size="sm" />
                <span>Stripe Dashboard</span>
              </button>
            ) : (
              <a href="/settings?tab=stripe" className={styles.stripeInfoButton}>
                <Icon name="settings" size="sm" />
                <span>Einrichten</span>
              </a>
            )}
          </div>

          {/* Top Products */}
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>Top Produkte</h3>
            
            {topProducts.length > 0 ? (
              <div className={styles.topProductsList}>
                {topProducts.map((product) => (
                  <div key={product.id} className={styles.topProductItem}>
                    <div className={styles.productThumb}>
                      {product.thumbnail ? (
                        <img src={product.thumbnail} alt={product.title} />
                      ) : (
                        <Icon name="package" size="sm" />
                      )}
                    </div>
                    <div className={styles.productInfo}>
                      <span className={styles.productName}>{product.title}</span>
                      <span className={styles.productStats}>{product.sales} Verkäufe</span>
                    </div>
                    <span className={styles.productRevenue}>{formatCurrency(product.revenue)}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className={styles.emptyState}>
                <Icon name="package" size="xl" />
                <p>Noch keine Verkäufe</p>
                <span>Erstelle dein erstes Produkt!</span>
              </div>
            )}
          </div>
        </>
      )}

      {/* ==================== PROVISIONEN TAB ==================== */}
      {activeTab === 'affiliates' && (
        <>
          {/* Balance Card mit integriertem Hinweis und Button */}
          <div className={styles.balanceCard}>
            <div className={styles.balanceMain}>
              <div className={styles.balanceInfo}>
                <span className={styles.balanceLabel}>Verfügbares Guthaben</span>
                <span className={styles.balanceAmount}>{formatCurrency(affiliateBalance)}</span>
                {affiliatePending > 0 && (
                  <span className={styles.balanceHint}>
                    + {formatCurrency(affiliatePending)} in Freigabe
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
            <div className={styles.balanceStats}>
              <Icon name="info" size="xs" />
              <span>
                Provisionen werden nach 7 Tagen freigegeben (Schutz vor Rückbuchungen).
                {!stripeStatus?.payoutsEnabled && affiliateBalance > 0 && (
                  <> <a href="/settings?tab=stripe">Stripe einrichten</a>, um auszuzahlen.</>
                )}
              </span>
            </div>
          </div>

          {/* Stats Grid */}
          <div className={styles.statsGrid}>
            <div className={styles.statCard}>
              <div className={`${styles.statIcon} ${styles.statIconSuccess}`}>
                <Icon name="dollarSign" size="sm" />
              </div>
              <div className={styles.statValue}>{formatCurrency(affiliateData?.totalEarnings || 0)}</div>
              <div className={styles.statLabel}>Gesamtprovisionen</div>
            </div>
            <div className={styles.statCard}>
              <div className={`${styles.statIcon} ${styles.statIconPrimary}`}>
                <Icon name="users" size="sm" />
              </div>
              <div className={styles.statValue}>{dashboard?.totalReferrals || 0}</div>
              <div className={styles.statLabel}>Referrals</div>
            </div>
          </div>

          {/* Recent Affiliate Sales */}
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>Letzte Provisionen</h3>
            
            {affiliateSales.length > 0 ? (
              <div className={styles.topProductsList}>
                {affiliateSales.map((sale) => (
                  <div key={sale.id} className={styles.topProductItem}>
                    <div className={styles.productThumb}>
                      {sale.productThumbnail ? (
                        <img src={sale.productThumbnail} alt={sale.productTitle} />
                      ) : (
                        <Icon name="package" size="sm" />
                      )}
                    </div>
                    <div className={styles.productInfo}>
                      <span className={styles.productName}>{sale.productTitle}</span>
                      <span className={styles.productStats}>{formatDate(sale.date)}</span>
                    </div>
                    <span className={styles.productRevenue}>+{formatCurrency(sale.commission)}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className={styles.emptyState}>
                <Icon name="link" size="xl" />
                <p>Noch keine Provisionen</p>
                <span>Teile Produkte mit deinem Affiliate-Link!</span>
              </div>
            )}
          </div>

          {/* Payout History */}
          {payoutHistory.length > 0 && (
            <div className={styles.section}>
              <h3 className={styles.sectionTitle}>Auszahlungshistorie</h3>
              <PayoutHistory 
                payouts={payoutHistory}
                onCancel={handleCancelPayout}
              />
            </div>
          )}
        </>
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
        availableBalance={affiliateBalance}
        onRequestPayout={handleRequestPayout}
        loading={payoutLoading}
      />
    </div>
  );
}

export default EarningsDashboard;
