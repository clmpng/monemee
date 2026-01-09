-- Migration: Gast-Checkout und Download-Tokens
-- Ermöglicht Käufe ohne Account und sichere Download-Links

-- ============================================
-- 1. Transactions für Gast-Checkout erweitern
-- ============================================

-- buyer_id nullable machen (für Gäste)
ALTER TABLE transactions
  ALTER COLUMN buyer_id DROP NOT NULL;

-- buyer_email Spalte hinzufügen
ALTER TABLE transactions
  ADD COLUMN IF NOT EXISTS buyer_email VARCHAR(255);

-- Index für E-Mail-basierte Abfragen
CREATE INDEX IF NOT EXISTS idx_transactions_buyer_email ON transactions(buyer_email);

-- Constraint: Entweder buyer_id ODER buyer_email muss gesetzt sein
ALTER TABLE transactions
  ADD CONSTRAINT chk_buyer_identity
  CHECK (buyer_id IS NOT NULL OR buyer_email IS NOT NULL);

-- ============================================
-- 2. Download-Tokens Tabelle
-- ============================================

CREATE TABLE IF NOT EXISTS download_tokens (
    id SERIAL PRIMARY KEY,

    -- Referenzen
    transaction_id INTEGER NOT NULL REFERENCES transactions(id) ON DELETE CASCADE,
    buyer_id INTEGER REFERENCES users(id) ON DELETE CASCADE,  -- nullable für Gäste
    buyer_email VARCHAR(255),  -- für Gäste
    product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    module_id INTEGER REFERENCES product_modules(id) ON DELETE CASCADE,

    -- Token (256-bit, hex-encoded)
    token VARCHAR(64) UNIQUE NOT NULL,

    -- Nutzungs-Tracking
    max_clicks INTEGER DEFAULT 3,
    click_count INTEGER DEFAULT 0,

    -- Gültigkeit (30 Tage default)
    expires_at TIMESTAMP NOT NULL,

    -- Audit-Felder
    last_used_at TIMESTAMP,
    last_ip VARCHAR(45),  -- IPv4 oder IPv6

    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indizes für schnelle Abfragen
CREATE INDEX IF NOT EXISTS idx_download_tokens_token ON download_tokens(token);
CREATE INDEX IF NOT EXISTS idx_download_tokens_transaction ON download_tokens(transaction_id);
CREATE INDEX IF NOT EXISTS idx_download_tokens_buyer_email ON download_tokens(buyer_email);
CREATE INDEX IF NOT EXISTS idx_download_tokens_expires ON download_tokens(expires_at);

-- ============================================
-- 3. Kommentare für Dokumentation
-- ============================================

COMMENT ON TABLE download_tokens IS 'Sichere Download-Links für Käufer (E-Mail-Links)';
COMMENT ON COLUMN download_tokens.token IS '256-bit kryptografischer Token (hex-encoded)';
COMMENT ON COLUMN download_tokens.max_clicks IS 'Maximale Anzahl an Downloads (default: 3)';
COMMENT ON COLUMN download_tokens.expires_at IS 'Ablaufdatum des Tokens (default: 30 Tage)';
COMMENT ON COLUMN transactions.buyer_email IS 'E-Mail des Käufers (von Stripe, für Gäste ohne Account)';
