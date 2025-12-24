const db = require('../config/database');

/**
 * Payout Model
 * Raw SQL queries for payouts table
 */
const PayoutModel = {
  /**
   * Find payout by ID
   */
  async findById(id) {
    const query = `
      SELECT 
        p.*,
        u.name as user_name,
        u.email as user_email
      FROM payouts p
      JOIN users u ON p.user_id = u.id
      WHERE p.id = $1
    `;
    
    const result = await db.query(query, [id]);
    return result.rows[0] || null;
  },

  /**
   * Find payout by reference number
   */
  async findByReference(referenceNumber) {
    const query = `
      SELECT * FROM payouts 
      WHERE reference_number = $1
    `;
    
    const result = await db.query(query, [referenceNumber]);
    return result.rows[0] || null;
  },

  /**
   * Find payouts by user
   */
  async findByUserId(userId, { limit = 50, offset = 0, status = null } = {}) {
    let query = `
      SELECT * FROM payouts 
      WHERE user_id = $1
    `;
    
    const values = [userId];
    let paramCount = 2;
    
    if (status) {
      query += ` AND status = $${paramCount}`;
      values.push(status);
      paramCount++;
    }
    
    query += ` ORDER BY created_at DESC LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
    values.push(limit, offset);
    
    const result = await db.query(query, values);
    return result.rows;
  },

  /**
   * Create new payout request
   */
  async create(data) {
    const {
      user_id,
      amount,
      fee,
      net_amount,
      iban_last4 = null,
      account_holder = null,
      status = 'pending'
    } = data;

    const query = `
      INSERT INTO payouts (
        user_id, amount, fee, net_amount,
        iban_last4, account_holder, status
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `;

    const values = [
      user_id, amount, fee, net_amount,
      iban_last4, account_holder, status
    ];

    const result = await db.query(query, values);
    return result.rows[0];
  },

  /**
   * Update payout status
   */
  async updateStatus(id, status, additionalData = {}) {
    const updates = ['status = $2'];
    const values = [id, status];
    let paramCount = 3;
    
    // Set timestamp based on status
    if (status === 'processing') {
      updates.push(`processed_at = NOW()`);
    } else if (status === 'completed') {
      updates.push(`completed_at = NOW()`);
    }
    
    // Additional fields
    if (additionalData.stripe_transfer_id) {
      updates.push(`stripe_transfer_id = $${paramCount}`);
      values.push(additionalData.stripe_transfer_id);
      paramCount++;
    }
    
    if (additionalData.stripe_payout_id) {
      updates.push(`stripe_payout_id = $${paramCount}`);
      values.push(additionalData.stripe_payout_id);
      paramCount++;
    }
    
    if (additionalData.failure_reason) {
      updates.push(`failure_reason = $${paramCount}`);
      values.push(additionalData.failure_reason);
      paramCount++;
    }
    
    const query = `
      UPDATE payouts 
      SET ${updates.join(', ')}
      WHERE id = $1
      RETURNING *
    `;
    
    const result = await db.query(query, values);
    return result.rows[0];
  },

  /**
   * Get total payouts for user
   */
  async getTotalPaidOut(userId) {
    const query = `
      SELECT COALESCE(SUM(net_amount), 0) as total_paid
      FROM payouts
      WHERE user_id = $1 AND status = 'completed'
    `;
    
    const result = await db.query(query, [userId]);
    return parseFloat(result.rows[0].total_paid);
  },

  /**
   * Get pending payouts count for user
   */
  async getPendingCount(userId) {
    const query = `
      SELECT COUNT(*) as count
      FROM payouts
      WHERE user_id = $1 AND status IN ('pending', 'processing')
    `;
    
    const result = await db.query(query, [userId]);
    return parseInt(result.rows[0].count);
  },

  /**
   * Get payout statistics for user
   */
  async getStats(userId) {
    const query = `
      SELECT 
        COUNT(*) FILTER (WHERE status = 'completed') as completed_count,
        COUNT(*) FILTER (WHERE status IN ('pending', 'processing')) as pending_count,
        COALESCE(SUM(net_amount) FILTER (WHERE status = 'completed'), 0) as total_paid,
        COALESCE(SUM(amount) FILTER (WHERE status IN ('pending', 'processing')), 0) as pending_amount
      FROM payouts
      WHERE user_id = $1
    `;
    
    const result = await db.query(query, [userId]);
    const stats = result.rows[0];
    
    return {
      completedCount: parseInt(stats.completed_count),
      pendingCount: parseInt(stats.pending_count),
      totalPaid: parseFloat(stats.total_paid),
      pendingAmount: parseFloat(stats.pending_amount)
    };
  },

  /**
   * Cancel payout (only if still pending)
   */
  async cancel(id, userId) {
    const query = `
      UPDATE payouts 
      SET status = 'cancelled'
      WHERE id = $1 AND user_id = $2 AND status = 'pending'
      RETURNING *
    `;
    
    const result = await db.query(query, [id, userId]);
    return result.rows[0] || null;
  }
};

module.exports = PayoutModel;
