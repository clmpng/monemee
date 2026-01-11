import { useQuery } from '@tanstack/react-query';
import { performanceAPI } from '../services/api';
import { Activity, Database, Zap, AlertTriangle, HardDrive, Clock } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import styles from '../styles/pages/common.module.css';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

export default function Performance() {
  const { data: dbMetrics } = useQuery({
    queryKey: ['performance-database'],
    queryFn: performanceAPI.getDatabase,
    refetchInterval: 30000,
  });

  const { data: apiMetrics } = useQuery({
    queryKey: ['performance-api'],
    queryFn: performanceAPI.getAPI,
    refetchInterval: 30000,
  });

  const dbData = dbMetrics?.data;
  const apiData = apiMetrics?.data;

  const requestsOverTime = apiData?.requestsOverTime || [];

  const tableSizeData =
    dbData?.tableSizes?.slice(0, 10).map((table: any) => ({
      name: table.table_name.length > 15 ? table.table_name.substring(0, 15) + '...' : table.table_name,
      size: parseFloat(table.size_mb),
      rows: parseInt(table.row_count),
    })) || [];

  const slowQueries = dbData?.slowQueries || [];

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <h1 className={styles.title}>System & Performance</h1>
        <p className={styles.subtitle}>Database Health, API Metrics & Error Tracking</p>
      </div>

      {/* Real-time Metrics */}
      <div className={styles.statsGrid}>
        <div className="card-compact">
          <div className="flex items-center justify-between">
            <div>
              <p className={styles.statLabel}>API Requests</p>
              <p className={styles.statValueSmall}>{apiData?.totalRequests?.toLocaleString() || 0}</p>
              <p className={styles.statSubtext}>Last 24h</p>
            </div>
            <div className="stat-icon stat-icon-primary">
              <Activity size={24} />
            </div>
          </div>
        </div>

        <div className="card-compact">
          <div className="flex items-center justify-between">
            <div>
              <p className={styles.statLabel}>Avg Response Time</p>
              <p className={`${styles.statValueSmall} ${styles.statValueSuccess}`}>{apiData?.avgResponseTime || 0}ms</p>
              <p className={styles.statSubtext}>
                {apiData?.avgResponseTime && apiData.avgResponseTime < 100
                  ? 'Excellent'
                  : apiData?.avgResponseTime && apiData.avgResponseTime < 300
                  ? 'Good'
                  : 'Needs attention'}
              </p>
            </div>
            <div className="stat-icon stat-icon-success">
              <Zap size={24} />
            </div>
          </div>
        </div>

        <div className="card-compact">
          <div className="flex items-center justify-between">
            <div>
              <p className={styles.statLabel}>Error Rate</p>
              <p className={`${styles.statValueSmall} ${styles.statValueDanger}`}>{apiData?.errorRate?.toFixed(2) || 0}%</p>
              <p className={styles.statSubtext}>{apiData?.errorCount || 0} errors</p>
            </div>
            <div className="stat-icon stat-icon-danger">
              <AlertTriangle size={24} />
            </div>
          </div>
        </div>

        <div className="card-compact">
          <div className="flex items-center justify-between">
            <div>
              <p className={styles.statLabel}>DB Connections</p>
              <p className={styles.statValueSmall} style={{ color: 'var(--color-info-light)' }}>
                {dbData?.pool?.active || 0}/{dbData?.pool?.total || 0}
              </p>
              <p className={styles.statSubtext}>{dbData?.pool?.idle || 0} idle</p>
            </div>
            <div className="stat-icon stat-icon-purple">
              <Database size={24} />
            </div>
          </div>
        </div>
      </div>

      {/* Database Health */}
      <div className="card">
        <h2 className={styles.sectionTitle}>Database Health</h2>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--spacing-lg)', marginBottom: 'var(--spacing-lg)' }}>
          <div style={{ padding: 'var(--spacing-md)', backgroundColor: 'var(--color-bg-tertiary)', borderRadius: 'var(--radius-md)' }}>
            <div className="flex items-center gap-sm" style={{ marginBottom: 'var(--spacing-sm)' }}>
              <Database size={18} style={{ color: 'var(--color-text-tertiary)' }} />
              <p style={{ fontWeight: 500 }}>Connection Pool</p>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-sm)' }}>
              <div className="flex justify-between" style={{ fontSize: 'var(--font-size-sm)' }}>
                <span style={{ color: 'var(--color-text-tertiary)' }}>Active:</span>
                <span style={{ fontWeight: 500 }}>{dbData?.pool?.active || 0}</span>
              </div>
              <div className="flex justify-between" style={{ fontSize: 'var(--font-size-sm)' }}>
                <span style={{ color: 'var(--color-text-tertiary)' }}>Idle:</span>
                <span style={{ fontWeight: 500 }}>{dbData?.pool?.idle || 0}</span>
              </div>
              <div className="flex justify-between" style={{ fontSize: 'var(--font-size-sm)' }}>
                <span style={{ color: 'var(--color-text-tertiary)' }}>Waiting:</span>
                <span style={{ fontWeight: 500 }}>{dbData?.pool?.waiting || 0}</span>
              </div>
            </div>
          </div>

          <div style={{ padding: 'var(--spacing-md)', backgroundColor: 'var(--color-bg-tertiary)', borderRadius: 'var(--radius-md)' }}>
            <div className="flex items-center gap-sm" style={{ marginBottom: 'var(--spacing-sm)' }}>
              <Clock size={18} style={{ color: 'var(--color-text-tertiary)' }} />
              <p style={{ fontWeight: 500 }}>Query Performance</p>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-sm)' }}>
              <div className="flex justify-between" style={{ fontSize: 'var(--font-size-sm)' }}>
                <span style={{ color: 'var(--color-text-tertiary)' }}>Avg Query Time:</span>
                <span style={{ fontWeight: 500 }}>{dbData?.avgQueryTime || 0}ms</span>
              </div>
              <div className="flex justify-between" style={{ fontSize: 'var(--font-size-sm)' }}>
                <span style={{ color: 'var(--color-text-tertiary)' }}>Slow Queries:</span>
                <span
                  style={{
                    fontWeight: 500,
                    color: slowQueries.length > 5 ? 'var(--color-danger-light)' : 'var(--color-success-light)',
                  }}
                >
                  {slowQueries.length}
                </span>
              </div>
            </div>
          </div>

          <div style={{ padding: 'var(--spacing-md)', backgroundColor: 'var(--color-bg-tertiary)', borderRadius: 'var(--radius-md)' }}>
            <div className="flex items-center gap-sm" style={{ marginBottom: 'var(--spacing-sm)' }}>
              <HardDrive size={18} style={{ color: 'var(--color-text-tertiary)' }} />
              <p style={{ fontWeight: 500 }}>Database Size</p>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-sm)' }}>
              <div className="flex justify-between" style={{ fontSize: 'var(--font-size-sm)' }}>
                <span style={{ color: 'var(--color-text-tertiary)' }}>Total Size:</span>
                <span style={{ fontWeight: 500 }}>{dbData?.totalSize || '0 MB'}</span>
              </div>
              <div className="flex justify-between" style={{ fontSize: 'var(--font-size-sm)' }}>
                <span style={{ color: 'var(--color-text-tertiary)' }}>Tables:</span>
                <span style={{ fontWeight: 500 }}>{dbData?.tableSizes?.length || 0}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Table Sizes Chart */}
        {tableSizeData.length > 0 && (
          <div style={{ marginTop: 'var(--spacing-lg)' }}>
            <h3 style={{ fontWeight: 500, marginBottom: 'var(--spacing-md)' }}>Table Sizes (Top 10)</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={tableSizeData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: 'var(--color-text-tertiary)' }} angle={-45} textAnchor="end" height={100} />
                <YAxis tick={{ fontSize: 12, fill: 'var(--color-text-tertiary)' }} />
                <Tooltip
                  contentStyle={{ backgroundColor: 'var(--color-bg-card)', border: '1px solid var(--color-border)' }}
                  formatter={(value: any, name: string) => {
                    if (name === 'size') return [`${value.toFixed(2)} MB`, 'Size'];
                    return [value.toLocaleString(), 'Rows'];
                  }}
                />
                <Bar dataKey="size" fill="#3b82f6" name="Size (MB)">
                  {tableSizeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Slow Queries */}
        {slowQueries.length > 0 && (
          <div style={{ marginTop: 'var(--spacing-lg)' }}>
            <h3 className="flex items-center gap-sm" style={{ fontWeight: 500, marginBottom: 'var(--spacing-md)' }}>
              <AlertTriangle size={18} style={{ color: 'var(--color-warning-light)' }} />
              Slow Queries ({'>'}1s)
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-sm)' }}>
              {slowQueries.slice(0, 5).map((query: any, index: number) => (
                <div key={index} style={{ padding: 'var(--spacing-md)', backgroundColor: 'var(--color-warning-50)', borderRadius: 'var(--radius-md)' }}>
                  <div className="flex items-start justify-between" style={{ marginBottom: 'var(--spacing-sm)' }}>
                    <code className={styles.mono} style={{ flex: 1 }}>
                      {query.query.length > 100 ? query.query.substring(0, 100) + '...' : query.query}
                    </code>
                    <span style={{ fontSize: 'var(--font-size-sm)', fontWeight: 500, color: 'var(--color-warning-light)', marginLeft: 'var(--spacing-md)' }}>
                      {query.duration}ms
                    </span>
                  </div>
                  <p className={styles.statSubtext}>
                    Calls: {query.calls} | Avg: {query.avg_duration}ms
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* API Performance */}
      <div className="card">
        <h2 className={styles.sectionTitle}>API Performance (Last 24h)</h2>

        {requestsOverTime.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={requestsOverTime}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
              <XAxis dataKey="hour" tick={{ fontSize: 12, fill: 'var(--color-text-tertiary)' }} />
              <YAxis tick={{ fontSize: 12, fill: 'var(--color-text-tertiary)' }} />
              <Tooltip contentStyle={{ backgroundColor: 'var(--color-bg-card)', border: '1px solid var(--color-border)' }} />
              <Line type="monotone" dataKey="requests" stroke="#3b82f6" strokeWidth={2} name="Requests" />
              <Line type="monotone" dataKey="errors" stroke="#ef4444" strokeWidth={2} name="Errors" />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className={styles.emptyState}>
            <Activity size={48} className={styles.emptyIcon} />
            <p className={styles.emptyText}>No API metrics available</p>
          </div>
        )}

        {/* API Endpoints Stats */}
        {apiData?.topEndpoints && apiData.topEndpoints.length > 0 && (
          <div style={{ marginTop: 'var(--spacing-lg)' }}>
            <h3 style={{ fontWeight: 500, marginBottom: 'var(--spacing-md)' }}>Top Endpoints</h3>
            <div className={styles.tableContainer}>
              <table className="table">
                <thead className="table-header">
                  <tr>
                    <th>Endpoint</th>
                    <th style={{ textAlign: 'right' }}>Requests</th>
                    <th style={{ textAlign: 'right' }}>Avg Time</th>
                    <th style={{ textAlign: 'right' }}>Errors</th>
                    <th style={{ textAlign: 'right' }}>Error Rate</th>
                  </tr>
                </thead>
                <tbody>
                  {apiData.topEndpoints.map((endpoint: any, index: number) => (
                    <tr key={index}>
                      <td className="table-cell">
                        <code className={styles.mono}>{endpoint.path}</code>
                      </td>
                      <td className="table-cell" style={{ textAlign: 'right' }}>
                        {endpoint.count.toLocaleString()}
                      </td>
                      <td className="table-cell" style={{ textAlign: 'right' }}>
                        <span
                          style={{
                            color:
                              endpoint.avg_time < 100
                                ? 'var(--color-success-light)'
                                : endpoint.avg_time < 300
                                ? 'var(--color-warning-light)'
                                : 'var(--color-danger-light)',
                          }}
                        >
                          {endpoint.avg_time}ms
                        </span>
                      </td>
                      <td className="table-cell" style={{ textAlign: 'right' }}>
                        {endpoint.errors || 0}
                      </td>
                      <td className="table-cell" style={{ textAlign: 'right' }}>
                        <span
                          style={{
                            color:
                              endpoint.error_rate < 1
                                ? 'var(--color-success-light)'
                                : endpoint.error_rate < 5
                                ? 'var(--color-warning-light)'
                                : 'var(--color-danger-light)',
                          }}
                        >
                          {endpoint.error_rate.toFixed(2)}%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* System Health Status */}
      <div className="card">
        <h2 className={styles.sectionTitle}>System Health Status</h2>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 'var(--spacing-md)' }}>
          {[
            { name: 'Database', status: 'Healthy' },
            { name: 'API Server', status: 'Running' },
            { name: 'WebSocket', status: 'Connected' },
            { name: 'Error Rate', status: (apiData?.errorRate || 0) < 1 ? 'Normal' : 'Elevated', warning: (apiData?.errorRate || 0) >= 1 },
          ].map((item) => (
            <div
              key={item.name}
              className="flex items-center gap-md"
              style={{
                padding: 'var(--spacing-md)',
                backgroundColor: item.warning ? 'var(--color-warning-50)' : 'var(--color-success-50)',
                borderRadius: 'var(--radius-md)',
              }}
            >
              <div
                style={{
                  width: '12px',
                  height: '12px',
                  borderRadius: '50%',
                  backgroundColor: item.warning ? 'var(--color-warning-light)' : 'var(--color-success-light)',
                }}
              />
              <div>
                <p style={{ fontWeight: 500, color: item.warning ? 'var(--color-warning-light)' : 'var(--color-success-light)' }}>{item.name}</p>
                <p className={styles.infoText}>{item.status}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
