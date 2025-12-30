-- ============================================
-- Migration: Add Stripe Session ID to Transactions
-- Datum: 2024-XX-XX
-- 
-- Fügt stripe_session_id für Idempotenz-Check bei Webhooks hinzu
-- ============================================

-- Stripe Session ID für Webhook-Idempotenz
ALTER TABLE transactions 
ADD COLUMN IF NOT EXISTS stripe_session_id VARCHAR(255);

-- Index für schnelle Suche
CREATE INDEX IF NOT EXISTS idx_transactions_stripe_session_id 
ON transactions(stripe_session_id);

-- Index für stripe_payment_id falls nicht vorhanden
CREATE INDEX IF NOT EXISTS idx_transactions_stripe_payment_id 
ON transactions(stripe_payment_id);

-- Updated_at Spalte falls nicht vorhanden
ALTER TABLE transactions 
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;