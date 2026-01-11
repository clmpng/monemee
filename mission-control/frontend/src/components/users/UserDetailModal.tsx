import { useQuery } from '@tanstack/react-query';
import { usersAPI } from '../../services/api';
import { X, Mail, Calendar, TrendingUp, Package, DollarSign } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface UserDetailModalProps {
  userId: string;
  onClose: () => void;
}

export default function UserDetailModal({ userId, onClose }: UserDetailModalProps) {
  const { data, isLoading } = useQuery({
    queryKey: ['user-detail', userId],
    queryFn: () => usersAPI.getById(userId),
  });

  const user = data?.data?.user;
  const products = data?.data?.products || [];
  const stats = data?.data?.stats;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'var(--overlay-dark)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 50,
        padding: 'var(--spacing-md)',
      }}
    >
      <div
        style={{
          backgroundColor: 'var(--color-bg-card)',
          borderRadius: 'var(--radius-xl)',
          border: '1px solid var(--color-border)',
          maxWidth: '1200px',
          width: '100%',
          maxHeight: '90vh',
          overflowY: 'auto',
        }}
      >
        {/* Header */}
        <div
          style={{
            position: 'sticky',
            top: 0,
            backgroundColor: 'var(--color-bg-card)',
            borderBottom: '1px solid var(--color-border)',
            padding: 'var(--spacing-md) var(--spacing-lg)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            zIndex: 10,
          }}
        >
          <div>
            <h2
              style={{
                fontSize: 'var(--font-size-2xl)',
                fontWeight: 700,
                color: 'var(--color-text-primary)',
              }}
            >
              {user?.username || 'Loading...'}
            </h2>
            <p
              style={{
                fontSize: 'var(--font-size-sm)',
                color: 'var(--color-text-tertiary)',
                marginTop: 'var(--spacing-xs)',
              }}
            >
              User ID: #{userId}
            </p>
          </div>
          <button onClick={onClose} className="btn btn-ghost" style={{ padding: 'var(--spacing-sm)' }}>
            <X size={24} />
          </button>
        </div>

        {isLoading ? (
          <div className="flex-center" style={{ padding: 'var(--spacing-2xl)' }}>
            <div className="spinner spinner-lg"></div>
          </div>
        ) : (
          <div style={{ padding: 'var(--spacing-lg)', display: 'flex', flexDirection: 'column', gap: 'var(--spacing-lg)' }}>
            {/* Basic Info */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 'var(--spacing-lg)' }}>
              <div className="card-compact">
                <h3 style={{ fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: 'var(--spacing-md)' }}>
                  Basic Info
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-sm)' }}>
                  <div className="flex items-center gap-sm" style={{ fontSize: 'var(--font-size-sm)' }}>
                    <Mail size={16} style={{ color: 'var(--color-text-muted)' }} />
                    <span style={{ color: 'var(--color-text-secondary)' }}>{user.email}</span>
                  </div>
                  <div className="flex items-center gap-sm" style={{ fontSize: 'var(--font-size-sm)' }}>
                    <Calendar size={16} style={{ color: 'var(--color-text-muted)' }} />
                    <span style={{ color: 'var(--color-text-secondary)' }}>
                      Joined {new Date(user.created_at).toLocaleDateString('de-DE')}
                    </span>
                  </div>
                  <div className="flex items-start gap-sm" style={{ fontSize: 'var(--font-size-sm)' }}>
                    <Package size={16} style={{ color: 'var(--color-text-muted)', marginTop: '2px' }} />
                    <div>
                      <p style={{ color: 'var(--color-text-primary)', fontWeight: 500 }}>
                        Level {user.level} -{' '}
                        {user.level === 1
                          ? 'Starter'
                          : user.level === 2
                          ? 'Rising Star'
                          : user.level === 3
                          ? 'Creator'
                          : user.level === 4
                          ? 'Pro'
                          : 'Elite'}
                      </p>
                      <p style={{ color: 'var(--color-text-secondary)', textTransform: 'capitalize' }}>
                        Role: {user.role}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="card-compact">
                <h3 style={{ fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: 'var(--spacing-md)' }}>
                  Financial Stats
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-sm)' }}>
                  <div>
                    <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-tertiary)' }}>Total Earnings</p>
                    <p style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 700, color: 'var(--color-success-light)' }}>
                      €{parseFloat(user.total_earnings || 0).toFixed(2)}
                    </p>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 'var(--spacing-md)' }}>
                    <div>
                      <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-tertiary)' }}>Total Sales</p>
                      <p style={{ fontSize: 'var(--font-size-xl)', fontWeight: 700, color: 'var(--color-text-primary)' }}>
                        {stats?.sales?.total_sales || 0}
                      </p>
                    </div>
                    <div>
                      <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-tertiary)' }}>Avg Order</p>
                      <p style={{ fontSize: 'var(--font-size-xl)', fontWeight: 700, color: 'var(--color-text-primary)' }}>
                        €{parseFloat(stats?.sales?.avg_order_value || 0).toFixed(2)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Stripe Status */}
            <div className="card-compact">
              <h3 style={{ fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: 'var(--spacing-md)' }}>
                Stripe Connect Status
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--spacing-md)' }}>
                <div>
                  <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-tertiary)' }}>Account Status</p>
                  <span
                    className={`badge ${user.stripe_account_status === 'enabled' ? 'badge-success' : 'badge-warning'}`}
                    style={{ marginTop: 'var(--spacing-xs)' }}
                  >
                    {user.stripe_account_status || 'Not set up'}
                  </span>
                </div>
                <div>
                  <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-tertiary)' }}>Charges Enabled</p>
                  <p style={{ fontSize: 'var(--font-size-sm)', fontWeight: 500, marginTop: 'var(--spacing-xs)', color: 'var(--color-text-primary)' }}>
                    {user.stripe_charges_enabled ? '✓ Yes' : '✗ No'}
                  </p>
                </div>
                <div>
                  <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-tertiary)' }}>Payouts Enabled</p>
                  <p style={{ fontSize: 'var(--font-size-sm)', fontWeight: 500, marginTop: 'var(--spacing-xs)', color: 'var(--color-text-primary)' }}>
                    {user.stripe_payouts_enabled ? '✓ Yes' : '✗ No'}
                  </p>
                </div>
              </div>
            </div>

            {/* Earnings Trend */}
            {stats?.earningsTrend && stats.earningsTrend.length > 0 && (
              <div className="card-compact">
                <h3 style={{ fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: 'var(--spacing-md)' }}>
                  Earnings Trend (Last 30 Days)
                </h3>
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={stats.earningsTrend}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                    <XAxis
                      dataKey="date"
                      tick={{ fontSize: 12, fill: 'var(--color-text-tertiary)' }}
                      tickFormatter={(value) =>
                        new Date(value).toLocaleDateString('de-DE', { month: 'short', day: 'numeric' })
                      }
                    />
                    <YAxis tick={{ fontSize: 12, fill: 'var(--color-text-tertiary)' }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'var(--color-bg-card)',
                        border: '1px solid var(--color-border)',
                        borderRadius: 'var(--radius-md)',
                      }}
                      formatter={(value: any) => `€${value}`}
                      labelFormatter={(label) => new Date(label).toLocaleDateString('de-DE')}
                    />
                    <Line type="monotone" dataKey="earnings" stroke="#10b981" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Products */}
            <div className="card-compact">
              <h3 style={{ fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: 'var(--spacing-md)' }}>
                Products ({products.length})
              </h3>
              {products.length === 0 ? (
                <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)' }}>Keine Produkte</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-sm)' }}>
                  {products.map((product: any) => (
                    <div
                      key={product.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: 'var(--spacing-md)',
                        backgroundColor: 'var(--color-bg-tertiary)',
                        borderRadius: 'var(--radius-md)',
                      }}
                    >
                      <div style={{ flex: 1 }}>
                        <p style={{ fontWeight: 500, color: 'var(--color-text-primary)' }}>{product.title}</p>
                        <div
                          className="flex items-center gap-md"
                          style={{ marginTop: 'var(--spacing-xs)', fontSize: 'var(--font-size-sm)', color: 'var(--color-text-tertiary)' }}
                        >
                          <span>€{parseFloat(product.price).toFixed(2)}</span>
                          <span>•</span>
                          <span>{product.sales} Sales</span>
                          <span>•</span>
                          <span>{product.views} Views</span>
                        </div>
                      </div>
                      <span className={`badge ${product.status === 'active' ? 'badge-success' : 'badge-warning'}`}>
                        {product.status}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Affiliate Stats */}
            {stats?.affiliate && parseInt(stats.affiliate.total_conversions) > 0 && (
              <div className="card-compact">
                <h3 style={{ fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: 'var(--spacing-md)' }}>
                  Affiliate Performance
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 'var(--spacing-md)' }}>
                  <div>
                    <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-tertiary)' }}>Total Conversions</p>
                    <p style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 700, color: 'var(--color-text-primary)' }}>
                      {stats.affiliate.total_conversions}
                    </p>
                  </div>
                  <div>
                    <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-tertiary)' }}>Total Commission</p>
                    <p style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 700, color: 'var(--color-success-light)' }}>
                      €{parseFloat(stats.affiliate.total_commission || 0).toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
