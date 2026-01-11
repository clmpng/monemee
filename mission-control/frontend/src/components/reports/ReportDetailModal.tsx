import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { reportsAPI } from '../../services/api';
import {
  X,
  Flag,
  Clock,
  CheckCircle,
  XCircle,
  Eye,
  Bot,
  ExternalLink,
  User,
  Mail,
  AlertTriangle
} from 'lucide-react';
import styles from '../../styles/pages/ContentReports.module.css';

interface ReportDetailModalProps {
  reportId: string;
  onClose: () => void;
  onUpdate: () => void;
}

const STATUS_OPTIONS = [
  { value: 'pending', label: 'Offen' },
  { value: 'in_review', label: 'In Prüfung' },
  { value: 'resolved', label: 'Erledigt' },
  { value: 'rejected', label: 'Abgelehnt' }
];

const ACTION_OPTIONS = [
  { value: 'removed', label: 'Inhalt entfernt' },
  { value: 'warning', label: 'Verwarnung ausgesprochen' },
  { value: 'no_action', label: 'Keine Maßnahme erforderlich' },
  { value: 'escalated', label: 'Eskaliert' }
];

const REASON_LABELS: Record<string, string> = {
  copyright: 'Urheberrechtsverletzung',
  fraud: 'Betrug / Irreführung',
  illegal: 'Illegale Inhalte',
  harmful: 'Schädliche Inhalte',
  hate: 'Hassrede / Diskriminierung',
  privacy: 'Verletzung der Privatsphäre',
  other: 'Sonstiger Verstoß'
};

