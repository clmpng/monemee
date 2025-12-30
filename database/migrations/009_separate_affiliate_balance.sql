-- ============================================
-- Migration: Separate Affiliate Balance
-- Datum: 2024-XX-XX
-- 
-- Trennt Produkt-Einnahmen (via Stripe) von
-- Affiliate-Provisionen (manuelle Auszahlung)
-- ============================================

-- ============================================
-- 1. Users Tabelle anpassen
-- ============================================

-- Umbenennen: available_balance → affiliate_balance
-- (Nur Affiliate-Provisionen, nicht Produkteinnahmen)
ALTER TABLE users 
RENAME COLUMN available_balance TO affiliate_balance;

-- Neues Feld: Gesamte Affiliate-Einnahmen (für Statistik)
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS affiliate_earnings_total DECIMAL(10, 2) DEFAULT 0;

-- pending_balance wird zu affiliate_pending_balance (für Clearing)
ALTER TABLE users 
RENAME COLUMN pending_balance TO affiliate_pending_balance;

-- Kommentar zur Klarheit
COMMENT ON COLUMN users.total_earnings IS 'Gesamteinnahmen aus Produktverkäufen (für Level-Berechnung). Auszahlung erfolgt automatisch via Stripe.';
COMMENT ON COLUMN users.affiliate_balance IS 'Verfügbares Guthaben aus Affiliate-Provisionen. Kann manuell ausgezahlt werden.';
COMMENT ON COLUMN users.affiliate_pending_balance IS 'Affiliate-Provisionen in 7-Tage Clearing-Phase.';
COMMENT ON COLUMN users.affiliate_earnings_total IS 'Gesamte Affiliate-Einnahmen (historisch).';

-- ============================================
-- 2. Transactions Tabelle erweitern
-- ============================================

-- Wann wird die Affiliate-Provision verfügbar?
ALTER TABLE transactions 
ADD COLUMN IF NOT EXISTS affiliate_available_at TIMESTAMP;

-- Index für Clearing-Abfragen
CREATE INDEX IF NOT EXISTS idx_transactions_affiliate_available 
ON transactions(affiliate_available_at) 
WHERE promoter_id IS NOT NULL AND affiliate_available_at IS NOT NULL;

-- ============================================
-- 3. Bestehende Daten migrieren
-- ============================================

-- Setze affiliate_earnings_total basierend auf bestehenden Transaktionen
UPDATE users u
SET affiliate_earnings_total = COALESCE((
    SELECT SUM(t.promoter_commission)
    FROM transactions t
    WHERE t.promoter_id = u.id
    AND t.status = 'completed'
), 0);

-- Setze affiliate_available_at für bestehende Transaktionen
-- (Alle bestehenden sofort verfügbar)
UPDATE transactions
SET affiliate_available_at = created_at
WHERE promoter_id IS NOT NULL 
AND affiliate_available_at IS NULL;

-- ============================================
-- 4. Payouts Tabelle anpassen
-- ============================================

-- Typ hinzufügen um zu kennzeichnen dass es Affiliate-Payouts sind
ALTER TABLE payouts 
ADD COLUMN IF NOT EXISTS source_type VARCHAR(20) DEFAULT 'affiliate'
    CHECK (source_type IN ('affiliate', 'legacy'));

COMMENT ON COLUMN payouts.source_type IS 'Quelle der Auszahlung. affiliate = Affiliate-Provisionen';

-- ============================================
-- 5. View für Clearing-Status
-- ============================================

CREATE OR REPLACE VIEW affiliate_clearing_status AS
SELECT 
    t.promoter_id AS user_id,
    COUNT(*) FILTER (WHERE t.affiliate_available_at <= NOW()) AS available_count,
    COUNT(*) FILTER (WHERE t.affiliate_available_at > NOW()) AS pending_count,
    COALESCE(SUM(t.promoter_commission) FILTER (WHERE t.affiliate_available_at <= NOW()), 0) AS available_amount,
    COALESCE(SUM(t.promoter_commission) FILTER (WHERE t.affiliate_available_at > NOW()), 0) AS pending_amount
FROM transactions t
WHERE t.promoter_id IS NOT NULL
AND t.status = 'completed'
GROUP BY t.promoter_id;

-- ============================================
-- 6. Function für Clearing-Update (Cronjob)
-- ============================================

CREATE OR REPLACE FUNCTION update_affiliate_balances()
RETURNS void AS $$
BEGIN
    -- Verschiebe freigegebene Provisionen von pending zu available
    UPDATE users u
    SET 
        affiliate_balance = affiliate_balance + COALESCE((
            SELECT SUM(t.promoter_commission)
            FROM transactions t
            WHERE t.promoter_id = u.id
            AND t.affiliate_available_at <= NOW()
            AND t.affiliate_available_at > NOW() - INTERVAL '1 day'
            AND t.status = 'completed'
        ), 0),
        affiliate_pending_balance = GREATEST(0, affiliate_pending_balance - COALESCE((
            SELECT SUM(t.promoter_commission)
            FROM transactions t
            WHERE t.promoter_id = u.id
            AND t.affiliate_available_at <= NOW()
            AND t.affiliate_available_at > NOW() - INTERVAL '1 day'
            AND t.status = 'completed'
        ), 0))
    WHERE EXISTS (
        SELECT 1 FROM transactions t
        WHERE t.promoter_id = u.id
        AND t.affiliate_available_at <= NOW()
        AND t.affiliate_available_at > NOW() - INTERVAL '1 day'
    );
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- Rollback Script
-- ============================================
/*
ALTER TABLE users RENAME COLUMN affiliate_balance TO available_balance;
ALTER TABLE users RENAME COLUMN affiliate_pending_balance TO pending_balance;
ALTER TABLE users DROP COLUMN IF EXISTS affiliate_earnings_total;
ALTER TABLE transactions DROP COLUMN IF EXISTS affiliate_available_at;
ALTER TABLE payouts DROP COLUMN IF EXISTS source_type;
DROP VIEW IF EXISTS affiliate_clearing_status;
DROP FUNCTION IF EXISTS update_affiliate_balances();
*/