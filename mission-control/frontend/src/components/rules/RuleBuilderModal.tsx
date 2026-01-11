import { useState, useEffect } from 'react';
import { useMutation } from '@tanstack/react-query';
import { rulesAPI } from '../../services/api';
import { X, Plus, Trash2, Play } from 'lucide-react';
import ConditionBuilder from './ConditionBuilder';
import ActionBuilder from './ActionBuilder';

interface RuleBuilderModalProps {
  rule: any | null;
  onClose: () => void;
  onSuccess: () => void;
}

const TRIGGERS = [
  { value: 'user.created', label: 'User Created', category: 'user' },
  { value: 'user.level_up', label: 'User Level Up', category: 'user' },
  { value: 'transaction.created', label: 'Transaction Created', category: 'transaction' },
  { value: 'product.created', label: 'Product Created', category: 'product' },
  { value: 'product.published', label: 'Product Published', category: 'product' },
  { value: 'payout.requested', label: 'Payout Requested', category: 'transaction' },
  { value: 'security.failed_login', label: 'Failed Login', category: 'security' },
  { value: 'performance.alert', label: 'Performance Alert', category: 'performance' },
];

const CATEGORIES = ['user', 'transaction', 'product', 'security', 'performance'];

export default function RuleBuilderModal({ rule, onClose, onSuccess }: RuleBuilderModalProps) {
  const isEditing = !!rule?.id;

  const [formData, setFormData] = useState({
    name: rule?.name || '',
    description: rule?.description || '',
    category: rule?.category || 'user',
    trigger: rule?.trigger || '',
    conditions: rule?.conditions || { logic: 'AND', rules: [] },
    actions: rule?.actions || [],
    priority: rule?.priority || 0,
    status: rule?.status || 'active',
  });

  const [testData, setTestData] = useState('{}');
  const [testResult, setTestResult] = useState<any>(null);

  // Create/Update mutation
  const saveMutation = useMutation({
    mutationFn: (data: any) => {
      if (isEditing) {
        return rulesAPI.update(rule.id, data);
      }
      return rulesAPI.create(data);
    },
    onSuccess: () => {
      onSuccess();
    },
  });

  // Test mutation
  const testMutation = useMutation({
    mutationFn: (data: any) => rulesAPI.test(data, JSON.parse(testData)),
    onSuccess: (result) => {
      setTestResult(result.data);
    },
  });

  const handleSave = () => {
    if (!formData.name || !formData.trigger) {
      alert('Name and Trigger are required');
      return;
    }

    saveMutation.mutate(formData);
  };

  const handleTest = () => {
    try {
      JSON.parse(testData); // Validate JSON
      testMutation.mutate(formData);
    } catch (error) {
      alert('Invalid test data JSON');
    }
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
          borderRadius: 'var(--radius-xl)',
          border: '1px solid var(--color-border)',
          maxWidth: '1200px',
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
          <h2
            style={{
              fontSize: 'var(--font-size-2xl)',
              fontWeight: 700,
              color: 'var(--color-text-primary)',
            }}
          >
            {isEditing ? 'Edit Rule' : 'Create New Rule'}
          </h2>
          <button onClick={onClose} className="btn btn-ghost" style={{ padding: 'var(--spacing-sm)' }}>
            <X size={24} />
          </button>
        </div>

        <div style={{ padding: 'var(--spacing-lg)', display: 'flex', flexDirection: 'column', gap: 'var(--spacing-lg)' }}>
          {/* Basic Info */}
          <div className="card-compact">
            <h3 style={{ fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: 'var(--spacing-md)' }}>
              Basic Information
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 'var(--spacing-md)' }}>
              <div>
                <label className="input-label">Rule Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="input"
                  placeholder="e.g. Welcome New Users"
                />
              </div>

              <div>
                <label className="input-label">Category *</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="input"
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat.charAt(0).toUpperCase() + cat.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ gridColumn: 'span 2' }}>
                <label className="input-label">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="input"
                  rows={2}
                  placeholder="What does this rule do?"
                />
              </div>

              <div>
                <label className="input-label">Trigger Event *</label>
                <select
                  value={formData.trigger}
                  onChange={(e) => setFormData({ ...formData, trigger: e.target.value })}
                  className="input"
                >
                  <option value="">Select trigger...</option>
                  {TRIGGERS.filter((t) => t.category === formData.category).map((trigger) => (
                    <option key={trigger.value} value={trigger.value}>
                      {trigger.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="input-label">Priority</label>
                <input
                  type="number"
                  value={formData.priority}
                  onChange={(e) =>
                    setFormData({ ...formData, priority: parseInt(e.target.value) })
                  }
                  className="input"
                  min="0"
                  max="1000"
                />
                <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', marginTop: 'var(--spacing-xs)' }}>
                  Higher priority rules execute first
                </p>
              </div>
            </div>
          </div>

          {/* Conditions */}
          <div className="card-compact">
            <div className="flex items-center justify-between" style={{ marginBottom: 'var(--spacing-md)' }}>
              <h3 style={{ fontWeight: 600, color: 'var(--color-text-primary)' }}>Conditions (When)</h3>
              <select
                value={formData.conditions.logic}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    conditions: { ...formData.conditions, logic: e.target.value },
                  })
                }
                className="input"
                style={{ width: 'auto' }}
              >
                <option value="AND">Match ALL conditions</option>
                <option value="OR">Match ANY condition</option>
              </select>
            </div>

            <ConditionBuilder
              conditions={formData.conditions.rules}
              onChange={(rules) =>
                setFormData({
                  ...formData,
                  conditions: { ...formData.conditions, rules },
                })
              }
            />
          </div>

          {/* Actions */}
          <div className="card-compact">
            <h3 style={{ fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: 'var(--spacing-md)' }}>
              Actions (Then)
            </h3>
            <ActionBuilder
              actions={formData.actions}
              onChange={(actions) => setFormData({ ...formData, actions })}
            />
          </div>

          {/* Test Rule */}
          <div className="card-compact">
            <h3 style={{ fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: 'var(--spacing-md)' }}>
              Test Rule
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-sm)' }}>
              <div>
                <label className="input-label">Test Data (JSON)</label>
                <textarea
                  value={testData}
                  onChange={(e) => setTestData(e.target.value)}
                  className="input"
                  style={{ fontFamily: 'var(--font-family-mono)', fontSize: 'var(--font-size-sm)' }}
                  rows={6}
                  placeholder='{"user": {"id": 123, "level": 2, "username": "testuser"}}'
                />
              </div>

              <button
                onClick={handleTest}
                disabled={testMutation.isPending}
                className="btn btn-secondary"
                style={{ display: 'inline-flex', alignItems: 'center', gap: 'var(--spacing-sm)', alignSelf: 'flex-start' }}
              >
                <Play size={18} />
                {testMutation.isPending ? 'Testing...' : 'Test Rule'}
              </button>

              {testResult && (
                <div
                  style={{
                    padding: 'var(--spacing-md)',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: testResult.success ? 'var(--color-success-50)' : 'var(--color-danger-50)',
                    border: `1px solid ${testResult.success ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
                  }}
                >
                  <pre style={{ fontSize: 'var(--font-size-sm)', overflow: 'auto', color: 'var(--color-text-primary)' }}>
                    {JSON.stringify(testResult, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div
          style={{
            position: 'sticky',
            bottom: 0,
            backgroundColor: 'var(--color-bg-tertiary)',
            borderTop: '1px solid var(--color-border)',
            padding: 'var(--spacing-md) var(--spacing-lg)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div className="flex items-center gap-sm">
            <label className="flex items-center gap-sm" style={{ fontSize: 'var(--font-size-sm)' }}>
              <input
                type="checkbox"
                checked={formData.status === 'active'}
                onChange={(e) =>
                  setFormData({ ...formData, status: e.target.checked ? 'active' : 'inactive' })
                }
                style={{ width: '16px', height: '16px' }}
              />
              <span style={{ fontWeight: 500, color: 'var(--color-text-primary)' }}>Activate rule immediately</span>
            </label>
          </div>

          <div className="flex items-center gap-sm">
            <button onClick={onClose} className="btn btn-secondary">
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saveMutation.isPending}
              className="btn btn-primary"
            >
              {saveMutation.isPending ? 'Saving...' : isEditing ? 'Update Rule' : 'Create Rule'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
