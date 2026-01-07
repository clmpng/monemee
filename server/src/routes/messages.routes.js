const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');
const messagesController = require('../controllers/messages.controller');
const { authenticate, optionalAuth } = require('../middleware/auth');

// ============================================
// Rate Limiting (Security)
// ============================================

// Strenges Limit für öffentlichen Message-Endpoint (Spam-Schutz)
const messageSendLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 Stunde
  max: 10, // Max 10 Nachrichten pro Stunde pro IP
  message: {
    success: false,
    message: 'Zu viele Nachrichten gesendet. Bitte versuche es in einer Stunde erneut.'
  },
  standardHeaders: true,
  legacyHeaders: false,
  // IP-basiertes Limiting
  keyGenerator: (req) => req.ip
});

// ============================================
// Messages Routes
// ============================================

// Public Routes
// -----------------------------------------

// POST /api/v1/messages/send - Send message to store owner (public)
// SECURITY: Rate-Limited (10/Stunde) + optionalAuth
router.post('/send', messageSendLimiter, optionalAuth, messagesController.sendMessage);

// Protected Routes (require authentication)
// -----------------------------------------

// GET /api/v1/messages - Get inbox messages
router.get('/', authenticate, messagesController.getInbox);

// GET /api/v1/messages/unread-count - Get unread message count
router.get('/unread-count', authenticate, messagesController.getUnreadCount);

// GET /api/v1/messages/:id - Get single message
router.get('/:id', authenticate, messagesController.getMessage);

// PUT /api/v1/messages/read-all - Mark all messages as read
router.put('/read-all', authenticate, messagesController.markAllAsRead);

// PUT /api/v1/messages/:id/read - Mark message as read
router.put('/:id/read', authenticate, messagesController.markAsRead);

// PUT /api/v1/messages/:id/archive - Archive message
router.put('/:id/archive', authenticate, messagesController.archiveMessage);

// DELETE /api/v1/messages/:id - Delete message
router.delete('/:id', authenticate, messagesController.deleteMessage);

module.exports = router;
