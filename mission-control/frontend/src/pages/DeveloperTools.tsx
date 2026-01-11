import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { devtoolsAPI } from '../services/api';
import styles from '../styles/pages/common.module.css';
import {
  Code,
  Database,
  Webhook,
  Flag,
  RefreshCw,
  Eye,
  Plus,
  ToggleLeft,
  ToggleRight,
  Trash2,
  Edit,
  X,
} from 'lucide-react';

type Tab = 'api-inspector' | 'db-profiler' | 'webhooks' | 'feature-flags';

export default function DeveloperTools() {
  const [activeTab, setActiveTab] = useState<Tab>('api-inspector');

  const tabs = [
    { id: 'api-inspector', label: 'API Inspector', icon: Code },
    { id: 'db-profiler', label: 'DB Profiler', icon: Database },
    { id: 'webhooks', label: 'Webhook Debugger', icon: Webhook },
    { id: 'feature-flags', label: 'Feature Flags', icon: Flag },
  ];

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <h1 className={styles.title} style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-md)' }}>
          <Code style={{ width: 32, height: 32, color: 'var(--color-primary-light)' }} />
          Developer Tools
        </h1>
        <p className={styles.subtitle}>
          Debug APIs, profile queries, test webhooks und manage feature flags
        </p>
      </div>

      {/* Tabs */}
      <div style={{ borderBottom: '1px solid var(--color-border)' }}>
        <div className="flex gap-md" style={{ overflowX: 'auto' }}>
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as Tab)}
                className="flex items-center gap-sm"
                style={{
                  padding: 'var(--spacing-md) var(--spacing-md)',
                  fontSize: 'var(--font-size-sm)',
                  fontWeight: 500,
                  whiteSpace: 'nowrap',
                  borderBottom: activeTab === tab.id ? '2px solid var(--color-primary)' : '2px solid transparent',
                  color: activeTab === tab.id ? 'var(--color-primary-light)' : 'var(--color-text-tertiary)',
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
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
        {activeTab === 'api-inspector' && <APIInspectorTab />}
        {activeTab === 'db-profiler' && <DBProfilerTab />}
        {activeTab === 'webhooks' && <WebhooksTab />}
        {activeTab === 'feature-flags' && <FeatureFlagsTab />}
      </div>
    </div>
  );
}

