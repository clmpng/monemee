import React, { useState } from 'react';
import styles from '../../styles/pages/Earnings.module.css';

/**
 * Earnings Dashboard Page
 * Shows total earnings, level progress, and statistics
 */
function EarningsDashboard() {
  // Mock data (später aus API)
  const [activeTab, setActiveTab] = useState('products'); // 'products' | 'affiliates'

  // Earnings data
  const earnings = {
    total: 847.50,
    thisMonth: 234.00,
    lastMonth: 189.50,
    change: 23.5 // percentage
  };

  // Level data
  const level = {
    current: 2,
    name: 'Rising Star',
    fee: 12,
    progress: 234, // current earnings
    nextLevel: 500, // needed for next level
    nextFee: 10
  };

  // Stats
  const stats = {
    totalSales: 28,
    totalViews: 1234,
    conversionRate: 2.3,
    avgOrderValue: 30.27
  };

  // Top Products
  const topProducts = [
    { id: 1, name: 'Ultimate Productivity Guide', revenue: 359.88, sales: 12, thumbnail: null },
    { id: 2, name: 'Design Templates Bundle', revenue: 399.92, sales: 8, thumbnail: null },
    { id: 3, name: 'Quick Start Checklist', revenue: 87.70, sales: 7, thumbnail: null }
  ];

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  };

  // Calculate level progress percentage
  const levelProgress = Math.min((level.progress / level.nextLevel) * 100, 100);

  return (
    <div className={`page ${styles.earningsPage}`}>
      {/* Page Header */}
      <div className="page-header">
        <h1 className="page-title">Einnahmen</h1>
        <p className="page-subtitle">Deine Statistiken und Fortschritt</p>
      </div>

      {/* Total Earnings Card */}
      <div className={styles.totalEarnings}>
        <p className={styles.totalLabel}>Gesamteinnahmen</p>
        <p className={styles.totalValue}>{formatCurrency(earnings.total)}</p>
        <p className={styles.totalChange}>
          <span className={earnings.change >= 0 ? styles.changePositive : styles.changeNegative}>
            {earnings.change >= 0 ? '↑' : '↓'} {Math.abs(earnings.change)}%
          </span>
          <span> vs. letzten Monat</span>
        </p>
      </div>

      {/* Level Progress Card */}
      <div className={styles.levelCard}>
        <div className={styles.levelHeader}>
          <div className={styles.levelBadge}>
            <div className={styles.levelIcon}>⭐</div>
            <div className={styles.levelInfo}>
              <h3>Level {level.current} - {level.name}</h3>
              <p>{formatCurrency(level.nextLevel - level.progress)} bis Level {level.current + 1}</p>
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

      {/* Stats Grid */}
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={`${styles.statIcon} ${styles.statIconPrimary}`}>💰</div>
          <div className={styles.statValue}>{stats.totalSales}</div>
          <div className={styles.statLabel}>Verkäufe</div>
        </div>
        <div className={styles.statCard}>
          <div className={`${styles.statIcon} ${styles.statIconSuccess}`}>👁️</div>
          <div className={styles.statValue}>{stats.totalViews}</div>
          <div className={styles.statLabel}>Views</div>
        </div>
        <div className={styles.statCard}>
          <div className={`${styles.statIcon} ${styles.statIconWarning}`}>📈</div>
          <div className={styles.statValue}>{stats.conversionRate}%</div>
          <div className={styles.statLabel}>Conversion</div>
        </div>
        <div className={styles.statCard}>
          <div className={`${styles.statIcon} ${styles.statIconDanger}`}>🧾</div>
          <div className={styles.statValue}>{formatCurrency(stats.avgOrderValue)}</div>
          <div className={styles.statLabel}>Ø Bestellung</div>
        </div>
      </div>

      {/* Tabs */}
      <div className={styles.tabs}>
        <button 
          className={`${styles.tab} ${activeTab === 'products' ? styles.tabActive : ''}`}
          onClick={() => setActiveTab('products')}
        >
          Meine Produkte
        </button>
        <button 
          className={`${styles.tab} ${activeTab === 'affiliates' ? styles.tabActive : ''}`}
          onClick={() => setActiveTab('affiliates')}
        >
          Affiliate-Einnahmen
        </button>
      </div>

      {/* Top Products Section */}
      {activeTab === 'products' && (
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Top Produkte</h2>
          
          <div className={styles.topProductsList}>
            {topProducts.map((product, index) => (
              <div key={product.id} className={styles.topProductItem}>
                <div className={`${styles.productRank} ${index === 0 ? 'gold' : index === 1 ? 'silver' : index === 2 ? 'bronze' : ''}`}>
                  {index + 1}
                </div>
                <div className={styles.productThumb}>
                  {product.thumbnail ? (
                    <img src={product.thumbnail} alt={product.name} />
                  ) : (
                    <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>📦</span>
                  )}
                </div>
                <div className={styles.productInfo}>
                  <div className={styles.productName}>{product.name}</div>
                  <div className={styles.productStats}>{product.sales} Verkäufe</div>
                </div>
                <div className={styles.productRevenue}>
                  {formatCurrency(product.revenue)}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Affiliate Earnings Section */}
      {activeTab === 'affiliates' && (
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Affiliate-Einnahmen</h2>
          
          <div className="empty-state">
            <div className="empty-state-icon">🔗</div>
            <h3 className="empty-state-title">Noch keine Affiliate-Einnahmen</h3>
            <p className="empty-state-text">
              Bewerbe Produkte anderer Creator und verdiene Provisionen!
            </p>
          </div>
        </section>
      )}
    </div>
  );
}

export default EarningsDashboard;