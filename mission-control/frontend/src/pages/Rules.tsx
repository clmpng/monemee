import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { rulesAPI } from '../services/api';
import { Plus, Play, Pause, Edit, Trash2, Copy, TrendingUp, Clock } from 'lucide-react';
import RuleBuilderModal from '../components/rules/RuleBuilderModal';
import RuleExecutionHistory from '../components/rules/RuleExecutionHistory';
import styles from '../styles/pages/common.module.css';

export default function Rules() {
  const queryClient = useQueryClient();
  const [selectedRule, setSelectedRule] = useState<any | null>(null);
  const [isBuilderOpen, setIsBuilderOpen] = useState(false);
  const [filter, setFilter] = useState('all');
  const [selectedRuleForHistory, setSelectedRuleForHistory] = useState<string | null>(null);

  const { data: rulesData, isLoading } = useQuery({
    queryKey: ['rules', filter],
    queryFn: () => rulesAPI.getAll({ status: filter !== 'all' ? filter : undefined }),
  });

  const { data: statsData } = useQuery({
    queryKey: ['rules-stats'],
    queryFn: rulesAPI.getStats,
    refetchInterval: 30000,
  });

  const toggleMutation = useMutation({
    mutationFn: (id: string) => rulesAPI.toggle(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rules'] });
      queryClient.invalidateQueries({ queryKey: ['rules-stats'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => rulesAPI.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rules'] });
      queryClient.invalidateQueries({ queryKey: ['rules-stats'] });
    },
  });

  const rules = rulesData?.data || [];
  const stats = statsData?.data;

  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: string } = {
      user: 'badge-info',
      transaction: 'badge-success',
      product: 'badge-default',
      security: 'badge-danger',
      performance: 'badge-warning',
    };
    return colors[category] || 'badge-default';
  };

  const handleCreateRule = () => {
    setSelectedRule(null);
    setIsBuilderOpen(true);
  };

  const handleEditRule = (rule: any) => {
    setSelectedRule(rule);
    setIsBuilderOpen(true);
  };

  const handleDuplicateRule = (rule: any) => {
    setSelectedRule({ ...rule, id: null, name: `${rule.name} (Copy)` });
    setIsBuilderOpen(true);
  };

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className={styles.header}>
          <h1 className={styles.title}>Automation Rules</h1>
          <p className={styles.subtitle}>If This Then That - Automatisiere deine Platform</p>
        </div>
        <button onClick={handleCreateRule} className="btn btn-primary">
          <Plus size={20} />
          Create Rule
        </button>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className={styles.statsGrid}>
          <div className="card-compact">
            <p className={styles.statLabel}>Total Rules</p>
            <p className={styles.statValue}>{stats.rules.total_rules || 0}</p>
          </div>

          <div className="card-compact">
            <p className={styles.statLabel}>Active Rules</p>
            <p className={`${styles.statValue} ${styles.statValueSuccess}`}>{stats.rules.active_rules || 0}</p>
          </div>

          <div className="card-compact">
            <p className={styles.statLabel}>Executions (24h)</p>
            <p className={styles.statValue} style={{ color: 'var(--color-primary-light)' }}>
              {stats.executions.last_24h || 0}
            </p>
          </div>

          <div className="card-compact">
            <p className={styles.statLabel}>Success Rate</p>
            <p className={styles.statValue} style={{ color: 'var(--color-info-light)' }}>
              {stats.executions.total_executions > 0
                ? Math.round((stats.executions.successful / stats.executions.total_executions) * 100)
                : 0}
              %
            </p>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex gap-sm">
        {['all', 'active', 'inactive'].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`btn ${filter === f ? 'btn-primary' : 'btn-secondary'}`}
            style={{ fontSize: 'var(--font-size-sm)' }}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {/* Rules List */}
      <div className="card">
        {isLoading ? (
          <div className={styles.loading}>
            <div className="spinner spinner-lg"></div>
          </div>
        ) : rules.length === 0 ? (
          <div className={styles.emptyState}>
            <TrendingUp size={48} className={styles.emptyIcon} />
            <p className={styles.emptyText}>No rules found</p>
            <button onClick={handleCreateRule} className="btn btn-secondary" style={{ marginTop: 'var(--spacing-md)' }}>
              <Plus size={18} />
              Create your first rule
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-sm)' }}>
            {rules.map((rule: any) => (
              <div
                key={rule.id}
                style={{
                  padding: 'var(--spacing-md)',
                  backgroundColor: 'var(--color-bg-tertiary)',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--color-border)',
                  transition: 'border-color var(--transition-fast)',
                }}
              >
                <div className="flex items-start justify-between">
                  <div style={{ flex: 1 }}>
                    <div className="flex items-center gap-sm" style={{ marginBottom: 'var(--spacing-sm)' }}>
                      <h3 style={{ fontWeight: 600 }}>{rule.name}</h3>
                      <span className={`badge ${getCategoryColor(rule.category)}`}>{rule.category}</span>
                      <span className={`badge ${rule.status === 'active' ? 'badge-success' : 'badge-warning'}`}>{rule.status}</span>
                      <span className="badge badge-info">Priority: {rule.priority}</span>
                    </div>

                    {rule.description && (
                      <p className={styles.infoText} style={{ marginBottom: 'var(--spacing-sm)' }}>
                        {rule.description}
                      </p>
                    )}

                    <div className="flex items-center gap-md" style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)' }}>
                      <span>
                        <strong>Trigger:</strong> {rule.trigger}
                      </span>
                      <span>|</span>
                      <span>
                        <strong>Conditions:</strong> {rule.conditions?.rules?.length || 0} rules
                      </span>
                      <span>|</span>
                      <span>
                        <strong>Actions:</strong> {rule.actions?.length || 0} actions
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-xs" style={{ marginLeft: 'var(--spacing-md)' }}>
                    <button onClick={() => setSelectedRuleForHistory(rule.id)} className="btn btn-ghost btn-sm" title="View history">
                      <Clock size={16} />
                    </button>
                    <button
                      onClick={() => toggleMutation.mutate(rule.id)}
                      className="btn btn-ghost btn-sm"
                      title={rule.status === 'active' ? 'Pause rule' : 'Activate rule'}
                    >
                      {rule.status === 'active' ? <Pause size={16} /> : <Play size={16} />}
                    </button>
                    <button onClick={() => handleEditRule(rule)} className="btn btn-ghost btn-sm" title="Edit rule">
                      <Edit size={16} />
                    </button>
                    <button onClick={() => handleDuplicateRule(rule)} className="btn btn-ghost btn-sm" title="Duplicate rule">
                      <Copy size={16} />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`Delete rule "${rule.name}"?`)) {
                          deleteMutation.mutate(rule.id);
                        }
                      }}
                      className="btn btn-ghost btn-sm"
                      style={{ color: 'var(--color-danger-light)' }}
                      title="Delete rule"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Rule Builder Modal */}
      {isBuilderOpen && (
        <RuleBuilderModal
          rule={selectedRule}
          onClose={() => {
            setIsBuilderOpen(false);
            setSelectedRule(null);
          }}
          onSuccess={() => {
            queryClient.invalidateQueries({ queryKey: ['rules'] });
            queryClient.invalidateQueries({ queryKey: ['rules-stats'] });
            setIsBuilderOpen(false);
            setSelectedRule(null);
          }}
        />
      )}

      {/* Execution History Modal */}
      {selectedRuleForHistory && <RuleExecutionHistory ruleId={selectedRuleForHistory} onClose={() => setSelectedRuleForHistory(null)} />}
    </div>
  );
}
