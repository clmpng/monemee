const db = require('../config/database');

/**
 * Product Model
 * Raw SQL queries for products table
 */
const ProductModel = {
  /**
   * Find all products by user ID
   */
  async findByUserId(userId) {
    const query = `
      SELECT 
        id, user_id, title, description, price, 
        thumbnail_url, file_url, type, status,
        views, sales, affiliate_commission,
        created_at, updated_at
      FROM products 
      WHERE user_id = $1 
      ORDER BY created_at DESC
    `;
    
    const result = await db.query(query, [userId]);
    return result.rows;
  },

  /**
   * Find product by ID
   */
  async findById(id) {
    const query = `
      SELECT 
        p.*,
        u.username as creator_username,
        u.name as creator_name
      FROM products p
      JOIN users u ON p.user_id = u.id
      WHERE p.id = $1
    `;
    
    const result = await db.query(query, [id]);
    return result.rows[0] || null;
  },

  /**
   * Create new product
   */
  async create(data) {
    const {
      user_id,
      title,
      description = '',
      price = 0,
      thumbnail_url = null,
      file_url = null,
      type = 'download',
      status = 'draft',
      affiliate_commission = 20
    } = data;

    const query = `
      INSERT INTO products (
        user_id, title, description, price,
        thumbnail_url, file_url, type, status,
        affiliate_commission
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *
    `;

    const values = [
      user_id, title, description, price,
      thumbnail_url, file_url, type, status,
      affiliate_commission
    ];

    const result = await db.query(query, values);
    return result.rows[0];
  },

  /**
   * Update product
   */
  async update(id, data) {
    const allowedFields = [
      'title', 'description', 'price', 'thumbnail_url',
      'file_url', 'type', 'status', 'affiliate_commission'
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
      UPDATE products 
      SET ${updates.join(', ')}, updated_at = NOW()
      WHERE id = $${paramCount}
      RETURNING *
    `;

    const result = await db.query(query, values);
    return result.rows[0] || null;
  },

  /**
   * Delete product
   */
  async delete(id) {
    const query = 'DELETE FROM products WHERE id = $1 RETURNING id';
    const result = await db.query(query, [id]);
    return result.rows.length > 0;
  },

  /**
   * Increment view count
   */
  async incrementViews(id) {
    const query = `
      UPDATE products 
      SET views = views + 1 
      WHERE id = $1
      RETURNING views
    `;
    
    const result = await db.query(query, [id]);
    return result.rows[0]?.views || 0;
  },

  /**
   * Increment sales count
   */
  async incrementSales(id) {
    const query = `
      UPDATE products 
      SET sales = sales + 1 
      WHERE id = $1
      RETURNING sales
    `;
    
    const result = await db.query(query, [id]);
    return result.rows[0]?.sales || 0;
  },

  /**
   * Get top products by sales
   */
  async getTop(limit = 10) {
    const query = `
      SELECT 
        p.*,
        u.username as creator_username,
        u.name as creator_name
      FROM products p
      JOIN users u ON p.user_id = u.id
      WHERE p.status = 'active'
      ORDER BY p.sales DESC
      LIMIT $1
    `;
    
    const result = await db.query(query, [limit]);
    return result.rows;
  },

  /**
   * Discover products for promoters
   */
  async discover({ category, sort = 'popular', limit = 20, offset = 0 }) {
    let orderBy = 'p.sales DESC';
    
    switch (sort) {
      case 'newest':
        orderBy = 'p.created_at DESC';
        break;
      case 'price_low':
        orderBy = 'p.price ASC';
        break;
      case 'price_high':
        orderBy = 'p.price DESC';
        break;
      case 'commission':
        orderBy = 'p.affiliate_commission DESC';
        break;
      default:
        orderBy = 'p.sales DESC';
    }

    let whereClause = "WHERE p.status = 'active'";
    const values = [limit, offset];

    if (category) {
      whereClause += ' AND p.category = $3';
      values.push(category);
    }

    const query = `
      SELECT 
        p.*,
        u.username as creator_username,
        u.name as creator_name
      FROM products p
      JOIN users u ON p.user_id = u.id
      ${whereClause}
      ORDER BY ${orderBy}
      LIMIT $1 OFFSET $2
    `;

    const result = await db.query(query, values);
    return result.rows;
  },


  /**
   * Find product by ID for public view (with creator info)
   */
  async findByIdPublic(id) {
    const query = `
      SELECT 
        p.id,
        p.title,
        p.description,
        p.price,
        p.thumbnail_url,
        p.type,
        p.status,
        p.views,
        p.sales,
        p.affiliate_commission,
        p.created_at,
        u.id as user_id,
        u.username as creator_username,
        u.name as creator_name,
        u.avatar_url as creator_avatar,
        u.bio as creator_bio,
        (SELECT COUNT(*) FROM products WHERE user_id = u.id AND status = 'active') as creator_product_count
      FROM products p
      JOIN users u ON p.user_id = u.id
      WHERE p.id = $1
    `;
    
    const result = await db.query(query, [id]);
    return result.rows[0] || null;
  },

};

module.exports = ProductModel;