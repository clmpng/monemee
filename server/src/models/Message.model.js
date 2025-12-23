const db = require('../config/database');

/**
 * Message Model
 * Raw SQL queries for messages table
 */
const MessageModel = {
  /**
   * Find message by ID
   */
  async findById(id) {
    const query = `
      SELECT 
        m.*,
        sender.name as sender_user_name,
        sender.avatar_url as sender_avatar,
        p.title as product_title
      FROM messages m
      LEFT JOIN users sender ON m.sender_user_id = sender.id
      LEFT JOIN products p ON m.product_id = p.id
      WHERE m.id = $1
    `;
    
    const result = await db.query(query, [id]);
    return result.rows[0] || null;
  },

  /**
   * Find messages by recipient (for inbox)
   */
  async findByRecipientId(recipientId, { limit = 50, offset = 0, includeArchived = false } = {}) {
    const archivedFilter = includeArchived ? '' : 'AND m.is_archived = false';
    
    const query = `
      SELECT 
        m.*,
        sender.name as sender_user_name,
        sender.avatar_url as sender_avatar,
        sender.username as sender_username,
        p.title as product_title,
        p.thumbnail_url as product_thumbnail
      FROM messages m
      LEFT JOIN users sender ON m.sender_user_id = sender.id
      LEFT JOIN products p ON m.product_id = p.id
      WHERE m.recipient_id = $1 ${archivedFilter}
      ORDER BY m.created_at DESC
      LIMIT $2 OFFSET $3
    `;
    
    const result = await db.query(query, [recipientId, limit, offset]);
    return result.rows;
  },

  /**
   * Count unread messages for user
   */
  async countUnread(recipientId) {
    const query = `
      SELECT COUNT(*) as count
      FROM messages
      WHERE recipient_id = $1 AND is_read = false AND is_archived = false
    `;
    
    const result = await db.query(query, [recipientId]);
    return parseInt(result.rows[0]?.count || 0, 10);
  },

  /**
   * Create new message
   */
  async create(data) {
    const {
      sender_user_id = null,
      sender_name,
      sender_email,
      recipient_id,
      subject = null,
      message,
      product_id = null
    } = data;

    const query = `
      INSERT INTO messages (
        sender_user_id, sender_name, sender_email,
        recipient_id, subject, message, product_id
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `;

    const values = [
      sender_user_id, sender_name, sender_email,
      recipient_id, subject, message, product_id
    ];

    const result = await db.query(query, values);
    return result.rows[0];
  },

  /**
   * Mark message as read
   */
  async markAsRead(id, recipientId) {
    const query = `
      UPDATE messages 
      SET is_read = true, read_at = NOW()
      WHERE id = $1 AND recipient_id = $2
      RETURNING *
    `;
    
    const result = await db.query(query, [id, recipientId]);
    return result.rows[0];
  },

  /**
   * Mark all messages as read for user
   */
  async markAllAsRead(recipientId) {
    const query = `
      UPDATE messages 
      SET is_read = true, read_at = NOW()
      WHERE recipient_id = $1 AND is_read = false
      RETURNING COUNT(*) as updated
    `;
    
    const result = await db.query(query, [recipientId]);
    return result.rows[0];
  },

  /**
   * Archive message
   */
  async archive(id, recipientId) {
    const query = `
      UPDATE messages 
      SET is_archived = true
      WHERE id = $1 AND recipient_id = $2
      RETURNING *
    `;
    
    const result = await db.query(query, [id, recipientId]);
    return result.rows[0];
  },

  /**
   * Delete message
   */
  async delete(id, recipientId) {
    const query = `
      DELETE FROM messages 
      WHERE id = $1 AND recipient_id = $2
      RETURNING id
    `;
    
    const result = await db.query(query, [id, recipientId]);
    return result.rows[0];
  }
};

module.exports = MessageModel;
