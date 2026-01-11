import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { businessIntelligenceAPI } from '../services/api';
import styles from '../styles/pages/common.module.css';
import {
  TrendingUp,
  Users,
  DollarSign,
  Target,
  ShoppingCart,
  AlertTriangle,
  PieChart,
  BarChart3,
} from 'lucide-react';

type Tab =
  | 'revenue-attribution'
  | 'customer-segments'
  | 'clv'
  | 'cohort-analysis'
  | 'cross-sell'
  | 'churn';

export default function BusinessIntelligence() {
  const [activeTab, setActiveTab] = useState<Tab>('revenue-attribution');

  const tabs = [
    { id: 'revenue-attribution', label: 'Revenue Attribution', icon: DollarSign },
    { id: 'customer-segments', label: 'Customer Segments', icon: Users },
    { id: 'clv', label: 'Customer Lifetime Value', icon: TrendingUp },
    { id: 'cohort-analysis', label: 'Cohort Analysis', icon: BarChart3 },
    { id: 'cross-sell', label: 'Cross-Sell Opportunities', icon: ShoppingCart },
    { id: 'churn', label: 'Churn Prediction', icon: AlertTriangle },
  ];

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <h1 className={styles.title} style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-md)' }}>
          <PieChart style={{ width: 32, height: 32, color: 'var(--color-primary-light)' }} />
          Business Intelligence
        </h1>
        <p className={styles.subtitle}>
          Revenue Insights, Customer Segmentation und Predictive Analytics
        </p>
      </div>

      {/* Tabs */}
      <div style={{ borderBottom: '1px solid var(--color-border)' }}>
        <div style={{ display: 'flex', gap: 'var(--spacing-md)', overflowX: 'auto' }}>
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as Tab)}
                style={{
                  padding: 'var(--spacing-md) var(--spacing-md)',
                  fontWeight: 500,
                  fontSize: 'var(--font-size-sm)',
                  whiteSpace: 'nowrap',
                  color: isActive ? 'var(--color-primary-light)' : 'var(--color-text-tertiary)',
                  background: 'none',
                  borderTop: 'none',
                  borderLeft: 'none',
                  borderRight: 'none',
                  borderBottomWidth: 2,
                  borderBottomStyle: 'solid',
                  borderBottomColor: isActive ? 'var(--color-primary)' : 'transparent',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--spacing-sm)',
                  transition: 'var(--transition-fast)',
                }}
              >
                <Icon style={{ width: 16, height: 16 }} />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === 'revenue-attribution' && <RevenueAttributionTab />}
        {activeTab === 'customer-segments' && <CustomerSegmentsTab />}
        {activeTab === 'clv' && <CustomerLifetimeValueTab />}
        {activeTab === 'cohort-analysis' && <CohortAnalysisTab />}
        {activeTab === 'cross-sell' && <CrossSellTab />}
        {activeTab === 'churn' && <ChurnPredictionTab />}
      </div>
    </div>
  );
}

