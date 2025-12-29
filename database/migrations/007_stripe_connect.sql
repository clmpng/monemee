-- ============================================
-- Migration: Stripe Connect Integration
-- Datum: 2024-XX-XX
-- 
-- Ersetzt manuelle IBAN-Speicherung durch Stripe Connect
-- Stripe sammelt und verwaltet alle Bankdaten selbst
-- ============================================

-- ============================================
-- 1. Neue Stripe Connect Felder
-- ============================================

-- Status des Stripe Connect Accounts
-- not_created: Noch kein Account erstellt
-- pending: Account erstellt, Onboarding nicht abgeschlossen
-- restricted: Account eingeschränkt (fehlende Infos/Verifizierung)
-- enabled: Voll funktionsfähig
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS stripe_account_status VARCHAR(20) DEFAULT 'not_created'
    CHECK (stripe_account_status IN ('not_created', 'pending', 'restricted', 'enabled'));

-- Kann Zahlungen empfangen (Verkäufe)
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS stripe_charges_enabled BOOLEAN DEFAULT false;

-- Kann Auszahlungen erhalten
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS stripe_payouts_enabled BOOLEAN DEFAULT false;

-- Onboarding vollständig abgeschlossen
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS stripe_onboarding_complete BOOLEAN DEFAULT false;

-- Wann wurde das Stripe-Konto zuletzt aktualisiert (via Webhook)
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS stripe_account_updated_at TIMESTAMP;

-- Details vom Stripe Connect Account (für Debugging/Support)
-- Enthält: requirements, currently_due, eventually_due, etc.
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS stripe_account_details JSONB;

-- ============================================
-- 2. Alte IBAN-Felder entfernen
-- (Stripe verwaltet Bankdaten selbst)
-- ============================================

-- IBAN und Kontoinhaber werden nicht mehr benötigt
-- Stripe sammelt diese Daten während des Onboardings
ALTER TABLE users DROP COLUMN IF EXISTS payout_iban;
ALTER TABLE users DROP COLUMN IF EXISTS payout_account_holder;

-- Auch in payouts Tabelle: iban_last4 bleibt für Historie,
-- aber account_holder kommt jetzt von Stripe
-- (Keine Änderung nötig, da wir die Info aus Stripe holen)

-- ============================================
-- 3. Payouts Tabelle erweitern
-- ============================================

-- Typ der Auszahlung (für verschiedene Stripe Transfer-Typen)
ALTER TABLE payouts 
ADD COLUMN IF NOT EXISTS payout_type VARCHAR(20) DEFAULT 'standard'
    CHECK (payout_type IN ('standard', 'instant'));

-- Stripe Destination (wohin das Geld geht)
ALTER TABLE payouts 
ADD COLUMN IF NOT EXISTS stripe_destination VARCHAR(255);

-- Stripe Balance Transaction ID (für Reconciliation)
ALTER TABLE payouts 
ADD COLUMN IF NOT EXISTS stripe_balance_transaction VARCHAR(255);

-- ============================================
-- 4. Stripe Webhook Events Log
-- Für Audit Trail und Debugging
-- ============================================

CREATE TABLE IF NOT EXISTS stripe_webhook_events (
    id SERIAL PRIMARY KEY,
    
    -- Stripe Event Details
    stripe_event_id VARCHAR(255) UNIQUE NOT NULL,
    event_type VARCHAR(100) NOT NULL,
    
    -- Verarbeitungsstatus
    status VARCHAR(20) DEFAULT 'received'
        CHECK (status IN ('received', 'processing', 'processed', 'failed')),
    
    -- Payload (für Debugging)
    payload JSONB,
    
    -- Error Details (falls fehlgeschlagen)
    error_message TEXT,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    processed_at TIMESTAMP
);

-- Index für Event-Typ und Status
CREATE INDEX IF NOT EXISTS idx_stripe_events_type ON stripe_webhook_events(event_type);
CREATE INDEX IF NOT EXISTS idx_stripe_events_status ON stripe_webhook_events(status);
CREATE INDEX IF NOT EXISTS idx_stripe_events_created ON stripe_webhook_events(created_at DESC);

-- ============================================
-- 5. Indexes für neue User-Felder
-- ============================================

CREATE INDEX IF NOT EXISTS idx_users_stripe_status ON users(stripe_account_status);
CREATE INDEX IF NOT EXISTS idx_users_stripe_payouts_enabled ON users(stripe_payouts_enabled);

-- ============================================
-- 6. Bestehende User migrieren
-- ============================================

-- User mit existierender stripe_account_id auf 'pending' setzen
-- (müssen Onboarding abschließen)
UPDATE users 
SET stripe_account_status = 'pending'
WHERE stripe_account_id IS NOT NULL 
  AND stripe_account_status = 'not_created';

-- ============================================
-- Rollback Script (falls nötig)
-- ============================================
/*
-- Neue Felder entfernen
ALTER TABLE users DROP COLUMN IF EXISTS stripe_account_status;
ALTER TABLE users DROP COLUMN IF EXISTS stripe_charges_enabled;
ALTER TABLE users DROP COLUMN IF EXISTS stripe_payouts_enabled;
ALTER TABLE users DROP COLUMN IF EXISTS stripe_onboarding_complete;
ALTER TABLE users DROP COLUMN IF EXISTS stripe_account_updated_at;
ALTER TABLE users DROP COLUMN IF EXISTS stripe_account_details;

-- Payouts Felder entfernen
ALTER TABLE payouts DROP COLUMN IF EXISTS payout_type;
ALTER TABLE payouts DROP COLUMN IF EXISTS stripe_destination;
ALTER TABLE payouts DROP COLUMN IF EXISTS stripe_balance_transaction;

-- Webhook Events Tabelle entfernen
DROP TABLE IF EXISTS stripe_webhook_events;

-- Alte IBAN-Felder wiederherstellen (falls benötigt)
ALTER TABLE users ADD COLUMN IF NOT EXISTS payout_iban VARCHAR(34);
ALTER TABLE users ADD COLUMN IF NOT EXISTS payout_account_holder VARCHAR(100);
*/