-- ============================================
-- Migration: Product Modules
-- Ermöglicht mehrere Content-Module pro Produkt
-- ============================================

-- Tabelle für Produkt-Module
CREATE TABLE IF NOT EXISTS product_modules (
    id SERIAL PRIMARY KEY,
    product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    type VARCHAR(20) NOT NULL CHECK (type IN ('file', 'url', 'email', 'videocall', 'text')),
    title VARCHAR(200),
    description TEXT,
    sort_order INTEGER DEFAULT 0,
    
    -- File-spezifisch
    file_url TEXT,
    file_name VARCHAR(255),
    file_size INTEGER,
    
    -- URL-spezifisch
    url TEXT,
    url_label VARCHAR(100),
    
    -- Email/Newsletter-spezifisch
    newsletter_id VARCHAR(100),
    
    -- Videocall-spezifisch
    duration INTEGER, -- in Minuten
    booking_url TEXT,
    
    -- Text-spezifisch
    content TEXT,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Index für schnelle Abfragen
CREATE INDEX IF NOT EXISTS idx_product_modules_product ON product_modules(product_id);
CREATE INDEX IF NOT EXISTS idx_product_modules_type ON product_modules(type);

-- Sortierung nach sort_order
CREATE INDEX IF NOT EXISTS idx_product_modules_sort ON product_modules(product_id, sort_order);
