import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { leaderboardsAPI } from '../services/api';
import { Trophy, TrendingUp, Users, Package, Zap, Medal } from 'lucide-react';
import styles from '../styles/pages/common.module.css';

export default function Leaderboards() {
  const [period, setPeriod] = useState('30d');
  const [activeTab, setActiveTab] = useState('sellers');

  // Fetch overview
  const { data: overviewData } = useQuery({
    queryKey: ['leaderboards-overview'],
    queryFn: leaderboardsAPI.getOverview,
  });

  // Fetch current leaderboard
  const { data: leaderboardData, isLoading } = useQuery({
    queryKey: ['leaderboard', activeTab, period],
    queryFn: () => {
      const params = activeTab !== 'fastest-growing' ? { period, limit: 50 } : { limit: 50 };

      switch (activeTab) {
        case 'sellers':
          return leaderboardsAPI.getTopSellers(params);
        case 'affiliates':
          return leaderboardsAPI.getTopAffiliates(params);
        case 'products':
          return leaderboardsAPI.getTopProducts(params);
        case 'fastest-growing':
          return leaderboardsAPI.getFastestGrowing(params);
        case 'most-active':
          return leaderboardsAPI.getMostActive(params);
        default:
          return leaderboardsAPI.getTopSellers(params);
      }
    },
  });

  const leaderboard = leaderboardData?.data || [];
  const overview = overviewData?.data;

  const tabs = [
    { id: 'sellers', label: 'Top Sellers', icon: Trophy },
    { id: 'affiliates', label: 'Top Affiliates', icon: Users },
    { id: 'products', label: 'Top Products', icon: Package },
    { id: 'fastest-growing', label: 'Fastest Growing', icon: TrendingUp },
    { id: 'most-active', label: 'Most Active', icon: Zap },
  ];

  const getRankMedal = (rank: number) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return `#${rank}`;
  };

  const getRankStyle = (rank: number): React.CSSProperties => {
    if (rank === 1) return { color: '#EAB308', fontWeight: 700, fontSize: 'var(--font-size-2xl)' };
    if (rank === 2) return { color: '#9CA3AF', fontWeight: 700, fontSize: 'var(--font-size-xl)' };
    if (rank === 3) return { color: '#F97316', fontWeight: 700, fontSize: 'var(--font-size-xl)' };
    return { color: 'var(--color-text-secondary)', fontWeight: 500 };
  };

  return (
    <div className={styles.page}>
      {/* Header */}
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>Leaderboards</h1>
        <p className={styles.pageSubtitle}>Top Performers on Your Platform</p>
      </div>

      {/* Overview Cards */}
      {overview && (
        <div className={styles.statsGrid}>
          <div
            className="card"
            style={{
              background: 'linear-gradient(135deg, rgba(234, 179, 8, 0.1) 0%, rgba(234, 179, 8, 0.2) 100%)',
              borderColor: 'rgba(234, 179, 8, 0.3)',
            }}
          >
            <div className="flex items-center gap-sm" style={{ marginBottom: 'var(--spacing-sm)' }}>
              <Trophy style={{ color: '#EAB308' }} size={32} />
              <div>
                <p style={{ fontSize: 'var(--font-size-sm)', color: '#EAB308' }}>Top Seller</p>
                <p style={{ fontSize: 'var(--font-size-xl)', fontWeight: 700, color: 'var(--color-text-primary)' }}>
                  {overview.topSeller?.username || '-'}
                </p>
              </div>
            </div>
            {overview.topSeller && (
              <p style={{ fontSize: 'var(--font-size-sm)', color: '#EAB308', marginTop: 'var(--spacing-sm)' }}>
                €{parseFloat(overview.topSeller.total_revenue).toFixed(2)} revenue
              </p>
            )}
          </div>

          <div
            className="card"
            style={{
              background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.1) 0%, rgba(168, 85, 247, 0.2) 100%)',
              borderColor: 'rgba(168, 85, 247, 0.3)',
            }}
          >
            <div className="flex items-center gap-sm" style={{ marginBottom: 'var(--spacing-sm)' }}>
              <Users style={{ color: '#A855F7' }} size={32} />
              <div>
                <p style={{ fontSize: 'var(--font-size-sm)', color: '#A855F7' }}>Top Affiliate</p>
                <p style={{ fontSize: 'var(--font-size-xl)', fontWeight: 700, color: 'var(--color-text-primary)' }}>
                  {overview.topAffiliate?.username || '-'}
                </p>
              </div>
            </div>
            {overview.topAffiliate && (
              <p style={{ fontSize: 'var(--font-size-sm)', color: '#A855F7', marginTop: 'var(--spacing-sm)' }}>
                €{parseFloat(overview.topAffiliate.total_commission).toFixed(2)} commission
              </p>
            )}
          </div>

          <div
            className="card"
            style={{
              background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(59, 130, 246, 0.2) 100%)',
              borderColor: 'rgba(59, 130, 246, 0.3)',
            }}
          >
            <div className="flex items-center gap-sm" style={{ marginBottom: 'var(--spacing-sm)' }}>
              <Package style={{ color: '#3B82F6' }} size={32} />
              <div>
                <p style={{ fontSize: 'var(--font-size-sm)', color: '#3B82F6' }}>Top Product</p>
                <p style={{ fontSize: 'var(--font-size-xl)', fontWeight: 700, color: 'var(--color-text-primary)' }}>
                  {overview.topProduct?.title || '-'}
                </p>
              </div>
            </div>
            {overview.topProduct && (
              <p style={{ fontSize: 'var(--font-size-sm)', color: '#3B82F6', marginTop: 'var(--spacing-sm)' }}>
                €{parseFloat(overview.topProduct.total_revenue).toFixed(2)} revenue
              </p>
            )}
          </div>
        </div>
      )}

      {/* Tabs */}
      <div style={{ borderBottom: '1px solid var(--color-border)' }}>
        <div className="flex gap-xs" style={{ overflowX: 'auto', paddingBottom: 'var(--spacing-sm)' }}>
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  padding: 'var(--spacing-sm) var(--spacing-md)',
                  borderRadius: 'var(--radius-md) var(--radius-md) 0 0',
                  fontWeight: 500,
                  whiteSpace: 'nowrap',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 'var(--spacing-sm)',
                  backgroundColor: activeTab === tab.id ? 'var(--color-bg-card)' : 'transparent',
                  color: activeTab === tab.id ? 'var(--color-primary-light)' : 'var(--color-text-tertiary)',
                  borderBottom: activeTab === tab.id ? '2px solid var(--color-primary)' : '2px solid transparent',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'all var(--transition-fast)',
                }}
              >
                <Icon size={18} />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Period Filter */}
      {activeTab !== 'fastest-growing' && (
        <div className="flex gap-xs">
          {['7d', '30d', '90d', 'all'].map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={period === p ? 'btn btn-primary btn-sm' : 'btn btn-secondary btn-sm'}
            >
              {p === 'all' ? 'All Time' : p === '7d' ? 'Last 7 Days' : p === '30d' ? 'Last 30 Days' : 'Last 90 Days'}
            </button>
          ))}
        </div>
      )}

      {/* Leaderboard */}
      <div className="card">
        {isLoading ? (
          <div className="flex-center" style={{ padding: 'var(--spacing-2xl)' }}>
            <div className="spinner spinner-lg"></div>
          </div>
        ) : leaderboard.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 'var(--spacing-2xl)', color: 'var(--color-text-muted)' }}>
            <Medal size={48} style={{ margin: '0 auto var(--spacing-md)', opacity: 0.5 }} />
            <p>No data available for this period</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="table">
              <thead className="table-header">
                <tr>
                  <th className="table-cell" style={{ width: '80px', textAlign: 'center', fontWeight: 600 }}>
                    Rank
                  </th>
                  <th className="table-cell" style={{ textAlign: 'left', fontWeight: 600 }}>
                    {activeTab === 'products' ? 'Product' : 'User'}
                  </th>
                  {renderTableHeaders(activeTab)}
                </tr>
              </thead>
              <tbody>
                {leaderboard.map((item: any) => (
                  <tr key={item.id} className="table-row">
                    <td className="table-cell" style={{ textAlign: 'center' }}>
                      <span style={getRankStyle(item.rank)}>{getRankMedal(item.rank)}</span>
                    </td>
                    <td className="table-cell">
                      <div>
                        <p style={{ fontWeight: 500, color: 'var(--color-text-primary)' }}>
                          {item.title || item.username}
                        </p>
                        {item.email && (
                          <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)' }}>
                            {item.email}
                          </p>
                        )}
                        {item.creator && (
                          <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)' }}>
                            by {item.creator}
                          </p>
                        )}
                      </div>
                    </td>
                    {renderTableData(activeTab, item)}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function renderTableHeaders(tab: string) {
  const thStyle: React.CSSProperties = { fontWeight: 600 };

  switch (tab) {
    case 'sellers':
      return (
        <>
          <th className="table-cell" style={{ ...thStyle, textAlign: 'center' }}>Level</th>
          <th className="table-cell" style={{ ...thStyle, textAlign: 'right' }}>Sales</th>
          <th className="table-cell" style={{ ...thStyle, textAlign: 'right' }}>Revenue</th>
          <th className="table-cell" style={{ ...thStyle, textAlign: 'right' }}>Avg Order</th>
          <th className="table-cell" style={{ ...thStyle, textAlign: 'right' }}>Earnings</th>
        </>
      );

    case 'affiliates':
      return (
        <>
          <th className="table-cell" style={{ ...thStyle, textAlign: 'center' }}>Level</th>
          <th className="table-cell" style={{ ...thStyle, textAlign: 'right' }}>Conversions</th>
          <th className="table-cell" style={{ ...thStyle, textAlign: 'right' }}>Sales Generated</th>
          <th className="table-cell" style={{ ...thStyle, textAlign: 'right' }}>Commission</th>
          <th className="table-cell" style={{ ...thStyle, textAlign: 'right' }}>Avg Commission</th>
        </>
      );

    case 'products':
      return (
        <>
          <th className="table-cell" style={{ ...thStyle, textAlign: 'center' }}>Category</th>
          <th className="table-cell" style={{ ...thStyle, textAlign: 'right' }}>Price</th>
          <th className="table-cell" style={{ ...thStyle, textAlign: 'right' }}>Sales</th>
          <th className="table-cell" style={{ ...thStyle, textAlign: 'right' }}>Revenue</th>
          <th className="table-cell" style={{ ...thStyle, textAlign: 'right' }}>CR%</th>
        </>
      );

    case 'fastest-growing':
      return (
        <>
          <th className="table-cell" style={{ ...thStyle, textAlign: 'center' }}>Level</th>
          <th className="table-cell" style={{ ...thStyle, textAlign: 'right' }}>Growth Rate</th>
          <th className="table-cell" style={{ ...thStyle, textAlign: 'right' }}>Last 30d</th>
          <th className="table-cell" style={{ ...thStyle, textAlign: 'right' }}>Prev 30d</th>
          <th className="table-cell" style={{ ...thStyle, textAlign: 'right' }}>Total</th>
        </>
      );

    case 'most-active':
      return (
        <>
          <th className="table-cell" style={{ ...thStyle, textAlign: 'center' }}>Level</th>
          <th className="table-cell" style={{ ...thStyle, textAlign: 'right' }}>Sales</th>
          <th className="table-cell" style={{ ...thStyle, textAlign: 'right' }}>Promotions</th>
          <th className="table-cell" style={{ ...thStyle, textAlign: 'right' }}>Products</th>
          <th className="table-cell" style={{ ...thStyle, textAlign: 'right' }}>Activity Score</th>
        </>
      );

    default:
      return null;
  }
}

function renderTableData(tab: string, item: any) {
  switch (tab) {
    case 'sellers':
      return (
        <>
          <td className="table-cell" style={{ textAlign: 'center' }}>
            <span className="badge badge-info">Level {item.level}</span>
          </td>
          <td className="table-cell" style={{ textAlign: 'right' }}>{item.total_sales}</td>
          <td className="table-cell" style={{ textAlign: 'right', fontWeight: 500 }}>
            €{parseFloat(item.total_revenue).toFixed(2)}
          </td>
          <td className="table-cell" style={{ textAlign: 'right' }}>
            €{parseFloat(item.avg_order_value).toFixed(2)}
          </td>
          <td className="table-cell" style={{ textAlign: 'right', fontWeight: 500, color: 'var(--color-success-light)' }}>
            €{parseFloat(item.total_earnings).toFixed(2)}
          </td>
        </>
      );

    case 'affiliates':
      return (
        <>
          <td className="table-cell" style={{ textAlign: 'center' }}>
            <span className="badge badge-info">Level {item.level}</span>
          </td>
          <td className="table-cell" style={{ textAlign: 'right' }}>{item.total_conversions}</td>
          <td className="table-cell" style={{ textAlign: 'right' }}>
            €{parseFloat(item.total_sales_generated).toFixed(2)}
          </td>
          <td className="table-cell" style={{ textAlign: 'right', fontWeight: 500, color: 'var(--color-success-light)' }}>
            €{parseFloat(item.total_commission).toFixed(2)}
          </td>
          <td className="table-cell" style={{ textAlign: 'right' }}>
            €{parseFloat(item.avg_commission).toFixed(2)}
          </td>
        </>
      );

    case 'products':
      return (
        <>
          <td className="table-cell" style={{ textAlign: 'center' }}>
            <span className="badge">{item.category}</span>
          </td>
          <td className="table-cell" style={{ textAlign: 'right' }}>€{parseFloat(item.price).toFixed(2)}</td>
          <td className="table-cell" style={{ textAlign: 'right' }}>{item.total_sales}</td>
          <td className="table-cell" style={{ textAlign: 'right', fontWeight: 500, color: 'var(--color-success-light)' }}>
            €{parseFloat(item.total_revenue).toFixed(2)}
          </td>
          <td className="table-cell" style={{ textAlign: 'right' }}>
            <span
              style={{
                fontWeight: 500,
                color:
                  item.conversion_rate >= 5
                    ? 'var(--color-success-light)'
                    : item.conversion_rate >= 2
                    ? 'var(--color-warning-light)'
                    : 'var(--color-danger-light)',
              }}
            >
              {parseFloat(item.conversion_rate).toFixed(1)}%
            </span>
          </td>
        </>
      );

    case 'fastest-growing':
      return (
        <>
          <td className="table-cell" style={{ textAlign: 'center' }}>
            <span className="badge badge-info">Level {item.level}</span>
          </td>
          <td className="table-cell" style={{ textAlign: 'right' }}>
            <span style={{ fontWeight: 500, color: 'var(--color-success-light)' }}>
              +{parseFloat(item.growth_rate).toFixed(0)}%
            </span>
          </td>
          <td className="table-cell" style={{ textAlign: 'right' }}>
            €{parseFloat(item.last_30d_revenue).toFixed(2)}
          </td>
          <td className="table-cell" style={{ textAlign: 'right', color: 'var(--color-text-muted)' }}>
            €{parseFloat(item.prev_30d_revenue).toFixed(2)}
          </td>
          <td className="table-cell" style={{ textAlign: 'right', fontWeight: 500 }}>
            €{parseFloat(item.total_revenue).toFixed(2)}
          </td>
        </>
      );

    case 'most-active':
      return (
        <>
          <td className="table-cell" style={{ textAlign: 'center' }}>
            <span className="badge badge-info">Level {item.level}</span>
          </td>
          <td className="table-cell" style={{ textAlign: 'right' }}>{item.sales_count}</td>
          <td className="table-cell" style={{ textAlign: 'right' }}>{item.promotions_count}</td>
          <td className="table-cell" style={{ textAlign: 'right' }}>{item.products_count}</td>
          <td className="table-cell" style={{ textAlign: 'right' }}>
            <span style={{ fontWeight: 500, color: 'var(--color-primary-light)' }}>{item.activity_score}</span>
          </td>
        </>
      );

    default:
      return null;
  }
}