export default function ReportDetailModal({
  reportId,
  onClose,
  onUpdate
}: ReportDetailModalProps) {
  const [status, setStatus] = useState('');
  const [action, setAction] = useState('');
  const [note, setNote] = useState('');

  const { data: reportData, isLoading } = useQuery({
    queryKey: ['report-detail', reportId],
    queryFn: () => reportsAPI.getById(reportId),
    onSuccess: (data: any) => {
      if (data?.data) {
        setStatus(data.data.status);
        setAction(data.data.resolution_action || '');
        setNote(data.data.resolution_note || '');
      }
    }
  });

  const updateMutation = useMutation({
    mutationFn: (data: any) => reportsAPI.update(reportId, data),
    onSuccess: () => {
      onUpdate();
      onClose();
    }
  });

  const handleSave = () => {
    updateMutation.mutate({
      status,
      resolution_action: action || null,
      resolution_note: note || null
    });
  };

  const report = reportData?.data;

  if (isLoading) {
    return (
      <div className={styles.modalOverlay} onClick={onClose}>
        <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
          <div className={styles.modalHeader}>
            <h2 className={styles.modalTitle}>Lade...</h2>
            <button className={styles.modalClose} onClick={onClose}>
              <X size={20} />
            </button>
          </div>
          <div className={styles.modalContent}>
            <div style={{ display: 'flex', justifyContent: 'center', padding: '2rem' }}>
              <div className="spinner spinner-lg"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!report) {
    return null;
  }

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>
            <Flag size={20} />
            Meldung {report.report_id}
          </h2>
          <button className={styles.modalClose} onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className={styles.modalContent}>
          {/* Overview */}
          <div className={styles.detailSection}>
            <h3 className={styles.detailSectionTitle}>Übersicht</h3>
            <div className={styles.detailGrid}>
              <div className={styles.detailItem}>
                <span className={styles.detailLabel}>Report ID</span>
                <code className={styles.detailValue}>{report.report_id}</code>
              </div>
              <div className={styles.detailItem}>
                <span className={styles.detailLabel}>Eingereicht am</span>
                <span className={styles.detailValue}>
                  {new Date(report.created_at).toLocaleString('de-DE')}
                </span>
              </div>
              <div className={styles.detailItem}>
                <span className={styles.detailLabel}>Meldegrund</span>
                <span className={styles.detailValue}>
                  {REASON_LABELS[report.reason] || report.reason}
                </span>
              </div>
              <div className={styles.detailItem}>
                <span className={styles.detailLabel}>Priorität</span>
                <span className={styles.detailValue} style={{ textTransform: 'capitalize' }}>
                  {report.priority}
                </span>
              </div>
            </div>
          </div>

          {/* Product Info */}
          <div className={styles.detailSection}>
            <h3 className={styles.detailSectionTitle}>Gemeldetes Produkt</h3>
            {report.product_title ? (
              <div className={styles.detailGrid}>
                <div className={styles.detailItem}>
                  <span className={styles.detailLabel}>Produkttitel</span>
                  <span className={styles.detailValue}>{report.product_title}</span>
                </div>
                <div className={styles.detailItem}>
                  <span className={styles.detailLabel}>Verkäufer</span>
                  <span className={styles.detailValue}>
                    {report.seller_username ? `@${report.seller_username}` : '-'}
                  </span>
                </div>
                {report.product_id && (
                  <div className={styles.detailItem}>
                    <span className={styles.detailLabel}>Produkt-Link</span>
                    <a
                      href={`https://monemee.de/p/${report.product_id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-ghost btn-sm"
                      style={{ padding: 0, height: 'auto' }}
                    >
                      <ExternalLink size={14} />
                      Produkt ansehen
                    </a>
                  </div>
                )}
              </div>
            ) : (
              <div className={styles.detailItem}>
                <span className={styles.detailLabel}>URL/ID (wie eingegeben)</span>
                <code className={styles.detailValue}>{report.product_url}</code>
              </div>
            )}
          </div>

          {/* Description */}
          <div className={styles.detailSection}>
            <h3 className={styles.detailSectionTitle}>Beschreibung des Meldenden</h3>
            <div className={styles.descriptionBox}>{report.description}</div>
          </div>

          {/* Reporter Info */}
          {(report.reporter_email || report.reporter_name) && (
            <div className={styles.detailSection}>
              <h3 className={styles.detailSectionTitle}>Kontaktdaten des Meldenden</h3>
              <div className={styles.detailGrid}>
                {report.reporter_name && (
                  <div className={styles.detailItem}>
                    <span className={styles.detailLabel}>
                      <User size={12} style={{ marginRight: 4 }} />
                      Name
                    </span>
                    <span className={styles.detailValue}>{report.reporter_name}</span>
                  </div>
                )}
                {report.reporter_email && (
                  <div className={styles.detailItem}>
                    <span className={styles.detailLabel}>
                      <Mail size={12} style={{ marginRight: 4 }} />
                      E-Mail
                    </span>
                    <span className={styles.detailValue}>{report.reporter_email}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Auto Review Result */}
          {report.auto_reviewed && report.auto_review_result && (
            <div className={styles.detailSection}>
              <h3 className={styles.detailSectionTitle}>KI-Analyse</h3>
              <div className={styles.autoReviewResult}>
                <div className={styles.autoReviewHeader}>
                  <Bot size={16} />
                  <span>
                    Auto-Review ({(report.auto_review_confidence * 100).toFixed(0)}%
                    Confidence)
                  </span>
                </div>
                <div className={styles.autoReviewContent}>
                  {JSON.stringify(report.auto_review_result, null, 2)}
                </div>
              </div>
            </div>
          )}

          {/* Resolution Form */}
          <div className={styles.detailSection}>
            <h3 className={styles.detailSectionTitle}>Bearbeitung</h3>
            <div className={styles.resolutionForm}>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="input"
                >
                  {STATUS_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Ergriffene Maßnahme</label>
                <select
                  value={action}
                  onChange={(e) => setAction(e.target.value)}
                  className="input"
                >
                  <option value="">Keine Maßnahme ausgewählt</option>
                  {ACTION_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Interner Kommentar</label>
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Notizen zur Bearbeitung..."
                  className="input"
                  rows={3}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className={styles.modalFooter}>
          <button onClick={onClose} className="btn btn-ghost">
            Abbrechen
          </button>
          <button
            onClick={handleSave}
            disabled={updateMutation.isPending}
            className="btn btn-primary"
          >
            {updateMutation.isPending ? 'Speichern...' : 'Speichern'}
          </button>
        </div>
      </div>
    </div>
  );
}
