import express from 'express';
import bcrypt from 'bcrypt';
import { generateToken } from '../middleware/auth.js';
import { AppError } from '../middleware/error.js';

const router = express.Router();

// WICHTIG: In Production sollten Admin-Credentials in der DB gespeichert werden
// Für MVP: Hardcoded Admin (ÄNDERN VOR PRODUCTION!)
const ADMIN_CREDENTIALS = {
  username: process.env.ADMIN_USERNAME || 'admin',
  // Password: "admin123" (gehasht)
  passwordHash: process.env.ADMIN_PASSWORD_HASH || '$2b$10$90C2.EssNfMBZfZ/VZ39KuL9z1/a3H1SOrijDaevORf25L7Zr8XPa',
  role: 'super-admin'
};

// POST /api/auth/login
router.post('/login', async (req, res, next) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      throw new AppError('Username und Password erforderlich', 400);
    }

    // Validiere Credentials
    if (username !== ADMIN_CREDENTIALS.username) {
      // Security: Gleiche Fehlerzeit wie bei korrektem Username
      await bcrypt.compare(password, ADMIN_CREDENTIALS.passwordHash);
      throw new AppError('Ungültige Credentials', 401);
    }

    const isValid = await bcrypt.compare(password, ADMIN_CREDENTIALS.passwordHash);

    if (!isValid) {
      throw new AppError('Ungültige Credentials', 401);
    }

    // Generiere Token
    const token = generateToken({
      id: 1,
      username: ADMIN_CREDENTIALS.username,
      role: ADMIN_CREDENTIALS.role
    });

    res.json({
      success: true,
      token,
      admin: {
        username: ADMIN_CREDENTIALS.username,
        role: ADMIN_CREDENTIALS.role
      }
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/auth/verify
router.post('/verify', async (req, res, next) => {
  try {
    // Token wird vom Frontend im Authorization Header mitgeschickt
    // Wir nutzen die authenticateAdmin middleware um zu verifizieren

    res.json({
      success: true,
      message: 'Token is valid'
    });
  } catch (error) {
    next(error);
  }
});

// Utility: Generate Password Hash (für Setup)
router.post('/hash-password', async (req, res, next) => {
  try {
    // WICHTIG: Diese Route sollte in Production DEAKTIVIERT werden!
    if (process.env.NODE_ENV === 'production') {
      throw new AppError('Not available in production', 403);
    }

    const { password } = req.body;

    if (!password) {
      throw new AppError('Password erforderlich', 400);
    }

    const hash = await bcrypt.hash(password, 10);

    res.json({
      success: true,
      hash,
      info: 'Speichere diesen Hash in ADMIN_PASSWORD_HASH env variable'
    });
  } catch (error) {
    next(error);
  }
});

export default router;
