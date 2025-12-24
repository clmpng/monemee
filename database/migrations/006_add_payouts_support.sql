-- ============================================
-- Migration: Add Payouts Support
-- Datum: 2024-01-XX
-- 
-- Fügt hinzu:
-- 1. Balance-Felder in users Tabelle
-- 2. payouts Tabelle für Auszahlungen
-- ============================================

-- ============================================
-- 1. Users Tabelle erweitern
-- ============================================

-- Verfügbares Guthaben (kann ausgezahlt werden)
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS available_balance DECIMAL(10, 2) DEFAULT 0;

-- Ausstehendes Guthaben (noch in Verarbeitung, z.B. Clearing-Zeit)
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS pending_balance DECIMAL(10, 2) DEFAULT 0;

-- IBAN für Auszahlungen (verschlüsselt speichern in Production!)
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS payout_iban VARCHAR(34);

-- Kontoinhaber Name
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS payout_account_holder VARCHAR(100);

-- ============================================
-- 2. Payouts Tabelle erstellen
-- ============================================

CREATE TABLE IF NOT EXISTS payouts (
    id SERIAL PRIMARY KEY,
    
    -- Beziehungen
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Beträge
    amount DECIMAL(10, 2) NOT NULL CHECK (amount > 0),
    fee DECIMAL(10, 2) DEFAULT 0 CHECK (fee >= 0),
    net_amount DECIMAL(10, 2) NOT NULL CHECK (net_amount > 0),
    
    -- Status
    status VARCHAR(20) DEFAULT 'pending' 
        CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'cancelled')),
    
    -- Stripe Integration (für später)
    stripe_transfer_id VARCHAR(255),
    stripe_payout_id VARCHAR(255),
    
    -- Zahlungsdetails (anonymisiert)
    iban_last4 VARCHAR(4),
    account_holder VARCHAR(100),
    
    -- Fehler-Tracking
    failure_reason TEXT,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    processed_at TIMESTAMP,
    completed_at TIMESTAMP,
    
    -- Referenz-Nummer für Buchhaltung
    reference_number VARCHAR(50) UNIQUE
);

-- ============================================
-- 3. Indexes für Performance
-- ============================================

CREATE INDEX IF NOT EXISTS idx_payouts_user_id ON payouts(user_id);
CREATE INDEX IF NOT EXISTS idx_payouts_status ON payouts(status);
CREATE INDEX IF NOT EXISTS idx_payouts_created_at ON payouts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_payouts_reference ON payouts(reference_number);

-- ============================================
-- 4. Trigger für Referenz-Nummer
-- ============================================

-- Funktion zum Generieren einer Referenz-Nummer
CREATE OR REPLACE FUNCTION generate_payout_reference()
RETURNS TRIGGER AS $$
BEGIN
    NEW.reference_number := 'PAY-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || LPAD(NEW.id::TEXT, 6, '0');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger nur erstellen wenn er nicht existiert
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_trigger WHERE tgname = 'set_payout_reference'
    ) THEN
        CREATE TRIGGER set_payout_reference
            BEFORE INSERT ON payouts
            FOR EACH ROW
            WHEN (NEW.reference_number IS NULL)
            EXECUTE PROCEDURE generate_payout_reference();
    END IF;
END
$$;

-- ============================================
-- 5. Bestehende User-Daten migrieren
-- ============================================

-- Setze available_balance = total_earnings für bestehende User
-- (In Production würde man das differenzierter machen)
UPDATE users 
SET available_balance = total_earnings 
WHERE available_balance = 0 AND total_earnings > 0;

-- ============================================
-- Rollback Script (falls nötig)
-- ============================================
/*
DROP TRIGGER IF EXISTS set_payout_reference ON payouts;
DROP FUNCTION IF EXISTS generate_payout_reference();
DROP TABLE IF EXISTS payouts;
ALTER TABLE users DROP COLUMN IF EXISTS available_balance;
ALTER TABLE users DROP COLUMN IF EXISTS pending_balance;
ALTER TABLE users DROP COLUMN IF EXISTS payout_iban;
ALTER TABLE users DROP COLUMN IF EXISTS payout_account_holder;
*/
