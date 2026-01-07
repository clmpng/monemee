require('dotenv').config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const uploadRoutes = require('./routes/upload.routes');

// Import routes
const routes = require('./routes');

// Import middleware
const { errorHandler } = require('./middleware/error');

// Create Express app
const app = express();

// ============================================
// Middleware
// ============================================

// Security headers
app.use(helmet());

// CORS - Sichere Konfiguration mit Whitelist
const allowedOrigins = [
  process.env.CLIENT_URL,
  'http://localhost:3000',
  'http://localhost:3001'
].filter(Boolean); // Entfernt undefined/null

app.use(cors({
  origin: (origin, callback) => {
    // Erlaube Requests ohne Origin (z.B. mobile Apps, Postman)
    if (!origin) return callback(null, true);

    // Prüfe ob Origin in Whitelist
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    // SECURITY: Log blockierte CORS-Requests
    console.warn(`[SECURITY] CORS blocked origin: ${origin}`);
    callback(new Error('CORS not allowed'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Request logging
app.use(morgan('dev'));

// ============================================
// WICHTIG: Stripe Webhooks brauchen Raw Body!
// Diese Routes müssen VOR express.json() definiert werden
// ============================================

// Stripe Webhooks mit Raw Body Parser
// Die Webhook-Routes sind in routes/stripe.routes.js definiert
// und haben ihren eigenen express.raw() Middleware
app.use('/api/v1/stripe/webhooks', express.raw({ type: 'application/json' }));

// ============================================
// JSON & URL-encoded Body Parser für alle anderen Routes
// ============================================

// Parse JSON bodies (für alle anderen Requests)
app.use(express.json());

// Parse URL-encoded bodies
app.use(express.urlencoded({ extended: true }));

// ============================================
// Routes
// ============================================

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    stripe: {
      configured: !!process.env.STRIPE_SECRET_KEY_TEST || !!process.env.STRIPE_SECRET_KEY,
      mode: process.env.STRIPE_MODE || 'test'
    }
  });
});

// API routes
app.use('/api/v1', routes);
app.use('/api/v1/upload', uploadRoutes);

// ============================================
// Error Handling
// ============================================

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Global error handler
app.use(errorHandler);

// ============================================
// Start Server
// ============================================

const PORT = process.env.PORT || 5000;
const STRIPE_MODE = process.env.STRIPE_MODE || 'test';

app.listen(PORT, () => {
  console.log(`
  ╔═══════════════════════════════════════╗
  ║                                       ║
  ║   💸 Monemee API Server               ║
  ║   Running on http://localhost:${PORT}    ║
  ║                                       ║
  ║   Stripe Mode: ${STRIPE_MODE.padEnd(20)}║
  ║                                       ║
  ╚═══════════════════════════════════════╝
  `);
});

module.exports = app;