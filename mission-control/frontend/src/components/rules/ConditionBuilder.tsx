import { Plus, Trash2 } from 'lucide-react';

interface Condition {
  field: string;
  operator: string;
  value: any;
}

interface ConditionBuilderProps {
  conditions: Condition[];
  onChange: (conditions: Condition[]) => void;
}

const OPERATORS = [
  { value: 'equals', label: 'Equals (=)' },
  { value: 'not_equals', label: 'Not Equals (≠)' },
  { value: 'greater_than', label: 'Greater Than (>)' },
  { value: 'less_than', label: 'Less Than (<)' },
  { value: 'greater_or_equal', label: 'Greater or Equal (≥)' },
  { value: 'less_or_equal', label: 'Less or Equal (≤)' },
  { value: 'contains', label: 'Contains' },
  { value: 'not_contains', label: 'Does Not Contain' },
  { value: 'starts_with', label: 'Starts With' },
  { value: 'ends_with', label: 'Ends With' },
  { value: 'is_empty', label: 'Is Empty' },
  { value: 'is_not_empty', label: 'Is Not Empty' },
];

const COMMON_FIELDS = {
  user: [
    { value: 'user.id', label: 'User ID' },
    { value: 'user.username', label: 'Username' },
    { value: 'user.email', label: 'Email' },
    { value: 'user.level', label: 'Level' },
    { value: 'user.total_earnings', label: 'Total Earnings' },
    { value: 'user.role', label: 'Role' },
  ],
  transaction: [
    { value: 'transaction.id', label: 'Transaction ID' },
    { value: 'transaction.amount', label: 'Amount' },
    { value: 'transaction.product_title', label: 'Product Title' },
    { value: 'transaction.seller_username', label: 'Seller' },
    { value: 'transaction.status', label: 'Status' },
  ],
  product: [
    { value: 'product.id', label: 'Product ID' },
    { value: 'product.title', label: 'Title' },
    { value: 'product.price', label: 'Price' },
    { value: 'product.category', label: 'Category' },
    { value: 'product.status', label: 'Status' },
  ],
  security: [
    { value: 'ip', label: 'IP Address' },
    { value: 'username', label: 'Username' },
    { value: 'attempts', label: 'Attempts' },
  ],
  performance: [
    { value: 'alert.metric', label: 'Metric' },
    { value: 'alert.value', label: 'Value' },
    { value: 'alert.threshold', label: 'Threshold' },
  ],
};

export default function ConditionBuilder({ conditions, onChange }: ConditionBuilderProps) {
  const addCondition = () => {
    onChange([...conditions, { field: '', operator: 'equals', value: '' }]);
  };

  const removeCondition = (index: number) => {
    onChange(conditions.filter((_, i) => i !== index));
  };

  const updateCondition = (index: number, updates: Partial<Condition>) => {
    const updated = [...conditions];
    updated[index] = { ...updated[index], ...updates };
    onChange(updated);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-sm)' }}>
      {conditions.length === 0 ? (
        <div
          style={{
            textAlign: 'center',
            padding: 'var(--spacing-xl)',
            color: 'var(--color-text-muted)',
            border: '2px dashed var(--color-border)',
            borderRadius: 'var(--radius-lg)',
          }}
        >
          <p style={{ marginBottom: 'var(--spacing-sm)' }}>No conditions - Rule will always execute</p>
          <button
            onClick={addCondition}
            className="btn btn-secondary"
            style={{ display: 'inline-flex', alignItems: 'center', gap: 'var(--spacing-sm)' }}
          >
            <Plus size={18} />
            Add Condition
          </button>
        </div>
      ) : (
        <>
          {conditions.map((condition, index) => (
            <div
              key={index}
              style={{
                display: 'grid',
                gridTemplateColumns: '4fr 3fr 4fr 1fr',
                gap: 'var(--spacing-sm)',
                padding: 'var(--spacing-md)',
                backgroundColor: 'var(--color-bg-tertiary)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-md)',
              }}
            >
              {/* Field */}
              <div>
                <label className="input-label" style={{ fontSize: 'var(--font-size-xs)' }}>Field</label>
                <input
                  type="text"
                  value={condition.field}
                  onChange={(e) => updateCondition(index, { field: e.target.value })}
                  placeholder="e.g. user.level"
                  className="input"
                  style={{ fontSize: 'var(--font-size-sm)' }}
                  list={`field-suggestions-${index}`}
                />
                <datalist id={`field-suggestions-${index}`}>
                  {Object.values(COMMON_FIELDS)
                    .flat()
                    .map((field) => (
                      <option key={field.value} value={field.value}>
                        {field.label}
                      </option>
                    ))}
                </datalist>
              </div>

              {/* Operator */}
              <div>
                <label className="input-label" style={{ fontSize: 'var(--font-size-xs)' }}>Operator</label>
                <select
                  value={condition.operator}
                  onChange={(e) => updateCondition(index, { operator: e.target.value })}
                  className="input"
                  style={{ fontSize: 'var(--font-size-sm)' }}
                >
                  {OPERATORS.map((op) => (
                    <option key={op.value} value={op.value}>
                      {op.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Value */}
              <div>
                <label className="input-label" style={{ fontSize: 'var(--font-size-xs)' }}>Value</label>
                <input
                  type="text"
                  value={condition.value}
                  onChange={(e) => updateCondition(index, { value: e.target.value })}
                  placeholder="Value to compare"
                  className="input"
                  style={{ fontSize: 'var(--font-size-sm)' }}
                  disabled={['is_empty', 'is_not_empty'].includes(condition.operator)}
                />
              </div>

              {/* Delete */}
              <div style={{ display: 'flex', alignItems: 'flex-end' }}>
                <button
                  onClick={() => removeCondition(index)}
                  className="btn btn-ghost"
                  style={{ padding: 'var(--spacing-sm)', color: 'var(--color-danger-light)' }}
                  title="Remove condition"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))}

          <button
            onClick={addCondition}
            className="btn btn-ghost"
            style={{ display: 'inline-flex', alignItems: 'center', gap: 'var(--spacing-sm)', alignSelf: 'flex-start' }}
          >
            <Plus size={18} />
            Add Condition
          </button>
        </>
      )}

      {/* Help Text */}
      <div
        style={{
          fontSize: 'var(--font-size-xs)',
          color: 'var(--color-text-tertiary)',
          backgroundColor: 'var(--color-primary-10)',
          padding: 'var(--spacing-md)',
          borderRadius: 'var(--radius-md)',
        }}
      >
        <p style={{ fontWeight: 500, marginBottom: 'var(--spacing-xs)' }}>Tips:</p>
        <ul style={{ marginLeft: 'var(--spacing-md)', listStyleType: 'disc', display: 'flex', flexDirection: 'column', gap: 'var(--spacing-xs)' }}>
          <li>Use dot notation for nested fields (e.g., user.level, transaction.amount)</li>
          <li>String values are case-sensitive</li>
          <li>Number comparisons work with operators like &gt;, &lt;, ≥, ≤</li>
          <li>Leave conditions empty to always execute the rule</li>
        </ul>
      </div>
    </div>
  );
}
