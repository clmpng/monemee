// client/src/pages/earnings/EarningsDashboard.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext'; 
import { Icon } from '../../components/common';
import { LevelInfoModal, PayoutModal, PayoutHistory, EarningsChart } from '../../components/earnings';
import { earningsService, payoutsService, stripeService } from '../../services';
import { PAYOUT_CONFIG } from '../../config/platform.config';
import { InvoiceList } from '../../components/billing';
import styles from '../../styles/pages/Earnings.module.css';

/**
 * Earnings Dashboard Page
 * 
 * Features:
 * - Zeitraum-Auswahl (7T, 30T, 90T, 1J)
 * - KPI-Karten mit Trends
 * - Einnahmen-Chart
 * - Top-Produkte mit Visualisierung
 * - Tabs für Produkte/Provisionen
 */

const PERIOD_OPTIONS = [
  { value: '7d', label: '7T' },
  { value: '30d', label: '30T' },
  { value: '90d', label: '90T' },
  { value: '365d', label: '1J' }
];

function EarningsDashboard() {
  const { user } = useAuth();
  // Period State
  const [selectedPeriod, setSelectedPeriod] = useState('30d');
  
  // Tab State
  const [activeTab, setActiveTab] = useState('products');
  
  // Statistics Data
  const [statistics, setStatistics] = useState(null);
  const [statsLoading, setStatsLoading] = useState(true);
  
  // Other Data States
  const [level, setLevel] = useState(null);
  const [affiliateData, setAffiliateData] = useState(null);
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

  // Fetch statistics when period changes
  const fetchStatistics = useCallback(async () => {
    try {
      setStatsLoading(true);
      const response = await earningsService.getStatistics(selectedPeriod);
      if (response.success) {
        setStatistics(response.data);
      }
    } catch (err) {
      console.error('Error fetching statistics:', err);
    } finally {
      setStatsLoading(false);
    }
  }, [selectedPeriod]);

  // Fetch all other data on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const [
          levelRes, 
          affiliateRes, 
          affiliateSalesRes, 
          payoutsRes,
          stripeRes
        ] = await Promise.all([
          earningsService.getLevelInfo(),
          payoutsService.getAffiliateBalance(),
          earningsService.getAffiliateEarnings().catch(() => ({ success: true, data: [] })),
          payoutsService.getHistory({ limit: 10 }),
          stripeService.getConnectStatus().catch(() => ({ success: false }))
        ]);

        if (levelRes.success) setLevel(levelRes.data);
        if (affiliateRes.success) setAffiliateData(affiliateRes.data);
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

    fetchData();
  }, []);

  // Fetch statistics when period changes
  useEffect(() => {
    fetchStatistics();
  }, [fetchStatistics]);

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount || 0);
  };

  // Format compact currency
  const formatCompactCurrency = (amount) => {
    if (amount >= 1000) {
      return `€${(amount / 1000).toFixed(1)}k`;
    }
    return formatCurrency(amount);
  };

  // Format date
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('de-DE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  // Format relative time
  const formatRelativeTime = (date) => {
    const now = new Date();
    const then = new Date(date);
    const diffMs = now - then;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Gerade eben';
    if (diffMins < 60) return `vor ${diffMins} Min.`;
    if (diffHours < 24) return `vor ${diffHours} Std.`;
    if (diffDays < 7) return `vor ${diffDays} Tag${diffDays > 1 ? 'en' : ''}`;
    return formatDate(date);
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
        const [affiliateRes, payoutsRes] = await Promise.all([
          payoutsService.getAffiliateBalance(),
          payoutsService.getHistory({ limit: 10 })
        ]);
        if (affiliateRes.success) setAffiliateData(affiliateRes.data);
        if (payoutsRes.success) setPayoutHistory(payoutsRes.data || []);
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
        const [affiliateRes, payoutsRes] = await Promise.all([
          payoutsService.getAffiliateBalance(),
          payoutsService.getHistory({ limit: 10 })
        ]);
        if (affiliateRes.success) setAffiliateData(affiliateRes.data);
        if (payoutsRes.success) setPayoutHistory(payoutsRes.data || []);
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

  // Extract data from statistics
  const kpis = statistics?.kpis || {};
  const chartData = statistics?.chart || [];
  const topProducts = statistics?.topProducts || [];
  const recentSales = statistics?.recentSales || [];
  
  // Affiliate balance data
  const affiliateBalance = affiliateData?.availableBalance || 0;
  const affiliatePending = affiliateData?.pendingBalance || 0;
  const canPayout = affiliateBalance >= PAYOUT_CONFIG.absoluteMinPayout && stripeStatus?.payoutsEnabled;

  return (
    <div className={`page ${styles.earningsPage}`}>
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

      {/* Period Selector */}
      <div className={styles.periodSelector}>
        <span className={styles.periodLabel}>Zeitraum:</span>
        <div className={styles.periodButtons}>
          {PERIOD_OPTIONS.map(option => (
            <button
              key={option.value}
              className={`${styles.periodButton} ${selectedPeriod === option.value ? styles.periodActive : ''}`}
              onClick={() => setSelectedPeriod(option.value)}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {/* KPI Cards */}
      <div className={styles.kpiGrid}>
        <div className={styles.kpiCard}>
          <div className={styles.kpiHeader}>
            <span className={styles.kpiLabel}>Einnahmen</span>
            <TrendBadge value={kpis.earnings?.change} />
          </div>
          <div className={styles.kpiValue}>
            {statsLoading ? '...' : formatCurrency(kpis.earnings?.value || 0)}
          </div>
        </div>
        
        <div className={styles.kpiCard}>
          <div className={styles.kpiHeader}>
            <span className={styles.kpiLabel}>Verkäufe</span>
            <TrendBadge value={kpis.sales?.change} />
          </div>
          <div className={styles.kpiValue}>
            {statsLoading ? '...' : (kpis.sales?.value || 0)}
          </div>
        </div>
        
        <div className={styles.kpiCard}>
          <div className={styles.kpiHeader}>
            <span className={styles.kpiLabel}>Ø Bestellwert</span>
            <TrendBadge value={kpis.avgOrderValue?.change} />
          </div>
          <div className={styles.kpiValue}>
            {statsLoading ? '...' : formatCurrency(kpis.avgOrderValue?.value || 0)}
          </div>
        </div>
        
        <div className={styles.kpiCard}>
          <div className={styles.kpiHeader}>
            <span className={styles.kpiLabel}>Conversion</span>
          </div>
          <div className={styles.kpiValue}>
            {statsLoading ? '...' : `${kpis.conversionRate?.value || 0}%`}
          </div>
          <div className={styles.kpiSubtext}>
            {kpis.conversionRate?.views || 0} Views
          </div>
        </div>
      </div>

      {/* Chart Section */}
      <div className={styles.chartSection}>
        <div className={styles.chartHeader}>
          <h3 className={styles.sectionTitle}>Einnahmen-Verlauf</h3>
        </div>
        <div className={styles.chartWrapper}>
          {statsLoading ? (
            <div className={styles.chartLoading}>
              <div className={styles.loadingSpinner} />
            </div>
          ) : (
            <EarningsChart 
              data={chartData} 
              type="earnings"
              height={200}
            />
          )}
        </div>
      </div>

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
        {user?.seller_type === 'business' && (
          <button 
            className={`${styles.tab} ${activeTab === 'invoices' ? styles.tabActive : ''}`}
            onClick={() => setActiveTab('invoices')}
          >
            <Icon name="fileText" size="sm" />
            <span>Rechnungen</span>
          </button>
        )}
      </div>

      {/* Products Tab Content */}
      {activeTab === 'products' && (
        <>
          {/* Stripe Info */}
          {stripeStatus?.payoutsEnabled && (
            <div className={styles.stripeInfoCard}>
              <div className={styles.stripeInfoIcon}>
                <Icon name="check" size="sm" />
              </div>
              <div className={styles.stripeInfoContent}>
                <h4>Automatische Auszahlung aktiv</h4>
                <p>Deine Produktverkäufe werden automatisch via Stripe auf dein Konto ausgezahlt.</p>
              </div>
              <button 
                className={styles.stripeInfoButton}
                onClick={handleOpenStripeDashboard}
              >
                <Icon name="externalLink" size="sm" />
                Stripe Dashboard
              </button>
            </div>
          )}

          {/* Top Products with Visualization */}
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>Top Produkte</h3>
            
            {topProducts.length > 0 ? (
              <div className={styles.topProductsList}>
                {topProducts.map((product, index) => (
                  <div key={product.id} className={styles.topProductItem}>
                    <div className={styles.productRank}>#{index + 1}</div>
                    <div className={styles.productThumb}>
                      {product.thumbnail ? (
                        <img src={product.thumbnail} alt={product.title} />
                      ) : (
                        <Icon name="package" size="sm" />
                      )}
                    </div>
                    <div className={styles.productInfo}>
                      <span className={styles.productName}>{product.title}</span>
                      <span className={styles.productStats}>
                        {product.sales} Verkäufe · {product.conversionRate}% CR
                      </span>
                    </div>
                    <div className={styles.productRevenueWrapper}>
                      <span className={styles.productRevenue}>{formatCompactCurrency(product.revenue)}</span>
                      <div className={styles.productBarWrapper}>
                        <div 
                          className={styles.productBar}
                          style={{ width: `${product.percentage}%` }}
                        />
                      </div>
                      <span className={styles.productPercentage}>{product.percentage}%</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className={styles.emptyState}>
                <Icon name="shoppingBag" size="xl" />
                <p>Noch keine Verkäufe</p>
                <span>Erstelle dein erstes Produkt!</span>
              </div>
            )}
          </div>

        {/* Recent Activity */}
        {recentSales.length > 0 && (
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>Letzte Aktivität</h3>
            <div className={styles.activityList}>
              {recentSales.slice(0, 5).map(sale => (
                <div key={sale.id} className={`${styles.activityItem} ${sale.isAffiliateSale ? styles.affiliateActivity : ''}`}>
                  <div className={styles.activityIcon} style={sale.isAffiliateSale ? { background: 'rgba(99, 102, 241, 0.15)', color: 'var(--color-primary)' } : {}}>
                    <Icon name={sale.isAffiliateSale ? 'link' : 'dollarSign'} size="sm" />
                  </div>
                  <div className={styles.activityContent}>
                    <span className={styles.activityText}>
                      <strong>{sale.buyerName}</strong> kaufte "{sale.productTitle}"
                      {sale.isAffiliateSale && (
                        <span className={styles.affiliateTag}> via {sale.promoterName}</span>
                      )}
                    </span>
                    <span className={styles.activityTime}>
                      {formatRelativeTime(sale.date)}
                      {sale.isAffiliateSale && sale.affiliateCommission > 0 && (
                        <span className={styles.commissionInfo}> · {formatCurrency(sale.affiliateCommission)} Provision</span>
                      )}
                    </span>
                  </div>
                  <span className={styles.activityAmount}>+{formatCurrency(sale.amount)}</span>
                </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* Affiliates Tab Content */}
      {activeTab === 'affiliates' && (
        <>
          {/* Balance Card */}
          <div className={styles.balanceCard}>
            <div className={styles.balanceMain}>
              <div className={styles.balanceInfo}>
                <span className={styles.balanceLabel}>Verfügbar zur Auszahlung</span>
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
                <Icon name="download" size="sm" />
                Auszahlen
              </button>
            </div>
            <div className={styles.balanceStats}>
              <Icon name="info" size="sm" />
              <span>
                Provisionen werden nach 7 Tagen freigegeben.
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
              <div className={styles.statValue}>{statistics?.kpis?.sales?.value || 0}</div>
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

      {/* Invoices Tab Content */}
      {activeTab === 'invoices' && user?.seller_type === 'business' && (
        <div className={styles.section}>
          <InvoiceList />
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
      />
    </div>
  );
}

/**
 * Trend Badge Component
 */
function TrendBadge({ value }) {
  if (value === undefined || value === null || value === 0) {
    return null;
  }
  
  const isPositive = value > 0;
  
  return (
    <span className={`${styles.trendBadge} ${isPositive ? styles.trendPositive : styles.trendNegative}`}>
      <Icon name={isPositive ? 'trendingUp' : 'trendingDown'} size="xs" />
      {Math.abs(value)}%
    </span>
  );
}

export default EarningsDashboard;
