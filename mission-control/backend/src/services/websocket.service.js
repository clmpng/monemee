let wsConnections = new Map(); // Changed to Map to store client metadata
let connectionStats = {
  total: 0,
  active: 0,
  messagesReceived: 0,
  messagesSent: 0,
  reconnections: 0,
  errors: 0
};

// Recent events buffer (store last 50 events)
const recentEvents = [];
const MAX_RECENT_EVENTS = 50;

const addRecentEvent = (event) => {
  recentEvents.unshift(event);
  if (recentEvents.length > MAX_RECENT_EVENTS) {
    recentEvents.pop();
  }
};

export const initializeWebSocket = (wss) => {
  console.log('🔌 WebSocket Server initialized');

  wss.on('connection', (ws, req) => {
    const clientId = generateClientId();
    const clientIp = req.socket.remoteAddress;

    console.log(`✅ New WebSocket client connected: ${clientId} from ${clientIp}`);

    // Store client metadata
    wsConnections.set(clientId, {
      ws,
      id: clientId,
      ip: clientIp,
      connectedAt: new Date(),
      subscriptions: new Set(['all']), // Default subscription to 'all' channel
      messageCount: 0
    });

    connectionStats.total++;
    connectionStats.active = wsConnections.size;

    // Heartbeat
    ws.isAlive = true;
    ws.on('pong', () => {
      ws.isAlive = true;
    });

    // Handle incoming messages
    ws.on('message', (message) => {
      try {
        const data = JSON.parse(message);
        connectionStats.messagesReceived++;

        const client = wsConnections.get(clientId);
        if (client) {
          client.messageCount++;
        }

        console.log(`📨 Received from ${clientId}:`, data);

        // Handle different message types
        switch (data.type) {
          case 'subscribe':
            handleSubscribe(clientId, data.channel);
            break;

          case 'unsubscribe':
            handleUnsubscribe(clientId, data.channel);
            break;

          case 'ping':
            sendToClient(clientId, { type: 'pong', timestamp: new Date().toISOString() });
            break;

          case 'request_history':
            sendRecentEvents(clientId, data.limit || 20);
            break;

          case 'request_stats':
            sendToClient(clientId, { type: 'stats', data: getConnectionStats() });
            break;

          default:
            // Echo back unknown messages
            sendToClient(clientId, {
              type: 'ack',
              message: 'Message received',
              original: data
            });
        }
      } catch (error) {
        console.error('❌ WebSocket message error:', error);
        connectionStats.errors++;
      }
    });

    ws.on('close', () => {
      console.log(`👋 Client disconnected: ${clientId}`);
      wsConnections.delete(clientId);
      connectionStats.active = wsConnections.size;
    });

    ws.on('error', (error) => {
      console.error(`❌ WebSocket error for ${clientId}:`, error);
      wsConnections.delete(clientId);
      connectionStats.active = wsConnections.size;
      connectionStats.errors++;
    });

    // Send welcome message and recent events
    sendToClient(clientId, {
      type: 'connected',
      message: 'Welcome to Mission Control Real-Time Feed',
      clientId: clientId,
      timestamp: new Date().toISOString()
    });

    // Send recent events to new client
    setTimeout(() => {
      sendRecentEvents(clientId, 10);
    }, 500);
  });

  // Heartbeat Interval (30s)
  const heartbeat = setInterval(() => {
    wsConnections.forEach((client, clientId) => {
      if (!client.ws.isAlive) {
        console.log(`💀 Terminating inactive client: ${clientId}`);
        wsConnections.delete(clientId);
        connectionStats.active = wsConnections.size;
        return client.ws.terminate();
      }

      client.ws.isAlive = false;
      client.ws.ping();
    });
  }, 30000);

  wss.on('close', () => {
    clearInterval(heartbeat);
  });
};

