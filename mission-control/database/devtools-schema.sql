-- =====================================================
-- DEVELOPER TOOLS SCHEMA
-- =====================================================

-- API Request Logs (for API Inspector)
CREATE TABLE IF NOT EXISTS api_request_logs (
  id SERIAL PRIMARY KEY,
  method VARCHAR(10) NOT NULL,
  endpoint VARCHAR(500) NOT NULL,
  status_code INTEGER,
  response_time INTEGER, -- in milliseconds
  user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  ip_address VARCHAR(45),
  user_agent TEXT,
  request_body JSONB,
  response_body JSONB,
  headers JSONB,
  timestamp TIMESTAMP DEFAULT NOW()
);

-- Slow Query Log (for DB Profiler)
CREATE TABLE IF NOT EXISTS slow_query_log (
  id SERIAL PRIMARY KEY,
  query TEXT NOT NULL,
  duration INTEGER NOT NULL, -- in milliseconds
  rows_returned INTEGER,
  executed_at TIMESTAMP DEFAULT NOW(),
  execution_plan JSONB
);

-- Webhook Logs (for Webhook Debugger)
CREATE TABLE IF NOT EXISTS webhook_logs (
  id SERIAL PRIMARY KEY,
  url VARCHAR(500) NOT NULL,
  payload JSONB NOT NULL,
  headers JSONB,
  status VARCHAR(20), -- 'success', 'failed', 'pending'
  response TEXT,
  error TEXT,
  duration INTEGER, -- in milliseconds
  retry_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Feature Flags
CREATE TABLE IF NOT EXISTS feature_flags (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) UNIQUE NOT NULL,
  description TEXT,
  enabled BOOLEAN DEFAULT FALSE,
  rollout_percentage INTEGER DEFAULT 0, -- 0-100
  target_users INTEGER[], -- Array of user IDs
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_api_logs_timestamp ON api_request_logs(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_api_logs_endpoint ON api_request_logs(endpoint);
CREATE INDEX IF NOT EXISTS idx_api_logs_status ON api_request_logs(status_code);
CREATE INDEX IF NOT EXISTS idx_api_logs_user_id ON api_request_logs(user_id);

CREATE INDEX IF NOT EXISTS idx_slow_queries_executed ON slow_query_log(executed_at DESC);
CREATE INDEX IF NOT EXISTS idx_slow_queries_duration ON slow_query_log(duration DESC);

CREATE INDEX IF NOT EXISTS idx_webhook_logs_created ON webhook_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_webhook_logs_status ON webhook_logs(status);
CREATE INDEX IF NOT EXISTS idx_webhook_logs_url ON webhook_logs(url);

CREATE INDEX IF NOT EXISTS idx_feature_flags_name ON feature_flags(name);
CREATE INDEX IF NOT EXISTS idx_feature_flags_enabled ON feature_flags(enabled);

-- Enable pg_stat_statements for query profiling (requires superuser)
/*
CREATE EXTENSION IF NOT EXISTS pg_stat_statements;
*/

-- Example Feature Flags (commented out - uncomment to insert)
/*
INSERT INTO feature_flags (name, description, enabled, rollout_percentage)
VALUES
  ('new_checkout_flow', 'New simplified checkout process', false, 0),
  ('dark_mode', 'Dark mode theme', true, 100),
  ('beta_features', 'Access to beta features', false, 10),
  ('enhanced_analytics', 'Enhanced analytics dashboard', true, 50),
  ('ai_recommendations', 'AI-powered product recommendations', false, 0);
*/
