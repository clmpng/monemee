import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { securityCenterAPI } from '../services/api';
import {
  Shield,
  Ban,
  Users,
  AlertTriangle,
  Key,
  Activity,
  TrendingDown,
  Plus,
  X,
  Trash2,
} from 'lucide-react';
import styles from '../styles/pages/common.module.css';

type Tab =
  | 'overview'
  | 'blocked-ips'
  | 'sessions'
  | 'failed-logins'
  | '2fa'
  | 'suspicious'
  | 'rate-limits';

export default function SecurityCenter() {
  const [activeTab, setActiveTab] = useState<Tab>('overview');

  const tabs = [
    { id: 'overview', label: 'Übersicht', icon: Shield },
    { id: 'blocked-ips', label: 'Blockierte IPs', icon: Ban },
    { id: 'sessions', label: 'Aktive Sessions', icon: Users },
    { id: 'failed-logins', label: 'Fehlgeschlagene Logins', icon: AlertTriangle },
    { id: '2fa', label: '2FA Status', icon: Key },
    { id: 'suspicious', label: 'Verdächtige Aktivität', icon: Activity },
    { id: 'rate-limits', label: 'Rate Limits', icon: TrendingDown },
  ];

  return (
    <div className={styles.page}>
      {/* Header */}
      <div className={styles.pageHeader}>
        <div className="flex items-center gap-sm">
          <Shield style={{ color: 'var(--color-danger)' }} size={32} />
          <div>
            <h1 className={styles.pageTitle}>Security Command Center</h1>
            <p className={styles.pageSubtitle}>Überwache Sicherheit, blockiere IPs und verwalte Sessions</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ borderBottom: '1px solid var(--color-border)' }}>
        <div className="flex gap-xs" style={{ overflowX: 'auto' }}>
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as Tab)}
                style={{
                  padding: 'var(--spacing-sm) var(--spacing-md)',
                  fontWeight: 500,
                  fontSize: 'var(--font-size-sm)',
                  whiteSpace: 'nowrap',
                  borderBottom: activeTab === tab.id ? '2px solid var(--color-danger)' : '2px solid transparent',
                  color: activeTab === tab.id ? 'var(--color-danger-light)' : 'var(--color-text-tertiary)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--spacing-sm)',
                  transition: 'all var(--transition-fast)',
                }}
              >
                <Icon size={16} />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === 'overview' && <OverviewTab />}
        {activeTab === 'blocked-ips' && <BlockedIPsTab />}
        {activeTab === 'sessions' && <ActiveSessionsTab />}
        {activeTab === 'failed-logins' && <FailedLoginsTab />}
        {activeTab === '2fa' && <TwoFactorTab />}
        {activeTab === 'suspicious' && <SuspiciousActivityTab />}
        {activeTab === 'rate-limits' && <RateLimitsTab />}
      </div>
    </div>
  );
}

