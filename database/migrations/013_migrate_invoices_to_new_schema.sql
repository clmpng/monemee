-- ============================================
-- Migration: Migrate Invoices to New Schema
-- Replaces old JSONB-based schema with simple field-based schema
-- ============================================

-- Enable pgcrypto extension for random token generation
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Drop old invoices table completely (CASCADE removes all foreign keys)
DROP TABLE IF EXISTS invoices CASCADE;

-- Create new invoices table with clean schema
CREATE TABLE invoices (
    id SERIAL PRIMARY KEY,

    -- Referenzen
    transaction_id INTEGER NOT NULL REFERENCES transactions(id) ON DELETE CASCADE,
    buyer_id INTEGER NOT NULL REFERENCES users(id) ON DELETE SET NULL,
    seller_id INTEGER NOT NULL REFERENCES users(id) ON DELETE SET NULL,

    -- Rechnungsnummer (Format: INV-YYYY-XXXXX)
    invoice_number VARCHAR(20) UNIQUE NOT NULL,

    -- Öffentlicher Zugang (für Käufer ohne Login)
    access_token VARCHAR(64) NOT NULL,
    token_expires_at TIMESTAMP,

    -- Beträge
    net_amount DECIMAL(10, 2) NOT NULL,      -- Netto
    tax_rate DECIMAL(4, 2) DEFAULT 0,         -- MwSt-Satz (0, 7, 19)
    tax_amount DECIMAL(10, 2) DEFAULT 0,      -- MwSt-Betrag
    gross_amount DECIMAL(10, 2) NOT NULL,     -- Brutto
    currency VARCHAR(3) DEFAULT 'EUR',

    -- Rechnungsdetails (Snapshot zum Zeitpunkt der Erstellung)
    product_title VARCHAR(200) NOT NULL,
    product_description TEXT,

    -- Seller-Daten (Snapshot)
    seller_name VARCHAR(200) NOT NULL,
    seller_address TEXT NOT NULL,
    seller_tax_id VARCHAR(50),
    seller_is_small_business BOOLEAN DEFAULT false,

    -- Buyer-Daten
    buyer_email VARCHAR(255) NOT NULL,

    -- Timestamps
    issued_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes für Performance
CREATE INDEX idx_invoices_transaction_id ON invoices(transaction_id);
CREATE INDEX idx_invoices_seller_id ON invoices(seller_id);
CREATE INDEX idx_invoices_buyer_id ON invoices(buyer_id);
CREATE INDEX idx_invoices_access_token ON invoices(access_token);
CREATE INDEX idx_invoices_invoice_number ON invoices(invoice_number);
CREATE INDEX idx_invoices_issued_at ON invoices(issued_at DESC);

-- Comments
COMMENT ON TABLE invoices IS 'Rechnungen für gewerbliche Verkäufer';
COMMENT ON COLUMN invoices.access_token IS 'Öffentlicher Token für Rechnung ohne Login (64 Zeichen Hex)';
COMMENT ON COLUMN invoices.seller_is_small_business IS 'true = Kleinunternehmer nach §19 UStG (keine MwSt)';
COMMENT ON COLUMN invoices.net_amount IS 'Nettobetrag (ohne MwSt)';
COMMENT ON COLUMN invoices.tax_rate IS 'MwSt-Satz in Prozent (0, 7, 19)';
COMMENT ON COLUMN invoices.gross_amount IS 'Bruttobetrag (inkl. MwSt)';

-- Success message
\echo 'Migration completed successfully! Invoices table recreated with new schema.'
