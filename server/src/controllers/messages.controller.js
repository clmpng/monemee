const MessageModel = require('../models/Message.model');
const UserModel = require('../models/User.model');

/**
 * Messages Controller
 * Handles message-related HTTP requests
 */
const messagesController = {
  /**
   * Get inbox messages for current user
   * GET /api/v1/messages
   */
  async getInbox(req, res, next) {
    try {
      const userId = req.userId;
      const { limit = 50, offset = 0, includeArchived = false } = req.query;
      
      const messages = await MessageModel.findByRecipientId(userId, {
        limit: parseInt(limit, 10),
        offset: parseInt(offset, 10),
        includeArchived: includeArchived === 'true'
      });
      
      const unreadCount = await MessageModel.countUnread(userId);
      
      res.json({
        success: true,
        data: {
          messages,
          unreadCount,
          pagination: {
            limit: parseInt(limit, 10),
            offset: parseInt(offset, 10),
            hasMore: messages.length === parseInt(limit, 10)
          }
        }
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Get single message
   * GET /api/v1/messages/:id
   */
  async getMessage(req, res, next) {
    try {
      const userId = req.userId;
      const { id } = req.params;
      
      const message = await MessageModel.findById(id);
      
      if (!message) {
        return res.status(404).json({
          success: false,
          message: 'Nachricht nicht gefunden'
        });
      }
      
      // Check ownership
      if (message.recipient_id !== userId) {
        return res.status(403).json({
          success: false,
          message: 'Kein Zugriff auf diese Nachricht'
        });
      }
      
      // Mark as read if not already
      if (!message.is_read) {
        await MessageModel.markAsRead(id, userId);
        message.is_read = true;
        message.read_at = new Date();
      }
      
      res.json({
        success: true,
        data: message
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Get unread count
   * GET /api/v1/messages/unread-count
   */
  async getUnreadCount(req, res, next) {
    try {
      const userId = req.userId;
      const count = await MessageModel.countUnread(userId);
      
      res.json({
        success: true,
        data: { count }
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Send message to store owner (public - no auth required)
   * POST /api/v1/messages/send
   */
  async sendMessage(req, res, next) {
    try {
      const { 
        recipient_username, 
        sender_name, 
        sender_email, 
        subject, 
        message,
        product_id 
      } = req.body;
      
      // Validate required fields
      if (!recipient_username || !sender_name || !sender_email || !message) {
        return res.status(400).json({
          success: false,
          message: 'Bitte fülle alle Pflichtfelder aus'
        });
      }
      
      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(sender_email)) {
        return res.status(400).json({
          success: false,
          message: 'Bitte gib eine gültige E-Mail-Adresse ein'
        });
      }
      
      // Find recipient by username
      const recipient = await UserModel.findByUsername(recipient_username);
      
      if (!recipient) {
        return res.status(404).json({
          success: false,
          message: 'Empfänger nicht gefunden'
        });
      }
      
      // Check if sender is logged in (optional auth)
      const senderUserId = req.userId || null;
      
      // Create message
      const newMessage = await MessageModel.create({
        sender_user_id: senderUserId,
        sender_name: sender_name.trim(),
        sender_email: sender_email.trim().toLowerCase(),
        recipient_id: recipient.id,
        subject: subject?.trim() || null,
        message: message.trim(),
        product_id: product_id || null
      });
      
      res.status(201).json({
        success: true,
        message: 'Nachricht erfolgreich gesendet',
        data: {
          id: newMessage.id,
          created_at: newMessage.created_at
        }
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Mark message as read
   * PUT /api/v1/messages/:id/read
   */
  async markAsRead(req, res, next) {
    try {
      const userId = req.userId;
      const { id } = req.params;
      
      const message = await MessageModel.markAsRead(id, userId);
      
      if (!message) {
        return res.status(404).json({
          success: false,
          message: 'Nachricht nicht gefunden'
        });
      }
      
      res.json({
        success: true,
        data: message
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Mark all messages as read
   * PUT /api/v1/messages/read-all
   */
  async markAllAsRead(req, res, next) {
    try {
      const userId = req.userId;
      await MessageModel.markAllAsRead(userId);
      
      res.json({
        success: true,
        message: 'Alle Nachrichten als gelesen markiert'
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Archive message
   * PUT /api/v1/messages/:id/archive
   */
  async archiveMessage(req, res, next) {
    try {
      const userId = req.userId;
      const { id } = req.params;
      
      const message = await MessageModel.archive(id, userId);
      
      if (!message) {
        return res.status(404).json({
          success: false,
          message: 'Nachricht nicht gefunden'
        });
      }
      
      res.json({
        success: true,
        data: message
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Delete message
   * DELETE /api/v1/messages/:id
   */
  async deleteMessage(req, res, next) {
    try {
      const userId = req.userId;
      const { id } = req.params;
      
      const deleted = await MessageModel.delete(id, userId);
      
      if (!deleted) {
        return res.status(404).json({
          success: false,
          message: 'Nachricht nicht gefunden'
        });
      }
      
      res.json({
        success: true,
        message: 'Nachricht gelöscht'
      });
    } catch (error) {
      next(error);
    }
  }
};

module.exports = messagesController;