// ========== OVERVIEW TAB ==========
function OverviewTab() {
  const { data, isLoading } = useQuery({
    queryKey: ['security-overview'],
    queryFn: securityCenterAPI.getOverview,
  });

  if (isLoading) {
    return (
      <div className="flex-center" style={{ padding: 'var(--spacing-2xl)' }}>
        <div className="spinner spinner-lg"></div>
      </div>
    );
  }

  const stats = [
    { label: 'Blockierte IPs', value: data?.data?.blockedIPs || 0, icon: Ban, color: '#EF4444' },
    { label: 'Aktive Sessions', value: data?.data?.activeSessions || 0, icon: Users, color: '#3B82F6' },
    { label: 'Fehlgeschlagene Logins (24h)', value: data?.data?.failedLogins24h || 0, icon: AlertTriangle, color: '#EAB308' },
    { label: 'Users mit 2FA', value: `${data?.data?.users2FA || 0} / ${data?.data?.totalUsers || 0}`, icon: Key, color: '#10B981' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-lg)' }}>
      {/* Stats Grid */}
      <div className="grid grid-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="card">
              <div className="flex items-center justify-between">
                <div>
                  <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-tertiary)' }}>{stat.label}</p>
                  <p style={{ fontSize: 'var(--font-size-3xl)', fontWeight: 700, color: 'var(--color-text-primary)', marginTop: 'var(--spacing-sm)' }}>
                    {stat.value}
                  </p>
                </div>
                <div style={{ padding: 'var(--spacing-md)', borderRadius: 'var(--radius-md)', backgroundColor: `${stat.color}20` }}>
                  <Icon size={24} style={{ color: stat.color }} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* 2FA Adoption Rate */}
      {data?.data && (
        <div className="card">
          <h3 style={{ fontSize: 'var(--font-size-lg)', fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: 'var(--spacing-md)' }}>
            2FA Adoption Rate
          </h3>
          <div className="flex items-center gap-md">
            <div style={{ flex: 1 }}>
              <div style={{ width: '100%', backgroundColor: 'var(--color-bg-tertiary)', borderRadius: 'var(--radius-full)', height: '16px' }}>
                <div
                  style={{
                    backgroundColor: 'var(--color-success)',
                    height: '16px',
                    borderRadius: 'var(--radius-full)',
                    transition: 'all var(--transition-normal)',
                    width: `${data.data.twoFactorAdoption || 0}%`,
                  }}
                />
              </div>
            </div>
            <span style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 700, color: 'var(--color-text-primary)' }}>
              {data.data.twoFactorAdoption || 0}%
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

