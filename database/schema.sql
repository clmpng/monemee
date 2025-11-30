-- ============================================
-- MoneMee Database Schema
-- PostgreSQL
-- ============================================

-- Drop existing tables (in correct order due to foreign keys)
DROP TABLE IF EXISTS challenges CASCADE;
DROP TABLE IF EXISTS achievements CASCADE;
DROP TABLE IF EXISTS affiliate_links CASCADE;
DROP TABLE IF EXISTS transactions CASCADE;
DROP TABLE IF EXISTS products CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- ============================================
-- Users Table
-- ============================================
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    firebase_uid VARCHAR(128) UNIQUE,
    email VARCHAR(255) UNIQUE NOT NULL,
    username VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    bio TEXT DEFAULT '',
    avatar_url TEXT,
    role VARCHAR(20) DEFAULT 'creator' CHECK (role IN ('creator', 'promoter', 'both')),
    level INTEGER DEFAULT 1 CHECK (level >= 1 AND level <= 5),
    total_earnings DECIMAL(12, 2) DEFAULT 0,
    stripe_account_id VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for users
CREATE INDEX idx_users_firebase_uid ON users(firebase_uid);
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_email ON users(email);

-- ============================================
-- Products Table
-- ============================================
CREATE TABLE products (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    description TEXT DEFAULT '',
    price DECIMAL(10, 2) DEFAULT 0 CHECK (price >= 0),
    thumbnail_url TEXT,
    file_url TEXT,
    type VARCHAR(50) DEFAULT 'download' CHECK (type IN ('download', 'subscription', 'coaching', 'course')),
    status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'archived')),
    views INTEGER DEFAULT 0,
    sales INTEGER DEFAULT 0,
    affiliate_commission INTEGER DEFAULT 20 CHECK (affiliate_commission >= 0 AND affiliate_commission <= 50),
    category VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for products
CREATE INDEX idx_products_user_id ON products(user_id);
CREATE INDEX idx_products_status ON products(status);
CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_products_sales ON products(sales DESC);

-- ============================================
-- Transactions Table
-- ============================================
CREATE TABLE transactions (
    id SERIAL PRIMARY KEY,
    product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE SET NULL,
    buyer_id INTEGER NOT NULL REFERENCES users(id) ON DELETE SET NULL,
    seller_id INTEGER NOT NULL REFERENCES users(id) ON DELETE SET NULL,
    promoter_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    amount DECIMAL(10, 2) NOT NULL,
    platform_fee DECIMAL(10, 2) NOT NULL,
    seller_amount DECIMAL(10, 2) NOT NULL,
    promoter_commission DECIMAL(10, 2) DEFAULT 0,
    stripe_payment_id VARCHAR(255),
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'refunded', 'failed')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for transactions
CREATE INDEX idx_transactions_seller_id ON transactions(seller_id);
CREATE INDEX idx_transactions_promoter_id ON transactions(promoter_id);
CREATE INDEX idx_transactions_product_id ON transactions(product_id);
CREATE INDEX idx_transactions_created_at ON transactions(created_at DESC);
CREATE INDEX idx_transactions_status ON transactions(status);

-- ============================================
-- Affiliate Links Table
-- ============================================
CREATE TABLE affiliate_links (
    id SERIAL PRIMARY KEY,
    product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    promoter_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    code VARCHAR(20) UNIQUE NOT NULL,
    clicks INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Ensure one link per promoter per product
    UNIQUE(product_id, promoter_id)
);

-- Indexes for affiliate_links
CREATE INDEX idx_affiliate_links_code ON affiliate_links(code);
CREATE INDEX idx_affiliate_links_promoter_id ON affiliate_links(promoter_id);
CREATE INDEX idx_affiliate_links_product_id ON affiliate_links(product_id);

-- ============================================
-- Achievements Table (Gamification)
-- ============================================
CREATE TABLE achievements (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    icon VARCHAR(50),
    unlocked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Each achievement type can only be unlocked once per user
    UNIQUE(user_id, type)
);

-- Index for achievements
CREATE INDEX idx_achievements_user_id ON achievements(user_id);

-- ============================================
-- Challenges Table (Daily Challenges)
-- ============================================
CREATE TABLE challenges (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    target INTEGER NOT NULL,
    progress INTEGER DEFAULT 0,
    reward_type VARCHAR(50),
    reward_value DECIMAL(10, 2),
    expires_at TIMESTAMP NOT NULL,
    completed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for challenges
CREATE INDEX idx_challenges_user_id ON challenges(user_id);
CREATE INDEX idx_challenges_expires_at ON challenges(expires_at);

-- ============================================
-- Seed Data (für MVP Testing)
-- ============================================

-- Demo User
INSERT INTO users (firebase_uid, email, username, name, bio, role, level, total_earnings)
VALUES (
    'demo-uid-123',
    'max@example.com',
    'maxmuster',
    'Max Mustermann',
    'Digital Creator | Sharing knowledge about productivity and design.',
    'creator',
    2,
    234.00
);

-- Demo Products
INSERT INTO products (user_id, title, description, price, type, status, views, sales, affiliate_commission)
VALUES 
    (1, 'Ultimate Productivity Guide', 'Der ultimative Guide für mehr Produktivität im Alltag. Mit praktischen Tipps und Übungen.', 29.99, 'download', 'active', 234, 12, 20),
    (1, 'Design Templates Bundle', 'Professionelle Design-Vorlagen für Social Media, Präsentationen und mehr.', 49.99, 'download', 'active', 156, 8, 25),
    (1, 'Free Resource Pack', 'Kostenlose Ressourcen zum Einstieg. Icons, Fonts und Checklisten.', 0, 'download', 'draft', 0, 0, 0);

-- Demo Transactions
INSERT INTO transactions (product_id, buyer_id, seller_id, amount, platform_fee, seller_amount, status)
VALUES 
    (1, 1, 1, 29.99, 3.60, 26.39, 'completed'),
    (1, 1, 1, 29.99, 3.60, 26.39, 'completed'),
    (2, 1, 1, 49.99, 6.00, 43.99, 'completed');

-- ============================================
-- Helper Function: Update updated_at timestamp
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_products_updated_at
    BEFORE UPDATE ON products
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();