// ========== REVENUE ATTRIBUTION TAB ==========
function RevenueAttributionTab() {
  const [period, setPeriod] = useState('30d');

  const { data, isLoading } = useQuery({
    queryKey: ['revenue-attribution', period],
    queryFn: () => businessIntelligenceAPI.getRevenueAttribution({ period }),
  });

  if (isLoading) {
    return (
      <div className="flex-center" style={{ padding: 'var(--spacing-2xl)' }}>
        <div className="spinner spinner-lg" />
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-lg)' }}>
      {/* Period Selector */}
      <div style={{ display: 'flex', gap: 'var(--spacing-sm)' }}>
        {['7d', '30d', '90d', '1y'].map((p) => (
          <button
            key={p}
            onClick={() => setPeriod(p)}
            className={period === p ? 'btn btn-primary' : 'btn btn-secondary'}
          >
            {p}
          </button>
        ))}
      </div>

      {/* By Source */}
      <div className="card">
        <h3 className={styles.sectionTitle}>Revenue by Source</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
          {data?.data?.bySource?.map((source: any) => (
            <div key={source.source} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-md)', marginBottom: 'var(--spacing-xs)' }}>
                  <span style={{ fontSize: 'var(--font-size-sm)', fontWeight: 500, color: 'var(--color-text-primary)', textTransform: 'capitalize' }}>
                    {source.source}
                  </span>
                  <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>
                    {source.transaction_count} transactions
                  </span>
                </div>
                <div style={{ width: '100%', backgroundColor: 'var(--color-bg-tertiary)', borderRadius: 'var(--radius-full)', height: 8 }}>
                  <div
                    style={{
                      backgroundColor: 'var(--color-primary)',
                      height: 8,
                      borderRadius: 'var(--radius-full)',
                      transition: 'var(--transition-normal)',
                      width: `${((source.total_revenue ?? 0) / (data?.data?.bySource?.[0]?.total_revenue || 1)) * 100}%`,
                    }}
                  />
                </div>
              </div>
              <div style={{ marginLeft: 'var(--spacing-lg)', textAlign: 'right' }}>
                <div style={{ fontSize: 'var(--font-size-lg)', fontWeight: 700, color: 'var(--color-text-primary)' }}>
                  {(source.total_revenue ?? 0).toFixed(2)} EUR
                </div>
                <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>
                  Avg: {(source.avg_revenue ?? 0).toFixed(2)} EUR
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* By Category */}
      <div className="card">
        <h3 className={styles.sectionTitle}>Revenue by Category</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
          {data?.data?.byCategory?.map((cat: any) => (
            <div key={cat.category} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-md)', marginBottom: 'var(--spacing-xs)' }}>
                  <span style={{ fontSize: 'var(--font-size-sm)', fontWeight: 500, color: 'var(--color-text-primary)' }}>
                    {cat.category}
                  </span>
                  <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>
                    {cat.transaction_count} sales
                  </span>
                </div>
                <div style={{ width: '100%', backgroundColor: 'var(--color-bg-tertiary)', borderRadius: 'var(--radius-full)', height: 8 }}>
                  <div
                    style={{
                      backgroundColor: 'var(--color-success)',
                      height: 8,
                      borderRadius: 'var(--radius-full)',
                      transition: 'var(--transition-normal)',
                      width: `${((cat.total_revenue ?? 0) / (data?.data?.byCategory?.[0]?.total_revenue || 1)) * 100}%`,
                    }}
                  />
                </div>
              </div>
              <div style={{ marginLeft: 'var(--spacing-lg)', textAlign: 'right' }}>
                <div style={{ fontSize: 'var(--font-size-lg)', fontWeight: 700, color: 'var(--color-text-primary)' }}>
                  {(cat.total_revenue ?? 0).toFixed(2)} EUR
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* By Affiliate */}
      <div className="card">
        <h3 className={styles.sectionTitle}>Top Affiliates by Revenue</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
          {data?.data?.byAffiliate?.slice(0, 10).map((aff: any, idx: number) => (
            <div
              key={aff.affiliate_id || idx}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: 'var(--spacing-md)',
                backgroundColor: 'var(--color-bg-tertiary)',
                borderRadius: 'var(--radius-lg)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-md)' }}>
                <div
                  style={{
                    width: 32,
                    height: 32,
                    background: 'var(--color-bg-soft-purple)',
                    borderRadius: 'var(--radius-full)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#A78BFA',
                    fontWeight: 700,
                  }}
                >
                  {idx + 1}
                </div>
                <div>
                  <div style={{ fontSize: 'var(--font-size-sm)', fontWeight: 500, color: 'var(--color-text-primary)' }}>
                    {aff.affiliate_username || `Affiliate #${aff.affiliate_id || 'N/A'}`}
                  </div>
                  <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>
                    {aff.referral_count} referrals
                  </div>
                </div>
              </div>
              <div style={{ fontSize: 'var(--font-size-lg)', fontWeight: 700, color: 'var(--color-text-primary)' }}>
                {(aff.total_revenue ?? 0).toFixed(2)} EUR
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* By Level */}
      <div className="card">
        <h3 className={styles.sectionTitle}>Revenue by User Level</h3>
        <div className="grid grid-5" style={{ gridTemplateColumns: 'repeat(5, 1fr)' }}>
          {data?.data?.byLevel?.map((level: any) => (
            <div
              key={level.level}
              style={{
                background: 'var(--color-primary-50)',
                borderRadius: 'var(--radius-lg)',
                padding: 'var(--spacing-md)',
                border: '1px solid var(--color-border)',
              }}
            >
              <div style={{ fontSize: 'var(--font-size-sm)', fontWeight: 500, color: 'var(--color-text-secondary)', marginBottom: 'var(--spacing-xs)' }}>
                Level {level.level}
              </div>
              <div style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 700, color: 'var(--color-text-primary)' }}>
                {(level.total_revenue ?? 0).toFixed(0)} EUR
              </div>
              <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-tertiary)', marginTop: 'var(--spacing-xs)' }}>
                {level.seller_count} sellers
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ========== CUSTOMER SEGMENTS TAB ==========
function CustomerSegmentsTab() {
  const { data, isLoading } = useQuery({
    queryKey: ['customer-segments'],
    queryFn: businessIntelligenceAPI.getCustomerSegments,
  });

  if (isLoading) {
    return (
      <div className="flex-center" style={{ padding: 'var(--spacing-2xl)' }}>
        <div className="spinner spinner-lg" />
      </div>
    );
  }

  const segmentConfig: Record<string, { label: string; bg: string; color: string; border: string; definition: string }> = {
    whales: {
      label: 'Whales',
      bg: 'var(--color-bg-soft-purple)',
      color: '#A78BFA',
      border: 'rgba(139, 92, 246, 0.3)',
      definition: 'Top 10% by revenue - Deine wichtigsten Umsatztreiber'
    },
    champions: {
      label: 'Champions',
      bg: 'var(--color-success-50)',
      color: 'var(--color-success-light)',
      border: 'rgba(16, 185, 129, 0.3)',
      definition: '>500 EUR, >10 Transaktionen, >3 Produkte - Hoch engagierte Power-Seller'
    },
    atRisk: {
      label: 'At Risk',
      bg: 'var(--color-warning-50)',
      color: 'var(--color-warning-light)',
      border: 'rgba(245, 158, 11, 0.3)',
      definition: 'Früher aktiv (>100 EUR in 30-90 Tagen), jetzt inaktiv - Brauchen Re-Engagement'
    },
    newProspects: {
      label: 'New Prospects',
      bg: 'var(--color-info-50)',
      color: 'var(--color-info-light)',
      border: 'rgba(99, 102, 241, 0.3)',
      definition: 'In den letzten 7 Tagen registriert - Hohes Potenzial'
    },
    oneHitWonders: {
      label: 'One-Hit Wonders',
      bg: 'rgba(249, 115, 22, 0.15)',
      color: '#FB923C',
      border: 'rgba(249, 115, 22, 0.3)',
      definition: 'Nur 1 Verkauf, dann nichts mehr - Conversion-Potenzial'
    },
    dormant: {
      label: 'Dormant',
      bg: 'var(--color-bg-tertiary)',
      color: 'var(--color-text-tertiary)',
      border: 'var(--color-border)',
      definition: 'Keine Aktivität seit 90+ Tagen - Niedrige Priorität'
    },
  };

  // Transform API response into displayable segments with aggregated stats
  const rawData = data?.data || {};
  const segments = Object.entries(segmentConfig).map(([key, config]) => {
    const segmentData = rawData[key] || { count: 0, users: [] };
    const users = segmentData.users || [];

    // Calculate aggregated statistics from users
    const totalRevenue = users.reduce((sum: number, user: any) =>
      sum + (parseFloat(user.total_revenue) || parseFloat(user.past_revenue) || 0), 0);
    const avgRevenue = users.length > 0 ? totalRevenue / users.length : 0;
    const totalTransactions = users.reduce((sum: number, user: any) =>
      sum + (parseInt(user.transaction_count) || 0), 0);
    const avgTransactions = users.length > 0 ? totalTransactions / users.length : 0;

    return {
      key,
      ...config,
      count: segmentData.count || 0,
      users,
      totalRevenue,
      avgRevenue,
      avgTransactions,
    };
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-lg)' }}>
      {/* Segment Overview Cards */}
      <div className="grid grid-3">
        {segments.map((segment) => (
          <div
            key={segment.key}
            className="card"
            style={{ borderWidth: 2, borderColor: segment.border }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--spacing-sm)' }}>
              <h3 style={{ fontSize: 'var(--font-size-sm)', fontWeight: 500, color: segment.color, textTransform: 'uppercase' }}>
                {segment.label}
              </h3>
              <div style={{ width: 12, height: 12, borderRadius: 'var(--radius-full)', backgroundColor: segment.color }} />
            </div>
            <div style={{ fontSize: 'var(--font-size-3xl)', fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: 'var(--spacing-xs)' }}>
              {segment.count} <span style={{ fontSize: 'var(--font-size-sm)', fontWeight: 400, color: 'var(--color-text-muted)' }}>User</span>
            </div>
            <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-tertiary)' }}>
              Total Revenue: {segment.totalRevenue.toFixed(2)} EUR
            </div>
            <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-tertiary)' }}>
              Avg Revenue: {segment.avgRevenue.toFixed(2)} EUR
            </div>
            {segment.avgTransactions > 0 && (
              <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', marginTop: 'var(--spacing-sm)' }}>
                Avg Transactions: {segment.avgTransactions.toFixed(1)}
              </div>
            )}
            <div style={{
              fontSize: 'var(--font-size-xs)',
              color: 'var(--color-text-muted)',
              marginTop: 'var(--spacing-md)',
              paddingTop: 'var(--spacing-sm)',
              borderTop: '1px solid var(--color-border)'
            }}>
              {segment.definition}
            </div>
          </div>
        ))}
      </div>

      {/* Summary Stats */}
      <div className="card">
        <h3 className={styles.sectionTitle}>Segment-Zusammenfassung</h3>
        <div className={styles.tableContainer}>
          <table className="table">
            <thead className="table-header">
              <tr>
                <th>Segment</th>
                <th style={{ textAlign: 'right' }}>Anzahl User</th>
                <th style={{ textAlign: 'right' }}>Total Revenue</th>
                <th style={{ textAlign: 'right' }}>Avg Revenue</th>
                <th style={{ textAlign: 'right' }}>Avg Transactions</th>
              </tr>
            </thead>
            <tbody>
              {segments.map((segment) => (
                <tr key={segment.key}>
                  <td className="table-cell">
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)' }}>
                      <div style={{ width: 10, height: 10, borderRadius: 'var(--radius-full)', backgroundColor: segment.color }} />
                      <span style={{ fontWeight: 500, color: 'var(--color-text-primary)' }}>{segment.label}</span>
                    </div>
                  </td>
                  <td className="table-cell" style={{ textAlign: 'right', fontWeight: 600 }}>{segment.count}</td>
                  <td className="table-cell" style={{ textAlign: 'right' }}>{segment.totalRevenue.toFixed(2)} EUR</td>
                  <td className="table-cell" style={{ textAlign: 'right' }}>{segment.avgRevenue.toFixed(2)} EUR</td>
                  <td className="table-cell" style={{ textAlign: 'right' }}>{segment.avgTransactions.toFixed(1)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}


// ========== CUSTOMER LIFETIME VALUE TAB ==========
function CustomerLifetimeValueTab() {
  const [limit, setLimit] = useState(50);

  const { data, isLoading } = useQuery({
    queryKey: ['clv', limit],
    queryFn: () => businessIntelligenceAPI.getCustomerLifetimeValue({ limit }),
  });

  if (isLoading) {
    return (
      <div className="flex-center" style={{ padding: 'var(--spacing-2xl)' }}>
        <div className="spinner spinner-lg" />
      </div>
    );
  }

  // Handle different possible data structures from API
  const customers = Array.isArray(data?.data) ? data.data : (data?.data?.customers || []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-lg)' }}>
      {/* Limit Selector */}
      <div style={{ display: 'flex', gap: 'var(--spacing-sm)' }}>
        {[20, 50, 100].map((l) => (
          <button
            key={l}
            onClick={() => setLimit(l)}
            className={limit === l ? 'btn btn-primary' : 'btn btn-secondary'}
          >
            Top {l}
          </button>
        ))}
      </div>

      {/* CLV Table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: 'var(--spacing-md) var(--spacing-lg)', borderBottom: '1px solid var(--color-border)' }}>
          <h3 className={styles.sectionTitle} style={{ marginBottom: 0 }}>
            Customer Lifetime Value (Top {limit})
          </h3>
        </div>
        <div className={styles.tableContainer}>
          <table className="table">
            <thead className="table-header">
              <tr>
                <th>Rank</th>
                <th>User</th>
                <th>Total Spent</th>
                <th>Purchases</th>
                <th>Avg Purchase</th>
                <th>First Purchase</th>
                <th>Last Purchase</th>
                <th>Days Active</th>
              </tr>
            </thead>
            <tbody>
              {customers.map((customer: any, idx: number) => (
                <tr key={customer.user_id}>
                  <td className="table-cell">
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: 32,
                        height: 32,
                        borderRadius: 'var(--radius-full)',
                        background: 'linear-gradient(135deg, var(--color-warning) 0%, #F97316 100%)',
                        color: 'white',
                        fontWeight: 700,
                        fontSize: 'var(--font-size-sm)',
                      }}
                    >
                      {idx + 1}
                    </div>
                  </td>
                  <td className="table-cell">
                    <div>
                      <div style={{ fontSize: 'var(--font-size-sm)', fontWeight: 500, color: 'var(--color-text-primary)' }}>
                        {customer.username}
                      </div>
                      <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>
                        {customer.email}
                      </div>
                    </div>
                  </td>
                  <td className="table-cell">
                    <div style={{ fontSize: 'var(--font-size-lg)', fontWeight: 700, color: 'var(--color-success-light)' }}>
                      {(customer.total_spent ?? 0).toFixed(2)} EUR
                    </div>
                  </td>
                  <td className="table-cell table-cell-primary">
                    {customer.purchase_count}
                  </td>
                  <td className="table-cell">
                    {(customer.avg_purchase_value ?? 0).toFixed(2)} EUR
                  </td>
                  <td className="table-cell">
                    {new Date(customer.first_purchase).toLocaleDateString('de-DE')}
                  </td>
                  <td className="table-cell">
                    {new Date(customer.last_purchase).toLocaleDateString('de-DE')}
                  </td>
                  <td className="table-cell">
                    {customer.days_active}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ========== COHORT ANALYSIS TAB ==========
function CohortAnalysisTab() {
  const { data, isLoading } = useQuery({
    queryKey: ['cohort-analysis'],
    queryFn: () => businessIntelligenceAPI.getCohortAnalysis({ months: 6 }),
  });

  if (isLoading) {
    return (
      <div className="flex-center" style={{ padding: 'var(--spacing-2xl)' }}>
        <div className="spinner spinner-lg" />
      </div>
    );
  }

  // Handle different possible data structures from API
  const cohorts = Array.isArray(data?.data) ? data.data : (data?.data?.cohorts || []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-lg)' }}>
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: 'var(--spacing-lg)' }}>
          <h3 className={styles.sectionTitle}>Monthly Cohort Retention</h3>
          <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-tertiary)', marginBottom: 'var(--spacing-lg)' }}>
            Shows the percentage of users from each cohort who made purchases in subsequent months
          </p>
        </div>
        <div className={styles.tableContainer}>
          <table className="table">
            <thead className="table-header">
              <tr>
                <th>Cohort Month</th>
                <th style={{ textAlign: 'center' }}>Users</th>
                <th style={{ textAlign: 'center' }}>Month 0</th>
                <th style={{ textAlign: 'center' }}>Month 1</th>
                <th style={{ textAlign: 'center' }}>Month 2</th>
                <th style={{ textAlign: 'center' }}>Month 3</th>
              </tr>
            </thead>
            <tbody>
              {cohorts.map((cohort: any) => (
                <tr key={cohort.cohort_month}>
                  <td className="table-cell table-cell-primary">
                    {new Date(cohort.cohort_month).toLocaleDateString('de-DE', {
                      year: 'numeric',
                      month: 'short',
                    })}
                  </td>
                  <td className="table-cell" style={{ textAlign: 'center' }}>
                    {cohort.cohort_size}
                  </td>
                  <td className="table-cell" style={{ textAlign: 'center' }}>
                    <span className="badge badge-success">100%</span>
                  </td>
                  <td className="table-cell" style={{ textAlign: 'center' }}>
                    <RetentionCell value={cohort.month_1_retention} />
                  </td>
                  <td className="table-cell" style={{ textAlign: 'center' }}>
                    <RetentionCell value={cohort.month_2_retention} />
                  </td>
                  <td className="table-cell" style={{ textAlign: 'center' }}>
                    <RetentionCell value={cohort.month_3_retention} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function RetentionCell({ value }: { value: any }) {
  if (!value) return <span style={{ color: 'var(--color-text-muted)' }}>-</span>;

  const percentage = parseFloat(value);

  let bgColor: string;
  let textColor: string;

  if (percentage >= 50) {
    bgColor = 'var(--color-success-50)';
    textColor = 'var(--color-success-light)';
  } else if (percentage >= 25) {
    bgColor = 'var(--color-warning-50)';
    textColor = 'var(--color-warning-light)';
  } else if (percentage > 0) {
    bgColor = 'rgba(249, 115, 22, 0.15)';
    textColor = '#FB923C';
  } else {
    bgColor = 'var(--color-danger-50)';
    textColor = 'var(--color-danger-light)';
  }

  return (
    <span
      style={{
        display: 'inline-block',
        padding: 'var(--spacing-xs) var(--spacing-md)',
        borderRadius: 'var(--radius-full)',
        fontSize: 'var(--font-size-xs)',
        fontWeight: 500,
        backgroundColor: bgColor,
        color: textColor,
      }}
    >
      {percentage.toFixed(1)}%
    </span>
  );
}

// ========== CROSS-SELL TAB ==========
function CrossSellTab() {
  const { data, isLoading } = useQuery({
    queryKey: ['cross-sell'],
    queryFn: () => businessIntelligenceAPI.getProductCrossSell({ min_occurrences: 2 }),
  });

  if (isLoading) {
    return (
      <div className="flex-center" style={{ padding: 'var(--spacing-2xl)' }}>
        <div className="spinner spinner-lg" />
      </div>
    );
  }

  // Handle different possible data structures from API
  const pairs = Array.isArray(data?.data) ? data.data : (data?.data?.pairs || []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-lg)' }}>
      <div className="card">
        <h3 className={styles.sectionTitle}>Frequently Bought Together</h3>
        <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-tertiary)', marginBottom: 'var(--spacing-lg)' }}>
          Products that are frequently purchased together - use for cross-sell recommendations
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
          {pairs.map((pair: any, idx: number) => (
            <div
              key={idx}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: 'var(--spacing-md)',
                background: 'var(--color-primary-50)',
                borderRadius: 'var(--radius-lg)',
                border: '1px solid var(--color-border)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-md)', flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)' }}>
                  <div
                    style={{
                      padding: 'var(--spacing-sm) var(--spacing-md)',
                      backgroundColor: 'var(--color-bg-card)',
                      borderRadius: 'var(--radius-lg)',
                      boxShadow: 'var(--shadow-sm)',
                    }}
                  >
                    <div style={{ fontSize: 'var(--font-size-sm)', fontWeight: 500, color: 'var(--color-text-primary)' }}>
                      {pair.product1_title}
                    </div>
                    <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>
                      {pair.product1_category}
                    </div>
                  </div>
                  <span style={{ color: 'var(--color-text-muted)' }}>+</span>
                  <div
                    style={{
                      padding: 'var(--spacing-sm) var(--spacing-md)',
                      backgroundColor: 'var(--color-bg-card)',
                      borderRadius: 'var(--radius-lg)',
                      boxShadow: 'var(--shadow-sm)',
                    }}
                  >
                    <div style={{ fontSize: 'var(--font-size-sm)', fontWeight: 500, color: 'var(--color-text-primary)' }}>
                      {pair.product2_title}
                    </div>
                    <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>
                      {pair.product2_category}
                    </div>
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-lg)', marginLeft: 'var(--spacing-md)' }}>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-tertiary)' }}>Co-purchases</div>
                  <div style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 700, color: 'var(--color-primary-light)' }}>{pair.co_purchase_count}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ========== CHURN PREDICTION TAB ==========
function ChurnPredictionTab() {
  const { data, isLoading } = useQuery({
    queryKey: ['churn-prediction'],
    queryFn: businessIntelligenceAPI.getChurnPrediction,
  });

  if (isLoading) {
    return (
      <div className="flex-center" style={{ padding: 'var(--spacing-2xl)' }}>
        <div className="spinner spinner-lg" />
      </div>
    );
  }

  // Handle different possible data structures from API
  const users = Array.isArray(data?.data) ? data.data : (data?.data?.users || []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-lg)' }}>
      <div className="card">
        <h3 className={styles.sectionTitle}>Users at Risk of Churning</h3>
        <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-tertiary)', marginBottom: 'var(--spacing-lg)' }}>
          Users who previously purchased but haven't been active in 60+ days - Priority for
          re-engagement campaigns
        </p>

        {users.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-text">Keine Churn-Risiko Users gefunden</div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
            {users.map((user: any) => (
              <div
                key={user.user_id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: 'var(--spacing-md)',
                  backgroundColor: 'var(--color-danger-50)',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                  borderRadius: 'var(--radius-lg)',
                }}
              >
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-md)', marginBottom: 'var(--spacing-xs)' }}>
                    <AlertTriangle style={{ width: 20, height: 20, color: 'var(--color-danger-light)' }} />
                    <div>
                      <div style={{ fontSize: 'var(--font-size-sm)', fontWeight: 500, color: 'var(--color-text-primary)' }}>
                        {user.username}
                      </div>
                      <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>
                        {user.email}
                      </div>
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-lg)', marginLeft: 'var(--spacing-md)' }}>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-tertiary)' }}>Total Spent</div>
                    <div style={{ fontSize: 'var(--font-size-sm)', fontWeight: 700, color: 'var(--color-text-primary)' }}>
                      {(user.total_spent ?? 0).toFixed(2)} EUR
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-tertiary)' }}>Purchases</div>
                    <div style={{ fontSize: 'var(--font-size-sm)', fontWeight: 700, color: 'var(--color-text-primary)' }}>
                      {user.purchase_count}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-tertiary)' }}>Last Purchase</div>
                    <div style={{ fontSize: 'var(--font-size-sm)', fontWeight: 700, color: 'var(--color-danger-light)' }}>
                      {new Date(user.last_purchase).toLocaleDateString('de-DE')}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-tertiary)' }}>Days Inactive</div>
                    <div style={{ fontSize: 'var(--font-size-lg)', fontWeight: 700, color: 'var(--color-danger-light)' }}>{user.days_since_purchase}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
