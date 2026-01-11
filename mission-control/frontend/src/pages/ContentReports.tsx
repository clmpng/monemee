import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { reportsAPI } from '../services/api';
import {
  Flag,
  Search,
  Filter,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  ExternalLink,
  Bot,
  Settings,
  RefreshCw
} from 'lucide-react';
import ReportDetailModal from '../components/reports/ReportDetailModal';
import AutoReviewConfigModal from '../components/reports/AutoReviewConfigModal';
import styles from '../styles/pages/common.module.css';
import reportStyles from '../styles/pages/ContentReports.module.css';

// Report reason labels
const REASON_LABELS: Record<string, string> = {
  copyright: 'Urheberrecht',
  fraud: 'Betrug',
  illegal: 'Illegal',
  harmful: 'Schädlich',
  hate: 'Hassrede',
  privacy: 'Privatsphäre',
  other: 'Sonstiges'
};

// Status labels and colors
const STATUS_CONFIG: Record<string, { label: string; color: string; icon: any }> = {
  pending: { label: 'Offen', color: 'warning', icon: Clock },
  in_review: { label: 'In Prüfung', color: 'info', icon: Eye },
  resolved: { label: 'Erledigt', color: 'success', icon: CheckCircle },
  rejected: { label: 'Abgelehnt', color: 'danger', icon: XCircle }
};

// Priority labels
const PRIORITY_CONFIG: Record<string, { label: string; color: string }> = {
  low: { label: 'Niedrig', color: 'default' },
  normal: { label: 'Normal', color: 'info' },
  high: { label: 'Hoch', color: 'warning' },
  urgent: { label: 'Dringend', color: 'danger' }
};

