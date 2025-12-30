const db = require('../config/database');
const { getPlatformFee: getLevelFee } = require('../config/levels.config');

/**
 * User Model
 * Raw SQL queries for users table
 * 
 * BALANCE-KONZEPT:
 * - total_earnings: Gesamte Produkteinnahmen (für Level-Berechnung)
 *   → Wird automatisch via Stripe Destination Charges ausgezahlt
 * 
 * - affiliate_balance / available_balance: Verfügbare Affiliate-Provisionen
 *   → Kann manuell ausgezahlt werden
 * 
 * - affiliate_pending_balance / pending_balance: Affiliate-Provisionen in Clearing (7 Tage)
 *   → Wird nach Clearing-Zeit zu affiliate_balance verschoben
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
        -- Affiliate Balance (mit Fallback für alte Spaltennamen)
        COALESCE(affiliate_balance, available_balance, 0) as affiliate_balance,
        COALESCE(affiliate_pending_balance, pending_balance, 0) as affiliate_pending_balance,
        COALESCE(affiliate_earnings_total, 0) as affiliate_earnings_total,
        -- Legacy-Spalten für Kompatibilität
        COALESCE(available_balance, 0) as available_balance,
        COALESCE(pending_balance, 0) as pending_balance,
        -- Stripe Connect
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
   * Update product earnings (für Level-Berechnung)
   * 
   * WICHTIG: Diese Funktion aktualisiert NUR total_earnings für Level-Progression.
   * Produkt-Einnahmen werden NICHT in available_balance gespeichert,
   * da sie direkt via Stripe an den Seller gehen.
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
   * Add affiliate commission (mit 7-Tage Clearing)
   * 
   * Provisionen landen zuerst in pending, werden nach 7 Tagen
   * automatisch zu available verschoben.
   */
  async addAffiliateCommission(id, amount) {
    // Versuche zuerst die neuen Spaltennamen, dann Fallback
    let query = `
      UPDATE users 
      SET 
        affiliate_pending_balance = COALESCE(affiliate_pending_balance, 0) + $1,
        affiliate_earnings_total = COALESCE(affiliate_earnings_total, 0) + $1,
        updated_at = NOW()
      WHERE id = $2
      RETURNING id, affiliate_pending_balance, affiliate_balance, affiliate_earnings_total
    `;
    
    try {
      const result = await db.query(query, [amount, id]);
      return result.rows[0];
    } catch (err) {
      // Fallback für alte Spaltenstruktur
      if (err.code === '42703') { // undefined_column
        query = `
          UPDATE users 
          SET 
            pending_balance = COALESCE(pending_balance, 0) + $1,
            updated_at = NOW()
          WHERE id = $2
          RETURNING id, pending_balance, available_balance
        `;
        const result = await db.query(query, [amount, id]);
        return result.rows[0];
      }
      throw err;
    }
  },

  /**
   * Update affiliate balance (für Auszahlungen - kann negativ sein)
   */
  async updateAffiliateBalance(id, amount) {
    // Versuche zuerst die neuen Spaltennamen
    let query = `
      UPDATE users 
      SET 
        affiliate_balance = COALESCE(affiliate_balance, 0) + $1,
        updated_at = NOW()
      WHERE id = $2
      RETURNING id, affiliate_balance, affiliate_pending_balance
    `;
    
    try {
      const result = await db.query(query, [amount, id]);
      return result.rows[0];
    } catch (err) {
      // Fallback für alte Spaltenstruktur
      if (err.code === '42703') {
        query = `
          UPDATE users 
          SET 
            available_balance = COALESCE(available_balance, 0) + $1,
            updated_at = NOW()
          WHERE id = $2
          RETURNING id, available_balance, pending_balance
        `;
        const result = await db.query(query, [amount, id]);
        return result.rows[0];
      }
      throw err;
    }
  },

  /**
   * Legacy: Update user balance (für Kompatibilität)
   * @deprecated Use updateAffiliateBalance instead
   */
  async updateBalance(id, amount) {
    return this.updateAffiliateBalance(id, amount);
  },

  /**
   * Move affiliate commission from pending to available (nach Clearing)
   */
  async releaseAffiliateClearing(id, amount) {
    let query = `
      UPDATE users 
      SET 
        affiliate_pending_balance = GREATEST(0, COALESCE(affiliate_pending_balance, 0) - $1),
        affiliate_balance = COALESCE(affiliate_balance, 0) + $1,
        updated_at = NOW()
      WHERE id = $2 AND COALESCE(affiliate_pending_balance, 0) >= $1
      RETURNING id, affiliate_balance, affiliate_pending_balance
    `;
    
    try {
      const result = await db.query(query, [amount, id]);
      return result.rows[0] || null;
    } catch (err) {
      // Fallback
      if (err.code === '42703') {
        query = `
          UPDATE users 
          SET 
            pending_balance = GREATEST(0, COALESCE(pending_balance, 0) - $1),
            available_balance = COALESCE(available_balance, 0) + $1,
            updated_at = NOW()
          WHERE id = $2 AND COALESCE(pending_balance, 0) >= $1
          RETURNING id, available_balance, pending_balance
        `;
        const result = await db.query(query, [amount, id]);
        return result.rows[0] || null;
      }
      throw err;
    }
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
