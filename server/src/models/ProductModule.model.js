const db = require('../config/database');

/**
 * ProductModule Model
 * Handles all database operations for product modules
 */
const ProductModuleModel = {
  /**
   * Find all modules for a product
   */
  async findByProductId(productId) {
    const query = `
      SELECT *
      FROM product_modules
      WHERE product_id = $1
      ORDER BY sort_order ASC, created_at ASC
    `;
    
    const result = await db.query(query, [productId]);
    return result.rows;
  },

  /**
   * Find module by ID
   */
  async findById(id) {
    const query = `SELECT * FROM product_modules WHERE id = $1`;
    const result = await db.query(query, [id]);
    return result.rows[0] || null;
  },

  /**
   * Create new module
   */
  async create(data) {
    const {
      product_id,
      type,
      title = null,
      description = null,
      sort_order = 0,
      file_url = null,
      file_name = null,
      file_size = null,
      url = null,
      url_label = null,
      newsletter_id = null,
      duration = null,
      booking_url = null,
      content = null
    } = data;

    const query = `
      INSERT INTO product_modules (
        product_id, type, title, description, sort_order,
        file_url, file_name, file_size,
        url, url_label,
        newsletter_id,
        duration, booking_url,
        content
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
      RETURNING *
    `;

    const values = [
      product_id, type, title, description, sort_order,
      file_url, file_name, file_size,
      url, url_label,
      newsletter_id,
      duration, booking_url,
      content
    ];

    const result = await db.query(query, values);
    return result.rows[0];
  },

  /**
   * Create multiple modules at once
   */
  async createMany(productId, modules) {
    if (!modules || modules.length === 0) return [];

    const createdModules = [];
    
    for (let i = 0; i < modules.length; i++) {
      const module = await this.create({
        ...modules[i],
        product_id: productId,
        sort_order: modules[i].sort_order ?? i
      });
      createdModules.push(module);
    }

    return createdModules;
  },

  /**
   * Update module
   */
  async update(id, data) {
    const allowedFields = [
      'type', 'title', 'description', 'sort_order',
      'file_url', 'file_name', 'file_size',
      'url', 'url_label',
      'newsletter_id',
      'duration', 'booking_url',
      'content'
    ];

    const updates = [];
    const values = [];
    let paramCount = 1;

    for (const field of allowedFields) {
      if (data[field] !== undefined) {
        updates.push(`${field} = $${paramCount}`);
        values.push(data[field]);
        paramCount++;
      }
    }

    if (updates.length === 0) {
      return this.findById(id);
    }

    updates.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(id);

    const query = `
      UPDATE product_modules
      SET ${updates.join(', ')}
      WHERE id = $${paramCount}
      RETURNING *
    `;

    const result = await db.query(query, values);
    return result.rows[0] || null;
  },

  /**
   * Delete module
   */
  async delete(id) {
    const query = `DELETE FROM product_modules WHERE id = $1 RETURNING id`;
    const result = await db.query(query, [id]);
    return result.rows.length > 0;
  },

  /**
   * Delete all modules for a product
   */
  async deleteByProductId(productId) {
    const query = `DELETE FROM product_modules WHERE product_id = $1`;
    await db.query(query, [productId]);
    return true;
  },

  /**
   * Reorder modules
   */
  async reorder(productId, moduleIds) {
    for (let i = 0; i < moduleIds.length; i++) {
      await db.query(
        `UPDATE product_modules SET sort_order = $1 WHERE id = $2 AND product_id = $3`,
        [i, moduleIds[i], productId]
      );
    }
    return this.findByProductId(productId);
  },

  /**
   * Get module count by product
   */
  async countByProductId(productId) {
    const query = `SELECT COUNT(*) as count FROM product_modules WHERE product_id = $1`;
    const result = await db.query(query, [productId]);
    return parseInt(result.rows[0].count, 10);
  }
};

module.exports = ProductModuleModel;
