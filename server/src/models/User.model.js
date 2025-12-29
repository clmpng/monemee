const db = require('../config/database');
const { getPlatformFee: getLevelFee } = require('../config/levels.config');

/**
 * User Model
 * Raw SQL queries for users table
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
        available_balance, pending_balance,
        stripe_account_id, stripe_account_status,
        stripe_charges_enabled, stripe_payouts_enabled,
        stripe_onboarding_complete, stripe_account_updated_at,
        created_at, updated_at
      FROM users 
      WHERE id = $1
    `;
    
    const result = await db.query(query, [id]);
    return result.rows[0] || null;
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
   * Wird vom Stripe Service aufgerufen
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
   * Update user earnings and check for level up
   * WICHTIG: Diese Funktion aktualisiert auch available_balance!
   */
  async updateEarnings(id, amount) {
    const query = `
      UPDATE users 
      SET 
        total_earnings = total_earnings + $1,
        available_balance = available_balance + $1,
        level = CASE
          WHEN total_earnings + $1 >= 5000 THEN 5
          WHEN total_earnings + $1 >= 2000 THEN 4
          WHEN total_earnings + $1 >= 500 THEN 3
          WHEN total_earnings + $1 >= 100 THEN 2
          ELSE 1
        END,
        updated_at = NOW()
      WHERE id = $2
      RETURNING id, level, total_earnings, available_balance
    `;
    
    const result = await db.query(query, [amount, id]);
    return result.rows[0];
  },

  /**
   * Update user balance (for payouts - kann negativ sein)
   */
  async updateBalance(id, amount) {
    const query = `
      UPDATE users 
      SET 
        available_balance = available_balance + $1,
        updated_at = NOW()
      WHERE id = $2
      RETURNING id, available_balance, pending_balance
    `;
    
    const result = await db.query(query, [amount, id]);
    return result.rows[0];
  },

  /**
   * Move amount from available to pending (für Clearing)
   */
  async moveToPending(id, amount) {
    const query = `
      UPDATE users 
      SET 
        available_balance = available_balance - $1,
        pending_balance = pending_balance + $1,
        updated_at = NOW()
      WHERE id = $2 AND available_balance >= $1
      RETURNING id, available_balance, pending_balance
    `;
    
    const result = await db.query(query, [amount, id]);
    return result.rows[0] || null;
  },

  /**
   * Release pending to available (nach Clearing)
   */
  async releasePending(id, amount) {
    const query = `
      UPDATE users 
      SET 
        pending_balance = pending_balance - $1,
        available_balance = available_balance + $1,
        updated_at = NOW()
      WHERE id = $2 AND pending_balance >= $1
      RETURNING id, available_balance, pending_balance
    `;
    
    const result = await db.query(query, [amount, id]);
    return result.rows[0] || null;
  },

  /**
   * Check if user can receive payouts
   * Requires: Stripe account with payouts enabled
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
   * Nutzt zentrale Config
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