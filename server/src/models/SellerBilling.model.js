const db = require('../config/database');

/**
 * Seller Billing Model
 * Raw SQL queries for seller_billing_info table
 */
const SellerBillingModel = {
  /**
   * Find billing info by user ID
   */
  async findByUserId(userId) {
    const query = `
      SELECT
        id, user_id, business_name, street, zip, city, country,
        is_small_business, tax_id,
        created_at, updated_at
      FROM seller_billing_info
      WHERE user_id = $1
    `;

    const result = await db.query(query, [userId]);
    return result.rows[0] || null;
  },

  /**
   * Create or update billing info (upsert)
   * Uses ON CONFLICT to handle existing records
   */
  async upsert(userId, data) {
    const {
      business_name,
      street,
      zip,
      city,
      country = 'DE',
      is_small_business = false,
      tax_id = null
    } = data;

    const query = `
      INSERT INTO seller_billing_info (
        user_id, business_name, street, zip, city, country,
        is_small_business, tax_id
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      ON CONFLICT (user_id)
      DO UPDATE SET
        business_name = EXCLUDED.business_name,
        street = EXCLUDED.street,
        zip = EXCLUDED.zip,
        city = EXCLUDED.city,
        country = EXCLUDED.country,
        is_small_business = EXCLUDED.is_small_business,
        tax_id = EXCLUDED.tax_id,
        updated_at = NOW()
      RETURNING *
    `;

    const values = [
      userId,
      business_name,
      street,
      zip,
      city,
      country,
      is_small_business,
      tax_id
    ];

    const result = await db.query(query, values);
    return result.rows[0];
  },

  /**
   * Update existing billing info
   */
  async update(userId, data) {
    const allowedFields = [
      'business_name', 'street', 'zip', 'city', 'country',
      'is_small_business', 'tax_id'
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
      return this.findByUserId(userId);
    }

    values.push(userId);
    const query = `
      UPDATE seller_billing_info
      SET ${updates.join(', ')}, updated_at = NOW()
      WHERE user_id = $${paramCount}
      RETURNING *
    `;

    const result = await db.query(query, values);
    return result.rows[0] || null;
  },

  /**
   * Delete billing info
   */
  async delete(userId) {
    const query = 'DELETE FROM seller_billing_info WHERE user_id = $1 RETURNING id';
    const result = await db.query(query, [userId]);
    return result.rows.length > 0;
  },

  /**
   * Check if billing info is complete
   * For business sellers: all required fields must be filled
   */
  isComplete(billingInfo) {
    if (!billingInfo) {
      return false;
    }

    // Required fields for all business sellers
    const hasBasicInfo = !!(
      billingInfo.business_name?.trim() &&
      billingInfo.street?.trim() &&
      billingInfo.zip?.trim() &&
      billingInfo.city?.trim() &&
      billingInfo.country?.trim()
    );

    if (!hasBasicInfo) {
      return false;
    }

    // If not small business (Kleinunternehmer), tax_id is required
    if (!billingInfo.is_small_business && !billingInfo.tax_id?.trim()) {
      return false;
    }

    return true;
  },

  /**
   * Format address for invoice display
   */
  formatAddress(billingInfo) {
    if (!billingInfo) {
      return '';
    }

    const lines = [
      billingInfo.street?.trim(),
      `${billingInfo.zip?.trim()} ${billingInfo.city?.trim()}`,
      billingInfo.country?.trim()
    ].filter(Boolean);

    return lines.join('\n');
  }
};

module.exports = SellerBillingModel;
