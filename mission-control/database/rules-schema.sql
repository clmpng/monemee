-- =====================================================
-- AUTOMATION RULES SCHEMA
-- =====================================================

-- Automation Rules Table
CREATE TABLE IF NOT EXISTS automation_rules (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  category VARCHAR(50) NOT NULL, -- 'user', 'transaction', 'product', 'security', 'performance'
  trigger VARCHAR(100) NOT NULL, -- 'user.created', 'transaction.created', etc.
  conditions JSONB NOT NULL DEFAULT '{}', -- Rule conditions as JSON
  actions JSONB NOT NULL DEFAULT '[]', -- Actions to execute as JSON array
  priority INTEGER DEFAULT 0, -- Higher priority rules execute first
  status VARCHAR(20) DEFAULT 'active', -- 'active', 'inactive'
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Rule Executions Log
CREATE TABLE IF NOT EXISTS rule_executions (
  id SERIAL PRIMARY KEY,
  rule_id INTEGER REFERENCES automation_rules(id) ON DELETE CASCADE,
  trigger_data JSONB, -- The data that triggered the rule
  status VARCHAR(20), -- 'success', 'failed'
  result JSONB, -- Execution result details
  executed_at TIMESTAMP DEFAULT NOW()
);

-- Blocked IPs (for security rules)
CREATE TABLE IF NOT EXISTS blocked_ips (
  id SERIAL PRIMARY KEY,
  ip_address VARCHAR(45) UNIQUE NOT NULL,
  reason TEXT,
  blocked_at TIMESTAMP DEFAULT NOW()
);

-- Counters (for increment_counter action)
CREATE TABLE IF NOT EXISTS counters (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) UNIQUE NOT NULL,
  value INTEGER DEFAULT 0,
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_rules_trigger ON automation_rules(trigger);
CREATE INDEX IF NOT EXISTS idx_rules_status ON automation_rules(status);
CREATE INDEX IF NOT EXISTS idx_rules_category ON automation_rules(category);
CREATE INDEX IF NOT EXISTS idx_rule_executions_rule_id ON rule_executions(rule_id);
CREATE INDEX IF NOT EXISTS idx_rule_executions_executed_at ON rule_executions(executed_at DESC);
CREATE INDEX IF NOT EXISTS idx_blocked_ips_ip ON blocked_ips(ip_address);

-- Example Rules (commented out - uncomment to insert)
/*
-- Rule 1: Welcome new users
INSERT INTO automation_rules (name, description, category, trigger, conditions, actions, priority)
VALUES (
  'Welcome New Users',
  'Send welcome notification when user registers',
  'user',
  'user.created',
  '{"logic": "AND", "rules": []}',
  '[
    {
      "type": "send_notification",
      "params": {
        "message": "Welcome {{user.username}} to Monemee! 🎉",
        "severity": "info"
      }
    },
    {
      "type": "create_audit_log",
      "params": {
        "action": "user_welcomed"
      }
    }
  ]',
  10
);

-- Rule 2: Flag large transactions
INSERT INTO automation_rules (name, description, category, trigger, conditions, actions, priority)
VALUES (
  'Flag Large Transactions',
  'Automatically flag transactions over €500 for review',
  'transaction',
  'transaction.created',
  '{
    "logic": "AND",
    "rules": [
      {
        "field": "transaction.amount",
        "operator": "greater_than",
        "value": 500
      }
    ]
  }',
  '[
    {
      "type": "flag_transaction",
      "params": {
        "reason": "High value transaction - manual review required"
      }
    },
    {
      "type": "send_notification",
      "params": {
        "message": "⚠️ Large transaction detected: €{{transaction.amount}}",
        "severity": "warning"
      }
    }
  ]',
  100
);

-- Rule 3: Level up users
INSERT INTO automation_rules (name, description, category, trigger, conditions, actions, priority)
VALUES (
  'Celebrate Level 3',
  'Send congratulations when user reaches Level 3',
  'user',
  'user.level_up',
  '{
    "logic": "AND",
    "rules": [
      {
        "field": "newLevel",
        "operator": "equals",
        "value": 3
      }
    ]
  }',
  '[
    {
      "type": "send_notification",
      "params": {
        "message": "🎉 Congratulations {{user.username}}! You reached Level 3 - Creator!",
        "severity": "info"
      }
    },
    {
      "type": "assign_badge",
      "params": {
        "badge": "Creator Level Reached"
      }
    }
  ]',
  50
);

-- Rule 4: Block suspicious IPs
INSERT INTO automation_rules (name, description, category, trigger, conditions, actions, priority)
VALUES (
  'Block Suspicious Login Attempts',
  'Block IP after 5 failed login attempts',
  'security',
  'security.failed_login',
  '{
    "logic": "AND",
    "rules": [
      {
        "field": "attempts",
        "operator": "greater_or_equal",
        "value": 5
      }
    ]
  }',
  '[
    {
      "type": "block_ip",
      "params": {
        "reason": "Too many failed login attempts"
      }
    },
    {
      "type": "send_notification",
      "params": {
        "message": "🚫 IP {{ip}} blocked due to suspicious activity",
        "severity": "critical"
      }
    }
  ]',
  200
);

-- Rule 5: Performance monitoring
INSERT INTO automation_rules (name, description, category, trigger, conditions, actions, priority)
VALUES (
  'Alert on Slow Database',
  'Send alert when database response time is too high',
  'performance',
  'performance.alert',
  '{
    "logic": "AND",
    "rules": [
      {
        "field": "alert.metric",
        "operator": "equals",
        "value": "db_response_time"
      },
      {
        "field": "alert.value",
        "operator": "greater_than",
        "value": 500
      }
    ]
  }',
  '[
    {
      "type": "send_notification",
      "params": {
        "message": "⚠️ Database slow: {{alert.value}}ms response time",
        "severity": "high"
      }
    },
    {
      "type": "create_audit_log",
      "params": {
        "action": "performance_degradation"
      }
    }
  ]',
  150
);
*/
