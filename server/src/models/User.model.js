const db = require('../config/database');
const { getPlatformFee: getLevelFee } = require('../config/levels.config');

/**
 * User Model
 * Raw SQL queries for users table
 * 
 * NACH MIGRATION 009:
 * - available_balance → affiliate_balance
 * - pending_balance → affiliate_pending_balance
 */
const UserModel = {
  /**
   * Find user by ID
   */
  async findById(id) {
    const query = `
      SELECT 
        id, firebase_uid, email, username, name,
        bio, avatar_url, role, level, total_earnings,
        affiliate_balance, affiliate_pending_balance,
        COALESCE(affiliate_earnings_total, 0) as affiliate_earnings_total,
        seller_type, 
        stripe_account_id, stripe_account_status,
        stripe_charges_enabled, stripe_payouts_enabled,
        stripe_onboarding_complete, stripe_account_updated_at,
        created_at, updated_at
      FROM users 
      WHERE id = $1
    `;
    
    const result = await db.query(query, [id]);
    const user = result.rows[0] || null;
    
    // Aliase für Rückwärtskompatibilität
    if (user) {
      user.available_balance = user.affiliate_balance;
      user.pending_balance = user.affiliate_pending_balance;
    }
    
    return user;
  },

  /**
   * Find user by Firebase UID
   */
  async findByFirebaseUid(firebaseUid) {
    const query = `
      SELECT * FROM users 
      WHERE firebase_uid = $1
    `;
    
    const result = await db.query(query, [firebaseUid]);
    return result.rows[0] || null;
  },

  /**
   * Find user by email
   */
  async findByEmail(email) {
    const query = `
      SELECT * FROM users 
      WHERE email = $1
    `;
    
    const result = await db.query(query, [email]);
    return result.rows[0] || null;
  },

  /**
   * Find user by username
   */
  async findByUsername(username) {
    const query = `
      SELECT 
        id, username, name, bio, avatar_url, 
        role, level, created_at
      FROM users 
      WHERE username = $1
    `;
    
    const result = await db.query(query, [username]);
    return result.rows[0] || null;
  },

  /**
   * Find user by Stripe Account ID
   */
  async findByStripeAccountId(stripeAccountId) {
    const query = `
      SELECT * FROM users 
      WHERE stripe_account_id = $1
    `;
    
    const result = await db.query(query, [stripeAccountId]);
    return result.rows[0] || null;
  },

  /**
   * Create new user
   */
  async create(data) {
    const {
      firebase_uid,
      email,
      username,
      name,
      bio = '',
      avatar_url = null,
      role = 'creator'
    } = data;

    const query = `
      INSERT INTO users (
        firebase_uid, email, username, name,
        bio, avatar_url, role
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `;

    const values = [
      firebase_uid, email, username, name,
      bio, avatar_url, role
    ];

    const result = await db.query(query, values);
    return result.rows[0];
  },

  /**
   * Update user
   */
  async update(id, data) {
    const allowedFields = [
      'username', 'name', 'bio', 'avatar_url', 
      'role', 'stripe_account_id'
    ];

    const updates = [];
    const values = [];
    let paramCount = 1;

    for (const [key, value] of Object.entries(data)) {
      if (allowedFields.includes(key)) {
        updates.push(`${key} = $${paramCount}`);
        values.push(value);
        paramCount++;
      }
    }

    if (updates.length === 0) {
      return this.findById(id);
    }

    values.push(id);
    const query = `
      UPDATE users 
      SET ${updates.join(', ')}, updated_at = NOW()
      WHERE id = $${paramCount}
      RETURNING *
    `;

    const result = await db.query(query, values);
    return result.rows[0] || null;
  },

  /**
   * Update Stripe Connect Status
   */
  async updateStripeStatus(id, data) {
    const allowedFields = [
      'stripe_account_id',
      'stripe_account_status',
      'stripe_charges_enabled',
      'stripe_payouts_enabled',
      'stripe_onboarding_complete',
      'stripe_account_details'
    ];

    const updates = [];
    const values = [];
    let paramCount = 1;

    for (const [key, value] of Object.entries(data)) {
      if (allowedFields.includes(key)) {
        if (key === 'stripe_account_details') {
          updates.push(`${key} = $${paramCount}::jsonb`);
          values.push(JSON.stringify(value));
        } else {
          updates.push(`${key} = $${paramCount}`);
          values.push(value);
        }
        paramCount++;
      }
    }

    if (updates.length === 0) {
      return this.findById(id);
    }

    updates.push(`stripe_account_updated_at = NOW()`);
    updates.push(`updated_at = NOW()`);

    values.push(id);
    const query = `
      UPDATE users 
      SET ${updates.join(', ')}
      WHERE id = $${paramCount}
      RETURNING *
    `;

    const result = await db.query(query, values);
    return result.rows[0] || null;
  },

  /**
   * Update product earnings (für Level-Berechnung)
   */
  async updateEarnings(id, amount) {
    const query = `
      UPDATE users 
      SET 
        total_earnings = total_earnings + $1,
        level = CASE
          WHEN total_earnings + $1 >= 5000 THEN 5
          WHEN total_earnings + $1 >= 2000 THEN 4
          WHEN total_earnings + $1 >= 500 THEN 3
          WHEN total_earnings + $1 >= 100 THEN 2
          ELSE 1
        END,
        updated_at = NOW()
      WHERE id = $2
      RETURNING id, level, total_earnings
    `;
    
    const result = await db.query(query, [amount, id]);
    return result.rows[0];
  },

  /**
   * Add affiliate commission (geht in pending für Clearing)
   */
  async addAffiliateCommission(id, amount) {
    const query = `
      UPDATE users 
      SET 
        affiliate_pending_balance = COALESCE(affiliate_pending_balance, 0) + $1,
        affiliate_earnings_total = COALESCE(affiliate_earnings_total, 0) + $1,
        updated_at = NOW()
      WHERE id = $2
      RETURNING id, affiliate_pending_balance, affiliate_balance, affiliate_earnings_total
    `;
    
    const result = await db.query(query, [amount, id]);
    return result.rows[0];
  },

  /**
   * Update affiliate balance (für Auszahlungen - kann negativ sein)
   */
  async updateAffiliateBalance(id, amount) {
    const query = `
      UPDATE users 
      SET 
        affiliate_balance = COALESCE(affiliate_balance, 0) + $1,
        updated_at = NOW()
      WHERE id = $2
      RETURNING id, affiliate_balance, affiliate_pending_balance
    `;
    
    const result = await db.query(query, [amount, id]);
    return result.rows[0];
  },

  /**
   * Legacy: Update user balance
   */
  async updateBalance(id, amount) {
    return this.updateAffiliateBalance(id, amount);
  },

  /**
   * Release affiliate commission from pending to available
   */
  async releaseAffiliateClearing(id, amount) {
    const query = `
      UPDATE users 
      SET 
        affiliate_pending_balance = GREATEST(0, COALESCE(affiliate_pending_balance, 0) - $1),
        affiliate_balance = COALESCE(affiliate_balance, 0) + $1,
        updated_at = NOW()
      WHERE id = $2 AND COALESCE(affiliate_pending_balance, 0) >= $1
      RETURNING id, affiliate_balance, affiliate_pending_balance
    `;
    
    const result = await db.query(query, [amount, id]);
    return result.rows[0] || null;
  },

  /**
   * Check if user can receive payouts
   */
  async canReceivePayouts(id) {
    const user = await this.findById(id);
    if (!user) return false;
    
    return !!(
      user.stripe_account_id &&
      user.stripe_payouts_enabled &&
      user.stripe_onboarding_complete
    );
  },

  /**
   * Get platform fee based on user level
   */
  getPlatformFee(level) {
    return getLevelFee(level);
  },

  /**
   * Check if username is available
   */
  async isUsernameAvailable(username) {
    const query = `
      SELECT id FROM users 
      WHERE username = $1
    `;
    
    const result = await db.query(query, [username]);
    return result.rows.length === 0;
  }
};

module.exports = UserModel;