// Generate unique client ID
const generateClientId = () => {
  return `client_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
};

// Handle channel subscription
const handleSubscribe = (clientId, channel) => {
  const client = wsConnections.get(clientId);
  if (client) {
    client.subscriptions.add(channel);
    sendToClient(clientId, {
      type: 'subscribed',
      channel,
      message: `Subscribed to ${channel}`
    });
    console.log(`📡 Client ${clientId} subscribed to ${channel}`);
  }
};

// Handle channel unsubscription
const handleUnsubscribe = (clientId, channel) => {
  const client = wsConnections.get(clientId);
  if (client && channel !== 'all') { // Can't unsubscribe from 'all'
    client.subscriptions.delete(channel);
    sendToClient(clientId, {
      type: 'unsubscribed',
      channel,
      message: `Unsubscribed from ${channel}`
    });
    console.log(`📡 Client ${clientId} unsubscribed from ${channel}`);
  }
};

// Send message to specific client
const sendToClient = (clientId, data) => {
  const client = wsConnections.get(clientId);
  if (client && client.ws.readyState === 1) { // OPEN
    const message = JSON.stringify({
      ...data,
      timestamp: data.timestamp || new Date().toISOString()
    });
    client.ws.send(message);
    connectionStats.messagesSent++;
    return true;
  }
  return false;
};

// Send recent events to client
const sendRecentEvents = (clientId, limit = 20) => {
  const events = recentEvents.slice(0, limit);
  sendToClient(clientId, {
    type: 'history',
    data: events,
    count: events.length
  });
};

// Broadcast to all connected clients (or specific channel)
export const broadcast = (data, channel = 'all') => {
  const message = JSON.stringify({
    ...data,
    timestamp: data.timestamp || new Date().toISOString()
  });

  // Add to recent events
  addRecentEvent({ ...data, timestamp: new Date().toISOString() });

  let sentCount = 0;
  wsConnections.forEach((client) => {
    // Check if client is subscribed to this channel
    if (client.ws.readyState === 1 && (client.subscriptions.has(channel) || client.subscriptions.has('all'))) {
      client.ws.send(message);
      sentCount++;
    }
  });

  connectionStats.messagesSent += sentCount;
  console.log(`📢 Broadcast to ${sentCount} clients on channel: ${channel}`);
  return sentCount;
};

// Get connection statistics
export const getConnectionStats = () => {
  const clients = Array.from(wsConnections.values()).map(client => ({
    id: client.id,
    ip: client.ip,
    connectedAt: client.connectedAt,
    subscriptions: Array.from(client.subscriptions),
    messageCount: client.messageCount
  }));

  return {
    ...connectionStats,
    clients,
    recentEventsCount: recentEvents.length
  };
};

// Clear recent events
export const clearRecentEvents = () => {
  recentEvents.length = 0;
};

// ========== EVENT-SPECIFIC BROADCASTS ==========

export const broadcastEvent = {
  // User Events
  newUser: (user) => {
    broadcast({
      type: 'user.created',
      data: {
        id: user.id,
        username: user.username,
        email: user.email,
        level: user.level,
        message: `Neuer User registriert: ${user.username}`
      }
    }, 'users');
  },

  userLevelUp: (user, newLevel) => {
    broadcast({
      type: 'user.level_up',
      data: {
        id: user.id,
        username: user.username,
        oldLevel: user.level,
        newLevel: newLevel,
        message: `${user.username} hat Level ${newLevel} erreicht!`
      }
    }, 'users');
  },

  // Transaction Events
  newSale: (transaction) => {
    broadcast({
      type: 'transaction.created',
      data: {
        id: transaction.id,
        amount: transaction.amount,
        product: transaction.product_title,
        seller: transaction.seller_username,
        buyer: transaction.buyer_username,
        message: `Neuer Verkauf: ${transaction.product_title} für €${transaction.amount}`
      }
    }, 'transactions');
  },

  transactionCompleted: (transaction) => {
    broadcast({
      type: 'transaction.completed',
      data: {
        id: transaction.id,
        amount: transaction.amount,
        message: `Transaktion abgeschlossen: €${transaction.amount}`
      }
    }, 'transactions');
  },

  // Product Events
  newProduct: (product) => {
    broadcast({
      type: 'product.created',
      data: {
        id: product.id,
        title: product.title,
        price: product.price,
        creator: product.creator_username,
        message: `Neues Produkt: ${product.title}`
      }
    }, 'products');
  },

  productPublished: (product) => {
    broadcast({
      type: 'product.published',
      data: {
        id: product.id,
        title: product.title,
        message: `Produkt veröffentlicht: ${product.title}`
      }
    }, 'products');
  },

  // Payment Events
  failedPayment: (error) => {
    broadcast({
      type: 'payment.failed',
      data: {
        message: error.message,
        amount: error.amount,
        reason: error.reason,
        severity: 'warning'
      }
    }, 'payments');
  },

  payoutRequested: (payout) => {
    broadcast({
      type: 'payout.requested',
      data: {
        id: payout.id,
        username: payout.username,
        amount: payout.amount,
        message: `Auszahlungsanfrage: ${payout.username} - €${payout.amount}`
      }
    }, 'payouts');
  },

  payoutCompleted: (payout) => {
    broadcast({
      type: 'payout.completed',
      data: {
        id: payout.id,
        username: payout.username,
        amount: payout.amount,
        message: `Auszahlung abgeschlossen: €${payout.amount}`
      }
    }, 'payouts');
  },

  // Security Events
  securityAlert: (alert) => {
    broadcast({
      type: 'security.alert',
      data: {
        severity: alert.severity, // 'critical', 'high', 'medium', 'low'
        message: alert.message,
        source: alert.source,
        details: alert.details
      }
    }, 'security');
  },

  failedLogin: (data) => {
    broadcast({
      type: 'security.failed_login',
      data: {
        ip: data.ip,
        username: data.username,
        attempts: data.attempts,
        message: `Fehlgeschlagener Login-Versuch: ${data.username || 'unknown'} von ${data.ip}`
      }
    }, 'security');
  },

  // Performance Events
  performanceAlert: (alert) => {
    broadcast({
      type: 'performance.alert',
      data: {
        metric: alert.metric,
        value: alert.value,
        threshold: alert.threshold,
        message: alert.message,
        severity: alert.severity
      }
    }, 'performance');
  },

  slowQuery: (query) => {
    broadcast({
      type: 'performance.slow_query',
      data: {
        query: query.query,
        duration: query.duration,
        message: `Langsame Query erkannt: ${query.duration}ms`
      }
    }, 'performance');
  },

  // System Events
  systemStatus: (status) => {
    broadcast({
      type: 'system.status',
      data: {
        status: status.status,
        uptime: status.uptime,
        message: status.message
      }
    }, 'system');
  },

  // Test Events
  testResult: (result) => {
    broadcast({
      type: 'test.completed',
      data: result
    }, 'tests');
  },

  // Generic Alert
  alert: (alert) => {
    broadcast({
      type: 'alert',
      data: {
        severity: alert.severity,
        message: alert.message,
        source: alert.source,
        details: alert.details
      }
    }, 'alerts');
  }
};

export default {
  initializeWebSocket,
  broadcast,
  broadcastEvent,
  getConnectionStats,
  clearRecentEvents
};
