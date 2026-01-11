-- =====================================================
-- SECURITY COMMAND CENTER SCHEMA
-- =====================================================

-- User Sessions (for session management)
CREATE TABLE IF NOT EXISTS user_sessions (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  session_token VARCHAR(255) UNIQUE NOT NULL,
  ip_address VARCHAR(45),
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  last_activity TIMESTAMP DEFAULT NOW(),
  expires_at TIMESTAMP NOT NULL
);

-- Failed Login Attempts
CREATE TABLE IF NOT EXISTS failed_login_attempts (
  id SERIAL PRIMARY KEY,
  ip_address VARCHAR(45) NOT NULL,
  username VARCHAR(255),
  attempt_time TIMESTAMP DEFAULT NOW(),
  user_agent TEXT,
  reason VARCHAR(100) -- 'invalid_password', 'user_not_found', 'account_locked', etc.
);

-- Rate Limit Violations
CREATE TABLE IF NOT EXISTS rate_limit_violations (
  id SERIAL PRIMARY KEY,
  ip_address VARCHAR(45) NOT NULL,
  endpoint VARCHAR(255) NOT NULL,
  timestamp TIMESTAMP DEFAULT NOW(),
  requests_count INTEGER DEFAULT 1
);

-- Add 2FA fields to users table (if not exists)
ALTER TABLE users ADD COLUMN IF NOT EXISTS two_factor_enabled BOOLEAN DEFAULT FALSE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS two_factor_secret VARCHAR(255);
ALTER TABLE users ADD COLUMN IF NOT EXISTS two_factor_enabled_at TIMESTAMP;
ALTER TABLE users ADD COLUMN IF NOT EXISTS two_factor_required BOOLEAN DEFAULT FALSE;

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_expires_at ON user_sessions(expires_at);
CREATE INDEX IF NOT EXISTS idx_sessions_last_activity ON user_sessions(last_activity DESC);
CREATE INDEX IF NOT EXISTS idx_failed_logins_ip ON failed_login_attempts(ip_address);
CREATE INDEX IF NOT EXISTS idx_failed_logins_time ON failed_login_attempts(attempt_time DESC);
CREATE INDEX IF NOT EXISTS idx_rate_violations_ip ON rate_limit_violations(ip_address);
CREATE INDEX IF NOT EXISTS idx_rate_violations_time ON rate_limit_violations(timestamp DESC);

-- Cleanup old data (optional - run periodically)
/*
DELETE FROM failed_login_attempts WHERE attempt_time < NOW() - INTERVAL '30 days';
DELETE FROM rate_limit_violations WHERE timestamp < NOW() - INTERVAL '7 days';
DELETE FROM user_sessions WHERE expires_at < NOW();
*/
