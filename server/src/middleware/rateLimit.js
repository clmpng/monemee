/**
 * Rate Limiting Middleware
 * Schützt vor Brute-Force, DDoS und API-Missbrauch
 */

const rateLimit = require('express-rate-limit');

// ============================================
// Generelles API Limit
// ============================================
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 Minuten
  max: 200, // 200 Requests pro 15 Minuten
  message: {
    success: false,
    message: 'Zu viele Anfragen. Bitte warte einen Moment.',
    code: 'RATE_LIMIT_EXCEEDED'
  },
  standardHeaders: true,
  legacyHeaders: false,
  // Skip für bestimmte Pfade (Webhooks müssen immer durchkommen)
  skip: (req) => req.path.includes('/webhooks')
});

// ============================================
// Strenges Auth Limit (Login, Register)
// ============================================
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 Minuten
  max: 10, // 10 Versuche pro 15 Minuten
  message: {
    success: false,
    message: 'Zu viele Anmeldeversuche. Bitte warte 15 Minuten.',
    code: 'AUTH_RATE_LIMIT_EXCEEDED'
  },
  standardHeaders: true,
  legacyHeaders: false,
  // Key basierend auf IP + Email (falls vorhanden)
  keyGenerator: (req) => {
    const email = req.body?.email || '';
    return `${req.ip}-${email}`;
  }
});

// ============================================
// Payment Limit (Checkout-Sessions)
// ============================================
const paymentLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 Stunde
  max: 20, // 20 Checkout-Versuche pro Stunde
  message: {
    success: false,
    message: 'Zu viele Zahlungsversuche. Bitte warte eine Stunde.',
    code: 'PAYMENT_RATE_LIMIT_EXCEEDED'
  },
  standardHeaders: true,
  legacyHeaders: false
});

// ============================================
// Stripe Connect Onboarding Limit
// ============================================
const stripeLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 Stunde
  max: 10, // 10 Onboarding-Versuche pro Stunde
  message: {
    success: false,
    message: 'Zu viele Anfragen. Bitte warte eine Stunde.',
    code: 'STRIPE_RATE_LIMIT_EXCEEDED'
  },
  standardHeaders: true,
  legacyHeaders: false
});

// ============================================
// Upload Limit
// ============================================
const uploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 Stunde
  max: 50, // 50 Uploads pro Stunde
  message: {
    success: false,
    message: 'Upload-Limit erreicht. Bitte warte eine Stunde.',
    code: 'UPLOAD_RATE_LIMIT_EXCEEDED'
  },
  standardHeaders: true,
  legacyHeaders: false
});

// ============================================
// Message/Spam Limit
// ============================================
const messageLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 Minute
  max: 10, // 10 Nachrichten pro Minute
  message: {
    success: false,
    message: 'Zu viele Nachrichten. Bitte warte einen Moment.',
    code: 'MESSAGE_RATE_LIMIT_EXCEEDED'
  },
  standardHeaders: true,
  legacyHeaders: false
});

// ============================================
// Sehr strenges Limit für sensitive Operationen
// ============================================
const sensitiveLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 Stunde
  max: 5, // 5 Versuche pro Stunde
  message: {
    success: false,
    message: 'Zu viele Anfragen für diese Aktion. Bitte warte eine Stunde.',
    code: 'SENSITIVE_RATE_LIMIT_EXCEEDED'
  },
  standardHeaders: true,
  legacyHeaders: false
});

module.exports = {
  generalLimiter,
  authLimiter,
  paymentLimiter,
  stripeLimiter,
  uploadLimiter,
  messageLimiter,
  sensitiveLimiter
};
