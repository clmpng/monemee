-- ============================================
-- Migration: Messages
-- Ermöglicht Nachrichten von Shop-Besuchern an Creator
-- ============================================

-- Tabelle für Nachrichten
CREATE TABLE IF NOT EXISTS messages (
    id SERIAL PRIMARY KEY,
    
    -- Sender (kann auch nicht-registrierter User sein)
    sender_user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    sender_name VARCHAR(100) NOT NULL,
    sender_email VARCHAR(255) NOT NULL,
    
    -- Empfänger (der Store-Besitzer)
    recipient_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Nachricht
    subject VARCHAR(200),
    message TEXT NOT NULL,
    
    -- Optional: Bezug zu einem Produkt
    product_id INTEGER REFERENCES products(id) ON DELETE SET NULL,
    
    -- Status
    is_read BOOLEAN DEFAULT false,
    is_archived BOOLEAN DEFAULT false,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    read_at TIMESTAMP
);

-- Indexes für schnelle Abfragen
CREATE INDEX IF NOT EXISTS idx_messages_recipient ON messages(recipient_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender_user ON messages(sender_user_id);
CREATE INDEX IF NOT EXISTS idx_messages_created ON messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_unread ON messages(recipient_id, is_read) WHERE is_read = false;
CREATE INDEX IF NOT EXISTS idx_messages_product ON messages(product_id);