export default function ContentReports() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const [reasonFilter, setReasonFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [selectedReportId, setSelectedReportId] = useState<string | null>(null);
  const [showAutoReviewConfig, setShowAutoReviewConfig] = useState(false);

  // Fetch statistics
  const { data: stats } = useQuery({
    queryKey: ['reports-stats'],
    queryFn: reportsAPI.getStatistics,
    refetchInterval: 30000
  });

  // Fetch reports
  const { data: reportsData, isLoading, refetch } = useQuery({
    queryKey: ['reports-list', page, statusFilter, reasonFilter, priorityFilter],
    queryFn: () =>
      reportsAPI.getAll({
        limit: 50,
        offset: (page - 1) * 50,
        status: statusFilter || undefined,
        reason: reasonFilter || undefined,
        priority: priorityFilter || undefined,
        orderBy: 'created_at',
        orderDir: 'DESC'
      }),
    refetchInterval: 60000
  });

  const reports = reportsData?.data?.reports || [];
  const counts = reportsData?.data?.counts || {};
  const pagination = reportsData?.data?.pagination;

  // Quick actions mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => reportsAPI.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reports-list'] });
      queryClient.invalidateQueries({ queryKey: ['reports-stats'] });
    }
  });

  const handleQuickAction = (reportId: string, status: string, action?: string) => {
    updateMutation.mutate({
      id: reportId,
      data: { status, resolution_action: action }
    });
  };

  const statsData = stats?.data || {};

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <div className={reportStyles.headerRow}>
          <div>
            <h1 className={styles.title}>Content Reports</h1>
            <p className={styles.subtitle}>DSA Art. 16 - Melde- und Abhilfeverfahren</p>
          </div>
          <div className={reportStyles.headerActions}>
            <button
              onClick={() => refetch()}
              className="btn btn-ghost btn-sm"
              title="Aktualisieren"
            >
              <RefreshCw size={16} />
            </button>
            <button
              onClick={() => setShowAutoReviewConfig(true)}
              className="btn btn-secondary btn-sm"
            >
              <Bot size={16} />
              <span>Auto-Review</span>
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className={styles.statsGrid}>
        <div className={`card-compact ${reportStyles.statCard} ${reportStyles.statCardWarning}`}>
          <div className={reportStyles.statIcon}>
            <Clock size={24} />
          </div>
          <div>
            <p className={styles.statLabel}>Offene Meldungen</p>
            <p className={styles.statValue}>{counts.pending || 0}</p>
          </div>
        </div>

        <div className={`card-compact ${reportStyles.statCard}`}>
          <div className={reportStyles.statIcon}>
            <Eye size={24} />
          </div>
          <div>
            <p className={styles.statLabel}>In Prüfung</p>
            <p className={styles.statValue}>{counts.in_review || 0}</p>
          </div>
        </div>

        <div className={`card-compact ${reportStyles.statCard} ${reportStyles.statCardSuccess}`}>
          <div className={reportStyles.statIcon}>
            <CheckCircle size={24} />
          </div>
          <div>
            <p className={styles.statLabel}>Erledigt</p>
            <p className={styles.statValue}>{counts.resolved || 0}</p>
          </div>
        </div>

        <div className="card-compact">
          <p className={styles.statLabel}>Statistiken</p>
          <div className={reportStyles.miniStats}>
            <div>
              <span className={reportStyles.miniStatValue}>{statsData.today_count || 0}</span>
              <span className={reportStyles.miniStatLabel}>Heute</span>
            </div>
            <div>
              <span className={reportStyles.miniStatValue}>{statsData.week_count || 0}</span>
              <span className={reportStyles.miniStatLabel}>Diese Woche</span>
            </div>
            <div>
              <span className={reportStyles.miniStatValue}>
                {statsData.avg_resolution_hours ? `${statsData.avg_resolution_hours}h` : '-'}
              </span>
              <span className={reportStyles.miniStatLabel}>Ø Bearbeitungszeit</span>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="card">
        <div className={styles.filters}>
          <div className={styles.filterGroup}>
            <label className={styles.filterLabel}>Status</label>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              className="input"
            >
              <option value="">Alle Status</option>
              <option value="pending">Offen</option>
              <option value="in_review">In Prüfung</option>
              <option value="resolved">Erledigt</option>
              <option value="rejected">Abgelehnt</option>
            </select>
          </div>

          <div className={styles.filterGroup}>
            <label className={styles.filterLabel}>Grund</label>
            <select
              value={reasonFilter}
              onChange={(e) => {
                setReasonFilter(e.target.value);
                setPage(1);
              }}
              className="input"
            >
              <option value="">Alle Gründe</option>
              <option value="copyright">Urheberrecht</option>
              <option value="fraud">Betrug</option>
              <option value="illegal">Illegal</option>
              <option value="harmful">Schädlich</option>
              <option value="hate">Hassrede</option>
              <option value="privacy">Privatsphäre</option>
              <option value="other">Sonstiges</option>
            </select>
          </div>

          <div className={styles.filterGroup}>
            <label className={styles.filterLabel}>Priorität</label>
            <select
              value={priorityFilter}
              onChange={(e) => {
                setPriorityFilter(e.target.value);
                setPage(1);
              }}
              className="input"
            >
              <option value="">Alle Prioritäten</option>
              <option value="urgent">Dringend</option>
              <option value="high">Hoch</option>
              <option value="normal">Normal</option>
              <option value="low">Niedrig</option>
            </select>
          </div>

          <div className={styles.filterGroup}>
            <label className={styles.filterLabel}>&nbsp;</label>
            <button
              onClick={() => {
                setStatusFilter('');
                setReasonFilter('');
                setPriorityFilter('');
                setPage(1);
              }}
              className="btn btn-ghost"
            >
              Filter zurücksetzen
            </button>
          </div>
        </div>
      </div>

      {/* Reports Table */}
      <div className="card">
        {isLoading ? (
          <div className={styles.loading}>
            <div className="spinner spinner-lg"></div>
          </div>
        ) : reports.length === 0 ? (
          <div className={styles.emptyState}>
            <Flag size={48} className={styles.emptyIcon} />
            <p className={styles.emptyText}>Keine Meldungen gefunden</p>
          </div>
        ) : (
          <>
            <div className={styles.tableContainer}>
              <table className="table">
                <thead className="table-header">
                  <tr>
                    <th>Report ID</th>
                    <th>Status</th>
                    <th>Priorität</th>
                    <th>Grund</th>
                    <th>Produkt</th>
                    <th>Eingereicht</th>
                    <th>Auto-Review</th>
                    <th style={{ textAlign: 'center' }}>Aktionen</th>
                  </tr>
                </thead>
                <tbody>
                  {reports.map((report: any) => {
                    const statusConfig = STATUS_CONFIG[report.status] || STATUS_CONFIG.pending;
                    const priorityConfig = PRIORITY_CONFIG[report.priority] || PRIORITY_CONFIG.normal;
                    const StatusIcon = statusConfig.icon;

                    return (
                      <tr key={report.id} className={reportStyles.reportRow}>
                        <td className="table-cell">
                          <code className={reportStyles.reportId}>{report.report_id}</code>
                        </td>
                        <td className="table-cell">
                          <span className={`badge badge-${statusConfig.color}`}>
                            <StatusIcon size={12} />
                            {statusConfig.label}
                          </span>
                        </td>
                        <td className="table-cell">
                          <span className={`badge badge-${priorityConfig.color}`}>
                            {priorityConfig.label}
                          </span>
                        </td>
                        <td className="table-cell">
                          {REASON_LABELS[report.reason] || report.reason}
                        </td>
                        <td className="table-cell">
                          {report.product_title ? (
                            <div className={reportStyles.productInfo}>
                              <span className={reportStyles.productTitle}>
                                {report.product_title}
                              </span>
                              {report.seller_username && (
                                <span className={reportStyles.sellerName}>
                                  @{report.seller_username}
                                </span>
                              )}
                            </div>
                          ) : (
                            <span className={reportStyles.unknownProduct}>
                              {report.product_url}
                            </span>
                          )}
                        </td>
                        <td className="table-cell">
                          <span className={reportStyles.timestamp}>
                            {new Date(report.created_at).toLocaleDateString('de-DE')}
                          </span>
                          <span className={reportStyles.timestampTime}>
                            {new Date(report.created_at).toLocaleTimeString('de-DE', {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>
                        </td>
                        <td className="table-cell">
                          {report.auto_reviewed ? (
                            <span
                              className={`badge badge-${
                                report.auto_review_confidence >= 0.8 ? 'success' : 'warning'
                              }`}
                              title={`Confidence: ${(report.auto_review_confidence * 100).toFixed(0)}%`}
                            >
                              <Bot size={12} />
                              {(report.auto_review_confidence * 100).toFixed(0)}%
                            </span>
                          ) : (
                            <span className={reportStyles.noAutoReview}>-</span>
                          )}
                        </td>
                        <td className="table-cell">
                          <div className={reportStyles.actions}>
                            <button
                              onClick={() => setSelectedReportId(report.id.toString())}
                              className="btn btn-ghost btn-sm"
                              title="Details anzeigen"
                            >
                              <Eye size={16} />
                            </button>
                            {report.status === 'pending' && (
                              <>
                                <button
                                  onClick={() => handleQuickAction(report.id, 'in_review')}
                                  className="btn btn-ghost btn-sm"
                                  title="In Prüfung setzen"
                                  disabled={updateMutation.isPending}
                                >
                                  <Clock size={16} />
                                </button>
                                <button
                                  onClick={() =>
                                    handleQuickAction(report.id, 'resolved', 'removed')
                                  }
                                  className="btn btn-ghost btn-sm btn-success"
                                  title="Entfernen & Erledigt"
                                  disabled={updateMutation.isPending}
                                >
                                  <CheckCircle size={16} />
                                </button>
                                <button
                                  onClick={() =>
                                    handleQuickAction(report.id, 'rejected', 'no_action')
                                  }
                                  className="btn btn-ghost btn-sm btn-danger"
                                  title="Ablehnen"
                                  disabled={updateMutation.isPending}
                                >
                                  <XCircle size={16} />
                                </button>
                              </>
                            )}
                            {report.product_id && (
                              <a
                                href={`https://monemee.de/p/${report.product_id}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="btn btn-ghost btn-sm"
                                title="Produkt ansehen"
                              >
                                <ExternalLink size={16} />
                              </a>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {pagination && pagination.total > 50 && (
              <div className={styles.pagination}>
                <p className={styles.paginationText}>
                  Zeige {(page - 1) * 50 + 1} bis {Math.min(page * 50, pagination.total)} von{' '}
                  {pagination.total} Meldungen
                </p>
                <div className={styles.paginationButtons}>
                  <button
                    onClick={() => setPage(page - 1)}
                    disabled={page === 1}
                    className="btn btn-secondary btn-sm"
                  >
                    Zurück
                  </button>
                  <button
                    onClick={() => setPage(page + 1)}
                    disabled={page * 50 >= pagination.total}
                    className="btn btn-secondary btn-sm"
                  >
                    Weiter
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Report Detail Modal */}
      {selectedReportId && (
        <ReportDetailModal
          reportId={selectedReportId}
          onClose={() => setSelectedReportId(null)}
          onUpdate={() => {
            queryClient.invalidateQueries({ queryKey: ['reports-list'] });
            queryClient.invalidateQueries({ queryKey: ['reports-stats'] });
          }}
        />
      )}

      {/* Auto-Review Config Modal */}
      {showAutoReviewConfig && (
        <AutoReviewConfigModal onClose={() => setShowAutoReviewConfig(false)} />
      )}
    </div>
  );
}
