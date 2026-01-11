import { Plus, Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';

interface Action {
  type: string;
  params: any;
}

interface ActionBuilderProps {
  actions: Action[];
  onChange: (actions: Action[]) => void;
}

const ACTION_TYPES = [
  {
    value: 'send_notification',
    label: '📢 Send Notification',
    description: 'Display a notification in Mission Control',
    params: ['message', 'severity'],
  },
  {
    value: 'send_email',
    label: '📧 Send Email',
    description: 'Send an email to user or admin',
    params: ['to', 'subject', 'body'],
  },
  {
    value: 'update_user_level',
    label: '📈 Update User Level',
    description: 'Change user level',
    params: ['user_id', 'new_level'],
  },
  {
    value: 'assign_badge',
    label: '🏆 Assign Badge',
    description: 'Award a badge to user',
    params: ['user_id', 'badge'],
  },
  {
    value: 'flag_transaction',
    label: '🚩 Flag Transaction',
    description: 'Flag transaction for manual review',
    params: ['transaction_id', 'reason'],
  },
  {
    value: 'block_ip',
    label: '🚫 Block IP Address',
    description: 'Block IP from accessing platform',
    params: ['ip', 'reason'],
  },
  {
    value: 'webhook',
    label: '🔗 Call Webhook',
    description: 'Make HTTP request to external service',
    params: ['url', 'method', 'headers'],
  },
  {
    value: 'create_audit_log',
    label: '📝 Create Audit Log',
    description: 'Log action to audit trail',
    params: ['action', 'details'],
  },
  {
    value: 'send_websocket_event',
    label: '🔌 Send WebSocket Event',
    description: 'Broadcast real-time event',
    params: ['event_type', 'channel'],
  },
  {
    value: 'increment_counter',
    label: '📊 Increment Counter',
    description: 'Increase a counter value',
    params: ['counter_name', 'increment'],
  },
];

export default function ActionBuilder({ actions, onChange }: ActionBuilderProps) {
  const [expandedActions, setExpandedActions] = useState<number[]>([]);

  const addAction = () => {
    onChange([...actions, { type: '', params: {} }]);
    setExpandedActions([...expandedActions, actions.length]);
  };

  const removeAction = (index: number) => {
    onChange(actions.filter((_, i) => i !== index));
    setExpandedActions(expandedActions.filter((i) => i !== index));
  };

  const updateAction = (index: number, updates: Partial<Action>) => {
    const updated = [...actions];
    updated[index] = { ...updated[index], ...updates };
    onChange(updated);
  };

  const updateParam = (actionIndex: number, paramName: string, value: any) => {
    const updated = [...actions];
    updated[actionIndex].params = {
      ...updated[actionIndex].params,
      [paramName]: value,
    };
    onChange(updated);
  };

  const toggleExpanded = (index: number) => {
    setExpandedActions((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
    );
  };

  const getActionType = (type: string) => {
    return ACTION_TYPES.find((a) => a.value === type);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-sm)' }}>
      {actions.length === 0 ? (
        <div
          style={{
            textAlign: 'center',
            padding: 'var(--spacing-xl)',
            color: 'var(--color-text-muted)',
            border: '2px dashed var(--color-border)',
            borderRadius: 'var(--radius-lg)',
          }}
        >
          <p style={{ marginBottom: 'var(--spacing-sm)' }}>No actions - Rule won't do anything</p>
          <button
            onClick={addAction}
            className="btn btn-secondary"
            style={{ display: 'inline-flex', alignItems: 'center', gap: 'var(--spacing-sm)' }}
          >
            <Plus size={18} />
            Add Action
          </button>
        </div>
      ) : (
        <>
          {actions.map((action, index) => {
            const actionType = getActionType(action.type);
            const isExpanded = expandedActions.includes(index);

            return (
              <div
                key={index}
                style={{
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-md)',
                  overflow: 'hidden',
                }}
              >
                {/* Action Header */}
                <div
                  className="flex items-center justify-between"
                  style={{
                    padding: 'var(--spacing-md)',
                    backgroundColor: 'var(--color-bg-tertiary)',
                  }}
                >
                  <div className="flex items-center gap-sm" style={{ flex: 1 }}>
                    <button
                      onClick={() => toggleExpanded(index)}
                      className="btn btn-ghost"
                      style={{ padding: 'var(--spacing-xs)' }}
                      title={isExpanded ? 'Collapse' : 'Expand'}
                    >
                      {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                    </button>

                    <div style={{ flex: 1 }}>
                      <select
                        value={action.type}
                        onChange={(e) => {
                          updateAction(index, { type: e.target.value, params: {} });
                          setExpandedActions([...expandedActions, index]);
                        }}
                        className="input"
                      >
                        <option value="">Select action type...</option>
                        {ACTION_TYPES.map((type) => (
                          <option key={type.value} value={type.value}>
                            {type.label}
                          </option>
                        ))}
                      </select>
                      {actionType && (
                        <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', marginTop: 'var(--spacing-xs)' }}>
                          {actionType.description}
                        </p>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={() => removeAction(index)}
                    className="btn btn-ghost"
                    style={{ padding: 'var(--spacing-sm)', color: 'var(--color-danger-light)', marginLeft: 'var(--spacing-sm)' }}
                    title="Remove action"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>

                {/* Action Parameters */}
                {isExpanded && action.type && (
                  <div
                    style={{
                      padding: 'var(--spacing-md)',
                      backgroundColor: 'var(--color-bg-card)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 'var(--spacing-sm)',
                    }}
                  >
                    {actionType?.params.map((paramName) => (
                      <div key={paramName}>
                        <label className="input-label">
                          {paramName.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
                        </label>
                        {renderParamInput(action, paramName, (value) =>
                          updateParam(index, paramName, value)
                        )}
                      </div>
                    ))}

                    {/* Variable Helper */}
                    <div
                      style={{
                        fontSize: 'var(--font-size-xs)',
                        color: 'var(--color-text-tertiary)',
                        backgroundColor: 'var(--color-primary-10)',
                        padding: 'var(--spacing-sm)',
                        borderRadius: 'var(--radius-sm)',
                      }}
                    >
                      <p style={{ fontWeight: 500, marginBottom: 'var(--spacing-xs)' }}>Use variables:</p>
                      <code style={{ fontSize: 'var(--font-size-xs)' }}>
                        {'{'}
                        {'{'}user.username{'}}'}
                        {'}'}
                      </code>{' '}
                      will be replaced with actual values
                    </div>
                  </div>
                )}
              </div>
            );
          })}

          <button
            onClick={addAction}
            className="btn btn-ghost"
            style={{ display: 'inline-flex', alignItems: 'center', gap: 'var(--spacing-sm)', alignSelf: 'flex-start' }}
          >
            <Plus size={18} />
            Add Action
          </button>
        </>
      )}
    </div>
  );
}

// Helper function to render appropriate input for param
function renderParamInput(action: Action, paramName: string, onChange: (value: any) => void) {
  const value = action.params[paramName] || '';

  // Special cases
  if (paramName === 'severity') {
    return (
      <select value={value} onChange={(e) => onChange(e.target.value)} className="input">
        <option value="">Select severity...</option>
        <option value="info">Info</option>
        <option value="warning">Warning</option>
        <option value="high">High</option>
        <option value="critical">Critical</option>
      </select>
    );
  }

  if (paramName === 'method') {
    return (
      <select value={value} onChange={(e) => onChange(e.target.value)} className="input">
        <option value="POST">POST</option>
        <option value="GET">GET</option>
        <option value="PUT">PUT</option>
        <option value="DELETE">DELETE</option>
      </select>
    );
  }

  if (paramName === 'new_level') {
    return (
      <select value={value} onChange={(e) => onChange(parseInt(e.target.value))} className="input">
        <option value="">Select level...</option>
        <option value="1">Level 1 - Starter</option>
        <option value="2">Level 2 - Rising Star</option>
        <option value="3">Level 3 - Creator</option>
        <option value="4">Level 4 - Pro</option>
        <option value="5">Level 5 - Elite</option>
      </select>
    );
  }

  if (paramName === 'increment') {
    return (
      <input
        type="number"
        value={value}
        onChange={(e) => onChange(parseInt(e.target.value))}
        className="input"
        min="1"
        placeholder="1"
      />
    );
  }

  if (paramName === 'body' || paramName === 'details') {
    return (
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="input"
        rows={3}
        placeholder={`Enter ${paramName}...`}
      />
    );
  }

  // Default: text input
  return (
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="input"
      placeholder={`Enter ${paramName}...`}
    />
  );
}
