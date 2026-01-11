import { useQuery } from '@tanstack/react-query';
import { analyticsAPI } from '../services/api';
import { TrendingUp, Package, ShoppingCart, Users, Target } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import styles from '../styles/pages/common.module.css';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#ec4899', '#84cc16'];

export default function Analytics() {
  const { data: products } = useQuery({
    queryKey: ['analytics-products'],
    queryFn: analyticsAPI.getProducts,
  });

  const { data: funnel } = useQuery({
    queryKey: ['analytics-funnel'],
    queryFn: analyticsAPI.getFunnel,
  });

  const topProducts = products?.data || [];
  const funnelData = funnel?.data;

  const productChartData = topProducts.slice(0, 8).map((p: any) => ({
    name: p.title.length > 20 ? p.title.substring(0, 20) + '...' : p.title,
    revenue: parseFloat(p.total_revenue),
    sales: p.sales,
  }));

  const funnelStages = funnelData
    ? [
        { name: 'Registered', value: funnelData.registered.count, percentage: funnelData.registered.percentage, icon: Users },
        { name: 'Created Product', value: funnelData.createdProduct.count, percentage: funnelData.createdProduct.percentage, icon: Package },
        { name: 'Published', value: funnelData.published.count, percentage: funnelData.published.percentage, icon: Target },
        { name: 'First Sale', value: funnelData.firstSale.count, percentage: funnelData.firstSale.percentage, icon: ShoppingCart },
        { name: 'Level 2+', value: funnelData.levelTwo.count, percentage: funnelData.levelTwo.percentage, icon: TrendingUp },
      ]
    : [];

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <h1 className={styles.title}>Analytics & Insights</h1>
        <p className={styles.subtitle}>Product Performance & Conversion Funnel</p>
      </div>

      {/* Conversion Funnel */}
      <div className="card">
        <h2 className={styles.sectionTitle} style={{ marginBottom: 'var(--spacing-lg)' }}>User Conversion Funnel</h2>

        {funnelStages.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
            {funnelStages.map((stage, index) => {
              const Icon = stage.icon;
              const dropOff = index > 0 ? funnelStages[index - 1].percentage - stage.percentage : 0;

              return (
                <div key={stage.name} style={{ position: 'relative' }}>
                  <div className="flex items-center gap-md">
                    <div className="flex items-center gap-sm" style={{ width: '140px' }}>
                      <Icon size={18} style={{ color: 'var(--color-text-tertiary)' }} />
                      <span style={{ fontSize: 'var(--font-size-sm)', fontWeight: 500 }}>{stage.name}</span>
                    </div>

                    <div style={{ flex: 1, position: 'relative' }}>
                      <div
                        style={{
                          height: '48px',
                          backgroundColor: 'var(--color-bg-tertiary)',
                          borderRadius: 'var(--radius-md)',
                          overflow: 'hidden',
                        }}
                      >
                        <div
                          className="flex items-center justify-between"
                          style={{
                            height: '100%',
                            width: `${stage.percentage}%`,
                            background: 'var(--gradient-primary)',
                            padding: '0 var(--spacing-md)',
                            transition: 'all 0.5s',
                          }}
                        >
                          <span style={{ color: 'white', fontWeight: 600 }}>{stage.value.toLocaleString()}</span>
                          <span style={{ color: 'white', fontWeight: 600 }}>{stage.percentage}%</span>
                        </div>
                      </div>

                      {dropOff > 0 && (
                        <div
                          style={{
                            position: 'absolute',
                            right: 0,
                            top: '-20px',
                            fontSize: 'var(--font-size-xs)',
                            color: 'var(--color-danger-light)',
                            fontWeight: 500,
                          }}
                        >
                          ↓ {dropOff.toFixed(1)}% drop-off
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className={styles.emptyState}>Loading funnel data...</div>
        )}

        {funnelData && (
          <div
            className={styles.statsGrid}
            style={{
              gridTemplateColumns: 'repeat(3, 1fr)',
              marginTop: 'var(--spacing-xl)',
              paddingTop: 'var(--spacing-lg)',
              borderTop: '1px solid var(--color-border)',
            }}
          >
            <div style={{ textAlign: 'center' }}>
              <p className={styles.statLabel}>Overall Conversion</p>
              <p style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 700, color: 'var(--color-primary-light)' }}>
                {((funnelData.firstSale.count / funnelData.registered.count) * 100).toFixed(1)}%
              </p>
              <p className={styles.statSubtext}>Registered → First Sale</p>
            </div>
            <div style={{ textAlign: 'center' }}>
              <p className={styles.statLabel}>Activation Rate</p>
              <p style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 700, color: 'var(--color-success-light)' }}>
                {funnelData.createdProduct.percentage.toFixed(1)}%
              </p>
              <p className={styles.statSubtext}>Users who created product</p>
            </div>
            <div style={{ textAlign: 'center' }}>
              <p className={styles.statLabel}>Monetization</p>
              <p style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 700, color: 'var(--color-warning-light)' }}>
                {funnelData.firstSale.percentage.toFixed(1)}%
              </p>
              <p className={styles.statSubtext}>Users who made sale</p>
            </div>
          </div>
        )}
      </div>

      {/* Top Products by Revenue */}
      <div className="card">
        <h2 className={styles.sectionTitle}>Top Products by Revenue</h2>

        {productChartData.length > 0 ? (
          <>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={productChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: 'var(--color-text-tertiary)' }} angle={-45} textAnchor="end" height={100} />
                <YAxis tick={{ fontSize: 12, fill: 'var(--color-text-tertiary)' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'var(--color-bg-card)',
                    border: '1px solid var(--color-border)',
                    borderRadius: 'var(--radius-md)',
                  }}
                  formatter={(value: any, name: string) => {
                    if (name === 'revenue') return [`€${value.toFixed(2)}`, 'Revenue'];
                    return [value, 'Sales'];
                  }}
                />
                <Bar dataKey="revenue" fill="#10b981" name="Revenue">
                  {productChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>

            <div className={styles.tableContainer} style={{ marginTop: 'var(--spacing-lg)' }}>
              <table className="table">
                <thead className="table-header">
                  <tr>
                    <th>Rank</th>
                    <th>Product</th>
                    <th>Creator</th>
                    <th style={{ textAlign: 'right' }}>Price</th>
                    <th style={{ textAlign: 'right' }}>Sales</th>
                    <th style={{ textAlign: 'right' }}>Views</th>
                    <th style={{ textAlign: 'right' }}>CR%</th>
                    <th style={{ textAlign: 'right' }}>Revenue</th>
                  </tr>
                </thead>
                <tbody>
                  {topProducts.map((product: any, index: number) => (
                    <tr key={product.id}>
                      <td className="table-cell">
                        <span style={{ fontWeight: 700, color: 'var(--color-primary-light)' }}>#{index + 1}</span>
                      </td>
                      <td className="table-cell">
                        <div>
                          <p style={{ fontWeight: 500 }}>{product.title}</p>
                          <p className={styles.statSubtext}>{product.category}</p>
                        </div>
                      </td>
                      <td className="table-cell">{product.creator}</td>
                      <td className="table-cell" style={{ textAlign: 'right' }}>
                        €{parseFloat(product.price).toFixed(2)}
                      </td>
                      <td className="table-cell" style={{ textAlign: 'right', fontWeight: 500 }}>
                        {product.sales}
                      </td>
                      <td className="table-cell" style={{ textAlign: 'right' }}>{product.views}</td>
                      <td className="table-cell" style={{ textAlign: 'right' }}>
                        <span
                          style={{
                            fontWeight: 500,
                            color:
                              product.conversion_rate >= 5
                                ? 'var(--color-success-light)'
                                : product.conversion_rate >= 2
                                ? 'var(--color-warning-light)'
                                : 'var(--color-danger-light)',
                          }}
                        >
                          {parseFloat(product.conversion_rate).toFixed(1)}%
                        </span>
                      </td>
                      <td className="table-cell" style={{ textAlign: 'right', fontWeight: 600, color: 'var(--color-success-light)' }}>
                        €{parseFloat(product.total_revenue).toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        ) : (
          <div className={styles.emptyState}>
            <Package size={48} className={styles.emptyIcon} />
            <p className={styles.emptyText}>No product data available</p>
          </div>
        )}
      </div>
    </div>
  );
}
