import api from './api';

/**
 * Messages Service
 * API calls for messages/inbox functionality
 */
const messagesService = {
  /**
   * Get inbox messages for current user
   * @param {Object} params - Query parameters
   * @param {number} params.limit - Max messages to return
   * @param {number} params.offset - Offset for pagination
   * @param {boolean} params.includeArchived - Include archived messages
   */
  getInbox: (params = {}) => api.get('/messages', { params }),
  
  /**
   * Get single message by ID
   * @param {number} id - Message ID
   */
  getMessage: (id) => api.get(`/messages/${id}`),
  
  /**
   * Get unread message count
   */
  getUnreadCount: () => api.get('/messages/unread-count'),
  
  /**
   * Send a message to a store owner (public - no auth required)
   * @param {Object} data - Message data
   * @param {string} data.recipient_username - Store owner's username
   * @param {string} data.sender_name - Sender's name
   * @param {string} data.sender_email - Sender's email
   * @param {string} data.subject - Message subject (optional)
   * @param {string} data.message - Message content
   * @param {number} data.product_id - Related product ID (optional)
   */
  sendMessage: (data) => api.post('/messages/send', data),
  
  /**
   * Mark message as read
   * @param {number} id - Message ID
   */
  markAsRead: (id) => api.put(`/messages/${id}/read`),
  
  /**
   * Mark all messages as read
   */
  markAllAsRead: () => api.put('/messages/read-all'),
  
  /**
   * Archive a message
   * @param {number} id - Message ID
   */
  archiveMessage: (id) => api.put(`/messages/${id}/archive`),
  
  /**
   * Delete a message
   * @param {number} id - Message ID
   */
  deleteMessage: (id) => api.delete(`/messages/${id}`)
};

export default messagesService;
