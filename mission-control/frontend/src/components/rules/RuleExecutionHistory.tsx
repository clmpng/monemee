import { useQuery } from '@tanstack/react-query';
import { rulesAPI } from '../../services/api';
import { X, CheckCircle, XCircle, Clock } from 'lucide-react';

interface RuleExecutionHistoryProps {
  ruleId: string;
  onClose: () => void;
}

export default function RuleExecutionHistory({ ruleId, onClose }: RuleExecutionHistoryProps) {
  const { data, isLoading } = useQuery({
    queryKey: ['rule-execution-history', ruleId],
    queryFn: () => rulesAPI.getExecutionHistory({ rule_id: ruleId, limit: 50 }),
  });

  const executions = data?.data || [];

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
          maxWidth: '1000px',
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
            <h2 style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 700, color: 'var(--color-text-primary)' }}>
              Execution History
            </h2>
            <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-tertiary)', marginTop: 'var(--spacing-xs)' }}>
              Last 50 executions
            </p>
          </div>
          <button onClick={onClose} className="btn btn-ghost" style={{ padding: 'var(--spacing-sm)' }}>
            <X size={24} />
          </button>
        </div>

        <div style={{ padding: 'var(--spacing-lg)' }}>
          {isLoading ? (
            <div className="flex-center" style={{ padding: 'var(--spacing-2xl)' }}>
              <div className="spinner spinner-lg"></div>
            </div>
          ) : executions.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 'var(--spacing-2xl)', color: 'var(--color-text-muted)' }}>
              <Clock size={48} style={{ margin: '0 auto var(--spacing-md)', opacity: 0.5 }} />
              <p>No execution history yet</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-sm)' }}>
              {executions.map((execution: any) => (
                <div
                  key={execution.id}
                  style={{
                    padding: 'var(--spacing-md)',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid',
                    backgroundColor: execution.status === 'success' ? 'var(--color-success-50)' : 'var(--color-danger-50)',
                    borderColor: execution.status === 'success' ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)',
                  }}
                >
                  <div className="flex items-start justify-between" style={{ marginBottom: 'var(--spacing-sm)' }}>
                    <div className="flex items-center gap-sm">
                      {execution.status === 'success' ? (
                        <CheckCircle style={{ color: 'var(--color-success-light)' }} size={24} />
                      ) : (
                        <XCircle style={{ color: 'var(--color-danger-light)' }} size={24} />
                      )}
                      <div>
                        <p style={{ fontWeight: 600, color: 'var(--color-text-primary)' }}>
                          {execution.status === 'success' ? 'Success' : 'Failed'}
                        </p>
                        <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>
                          {new Date(execution.executed_at).toLocaleString('de-DE')}
                        </p>
                      </div>
                    </div>

                    {execution.result?.duration && (
                      <span className="badge badge-info">{execution.result.duration}ms</span>
                    )}
                  </div>

                  {/* Trigger Data */}
                  {execution.trigger_data && (
                    <div style={{ marginBottom: 'var(--spacing-sm)' }}>
                      <p style={{ fontSize: 'var(--font-size-xs)', fontWeight: 500, color: 'var(--color-text-secondary)', marginBottom: 'var(--spacing-xs)' }}>
                        Trigger Data:
                      </p>
                      <pre
                        style={{
                          fontSize: 'var(--font-size-xs)',
                          backgroundColor: 'var(--color-bg-card)',
                          padding: 'var(--spacing-sm)',
                          borderRadius: 'var(--radius-sm)',
                          border: '1px solid var(--color-border)',
                          overflow: 'auto',
                          maxHeight: '128px',
                          color: 'var(--color-text-primary)',
                        }}
                      >
                        {JSON.stringify(execution.trigger_data, null, 2)}
                      </pre>
                    </div>
                  )}

                  {/* Execution Result */}
                  {execution.result && (
                    <div>
                      <p style={{ fontSize: 'var(--font-size-xs)', fontWeight: 500, color: 'var(--color-text-secondary)', marginBottom: 'var(--spacing-xs)' }}>
                        Result:
                      </p>

                      {/* Actions Summary */}
                      {execution.result.actions && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-xs)', marginBottom: 'var(--spacing-sm)' }}>
                          {execution.result.actions.map((actionResult: any, idx: number) => (
                            <div
                              key={idx}
                              style={{
                                fontSize: 'var(--font-size-xs)',
                                padding: 'var(--spacing-sm)',
                                borderRadius: 'var(--radius-sm)',
                                backgroundColor: actionResult.success ? 'var(--color-success-50)' : 'var(--color-danger-50)',
                                color: 'var(--color-text-primary)',
                              }}
                            >
                              <span style={{ fontWeight: 500 }}>{actionResult.action}:</span>{' '}
                              {actionResult.success ? actionResult.message : actionResult.error}
                            </div>
                          ))}
                        </div>
                      )}

                      <details style={{ fontSize: 'var(--font-size-xs)' }}>
                        <summary style={{ cursor: 'pointer', color: 'var(--color-text-tertiary)' }}>
                          Full details
                        </summary>
                        <pre
                          style={{
                            fontSize: 'var(--font-size-xs)',
                            backgroundColor: 'var(--color-bg-card)',
                            padding: 'var(--spacing-sm)',
                            borderRadius: 'var(--radius-sm)',
                            border: '1px solid var(--color-border)',
                            overflow: 'auto',
                            maxHeight: '192px',
                            marginTop: 'var(--spacing-sm)',
                            color: 'var(--color-text-primary)',
                          }}
                        >
                          {JSON.stringify(execution.result, null, 2)}
                        </pre>
                      </details>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
