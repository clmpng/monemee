import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { financialAPI } from '../services/api';
import { TrendingUp, DollarSign, CreditCard, Users, AlertCircle } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import styles from '../styles/pages/common.module.css';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

export default function Financial() {
  const [period, setPeriod] = useState('30d');
  const [transactionPage, setTransactionPage] = useState(1);

  const { data: overview } = useQuery({
    queryKey: ['financial-overview', period],
    queryFn: () => financialAPI.getOverview(period),
  });

  const { data: transactions } = useQuery({
    queryKey: ['financial-transactions', transactionPage],
    queryFn: () => financialAPI.getTransactions({ page: transactionPage, limit: 20 }),
  });

  const { data: payouts } = useQuery({
    queryKey: ['financial-payouts'],
    queryFn: () => financialAPI.getPayouts('pending'),
  });

  const summary = overview?.data?.summary;
  const levelBreakdown = overview?.data?.byLevel || [];

  const chartData = levelBreakdown.map((level: any) => ({
    name: `Level ${level.level}`,
    value: parseFloat(level.platform_fees),
    transactions: level.transactions,
  }));

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className={styles.header}>
          <h1 className={styles.title}>Financial Control Center</h1>
          <p className={styles.subtitle}>Revenue, Transactions & Payouts</p>
        </div>
        <select
          value={period}
          onChange={(e) => setPeriod(e.target.value)}
          className="input"
          style={{ width: 'auto' }}
        >
          <option value="7d">Last 7 Days</option>
          <option value="30d">Last 30 Days</option>
          <option value="90d">Last 90 Days</option>
          <option value="365d">Last Year</option>
        </select>
      </div>

      {/* Revenue Overview */}
      <div className={styles.statsGrid}>
        <div className="card-compact">
          <div className="flex items-center justify-between">
            <div>
              <p className={styles.statLabel}>Total Revenue</p>
              <p className={styles.statValueSmall}>€{parseFloat(summary?.total_revenue || 0).toFixed(2)}</p>
            </div>
            <div className="stat-icon stat-icon-primary">
              <DollarSign size={24} />
            </div>
          </div>
        </div>

        <div className="card-compact">
          <div className="flex items-center justify-between">
            <div>
              <p className={styles.statLabel}>Platform Fees</p>
              <p className={`${styles.statValueSmall} ${styles.statValueSuccess}`}>
                €{parseFloat(summary?.platform_fees || 0).toFixed(2)}
              </p>
            </div>
            <div className="stat-icon stat-icon-success">
              <TrendingUp size={24} />
            </div>
          </div>
          {summary && (
            <p className={styles.statSubtext}>
              {((summary.platform_fees / summary.total_revenue) * 100).toFixed(1)}% of revenue
            </p>
          )}
        </div>

        <div className="card-compact">
          <div className="flex items-center justify-between">
            <div>
              <p className={styles.statLabel}>Seller Payouts</p>
              <p className={styles.statValueSmall}>€{parseFloat(summary?.seller_payouts || 0).toFixed(2)}</p>
            </div>
            <div className="stat-icon stat-icon-purple">
              <CreditCard size={24} />
            </div>
          </div>
        </div>

        <div className="card-compact">
          <div className="flex items-center justify-between">
            <div>
              <p className={styles.statLabel}>Affiliate Commission</p>
              <p className={styles.statValueSmall} style={{ color: 'var(--color-warning-light)' }}>
                €{parseFloat(summary?.affiliate_commissions || 0).toFixed(2)}
              </p>
            </div>
            <div className="stat-icon stat-icon-warning">
              <Users size={24} />
            </div>
          </div>
        </div>
      </div>

      {/* Revenue by Level */}
      <div className={styles.grid2}>
        <div className="card">
          <h2 className={styles.sectionTitle}>Revenue by Level</h2>
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={chartData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label={(entry) => `€${entry.value.toFixed(0)}`}
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: any) => `€${value.toFixed(2)}`} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className={styles.emptyState}>No data available</div>
          )}
        </div>

        <div className="card">
          <h2 className={styles.sectionTitle}>Level Breakdown</h2>
          <div className="space-y-md">
            {levelBreakdown.map((level: any, index: number) => (
              <div
                key={level.level}
                className="flex items-center justify-between"
                style={{
                  padding: 'var(--spacing-md)',
                  backgroundColor: 'var(--color-bg-tertiary)',
                  borderRadius: 'var(--radius-md)',
                }}
              >
                <div className="flex items-center gap-md">
                  <div
                    style={{
                      width: '16px',
                      height: '16px',
                      borderRadius: 'var(--radius-sm)',
                      backgroundColor: COLORS[index % COLORS.length],
                    }}
                  />
                  <div>
                    <p style={{ fontWeight: 500, color: 'var(--color-text-primary)' }}>Level {level.level}</p>
                    <p className={styles.infoText}>{level.transactions} transactions</p>
                  </div>
                </div>
                <p style={{ fontWeight: 600, color: 'var(--color-text-primary)' }}>
                  €{parseFloat(level.platform_fees).toFixed(2)}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Pending Payouts */}
      {payouts?.data && payouts.data.length > 0 && (
        <div className="card">
          <div className="flex items-center justify-between" style={{ marginBottom: 'var(--spacing-md)' }}>
            <h2 className={styles.sectionTitle} style={{ marginBottom: 0 }}>
              Pending Payouts ({payouts.data.length})
            </h2>
            <span className="badge badge-warning">Requires Action</span>
          </div>
          <div className={styles.tableContainer}>
            <table className="table">
              <thead className="table-header">
                <tr>
                  <th>User</th>
                  <th style={{ textAlign: 'right' }}>Amount</th>
                  <th style={{ textAlign: 'right' }}>Fee</th>
                  <th style={{ textAlign: 'right' }}>Net Amount</th>
                  <th>Created</th>
                  <th style={{ textAlign: 'center' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {payouts.data.slice(0, 5).map((payout: any) => (
                  <tr key={payout.id}>
                    <td className="table-cell">
                      <div className={styles.userInfo}>
                        <span className={styles.userName}>{payout.username}</span>
                        <span className={styles.userEmail}>{payout.email}</span>
                      </div>
                    </td>
                    <td className="table-cell" style={{ textAlign: 'right' }}>
                      €{parseFloat(payout.amount).toFixed(2)}
                    </td>
                    <td className="table-cell" style={{ textAlign: 'right', color: 'var(--color-text-tertiary)' }}>
                      €{parseFloat(payout.fee).toFixed(2)}
                    </td>
                    <td className="table-cell" style={{ textAlign: 'right', fontWeight: 500 }}>
                      €{parseFloat(payout.net_amount).toFixed(2)}
                    </td>
                    <td className="table-cell" style={{ fontSize: 'var(--font-size-sm)' }}>
                      {new Date(payout.created_at).toLocaleDateString('de-DE')}
                    </td>
                    <td className="table-cell" style={{ textAlign: 'center' }}>
                      <button className="btn btn-ghost btn-sm">Review</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Recent Transactions */}
      <div className="card">
        <h2 className={styles.sectionTitle}>Recent Transactions</h2>
        {!transactions?.data || transactions.data.length === 0 ? (
          <div className={styles.emptyState}>
            <AlertCircle size={48} className={styles.emptyIcon} />
            <p className={styles.emptyText}>No transactions found</p>
          </div>
        ) : (
          <div className={styles.tableContainer}>
            <table className="table">
              <thead className="table-header">
                <tr>
                  <th>Product</th>
                  <th>Seller</th>
                  <th style={{ textAlign: 'right' }}>Amount</th>
                  <th style={{ textAlign: 'right' }}>Platform Fee</th>
                  <th>Promoter</th>
                  <th>Status</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {transactions.data.map((tx: any) => (
                  <tr key={tx.id}>
                    <td className="table-cell">
                      <span style={{ fontWeight: 500 }}>{tx.product_title}</span>
                    </td>
                    <td className="table-cell">{tx.seller_username}</td>
                    <td className="table-cell" style={{ textAlign: 'right', fontWeight: 500 }}>
                      €{parseFloat(tx.amount).toFixed(2)}
                    </td>
                    <td className="table-cell" style={{ textAlign: 'right', color: 'var(--color-success-light)' }}>
                      €{parseFloat(tx.platform_fee).toFixed(2)}
                    </td>
                    <td className="table-cell" style={{ fontSize: 'var(--font-size-sm)' }}>
                      {tx.promoter_username || '-'}
                      {tx.promoter_commission > 0 && (
                        <span style={{ marginLeft: '4px', color: 'var(--color-text-muted)', fontSize: 'var(--font-size-xs)' }}>
                          (€{parseFloat(tx.promoter_commission).toFixed(2)})
                        </span>
                      )}
                    </td>
                    <td className="table-cell">
                      <span
                        className={`badge ${
                          tx.status === 'completed'
                            ? 'badge-success'
                            : tx.status === 'pending'
                            ? 'badge-warning'
                            : tx.status === 'failed'
                            ? 'badge-danger'
                            : 'badge-info'
                        }`}
                      >
                        {tx.status}
                      </span>
                    </td>
                    <td className="table-cell" style={{ fontSize: 'var(--font-size-sm)' }}>
                      {new Date(tx.created_at).toLocaleString('de-DE')}
                    </td>
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
