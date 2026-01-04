-- ============================================
-- Migration: Invoices Table
-- Datum: 2024-XX-XX
-- 
-- Speichert automatisch generierte Rechnungen
-- ============================================

-- ============================================
-- 1. Invoices Tabelle
-- ============================================
CREATE TABLE IF NOT EXISTS invoices (
    id SERIAL PRIMARY KEY,
    
    -- Referenzen
    transaction_id INTEGER NOT NULL REFERENCES transactions(id) ON DELETE CASCADE,
    buyer_id INTEGER NOT NULL REFERENCES users(id) ON DELETE SET NULL,
    seller_id INTEGER NOT NULL REFERENCES users(id) ON DELETE SET NULL,
    
    -- Rechnungsnummer (Format: INV-YYYY-XXXXX)
    invoice_number VARCHAR(20) UNIQUE NOT NULL,
    
    -- Stripe Referenzen
    stripe_invoice_id VARCHAR(255),
    stripe_invoice_pdf_url TEXT,
    stripe_hosted_invoice_url TEXT,
    
    -- Beträge
    subtotal DECIMAL(10, 2) NOT NULL,
    tax_amount DECIMAL(10, 2) DEFAULT 0,
    total DECIMAL(10, 2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'EUR',
    
    -- Rechnungsdetails (JSON für Flexibilität)
    line_items JSONB NOT NULL DEFAULT '[]',
    buyer_details JSONB NOT NULL DEFAULT '{}',
    seller_details JSONB NOT NULL DEFAULT '{}',
    
    -- Status
    status VARCHAR(20) DEFAULT 'created' 
        CHECK (status IN ('created', 'sent', 'paid', 'void', 'uncollectible')),
    
    -- Timestamps
    issued_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    paid_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_invoices_transaction_id ON invoices(transaction_id);
CREATE INDEX IF NOT EXISTS idx_invoices_buyer_id ON invoices(buyer_id);
CREATE INDEX IF NOT EXISTS idx_invoices_seller_id ON invoices(seller_id);
CREATE INDEX IF NOT EXISTS idx_invoices_invoice_number ON invoices(invoice_number);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON invoices(status);
CREATE INDEX IF NOT EXISTS idx_invoices_issued_at ON invoices(issued_at DESC);

-- ============================================
-- 2. Webhook-Validation-Log Tabelle
-- ============================================
CREATE TABLE IF NOT EXISTS webhook_validation_logs (
    id SERIAL PRIMARY KEY,
    
    stripe_session_id VARCHAR(255),
    stripe_event_id VARCHAR(255),
    
    -- Validation Results
    validation_passed BOOLEAN DEFAULT false,
    validation_errors JSONB DEFAULT '[]',
    validation_warnings JSONB DEFAULT '[]',
    
    -- Metadata
    metadata_received JSONB DEFAULT '{}',
    validated_data JSONB DEFAULT '{}',
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_webhook_validation_session 
ON webhook_validation_logs(stripe_session_id);


-- ============================================
-- 3. Sequence für Rechnungsnummern
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