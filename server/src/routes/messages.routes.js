const express = require('express');
const router = express.Router();
const messagesController = require('../controllers/messages.controller');
const { authenticate, optionalAuth } = require('../middleware/auth');

// ============================================
// Messages Routes
// ============================================

// Public Routes
// -----------------------------------------

// POST /api/v1/messages/send - Send message to store owner (public)
// Uses optionalAuth to capture sender's user ID if logged in
router.post('/send', optionalAuth, messagesController.sendMessage);

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
