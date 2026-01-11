import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { dashboardAPI, reportsAPI } from '../services/api';
import { TrendingUp, TrendingDown, Users, DollarSign, ShoppingCart, Activity, Flag, AlertTriangle } from 'lucide-react';
import styles from '../styles/pages/Dashboard.module.css';

export default function Dashboard() {
  const { data: overview, isLoading } = useQuery({
    queryKey: ['dashboard-overview'],
    queryFn: dashboardAPI.getOverview,
    refetchInterval: 30000,
  });

  const { data: alerts } = useQuery({
    queryKey: ['dashboard-alerts'],
    queryFn: dashboardAPI.getAlerts,
    refetchInterval: 60000,
  });

  const { data: liveFeed } = useQuery({
    queryKey: ['dashboard-live-feed'],
    queryFn: () => dashboardAPI.getLiveFeed(10),
    refetchInterval: 10000,
  });

  // Content Reports stats
  const { data: reportsData } = useQuery({
    queryKey: ['dashboard-reports'],
    queryFn: () => reportsAPI.getAll({ status: 'pending', limit: 5 }),
    refetchInterval: 60000,
  });

  if (isLoading) {
    return (
      <div className={styles.loadingContainer}>
        <div className="spinner spinner-lg"></div>
      </div>
    );
  }

  const stats = overview?.data || {};

  return (
    <div className={styles.container}>
      {/* Page Header */}
      <div className={styles.header}>
        <h1 className={styles.title}>Command Center</h1>
        <p className={styles.subtitle}>Echtzeit-Überwachung deiner Monemee-Plattform</p>
      </div>

      {/* KPI Cards */}
      <div className={styles.kpiGrid}>
        {/* Users */}
        <div className="card-compact">
          <div className={styles.kpiCard}>
            <div className={styles.kpiContent}>
              <p className={styles.kpiLabel}>Total Users</p>
              <p className={styles.kpiValue}>{stats.users?.total || 0}</p>
            </div>
            <div className="stat-icon stat-icon-primary">
              <Users size={24} />
            </div>
          </div>
          {stats.users?.change && (
            <div className={styles.kpiChange}>
              {stats.users.change > 0 ? (
                <>
                  <TrendingUp size={16} className={styles.kpiChangePositive} />
                  <span className={styles.kpiChangePositive}>+{stats.users.change}%</span>
                </>
              ) : (
                <>
                  <TrendingDown size={16} className={styles.kpiChangeNegative} />
                  <span className={styles.kpiChangeNegative}>{stats.users.change}%</span>
                </>
              )}
              <span className={styles.kpiChangeLabel}>vs. last period</span>
            </div>
          )}
        </div>

        {/* Revenue Today */}
        <div className="card-compact">
          <div className={styles.kpiCard}>
            <div className={styles.kpiContent}>
              <p className={styles.kpiLabel}>Revenue Today</p>
              <p className={styles.kpiValue}>€{stats.revenue?.today?.toFixed(2) || '0.00'}</p>
            </div>
            <div className="stat-icon stat-icon-success">
              <DollarSign size={24} />
            </div>
          </div>
          {stats.revenue?.change && (
            <div className={styles.kpiChange}>
              <TrendingUp size={16} className={styles.kpiChangePositive} />
              <span className={styles.kpiChangePositive}>+{stats.revenue.change}%</span>
              <span className={styles.kpiChangeLabel}>vs. yesterday</span>
            </div>
          )}
        </div>

        {/* Sales Today */}
        <div className="card-compact">
          <div className={styles.kpiCard}>
            <div className={styles.kpiContent}>
              <p className={styles.kpiLabel}>Sales Today</p>
              <p className={styles.kpiValue}>{stats.sales?.today || 0}</p>
            </div>
            <div className="stat-icon stat-icon-primary">
              <ShoppingCart size={24} />
            </div>
          </div>
        </div>

        {/* System Health */}
        <div className="card-compact">
          <div className={styles.kpiCard}>
            <div className={styles.kpiContent}>
              <p className={styles.kpiLabel}>Uptime</p>
              <p className={styles.kpiValue}>{stats.health?.uptime || '99.8'}%</p>
            </div>
            <div className="stat-icon stat-icon-purple">
              <Activity size={24} />
            </div>
          </div>
          <div style={{ marginTop: 'var(--spacing-sm)' }}>
            <span className="badge badge-success">All Systems Operational</span>
          </div>
        </div>
      </div>

      {/* Content Reports Warning */}
      {reportsData?.data?.counts?.pending > 0 && (
        <Link to="/reports" className={`card ${styles.reportsCard}`}>
          <div className={styles.reportsCardContent}>
            <div className={styles.reportsCardIcon}>
              <Flag size={24} />
            </div>
            <div className={styles.reportsCardText}>
              <h3 className={styles.reportsCardTitle}>
                {reportsData.data.counts.pending} offene Meldung{reportsData.data.counts.pending !== 1 ? 'en' : ''}
              </h3>
              <p className={styles.reportsCardSubtitle}>
                Inhaltsmeldungen warten auf Prüfung (DSA Art. 16)
              </p>
            </div>
            <div className={styles.reportsCardAction}>
              Jetzt prüfen →
            </div>
          </div>
        </Link>
      )}

      {/* Alerts */}
      {alerts?.data && alerts.data.length > 0 && (
        <div className={`card ${styles.alertsCard}`}>
          <h2 className={styles.sectionTitle}>🚨 Critical Alerts</h2>
          <div className={styles.alertsList}>
            {alerts.data.map((alert: any) => (
              <div
                key={alert.id}
                className={`${styles.alertItem} ${
                  alert.severity === 'critical' ? styles.alertCritical : styles.alertWarning
                }`}
              >
                <p className={styles.alertTitle}>{alert.title}</p>
                <p className={styles.alertMessage}>{alert.message}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Live Feed */}
      <div className={`card ${styles.feedCard}`}>
        <h2 className={styles.sectionTitle}>⚡ Live Activity Feed</h2>
        <div className={styles.feedList}>
          {liveFeed?.data?.map((event: any, index: number) => (
            <div key={index} className={styles.feedItem}>
              <span className={styles.feedIcon}>{event.icon}</span>
              <div className={styles.feedContent}>
                <p className={styles.feedMessage}>{event.message}</p>
                <p className={styles.feedTime}>
                  {new Date(event.time).toLocaleTimeString('de-DE')}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
