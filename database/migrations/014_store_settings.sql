-- ============================================
-- Migration 014: Store Settings
-- Add customization options for user stores
-- ============================================

-- Add store_settings JSONB column to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS store_settings JSONB DEFAULT '{
  "theme": "classic",
  "layout": {
    "productGrid": "two-column"
  }
}'::jsonb;

-- Index für Performance
CREATE INDEX IF NOT EXISTS idx_users_store_settings ON users USING GIN (store_settings);

-- ============================================
-- Documentation
-- ============================================

-- Supported themes: classic, sunset, nature, dark, minimal, pastel
-- Supported grid layouts: single, two-column, three-column

-- Example store_settings structure:
-- {
--   "theme": "classic",
--   "layout": {
--     "productGrid": "two-column"
--   }
-- }