// ========== BLOCKED IPs TAB ==========
function BlockedIPsTab() {
  const [showAddModal, setShowAddModal] = useState(false);
  const [newIP, setNewIP] = useState('');
  const [reason, setReason] = useState('');
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['blocked-ips'],
    queryFn: securityCenterAPI.getBlockedIPs,
  });

  const blockMutation = useMutation({
    mutationFn: (data: { ip_address: string; reason: string }) =>
      securityCenterAPI.blockIP(data.ip_address, data.reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['blocked-ips'] });
      setShowAddModal(false);
      setNewIP('');
      setReason('');
    },
  });

  const unblockMutation = useMutation({
    mutationFn: securityCenterAPI.unblockIP,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['blocked-ips'] });
    },
  });

  if (isLoading) {
    return (
      <div className="flex-center" style={{ padding: 'var(--spacing-2xl)' }}>
        <div className="spinner spinner-lg"></div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
      <div className="flex items-center justify-between">
        <h2 style={{ fontSize: 'var(--font-size-xl)', fontWeight: 600, color: 'var(--color-text-primary)' }}>
          Blockierte IP-Adressen
        </h2>
        <button onClick={() => setShowAddModal(true)} className="btn btn-danger">
          <Plus size={16} />
          IP blockieren
        </button>
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <table className="table">
          <thead className="table-header">
            <tr>
              <th className="table-cell">IP-Adresse</th>
              <th className="table-cell">Grund</th>
              <th className="table-cell">Blockiert am</th>
              <th className="table-cell" style={{ textAlign: 'right' }}>Aktionen</th>
            </tr>
          </thead>
          <tbody>
            {data?.data?.map((ip: any) => (
              <tr key={ip.ip_address} className="table-row">
                <td className="table-cell" style={{ fontFamily: 'var(--font-family-mono)' }}>{ip.ip_address}</td>
                <td className="table-cell" style={{ color: 'var(--color-text-secondary)' }}>{ip.reason}</td>
                <td className="table-cell" style={{ color: 'var(--color-text-secondary)' }}>
                  {new Date(ip.blocked_at).toLocaleString('de-DE')}
                </td>
                <td className="table-cell" style={{ textAlign: 'right' }}>
                  <button
                    onClick={() => unblockMutation.mutate(ip.ip_address)}
                    className="btn btn-ghost"
                    style={{ color: 'var(--color-danger-light)', padding: 'var(--spacing-xs)' }}
                    disabled={unblockMutation.isPending}
                  >
                    <X size={20} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add IP Modal */}
      {showAddModal && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'var(--overlay-dark)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }}>
          <div className="card" style={{ width: '100%', maxWidth: '400px' }}>
            <h3 style={{ fontSize: 'var(--font-size-lg)', fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: 'var(--spacing-md)' }}>
              IP-Adresse blockieren
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
              <div>
                <label className="input-label">IP-Adresse</label>
                <input
                  type="text"
                  value={newIP}
                  onChange={(e) => setNewIP(e.target.value)}
                  placeholder="192.168.1.1"
                  className="input"
                />
              </div>
              <div>
                <label className="input-label">Grund</label>
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="z.B. Mehrfache fehlgeschlagene Login-Versuche"
                  rows={3}
                  className="input"
                />
              </div>
            </div>
            <div className="flex gap-sm" style={{ marginTop: 'var(--spacing-lg)' }}>
              <button onClick={() => setShowAddModal(false)} className="btn btn-secondary" style={{ flex: 1 }}>
                Abbrechen
              </button>
              <button
                onClick={() => blockMutation.mutate({ ip_address: newIP, reason })}
                disabled={blockMutation.isPending || !newIP || !reason}
                className="btn btn-danger"
                style={{ flex: 1 }}
              >
                {blockMutation.isPending ? 'Blockiere...' : 'Blockieren'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ========== ACTIVE SESSIONS TAB ==========
function ActiveSessionsTab() {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['active-sessions'],
    queryFn: securityCenterAPI.getActiveSessions,
  });

  const killSessionMutation = useMutation({
    mutationFn: securityCenterAPI.killSession,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['active-sessions'] });
    },
  });

  if (isLoading) {
    return (
      <div className="flex-center" style={{ padding: 'var(--spacing-2xl)' }}>
        <div className="spinner spinner-lg"></div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
      <h2 style={{ fontSize: 'var(--font-size-xl)', fontWeight: 600, color: 'var(--color-text-primary)' }}>
        Aktive Sessions ({data?.data?.length || 0})
      </h2>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <table className="table">
          <thead className="table-header">
            <tr>
              <th className="table-cell">User</th>
              <th className="table-cell">IP-Adresse</th>
              <th className="table-cell">User Agent</th>
              <th className="table-cell">Letzte Aktivität</th>
              <th className="table-cell">Idle Zeit</th>
              <th className="table-cell" style={{ textAlign: 'right' }}>Aktionen</th>
            </tr>
          </thead>
          <tbody>
            {data?.data?.map((session: any) => (
              <tr key={session.id} className="table-row">
                <td className="table-cell">
                  <div>
                    <div style={{ fontWeight: 500, color: 'var(--color-text-primary)' }}>{session.username}</div>
                    <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>{session.email}</div>
                  </div>
                </td>
                <td className="table-cell" style={{ fontFamily: 'var(--font-family-mono)', color: 'var(--color-text-secondary)' }}>
                  {session.ip_address}
                </td>
                <td className="table-cell" style={{ color: 'var(--color-text-secondary)', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {session.user_agent}
                </td>
                <td className="table-cell" style={{ color: 'var(--color-text-secondary)' }}>
                  {new Date(session.last_activity).toLocaleString('de-DE')}
                </td>
                <td className="table-cell" style={{ color: 'var(--color-text-secondary)' }}>
                  {Math.floor(session.idle_seconds / 60)}m
                </td>
                <td className="table-cell" style={{ textAlign: 'right' }}>
                  <button
                    onClick={() => killSessionMutation.mutate(session.id)}
                    className="btn btn-ghost"
                    style={{ color: 'var(--color-danger-light)', padding: 'var(--spacing-xs)' }}
                    disabled={killSessionMutation.isPending}
                  >
                    <Trash2 size={20} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ========== FAILED LOGINS TAB ==========
function FailedLoginsTab() {
  const { data: logins, isLoading: loginsLoading } = useQuery({
    queryKey: ['failed-logins'],
    queryFn: () => securityCenterAPI.getFailedLogins({ limit: 100 }),
  });

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['failed-logins-stats'],
    queryFn: securityCenterAPI.getFailedLoginsStats,
  });

  if (loginsLoading || statsLoading) {
    return (
      <div className="flex-center" style={{ padding: 'var(--spacing-2xl)' }}>
        <div className="spinner spinner-lg"></div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-lg)' }}>
      {/* Stats */}
      <div className="grid grid-4">
        {[
          { label: 'Gesamt', value: stats?.data?.overview?.total_attempts || 0 },
          { label: 'Unique IPs', value: stats?.data?.overview?.unique_ips || 0 },
          { label: 'Letzte Stunde', value: stats?.data?.overview?.last_hour || 0 },
          { label: 'Letzte 24h', value: stats?.data?.overview?.last_24h || 0 },
        ].map((stat) => (
          <div key={stat.label} className="card">
            <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-tertiary)' }}>{stat.label}</div>
            <div style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 700, color: 'var(--color-text-primary)', marginTop: 'var(--spacing-xs)' }}>
              {stat.value}
            </div>
          </div>
        ))}
      </div>

      {/* Top IPs */}
      <div className="card">
        <h3 style={{ fontSize: 'var(--font-size-lg)', fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: 'var(--spacing-md)' }}>
          Top IP-Adressen (24h)
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-sm)' }}>
          {stats?.data?.topIPs?.map((ip: any) => (
            <div
              key={ip.ip_address}
              className="flex items-center justify-between"
              style={{ padding: 'var(--spacing-md)', backgroundColor: 'var(--color-bg-tertiary)', borderRadius: 'var(--radius-md)' }}
            >
              <span style={{ fontFamily: 'var(--font-family-mono)', fontSize: 'var(--font-size-sm)', color: 'var(--color-text-primary)' }}>
                {ip.ip_address}
              </span>
              <div className="flex items-center gap-md">
                <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>
                  {ip.attempt_count} Versuche
                </span>
                <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>
                  Letzter: {new Date(ip.last_attempt).toLocaleString('de-DE')}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Attempts */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <table className="table">
          <thead className="table-header">
            <tr>
              <th className="table-cell">IP-Adresse</th>
              <th className="table-cell">Username</th>
              <th className="table-cell">Grund</th>
              <th className="table-cell">Zeitpunkt</th>
            </tr>
          </thead>
          <tbody>
            {logins?.data?.map((attempt: any, index: number) => (
              <tr key={index} className="table-row">
                <td className="table-cell" style={{ fontFamily: 'var(--font-family-mono)' }}>{attempt.ip_address}</td>
                <td className="table-cell" style={{ color: 'var(--color-text-secondary)' }}>{attempt.username || '-'}</td>
                <td className="table-cell" style={{ color: 'var(--color-text-secondary)' }}>{attempt.reason}</td>
                <td className="table-cell" style={{ color: 'var(--color-text-secondary)' }}>
                  {new Date(attempt.attempt_time).toLocaleString('de-DE')}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ========== 2FA TAB ==========
function TwoFactorTab() {
  const { data, isLoading } = useQuery({
    queryKey: ['2fa-status'],
    queryFn: securityCenterAPI.get2FAStatus,
  });

  if (isLoading) {
    return (
      <div className="flex-center" style={{ padding: 'var(--spacing-2xl)' }}>
        <div className="spinner spinner-lg"></div>
      </div>
    );
  }

  const stats = data?.data?.stats;
  const enrollments = data?.data?.recentEnrollments;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-lg)' }}>
      {/* Stats */}
      <div className="grid grid-3">
        <div className="card">
          <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-tertiary)' }}>Gesamt Users</div>
          <div style={{ fontSize: 'var(--font-size-3xl)', fontWeight: 700, color: 'var(--color-text-primary)', marginTop: 'var(--spacing-sm)' }}>
            {stats?.total_users || 0}
          </div>
        </div>
        <div className="card">
          <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-tertiary)' }}>Mit 2FA</div>
          <div style={{ fontSize: 'var(--font-size-3xl)', fontWeight: 700, color: 'var(--color-success-light)', marginTop: 'var(--spacing-sm)' }}>
            {stats?.users_with_2fa || 0}
          </div>
        </div>
        <div className="card">
          <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-tertiary)' }}>Adoption Rate</div>
          <div style={{ fontSize: 'var(--font-size-3xl)', fontWeight: 700, color: 'var(--color-primary-light)', marginTop: 'var(--spacing-sm)' }}>
            {stats?.adoption_rate || 0}%
          </div>
        </div>
      </div>

      {/* Recent Enrollments */}
      <div className="card">
        <h3 style={{ fontSize: 'var(--font-size-lg)', fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: 'var(--spacing-md)' }}>
          Neueste 2FA-Aktivierungen
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-sm)' }}>
          {enrollments?.map((enrollment: any, index: number) => (
            <div
              key={index}
              className="flex items-center justify-between"
              style={{ padding: 'var(--spacing-md)', backgroundColor: 'var(--color-bg-tertiary)', borderRadius: 'var(--radius-md)' }}
            >
              <div>
                <div style={{ fontSize: 'var(--font-size-sm)', fontWeight: 500, color: 'var(--color-text-primary)' }}>{enrollment.username}</div>
                <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>{enrollment.email}</div>
              </div>
              <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>
                {new Date(enrollment.two_factor_enabled_at).toLocaleString('de-DE')}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ========== SUSPICIOUS ACTIVITY TAB ==========
function SuspiciousActivityTab() {
  const { data, isLoading } = useQuery({
    queryKey: ['suspicious-activity'],
    queryFn: securityCenterAPI.getSuspiciousActivity,
  });

  if (isLoading) {
    return (
      <div className="flex-center" style={{ padding: 'var(--spacing-2xl)' }}>
        <div className="spinner spinner-lg"></div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-lg)' }}>
      {/* Suspicious IPs */}
      <div className="card">
        <h3 style={{ fontSize: 'var(--font-size-lg)', fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: 'var(--spacing-md)' }}>
          Verdächtige IPs (5+ fehlgeschlagene Logins in 1h)
        </h3>
        {data?.data?.suspiciousIPs?.length === 0 ? (
          <p style={{ color: 'var(--color-text-secondary)' }}>Keine verdächtigen IPs gefunden</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-sm)' }}>
            {data?.data?.suspiciousIPs?.map((ip: any) => (
              <div
                key={ip.ip_address}
                className="flex items-center justify-between"
                style={{
                  padding: 'var(--spacing-md)',
                  backgroundColor: 'var(--color-danger-50)',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                  borderRadius: 'var(--radius-md)',
                }}
              >
                <div>
                  <div style={{ fontFamily: 'var(--font-family-mono)', fontSize: 'var(--font-size-sm)', fontWeight: 500, color: 'var(--color-text-primary)' }}>
                    {ip.ip_address}
                  </div>
                  <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)' }}>
                    Versuche: {ip.attempted_usernames?.join(', ')}
                  </div>
                </div>
                <div className="flex items-center gap-md">
                  <span style={{ fontSize: 'var(--font-size-sm)', fontWeight: 700, color: 'var(--color-danger-light)' }}>
                    {ip.failed_attempts} Versuche
                  </span>
                  <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>
                    {new Date(ip.last_attempt).toLocaleString('de-DE')}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Unusual Transactions */}
      <div className="card">
        <h3 style={{ fontSize: 'var(--font-size-lg)', fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: 'var(--spacing-md)' }}>
          Ungewöhnliche Transaktionen (&gt; 1000€, letzte 24h)
        </h3>
        {data?.data?.unusualTransactions?.length === 0 ? (
          <p style={{ color: 'var(--color-text-secondary)' }}>Keine ungewöhnlichen Transaktionen</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-sm)' }}>
            {data?.data?.unusualTransactions?.map((tx: any) => (
              <div
                key={tx.id}
                className="flex items-center justify-between"
                style={{
                  padding: 'var(--spacing-md)',
                  backgroundColor: 'var(--color-warning-50)',
                  border: '1px solid rgba(245, 158, 11, 0.3)',
                  borderRadius: 'var(--radius-md)',
                }}
              >
                <div>
                  <div style={{ fontSize: 'var(--font-size-sm)', fontWeight: 500, color: 'var(--color-text-primary)' }}>{tx.product_title}</div>
                  <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)' }}>Käufer: {tx.buyer}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 'var(--font-size-sm)', fontWeight: 700, color: 'var(--color-text-primary)' }}>{tx.amount.toFixed(2)} €</div>
                  <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>
                    {new Date(tx.created_at).toLocaleString('de-DE')}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Rapid Activity */}
      <div className="card">
        <h3 style={{ fontSize: 'var(--font-size-lg)', fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: 'var(--spacing-md)' }}>
          Users mit ungewöhnlich hoher Aktivität
        </h3>
        {data?.data?.rapidActivity?.length === 0 ? (
          <p style={{ color: 'var(--color-text-secondary)' }}>Keine auffällige Aktivität</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-sm)' }}>
            {data?.data?.rapidActivity?.map((user: any) => (
              <div
                key={user.id}
                className="flex items-center justify-between"
                style={{
                  padding: 'var(--spacing-md)',
                  backgroundColor: 'var(--color-warning-50)',
                  border: '1px solid rgba(245, 158, 11, 0.2)',
                  borderRadius: 'var(--radius-md)',
                }}
              >
                <div>
                  <div style={{ fontSize: 'var(--font-size-sm)', fontWeight: 500, color: 'var(--color-text-primary)' }}>{user.username}</div>
                  <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)' }}>{user.email}</div>
                </div>
                <div className="flex items-center gap-md">
                  <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)' }}>
                    {user.transactions_24h} Transaktionen
                  </span>
                  <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)' }}>
                    {user.products_created_24h} Produkte
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ========== RATE LIMITS TAB ==========
function RateLimitsTab() {
  const { data, isLoading } = useQuery({
    queryKey: ['rate-limits'],
    queryFn: securityCenterAPI.getRateLimits,
  });

  if (isLoading) {
    return (
      <div className="flex-center" style={{ padding: 'var(--spacing-2xl)' }}>
        <div className="spinner spinner-lg"></div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
      <h2 style={{ fontSize: 'var(--font-size-xl)', fontWeight: 600, color: 'var(--color-text-primary)' }}>
        Rate Limit Violations (24h)
      </h2>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <table className="table">
          <thead className="table-header">
            <tr>
              <th className="table-cell">IP-Adresse</th>
              <th className="table-cell">Endpoint</th>
              <th className="table-cell">Violations</th>
              <th className="table-cell">Letzte Violation</th>
            </tr>
          </thead>
          <tbody>
            {data?.data?.map((violation: any, index: number) => (
              <tr key={index} className="table-row">
                <td className="table-cell" style={{ fontFamily: 'var(--font-family-mono)' }}>{violation.ip_address}</td>
                <td className="table-cell" style={{ color: 'var(--color-text-secondary)' }}>{violation.endpoint}</td>
                <td className="table-cell" style={{ fontWeight: 700, color: 'var(--color-danger-light)' }}>{violation.violation_count}</td>
                <td className="table-cell" style={{ color: 'var(--color-text-secondary)' }}>
                  {new Date(violation.last_violation).toLocaleString('de-DE')}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
