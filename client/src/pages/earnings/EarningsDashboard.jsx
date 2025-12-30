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
 * 1. PRODUKTE: Zeigt Produktverkäufe (Auszahlung via Stripe automatisch)
 * 2. PROVISIONEN: Zeigt Affiliate-Einnahmen (manuelle Auszahlung)
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
        earningsService.getProductEarnings(),
        earningsService.getAffiliateEarnings(),
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

  // Handle payout request (nur für Affiliate)
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

      {/* Level Card - Always visible */}
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

      {/* Tab Navigation */}
      <div className={styles.tabNavigation}>
        <button 
          className={`${styles.tabButton} ${activeTab === 'products' ? styles.tabActive : ''}`}
          onClick={() => setActiveTab('products')}
        >
          <Icon name="shoppingBag" size="sm" />
          <span>Produkte</span>
          <span className={styles.tabBadge}>{formatCurrency(dashboard?.productEarnings)}</span>
        </button>
        <button 
          className={`${styles.tabButton} ${activeTab === 'affiliates' ? styles.tabActive : ''}`}
          onClick={() => setActiveTab('affiliates')}
        >
          <Icon name="link" size="sm" />
          <span>Provisionen</span>
          {affiliateBalance > 0 && (
            <span className={`${styles.tabBadge} ${styles.tabBadgeHighlight}`}>
              {formatCurrency(affiliateBalance)}
            </span>
          )}
        </button>
      </div>

      {/* ==================== PRODUKTE TAB ==================== */}
      {activeTab === 'products' && (
        <div className={styles.tabContent}>
          {/* Info Box */}
          <div className={styles.infoBox}>
            <div className={styles.infoIcon}>
              <Icon name="checkCircle" size="md" />
            </div>
            <div className={styles.infoContent}>
              <h4>Automatische Auszahlung</h4>
              <p>
                Deine Produkteinnahmen werden direkt via Stripe auf dein Bankkonto überwiesen. 
                Du musst nichts weiter tun!
              </p>
            </div>
          </div>

          {/* Stats Overview */}
          <div className={styles.statsRow}>
            <div className={styles.statBox}>
              <div className={styles.statValue}>{formatCurrency(dashboard?.productEarnings)}</div>
              <div className={styles.statLabel}>Gesamteinnahmen</div>
            </div>
            <div className={styles.statBox}>
              <div className={styles.statValue}>{dashboard?.totalSales || 0}</div>
              <div className={styles.statLabel}>Verkäufe</div>
            </div>
          </div>

          {/* Stripe Dashboard Link */}
          {stripeStatus?.payoutsEnabled ? (
            <button 
              className={styles.stripeDashboardButton}
              onClick={handleOpenStripeDashboard}
            >
              <div className={styles.stripeButtonContent}>
                <Icon name="externalLink" size="md" />
                <div>
                  <span className={styles.stripeButtonTitle}>Stripe Dashboard öffnen</span>
                  <span className={styles.stripeButtonSubtitle}>
                    Transaktionen, Auszahlungen & Bankverbindung verwalten
                  </span>
                </div>
              </div>
              <Icon name="chevronRight" size="md" />
            </button>
          ) : (
            <div className={styles.stripeSetupHint}>
              <Icon name="alertCircle" size="md" />
              <div>
                <strong>Stripe noch nicht eingerichtet</strong>
                <p>Richte dein Auszahlungskonto in den <a href="/settings?tab=stripe">Einstellungen</a> ein, um Zahlungen zu empfangen.</p>
              </div>
            </div>
          )}

          {/* Top Products */}
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>
              <Icon name="trendingUp" size="sm" />
              Top Produkte
            </h3>
            
            {topProducts.length > 0 ? (
              <div className={styles.productList}>
                {topProducts.map((product, index) => (
                  <div key={product.id} className={styles.productItem}>
                    <span className={styles.productRank}>#{index + 1}</span>
                    <div className={styles.productThumb}>
                      {product.thumbnail ? (
                        <img src={product.thumbnail} alt={product.title} />
                      ) : (
                        <Icon name="package" size="sm" />
                      )}
                    </div>
                    <div className={styles.productInfo}>
                      <span className={styles.productTitle}>{product.title}</span>
                      <span className={styles.productSales}>{product.sales} Verkäufe</span>
                    </div>
                    <span className={styles.productRevenue}>{formatCurrency(product.revenue)}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className={styles.emptyState}>
                <Icon name="package" size="xl" />
                <p>Noch keine Verkäufe</p>
                <span>Erstelle dein erstes Produkt und starte durch!</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ==================== PROVISIONEN TAB ==================== */}
      {activeTab === 'affiliates' && (
        <div className={styles.tabContent}>
          {/* Balance Card */}
          <div className={styles.affiliateBalanceCard}>
            <div className={styles.balanceHeader}>
              <span className={styles.balanceLabel}>Verfügbares Guthaben</span>
              <span className={styles.balanceAmount}>{formatCurrency(affiliateBalance)}</span>
            </div>
            
            {affiliatePending > 0 && (
              <div className={styles.pendingInfo}>
                <Icon name="clock" size="sm" />
                <span>{formatCurrency(affiliatePending)} in Freigabe (7 Tage)</span>
              </div>
            )}

            <button 
              className={styles.payoutButton}
              onClick={() => setShowPayoutModal(true)}
              disabled={!canPayout}
            >
              <Icon name="wallet" size="sm" />
              {canPayout ? 'Auszahlung anfordern' : `Mind. ${formatCurrency(PAYOUT_CONFIG.absoluteMinPayout)}`}
            </button>

            {!stripeStatus?.payoutsEnabled && affiliateBalance > 0 && (
              <p className={styles.balanceHint}>
                <Icon name="info" size="xs" />
                Richte erst dein <a href="/settings?tab=stripe">Stripe-Konto</a> ein
              </p>
            )}
          </div>

          {/* Info Box - Why manual? */}
          <div className={styles.infoBoxSecondary}>
            <Icon name="info" size="sm" />
            <div>
              <strong>Warum manuelle Auszahlung?</strong>
              <p>
                Affiliate-Provisionen werden nach einer 7-tägigen Sicherheitsphase freigegeben. 
                Dies schützt vor Rückbuchungen und Betrug. Danach kannst du sie jederzeit auszahlen.
              </p>
            </div>
          </div>

          {/* Stats */}
          <div className={styles.statsRow}>
            <div className={styles.statBox}>
              <div className={styles.statValue}>{formatCurrency(affiliateData?.totalEarnings || dashboard?.affiliateEarnings)}</div>
              <div className={styles.statLabel}>Gesamtprovisionen</div>
            </div>
            <div className={styles.statBox}>
              <div className={styles.statValue}>{dashboard?.totalReferrals || 0}</div>
              <div className={styles.statLabel}>Referrals</div>
            </div>
          </div>

          {/* Recent Affiliate Sales */}
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>
              <Icon name="link" size="sm" />
              Letzte Provisionen
            </h3>
            
            {affiliateSales.length > 0 ? (
              <div className={styles.affiliateList}>
                {affiliateSales.map((sale) => (
                  <div key={sale.id} className={styles.affiliateItem}>
                    <div className={styles.affiliateThumb}>
                      {sale.productThumbnail ? (
                        <img src={sale.productThumbnail} alt={sale.productTitle} />
                      ) : (
                        <Icon name="package" size="sm" />
                      )}
                    </div>
                    <div className={styles.affiliateInfo}>
                      <span className={styles.affiliateTitle}>{sale.productTitle}</span>
                      <span className={styles.affiliateDate}>{formatDate(sale.date)}</span>
                    </div>
                    <span className={styles.affiliateCommission}>+{formatCurrency(sale.commission)}</span>
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
              <h3 className={styles.sectionTitle}>
                <Icon name="clock" size="sm" />
                Auszahlungshistorie
              </h3>
              <PayoutHistory 
                payouts={payoutHistory}
                onCancel={handleCancelPayout}
              />
            </div>
          )}
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
        availableBalance={affiliateBalance}
        onRequestPayout={handleRequestPayout}
        loading={payoutLoading}
        title="Affiliate-Provision auszahlen"
        description="Deine Provisionen werden auf dein Stripe-Konto überwiesen."
      />
    </div>
  );
}

export default EarningsDashboard;