// ========== API INSPECTOR TAB ==========
function APIInspectorTab() {
  const [period, setPeriod] = useState('24h');
  const [selectedRequest, setSelectedRequest] = useState<any>(null);

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['api-stats', period],
    queryFn: () => devtoolsAPI.getAPIRequestStats({ period }),
  });

  const { data: requests, isLoading: requestsLoading } = useQuery({
    queryKey: ['api-requests'],
    queryFn: () => devtoolsAPI.getAPIRequests({ limit: 50 }),
  });

  if (statsLoading || requestsLoading) {
    return (
      <div className="flex-center" style={{ padding: 'var(--spacing-2xl)' }}>
        <div className="spinner spinner-lg" />
      </div>
    );
  }

  return (
    <div className="flex-col gap-lg">
      {/* Period Selector */}
      <div className="flex gap-sm">
        {['1h', '24h', '7d', '30d'].map((p) => (
          <button
            key={p}
            onClick={() => setPeriod(p)}
            className={period === p ? 'btn btn-primary' : 'btn btn-secondary'}
          >
            {p}
          </button>
        ))}
      </div>

      {/* Stats Overview */}
      <div className="grid grid-4">
        <div className="card">
          <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-tertiary)' }}>Total Requests</div>
          <div style={{ fontSize: 'var(--font-size-3xl)', fontWeight: 700, color: 'var(--color-text-primary)', marginTop: 'var(--spacing-sm)' }}>
            {stats?.data?.overview?.total_requests || 0}
          </div>
        </div>
        <div className="card">
          <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-tertiary)' }}>Successful</div>
          <div style={{ fontSize: 'var(--font-size-3xl)', fontWeight: 700, color: 'var(--color-success-light)', marginTop: 'var(--spacing-sm)' }}>
            {stats?.data?.overview?.successful || 0}
          </div>
        </div>
        <div className="card">
          <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-tertiary)' }}>Client Errors</div>
          <div style={{ fontSize: 'var(--font-size-3xl)', fontWeight: 700, color: 'var(--color-warning-light)', marginTop: 'var(--spacing-sm)' }}>
            {stats?.data?.overview?.client_errors || 0}
          </div>
        </div>
        <div className="card">
          <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-tertiary)' }}>Server Errors</div>
          <div style={{ fontSize: 'var(--font-size-3xl)', fontWeight: 700, color: 'var(--color-danger-light)', marginTop: 'var(--spacing-sm)' }}>
            {stats?.data?.overview?.server_errors || 0}
          </div>
        </div>
      </div>

      {/* Avg Response Time */}
      <div className="card">
        <h3 style={{ fontSize: 'var(--font-size-lg)', fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: 'var(--spacing-sm)' }}>
          Response Time
        </h3>
        <div className="flex items-center gap-lg">
          <div>
            <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-tertiary)' }}>Avg: </span>
            <span style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 700, color: 'var(--color-text-primary)' }}>
              {Math.round(stats?.data?.overview?.avg_response_time || 0)}ms
            </span>
          </div>
          <div>
            <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-tertiary)' }}>Min: </span>
            <span style={{ fontSize: 'var(--font-size-lg)', fontWeight: 600, color: 'var(--color-success-light)' }}>
              {Math.round(stats?.data?.overview?.min_response_time || 0)}ms
            </span>
          </div>
          <div>
            <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-tertiary)' }}>Max: </span>
            <span style={{ fontSize: 'var(--font-size-lg)', fontWeight: 600, color: 'var(--color-danger-light)' }}>
              {Math.round(stats?.data?.overview?.max_response_time || 0)}ms
            </span>
          </div>
        </div>
      </div>

      {/* Top Endpoints */}
      <div className="card">
        <h3 style={{ fontSize: 'var(--font-size-lg)', fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: 'var(--spacing-md)' }}>
          Top Endpoints
        </h3>
        <div className="flex-col gap-sm">
          {stats?.data?.byEndpoint?.slice(0, 10).map((endpoint: any, idx: number) => (
            <div
              key={idx}
              className="flex items-center justify-between"
              style={{
                padding: 'var(--spacing-md)',
                backgroundColor: 'var(--color-bg-tertiary)',
                borderRadius: 'var(--radius-md)',
              }}
            >
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 'var(--font-size-sm)', fontWeight: 500, color: 'var(--color-text-primary)' }}>
                  {endpoint.endpoint}
                </div>
                <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>
                  Avg: {Math.round(endpoint.avg_response_time)}ms
                </div>
              </div>
              <div className="flex items-center gap-md">
                <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-tertiary)' }}>
                  {endpoint.count} calls
                </span>
                {endpoint.errors > 0 && (
                  <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-danger-light)' }}>{endpoint.errors} errors</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Slow Requests */}
      <div className="card">
        <h3 style={{ fontSize: 'var(--font-size-lg)', fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: 'var(--spacing-md)' }}>
          Slow Requests (&gt; 1s)
        </h3>
        {stats?.data?.slowRequests?.length === 0 ? (
          <p style={{ color: 'var(--color-text-tertiary)' }}>Keine langsamen Requests</p>
        ) : (
          <div className="flex-col gap-sm">
            {stats?.data?.slowRequests?.map((req: any, idx: number) => (
              <div
                key={idx}
                className="flex items-center justify-between"
                style={{
                  padding: 'var(--spacing-md)',
                  backgroundColor: 'var(--color-danger-50)',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                  borderRadius: 'var(--radius-md)',
                }}
              >
                <div>
                  <div style={{ fontSize: 'var(--font-size-sm)', fontWeight: 500, color: 'var(--color-text-primary)' }}>
                    {req.method} {req.endpoint}
                  </div>
                  <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>
                    {new Date(req.timestamp).toLocaleString('de-DE')}
                  </div>
                </div>
                <div className="flex items-center gap-md">
                  <span style={{ fontSize: 'var(--font-size-lg)', fontWeight: 700, color: 'var(--color-danger-light)' }}>
                    {Math.round(req.response_time)}ms
                  </span>
                  <span
                    className="badge"
                    style={{
                      backgroundColor: req.status_code >= 500
                        ? 'var(--color-danger-50)'
                        : req.status_code >= 400
                        ? 'var(--color-warning-50)'
                        : 'var(--color-success-50)',
                      color: req.status_code >= 500
                        ? 'var(--color-danger-light)'
                        : req.status_code >= 400
                        ? 'var(--color-warning-light)'
                        : 'var(--color-success-light)',
                    }}
                  >
                    {req.status_code}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recent Requests Table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: 'var(--spacing-md) var(--spacing-lg)', borderBottom: '1px solid var(--color-border)' }}>
          <h3 style={{ fontSize: 'var(--font-size-lg)', fontWeight: 600, color: 'var(--color-text-primary)' }}>
            Recent Requests
          </h3>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table className="table">
            <thead className="table-header">
              <tr>
                <th>Method</th>
                <th>Endpoint</th>
                <th>Status</th>
                <th>Time</th>
                <th>IP</th>
                <th>Timestamp</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {requests?.data?.map((req: any) => (
                <tr key={req.id}>
                  <td className="table-cell">
                    <span
                      className="badge"
                      style={{
                        backgroundColor: req.method === 'GET'
                          ? 'var(--color-primary-50)'
                          : req.method === 'POST'
                          ? 'var(--color-success-50)'
                          : req.method === 'PUT'
                          ? 'var(--color-warning-50)'
                          : req.method === 'DELETE'
                          ? 'var(--color-danger-50)'
                          : 'var(--color-bg-tertiary)',
                        color: req.method === 'GET'
                          ? 'var(--color-primary-light)'
                          : req.method === 'POST'
                          ? 'var(--color-success-light)'
                          : req.method === 'PUT'
                          ? 'var(--color-warning-light)'
                          : req.method === 'DELETE'
                          ? 'var(--color-danger-light)'
                          : 'var(--color-text-secondary)',
                        fontWeight: 700,
                      }}
                    >
                      {req.method}
                    </span>
                  </td>
                  <td className="table-cell table-cell-primary" style={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {req.endpoint}
                  </td>
                  <td className="table-cell">
                    <span
                      className="badge"
                      style={{
                        backgroundColor: req.status_code >= 500
                          ? 'var(--color-danger-50)'
                          : req.status_code >= 400
                          ? 'var(--color-warning-50)'
                          : 'var(--color-success-50)',
                        color: req.status_code >= 500
                          ? 'var(--color-danger-light)'
                          : req.status_code >= 400
                          ? 'var(--color-warning-light)'
                          : 'var(--color-success-light)',
                      }}
                    >
                      {req.status_code}
                    </span>
                  </td>
                  <td className="table-cell">
                    {Math.round(req.response_time)}ms
                  </td>
                  <td className="table-cell" style={{ fontFamily: 'var(--font-family-mono)' }}>
                    {req.ip_address}
                  </td>
                  <td className="table-cell">
                    {new Date(req.timestamp).toLocaleString('de-DE')}
                  </td>
                  <td className="table-cell" style={{ textAlign: 'right' }}>
                    <button
                      onClick={() => setSelectedRequest(req)}
                      className="btn btn-ghost"
                      style={{ padding: 'var(--spacing-xs)' }}
                    >
                      <Eye style={{ width: 20, height: 20, color: 'var(--color-primary-light)' }} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Request Details Modal */}
      {selectedRequest && (
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
              borderRadius: 'var(--radius-lg)',
              width: '100%',
              maxWidth: 900,
              maxHeight: '90vh',
              overflow: 'auto',
              border: '1px solid var(--color-border)',
            }}
          >
            <div
              className="flex items-center justify-between"
              style={{
                padding: 'var(--spacing-lg)',
                borderBottom: '1px solid var(--color-border)',
              }}
            >
              <h3 style={{ fontSize: 'var(--font-size-lg)', fontWeight: 600, color: 'var(--color-text-primary)' }}>
                Request Details
              </h3>
              <button
                onClick={() => setSelectedRequest(null)}
                className="btn btn-ghost"
                style={{ padding: 'var(--spacing-xs)' }}
              >
                <X style={{ width: 20, height: 20 }} />
              </button>
            </div>
            <div className="flex-col gap-md" style={{ padding: 'var(--spacing-lg)' }}>
              <div>
                <div style={{ fontSize: 'var(--font-size-sm)', fontWeight: 500, color: 'var(--color-text-secondary)', marginBottom: 'var(--spacing-xs)' }}>
                  Endpoint
                </div>
                <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-primary)', fontFamily: 'var(--font-family-mono)' }}>
                  {selectedRequest.method} {selectedRequest.endpoint}
                </div>
              </div>
              <div>
                <div style={{ fontSize: 'var(--font-size-sm)', fontWeight: 500, color: 'var(--color-text-secondary)', marginBottom: 'var(--spacing-xs)' }}>
                  Headers
                </div>
                <pre
                  style={{
                    fontSize: 'var(--font-size-xs)',
                    backgroundColor: 'var(--color-bg-tertiary)',
                    padding: 'var(--spacing-md)',
                    borderRadius: 'var(--radius-md)',
                    overflow: 'auto',
                    color: 'var(--color-text-primary)',
                    fontFamily: 'var(--font-family-mono)',
                  }}
                >
                  {JSON.stringify(selectedRequest.headers, null, 2)}
                </pre>
              </div>
              {selectedRequest.request_body && (
                <div>
                  <div style={{ fontSize: 'var(--font-size-sm)', fontWeight: 500, color: 'var(--color-text-secondary)', marginBottom: 'var(--spacing-xs)' }}>
                    Request Body
                  </div>
                  <pre
                    style={{
                      fontSize: 'var(--font-size-xs)',
                      backgroundColor: 'var(--color-bg-tertiary)',
                      padding: 'var(--spacing-md)',
                      borderRadius: 'var(--radius-md)',
                      overflow: 'auto',
                      color: 'var(--color-text-primary)',
                      fontFamily: 'var(--font-family-mono)',
                    }}
                  >
                    {JSON.stringify(selectedRequest.request_body, null, 2)}
                  </pre>
                </div>
              )}
              {selectedRequest.response_body && (
                <div>
                  <div style={{ fontSize: 'var(--font-size-sm)', fontWeight: 500, color: 'var(--color-text-secondary)', marginBottom: 'var(--spacing-xs)' }}>
                    Response Body
                  </div>
                  <pre
                    style={{
                      fontSize: 'var(--font-size-xs)',
                      backgroundColor: 'var(--color-bg-tertiary)',
                      padding: 'var(--spacing-md)',
                      borderRadius: 'var(--radius-md)',
                      overflow: 'auto',
                      maxHeight: 384,
                      color: 'var(--color-text-primary)',
                      fontFamily: 'var(--font-family-mono)',
                    }}
                  >
                    {JSON.stringify(selectedRequest.response_body, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ========== DB PROFILER TAB ==========
function DBProfilerTab() {
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['db-stats'],
    queryFn: devtoolsAPI.getDBStats,
  });

  const { data: queries, isLoading: queriesLoading } = useQuery({
    queryKey: ['db-queries'],
    queryFn: () => devtoolsAPI.getDBQueries({ limit: 50, min_duration: 100 }),
  });

  if (statsLoading || queriesLoading) {
    return (
      <div className="flex-center" style={{ padding: 'var(--spacing-2xl)' }}>
        <div className="spinner spinner-lg" />
      </div>
    );
  }

  return (
    <div className="flex-col gap-lg">
      {/* Connection Stats */}
      <div className="card">
        <h3 style={{ fontSize: 'var(--font-size-lg)', fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: 'var(--spacing-md)' }}>
          Database Connections
        </h3>
        <div className="grid grid-4">
          <div style={{ backgroundColor: 'var(--color-bg-tertiary)', borderRadius: 'var(--radius-md)', padding: 'var(--spacing-md)' }}>
            <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-tertiary)' }}>Total</div>
            <div style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 700, color: 'var(--color-text-primary)', marginTop: 'var(--spacing-xs)' }}>
              {stats?.data?.connections?.total || 0}
            </div>
          </div>
          <div style={{ backgroundColor: 'var(--color-success-50)', borderRadius: 'var(--radius-md)', padding: 'var(--spacing-md)' }}>
            <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-tertiary)' }}>Active</div>
            <div style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 700, color: 'var(--color-success-light)', marginTop: 'var(--spacing-xs)' }}>
              {stats?.data?.connections?.active || 0}
            </div>
          </div>
          <div style={{ backgroundColor: 'var(--color-primary-50)', borderRadius: 'var(--radius-md)', padding: 'var(--spacing-md)' }}>
            <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-tertiary)' }}>Idle</div>
            <div style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 700, color: 'var(--color-primary-light)', marginTop: 'var(--spacing-xs)' }}>
              {stats?.data?.connections?.idle || 0}
            </div>
          </div>
          <div style={{ backgroundColor: 'var(--color-warning-50)', borderRadius: 'var(--radius-md)', padding: 'var(--spacing-md)' }}>
            <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-tertiary)' }}>Idle in Transaction</div>
            <div style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 700, color: 'var(--color-warning-light)', marginTop: 'var(--spacing-xs)' }}>
              {stats?.data?.connections?.idle_in_transaction || 0}
            </div>
          </div>
        </div>
      </div>

      {/* Table Stats */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: 'var(--spacing-md) var(--spacing-lg)', borderBottom: '1px solid var(--color-border)' }}>
          <h3 style={{ fontSize: 'var(--font-size-lg)', fontWeight: 600, color: 'var(--color-text-primary)' }}>
            Table Statistics
          </h3>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table className="table">
            <thead className="table-header">
              <tr>
                <th>Table</th>
                <th>Size</th>
                <th>Rows</th>
                <th>Inserts</th>
                <th>Updates</th>
                <th>Deletes</th>
              </tr>
            </thead>
            <tbody>
              {stats?.data?.tables?.map((table: any, idx: number) => (
                <tr key={idx}>
                  <td className="table-cell table-cell-primary">
                    {table.tablename}
                  </td>
                  <td className="table-cell">
                    {table.size}
                  </td>
                  <td className="table-cell">
                    {table.row_count?.toLocaleString()}
                  </td>
                  <td className="table-cell">
                    {table.inserts?.toLocaleString()}
                  </td>
                  <td className="table-cell">
                    {table.updates?.toLocaleString()}
                  </td>
                  <td className="table-cell">
                    {table.deletes?.toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Index Stats */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: 'var(--spacing-md) var(--spacing-lg)', borderBottom: '1px solid var(--color-border)' }}>
          <h3 style={{ fontSize: 'var(--font-size-lg)', fontWeight: 600, color: 'var(--color-text-primary)' }}>
            Most Used Indexes
          </h3>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table className="table">
            <thead className="table-header">
              <tr>
                <th>Table</th>
                <th>Index</th>
                <th>Scans</th>
                <th>Tuples Read</th>
                <th>Tuples Fetched</th>
              </tr>
            </thead>
            <tbody>
              {stats?.data?.indexes?.map((index: any, idx: number) => (
                <tr key={idx}>
                  <td className="table-cell">
                    {index.tablename}
                  </td>
                  <td className="table-cell table-cell-primary">
                    {index.indexname}
                  </td>
                  <td className="table-cell">
                    {index.scans?.toLocaleString()}
                  </td>
                  <td className="table-cell">
                    {index.tuples_read?.toLocaleString()}
                  </td>
                  <td className="table-cell">
                    {index.tuples_fetched?.toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Slow Queries */}
      <div className="card">
        <h3 style={{ fontSize: 'var(--font-size-lg)', fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: 'var(--spacing-md)' }}>
          Slow Queries (&gt; 100ms)
        </h3>
        <div className="flex-col gap-md">
          {queries?.data?.map((query: any, idx: number) => (
            <div
              key={idx}
              style={{
                padding: 'var(--spacing-md)',
                backgroundColor: 'var(--color-bg-tertiary)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--color-border)',
              }}
            >
              <div className="flex items-start justify-between" style={{ marginBottom: 'var(--spacing-sm)' }}>
                <div style={{ flex: 1 }}>
                  <code
                    style={{
                      fontSize: 'var(--font-size-xs)',
                      color: 'var(--color-text-primary)',
                      display: 'block',
                      overflow: 'auto',
                      fontFamily: 'var(--font-family-mono)',
                    }}
                  >
                    {query.query}
                  </code>
                </div>
                <div style={{ marginLeft: 'var(--spacing-md)', textAlign: 'right' }}>
                  {query.mean_exec_time && (
                    <div style={{ fontSize: 'var(--font-size-lg)', fontWeight: 700, color: 'var(--color-danger-light)' }}>
                      {Math.round(query.mean_exec_time)}ms
                    </div>
                  )}
                  {query.duration && (
                    <div style={{ fontSize: 'var(--font-size-lg)', fontWeight: 700, color: 'var(--color-danger-light)' }}>
                      {Math.round(query.duration)}ms
                    </div>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-md" style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-tertiary)' }}>
                {query.calls && <span>Calls: {query.calls}</span>}
                {query.total_exec_time && (
                  <span>Total: {Math.round(query.total_exec_time)}ms</span>
                )}
                {query.rows_returned && <span>Rows: {query.rows_returned}</span>}
                {query.executed_at && (
                  <span>{new Date(query.executed_at).toLocaleString('de-DE')}</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ========== WEBHOOKS TAB ==========
function WebhooksTab() {
  const queryClient = useQueryClient();

  const { data: webhooks, isLoading: webhooksLoading } = useQuery({
    queryKey: ['webhooks'],
    queryFn: () => devtoolsAPI.getWebhooks({ limit: 100 }),
  });

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['webhook-stats'],
    queryFn: devtoolsAPI.getWebhookStats,
  });

  const retryMutation = useMutation({
    mutationFn: devtoolsAPI.retryWebhook,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['webhooks'] });
      queryClient.invalidateQueries({ queryKey: ['webhook-stats'] });
    },
  });

  if (webhooksLoading || statsLoading) {
    return (
      <div className="flex-center" style={{ padding: 'var(--spacing-2xl)' }}>
        <div className="spinner spinner-lg" />
      </div>
    );
  }

  return (
    <div className="flex-col gap-lg">
      {/* Stats */}
      <div className="grid grid-3">
        <div className="card">
          <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-tertiary)' }}>Total (24h)</div>
          <div style={{ fontSize: 'var(--font-size-3xl)', fontWeight: 700, color: 'var(--color-text-primary)', marginTop: 'var(--spacing-sm)' }}>
            {stats?.data?.overview?.total || 0}
          </div>
        </div>
        <div className="card">
          <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-tertiary)' }}>Successful</div>
          <div style={{ fontSize: 'var(--font-size-3xl)', fontWeight: 700, color: 'var(--color-success-light)', marginTop: 'var(--spacing-sm)' }}>
            {stats?.data?.overview?.successful || 0}
          </div>
        </div>
        <div className="card">
          <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-tertiary)' }}>Failed</div>
          <div style={{ fontSize: 'var(--font-size-3xl)', fontWeight: 700, color: 'var(--color-danger-light)', marginTop: 'var(--spacing-sm)' }}>
            {stats?.data?.overview?.failed || 0}
          </div>
        </div>
      </div>

      {/* By URL */}
      <div className="card">
        <h3 style={{ fontSize: 'var(--font-size-lg)', fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: 'var(--spacing-md)' }}>
          Webhooks by URL (24h)
        </h3>
        <div className="flex-col gap-sm">
          {stats?.data?.byURL?.map((url: any, idx: number) => (
            <div
              key={idx}
              className="flex items-center justify-between"
              style={{
                padding: 'var(--spacing-md)',
                backgroundColor: 'var(--color-bg-tertiary)',
                borderRadius: 'var(--radius-md)',
              }}
            >
              <div style={{ flex: 1, fontSize: 'var(--font-size-sm)', color: 'var(--color-text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {url.url}
              </div>
              <div className="flex items-center gap-md" style={{ marginLeft: 'var(--spacing-md)' }}>
                <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-tertiary)' }}>
                  {url.total} total
                </span>
                <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-success-light)' }}>{url.successful} OK</span>
                {url.failed > 0 && (
                  <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-danger-light)' }}>{url.failed} failed</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Webhooks Table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: 'var(--spacing-md) var(--spacing-lg)', borderBottom: '1px solid var(--color-border)' }}>
          <h3 style={{ fontSize: 'var(--font-size-lg)', fontWeight: 600, color: 'var(--color-text-primary)' }}>
            Webhook Logs
          </h3>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table className="table">
            <thead className="table-header">
              <tr>
                <th>URL</th>
                <th>Status</th>
                <th>Duration</th>
                <th>Retries</th>
                <th>Created</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {webhooks?.data?.map((webhook: any) => (
                <tr key={webhook.id}>
                  <td className="table-cell table-cell-primary" style={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {webhook.url}
                  </td>
                  <td className="table-cell">
                    <span
                      className="badge"
                      style={{
                        backgroundColor: webhook.status === 'success'
                          ? 'var(--color-success-50)'
                          : webhook.status === 'failed'
                          ? 'var(--color-danger-50)'
                          : 'var(--color-warning-50)',
                        color: webhook.status === 'success'
                          ? 'var(--color-success-light)'
                          : webhook.status === 'failed'
                          ? 'var(--color-danger-light)'
                          : 'var(--color-warning-light)',
                      }}
                    >
                      {webhook.status}
                    </span>
                  </td>
                  <td className="table-cell">
                    {webhook.duration ? `${webhook.duration}ms` : '-'}
                  </td>
                  <td className="table-cell">
                    {webhook.retry_count}
                  </td>
                  <td className="table-cell">
                    {new Date(webhook.created_at).toLocaleString('de-DE')}
                  </td>
                  <td className="table-cell" style={{ textAlign: 'right' }}>
                    {webhook.status === 'failed' && (
                      <button
                        onClick={() => retryMutation.mutate(webhook.id)}
                        disabled={retryMutation.isPending}
                        className="btn btn-ghost"
                        style={{ padding: 'var(--spacing-xs)' }}
                      >
                        <RefreshCw style={{ width: 20, height: 20, color: 'var(--color-primary-light)' }} />
                      </button>
                    )}
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

// ========== FEATURE FLAGS TAB ==========
function FeatureFlagsTab() {
  const [showModal, setShowModal] = useState(false);
  const [editingFlag, setEditingFlag] = useState<any>(null);
  const queryClient = useQueryClient();

  const { data: flags, isLoading } = useQuery({
    queryKey: ['feature-flags'],
    queryFn: devtoolsAPI.getFeatureFlags,
  });

  const createMutation = useMutation({
    mutationFn: devtoolsAPI.createFeatureFlag,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feature-flags'] });
      setShowModal(false);
      setEditingFlag(null);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, flag }: any) => devtoolsAPI.updateFeatureFlag(id, flag),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feature-flags'] });
      setShowModal(false);
      setEditingFlag(null);
    },
  });

  const toggleMutation = useMutation({
    mutationFn: devtoolsAPI.toggleFeatureFlag,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feature-flags'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: devtoolsAPI.deleteFeatureFlag,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feature-flags'] });
    },
  });

  if (isLoading) {
    return (
      <div className="flex-center" style={{ padding: 'var(--spacing-2xl)' }}>
        <div className="spinner spinner-lg" />
      </div>
    );
  }

  return (
    <div className="flex-col gap-lg">
      <div className="flex items-center justify-between">
        <h2 style={{ fontSize: 'var(--font-size-xl)', fontWeight: 600, color: 'var(--color-text-primary)' }}>
          Feature Flags ({flags?.data?.length || 0})
        </h2>
        <button
          onClick={() => {
            setEditingFlag(null);
            setShowModal(true);
          }}
          className="btn btn-primary"
        >
          <Plus style={{ width: 16, height: 16 }} />
          New Flag
        </button>
      </div>

      <div className="flex-col gap-md">
        {flags?.data?.map((flag: any) => (
          <div key={flag.id} className="card">
            <div className="flex items-start justify-between">
              <div style={{ flex: 1 }}>
                <div className="flex items-center gap-md" style={{ marginBottom: 'var(--spacing-sm)' }}>
                  <h3 style={{ fontSize: 'var(--font-size-lg)', fontWeight: 600, color: 'var(--color-text-primary)' }}>
                    {flag.name}
                  </h3>
                  <button
                    onClick={() => toggleMutation.mutate(flag.id)}
                    disabled={toggleMutation.isPending}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, transition: 'var(--transition-fast)' }}
                  >
                    {flag.enabled ? (
                      <ToggleRight style={{ width: 32, height: 32, color: 'var(--color-success-light)' }} />
                    ) : (
                      <ToggleLeft style={{ width: 32, height: 32, color: 'var(--color-text-muted)' }} />
                    )}
                  </button>
                </div>
                <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-tertiary)', marginBottom: 'var(--spacing-md)' }}>
                  {flag.description}
                </p>
                <div className="flex items-center gap-lg" style={{ fontSize: 'var(--font-size-sm)' }}>
                  <div>
                    <span style={{ color: 'var(--color-text-tertiary)' }}>Rollout: </span>
                    <span style={{ fontWeight: 600, color: 'var(--color-text-primary)' }}>
                      {flag.rollout_percentage}%
                    </span>
                  </div>
                  {flag.target_users && flag.target_users.length > 0 && (
                    <div>
                      <span style={{ color: 'var(--color-text-tertiary)' }}>Target Users: </span>
                      <span style={{ fontWeight: 600, color: 'var(--color-text-primary)' }}>
                        {flag.target_users.length}
                      </span>
                    </div>
                  )}
                  <div>
                    <span style={{ color: 'var(--color-text-tertiary)' }}>Created: </span>
                    <span style={{ color: 'var(--color-text-primary)' }}>
                      {new Date(flag.created_at).toLocaleDateString('de-DE')}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-sm" style={{ marginLeft: 'var(--spacing-md)' }}>
                <button
                  onClick={() => {
                    setEditingFlag(flag);
                    setShowModal(true);
                  }}
                  className="btn btn-ghost"
                  style={{ padding: 'var(--spacing-sm)' }}
                >
                  <Edit style={{ width: 20, height: 20, color: 'var(--color-primary-light)' }} />
                </button>
                <button
                  onClick={() => deleteMutation.mutate(flag.id)}
                  disabled={deleteMutation.isPending}
                  className="btn btn-ghost"
                  style={{ padding: 'var(--spacing-sm)' }}
                >
                  <Trash2 style={{ width: 20, height: 20, color: 'var(--color-danger-light)' }} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Create/Edit Modal */}
      {showModal && (
        <FeatureFlagModal
          flag={editingFlag}
          onClose={() => {
            setShowModal(false);
            setEditingFlag(null);
          }}
          onSubmit={(flag) => {
            if (editingFlag) {
              updateMutation.mutate({ id: editingFlag.id, flag });
            } else {
              createMutation.mutate(flag);
            }
          }}
        />
      )}
    </div>
  );
}

// Feature Flag Modal Component
function FeatureFlagModal({ flag, onClose, onSubmit }: any) {
  const [formData, setFormData] = useState({
    name: flag?.name || '',
    description: flag?.description || '',
    enabled: flag?.enabled || false,
    rollout_percentage: flag?.rollout_percentage || 0,
    target_users: flag?.target_users?.join(',') || '',
  });

  const handleSubmit = () => {
    const target_users = formData.target_users
      ? formData.target_users.split(',').map((id) => parseInt(id.trim())).filter((id) => !isNaN(id))
      : [];

    onSubmit({
      name: formData.name,
      description: formData.description,
      enabled: formData.enabled,
      rollout_percentage: parseInt(formData.rollout_percentage as any),
      target_users,
    });
  };

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
          borderRadius: 'var(--radius-lg)',
          width: '100%',
          maxWidth: 500,
          border: '1px solid var(--color-border)',
        }}
      >
        <div style={{ padding: 'var(--spacing-lg)', borderBottom: '1px solid var(--color-border)' }}>
          <h3 style={{ fontSize: 'var(--font-size-lg)', fontWeight: 600, color: 'var(--color-text-primary)' }}>
            {flag ? 'Edit Feature Flag' : 'New Feature Flag'}
          </h3>
        </div>
        <div className="flex-col gap-md" style={{ padding: 'var(--spacing-lg)' }}>
          <div>
            <label className="input-label">Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="dark_mode"
              className="input"
            />
          </div>
          <div>
            <label className="input-label">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Enable dark mode theme"
              rows={2}
              className="input"
              style={{ resize: 'vertical' }}
            />
          </div>
          <div className="flex items-center gap-sm">
            <input
              type="checkbox"
              id="enabled"
              checked={formData.enabled}
              onChange={(e) => setFormData({ ...formData, enabled: e.target.checked })}
              style={{ width: 16, height: 16, accentColor: 'var(--color-primary)' }}
            />
            <label htmlFor="enabled" style={{ fontSize: 'var(--font-size-sm)', fontWeight: 500, color: 'var(--color-text-secondary)' }}>
              Enabled
            </label>
          </div>
          <div>
            <label className="input-label">Rollout Percentage (0-100)</label>
            <input
              type="number"
              min="0"
              max="100"
              value={formData.rollout_percentage}
              onChange={(e) =>
                setFormData({ ...formData, rollout_percentage: e.target.value as any })
              }
              className="input"
            />
          </div>
          <div>
            <label className="input-label">Target User IDs (comma-separated)</label>
            <input
              type="text"
              value={formData.target_users}
              onChange={(e) => setFormData({ ...formData, target_users: e.target.value })}
              placeholder="1, 2, 3"
              className="input"
            />
          </div>
        </div>
        <div className="flex gap-md" style={{ padding: 'var(--spacing-lg)', borderTop: '1px solid var(--color-border)' }}>
          <button
            onClick={onClose}
            className="btn btn-secondary"
            style={{ flex: 1 }}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!formData.name}
            className="btn btn-primary"
            style={{ flex: 1 }}
          >
            {flag ? 'Update' : 'Create'}
          </button>
        </div>
      </div>
    </div>
  );
}
