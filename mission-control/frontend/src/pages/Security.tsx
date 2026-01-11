import { useQuery } from '@tanstack/react-query';
import { securityAPI } from '../services/api';
import { Shield, AlertTriangle, CheckCircle, Clock, X } from 'lucide-react';
import styles from '../styles/pages/common.module.css';

export default function Security() {
  const { data: overview } = useQuery({
    queryKey: ['security-overview'],
    queryFn: securityAPI.getOverview,
    refetchInterval: 60000,
  });

  const { data: auditLog } = useQuery({
    queryKey: ['security-audit-log'],
    queryFn: securityAPI.getAuditLog,
  });

  const securityStatus = overview?.data;
  const logs = auditLog?.data || [];

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <h1 className={styles.title}>Security & Compliance</h1>
        <p className={styles.subtitle}>Audit Logs & Security Monitoring</p>
      </div>

      {/* Security Status */}
      <div className="card">
        <div className="flex items-center gap-md" style={{ marginBottom: 'var(--spacing-lg)' }}>
          {securityStatus?.status === 'all_clear' ? (
            <>
              <CheckCircle style={{ color: 'var(--color-success-light)' }} size={32} />
              <div>
                <h2 style={{ fontSize: 'var(--font-size-xl)', fontWeight: 600, color: 'var(--color-success-light)' }}>
                  All Systems Secure
                </h2>
                <p className={styles.infoText}>No active threats detected</p>
              </div>
            </>
          ) : (
            <>
              <AlertTriangle style={{ color: 'var(--color-warning-light)' }} size={32} />
              <div>
                <h2 style={{ fontSize: 'var(--font-size-xl)', fontWeight: 600, color: 'var(--color-warning-light)' }}>
                  Security Alert
                </h2>
                <p className={styles.infoText}>Active threats detected</p>
              </div>
            </>
          )}
        </div>

        {/* Last 24h Metrics */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 'var(--spacing-md)' }}>
          <div className="card-compact" style={{ backgroundColor: 'var(--color-bg-tertiary)' }}>
            <p className={styles.statLabel}>Failed Logins</p>
            <p className={styles.statValueSmall}>{securityStatus?.last24h?.failedLogins || 0}</p>
            <span className={styles.statSubtext}>Normal range: 15-35</span>
          </div>

          <div className="card-compact" style={{ backgroundColor: 'var(--color-bg-tertiary)' }}>
            <p className={styles.statLabel}>Suspicious IPs</p>
            <p className={styles.statValueSmall} style={{ color: 'var(--color-warning-light)' }}>
              {securityStatus?.last24h?.suspiciousIPs || 0}
            </p>
            <span className={styles.statSubtext}>Blocked</span>
          </div>

          <div className="card-compact" style={{ backgroundColor: 'var(--color-bg-tertiary)' }}>
            <p className={styles.statLabel}>CORS Violations</p>
            <p className={styles.statValueSmall}>{securityStatus?.last24h?.corsViolations || 0}</p>
          </div>

          <div className="card-compact" style={{ backgroundColor: 'var(--color-bg-tertiary)' }}>
            <p className={styles.statLabel}>Rate Limited</p>
            <p className={styles.statValueSmall}>{securityStatus?.last24h?.rateLimited || 0}</p>
          </div>

          <div className="card-compact" style={{ backgroundColor: 'var(--color-bg-tertiary)' }}>
            <p className={styles.statLabel}>Webhook Failures</p>
            <p className={`${styles.statValueSmall} ${styles.statValueDanger}`}>
              {securityStatus?.last24h?.webhookFailures || 0}
            </p>
          </div>
        </div>

        {/* Active Threats */}
        {securityStatus?.activeThreats > 0 && (
          <div className="alert alert-danger" style={{ marginTop: 'var(--spacing-lg)' }}>
            <div className="flex items-center gap-sm">
              <X size={20} />
              <p style={{ fontWeight: 600 }}>{securityStatus.activeThreats} Active Threats Detected</p>
            </div>
            <p style={{ fontSize: 'var(--font-size-sm)', marginTop: 'var(--spacing-sm)' }}>
              Immediate action required. Check audit log for details.
            </p>
          </div>
        )}
      </div>

      {/* Audit Log */}
      <div className="card">
        <h2 className={styles.sectionTitle}>Audit Trail (Last 20 Actions)</h2>

        {logs.length === 0 ? (
          <div className={styles.emptyState}>
            <Clock size={48} className={styles.emptyIcon} />
            <p className={styles.emptyText}>No audit logs available</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-sm)' }}>
            {logs.map((log: any, index: number) => (
              <div
                key={index}
                className="flex items-start justify-between"
                style={{
                  padding: 'var(--spacing-md)',
                  backgroundColor: 'var(--color-bg-tertiary)',
                  borderRadius: 'var(--radius-md)',
                  transition: 'background-color var(--transition-fast)',
                }}
              >
                <div className="flex items-start gap-md">
                  <div
                    style={{
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      backgroundColor: 'var(--color-primary-light)',
                      marginTop: '8px',
                    }}
                  />
                  <div>
                    <p style={{ fontWeight: 500 }}>{formatAction(log.action)}</p>
                    <p className={styles.infoText} style={{ marginTop: 'var(--spacing-xs)' }}>
                      User: <span style={{ fontWeight: 500 }}>{log.username}</span>
                    </p>
                    {log.details && (
                      <div className={styles.mono} style={{ marginTop: 'var(--spacing-xs)', color: 'var(--color-text-muted)' }}>
                        {JSON.stringify(log.details)}
                      </div>
                    )}
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <p className={styles.infoText}>{new Date(log.timestamp).toLocaleDateString('de-DE')}</p>
                  <p className={styles.statSubtext}>{new Date(log.timestamp).toLocaleTimeString('de-DE')}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Compliance Section */}
      <div className="card">
        <h2 className={styles.sectionTitle}>GDPR Compliance Status</h2>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--spacing-md)' }}>
          <div
            className="flex items-center gap-md"
            style={{ padding: 'var(--spacing-md)', backgroundColor: 'var(--color-success-50)', borderRadius: 'var(--radius-md)' }}
          >
            <CheckCircle style={{ color: 'var(--color-success-light)' }} size={24} />
            <div>
              <p style={{ fontWeight: 500, color: 'var(--color-success-light)' }}>Cookie Consent</p>
              <p className={styles.infoText}>Implemented</p>
            </div>
          </div>

          <div
            className="flex items-center gap-md"
            style={{ padding: 'var(--spacing-md)', backgroundColor: 'var(--color-success-50)', borderRadius: 'var(--radius-md)' }}
          >
            <CheckCircle style={{ color: 'var(--color-success-light)' }} size={24} />
            <div>
              <p style={{ fontWeight: 500, color: 'var(--color-success-light)' }}>Data Encryption</p>
              <p className={styles.infoText}>SSL/TLS Active</p>
            </div>
          </div>

          <div
            className="flex items-center gap-md"
            style={{ padding: 'var(--spacing-md)', backgroundColor: 'var(--color-success-50)', borderRadius: 'var(--radius-md)' }}
          >
            <CheckCircle style={{ color: 'var(--color-success-light)' }} size={24} />
            <div>
              <p style={{ fontWeight: 500, color: 'var(--color-success-light)' }}>Audit Logging</p>
              <p className={styles.infoText}>Active</p>
            </div>
          </div>
        </div>

        <div style={{ marginTop: 'var(--spacing-md)', padding: 'var(--spacing-md)', backgroundColor: 'var(--color-bg-tertiary)', borderRadius: 'var(--radius-md)' }}>
          <h3 style={{ fontWeight: 500, marginBottom: 'var(--spacing-sm)' }}>Data Retention Policy</h3>
          <p className={styles.infoText} style={{ lineHeight: 1.8 }}>
            User data: Retained until account deletion <br />
            Transaction logs: 7 years (legal requirement) <br />
            Audit logs: 90 days <br />
            Analytics data: Anonymized after 30 days
          </p>
        </div>
      </div>
    </div>
  );
}

function formatAction(action: string): string {
  const actionMap: Record<string, string> = {
    product_created: 'Product Created',
    user_created: 'User Registered',
    payout_requested: 'Payout Requested',
    transaction_completed: 'Transaction Completed',
    login_failed: 'Failed Login Attempt',
    access_denied: 'Access Denied',
  };

  return actionMap[action] || action.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());
}
