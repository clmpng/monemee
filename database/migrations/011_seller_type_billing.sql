-- ============================================
-- Migration: Seller Type & Billing Info
-- Datum: 2024-XX-XX
-- 
-- Unterscheidet zwischen:
-- - private: Privatverkäufer (kein Beleg nötig)
-- - business: Gewerblich (mit is_small_business Flag)
-- ============================================

-- ============================================
-- 1. Users Tabelle erweitern
-- ============================================

-- Verkäufertyp: private = Privatperson, business = Gewerblich
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS seller_type VARCHAR(20) DEFAULT 'private'
    CHECK (seller_type IN ('private', 'business'));

-- Kommentar
COMMENT ON COLUMN users.seller_type IS 'private = Privatverkäufer (Stripe Receipt reicht), business = Gewerblich (Rechnung erforderlich)';

-- ============================================
-- 2. Seller Billing Info (nur für Gewerbliche)
-- ============================================

CREATE TABLE IF NOT EXISTS seller_billing_info (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    
    -- Geschäftsdaten
    business_name VARCHAR(200) NOT NULL,
    street VARCHAR(200) NOT NULL,
    zip VARCHAR(10) NOT NULL,
    city VARCHAR(100) NOT NULL,
    country VARCHAR(2) DEFAULT 'DE',
    
    -- Steuerliche Angaben
    is_small_business BOOLEAN DEFAULT false,  -- Kleinunternehmer §19 UStG
    tax_id VARCHAR(50),  -- USt-IdNr. oder Steuernummer (Pflicht wenn NICHT Kleinunternehmer)
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Index
CREATE INDEX IF NOT EXISTS idx_seller_billing_user_id ON seller_billing_info(user_id);

-- Kommentare
COMMENT ON TABLE seller_billing_info IS 'Rechnungsangaben für gewerbliche Verkäufer';
COMMENT ON COLUMN seller_billing_info.is_small_business IS 'true = Kleinunternehmer nach §19 UStG (keine MwSt)';
COMMENT ON COLUMN seller_billing_info.tax_id IS 'USt-IdNr. oder Steuernummer - Pflicht wenn is_small_business = false';

-- ============================================
-- 3. Invoices Tabelle (vereinfacht)
-- ============================================

CREATE TABLE IF NOT EXISTS invoices (
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

-- Indexes
CREATE INDEX IF NOT EXISTS idx_invoices_transaction_id ON invoices(transaction_id);
CREATE INDEX IF NOT EXISTS idx_invoices_seller_id ON invoices(seller_id);
CREATE INDEX IF NOT EXISTS idx_invoices_access_token ON invoices(access_token);
CREATE INDEX IF NOT EXISTS idx_invoices_invoice_number ON invoices(invoice_number);

-- ============================================
-- 4. Sequence für Rechnungsnummern
-- ============================================

CREATE SEQUENCE IF NOT EXISTS invoice_number_seq START 10001;

-- Funktion zum Generieren der Rechnungsnummer
CREATE OR REPLACE FUNCTION generate_invoice_number()
RETURNS VARCHAR(20) AS $$
DECLARE
    year_part VARCHAR(4);
    seq_part VARCHAR(5);
BEGIN
    year_part := TO_CHAR(CURRENT_DATE, 'YYYY');
    seq_part := LPAD(nextval('invoice_number_seq')::TEXT, 5, '0');
    RETURN 'INV-' || year_part || '-' || seq_part;
END;
$$ LANGUAGE plpgsql;