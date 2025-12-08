/**
 * Authentication Middleware
 * Verifies Firebase ID tokens and syncs users to database
 */

const admin = require('../config/firebase');
const UserModel = require('../models/User.model');

/**
 * Helper: Generate username from email or name
 */
const generateUsername = (email, name) => {
  // Try to create username from name first
  if (name) {
    const baseUsername = name
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '')
      .slice(0, 15);
    if (baseUsername.length >= 3) {
      return baseUsername + Math.floor(Math.random() * 1000);
    }
  }
  
  // Fallback to email prefix
  const emailPrefix = email.split('@')[0]
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '')
    .slice(0, 15);
  
  return emailPrefix + Math.floor(Math.random() * 1000);
};

/**
 * Authenticate user via Firebase token
 * - Verifies the Firebase ID token
 * - Finds or creates user in database
 * - Adds userId to request object
 */
const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Kein Token vorhanden'
      });
    }

    const token = authHeader.split('Bearer ')[1];

    // Verify Firebase token
    let decodedToken;
    try {
      decodedToken = await admin.auth().verifyIdToken(token);
    } catch (verifyError) {
      console.error('Token verification failed:', verifyError.code);
      
      if (verifyError.code === 'auth/id-token-expired') {
        return res.status(401).json({
          success: false,
          message: 'Token abgelaufen'
        });
      }
      
      return res.status(401).json({
        success: false,
        message: 'Ungültiger Token'
      });
    }

    const firebaseUid = decodedToken.uid;
    const email = decodedToken.email;
    const name = decodedToken.name || decodedToken.email?.split('@')[0] || 'User';
    const avatar = decodedToken.picture || null;

    // Find user in database by Firebase UID
    let user = await UserModel.findByFirebaseUid(firebaseUid);

    // If user doesn't exist, create them automatically
    if (!user) {
      console.log(`Creating new user for Firebase UID: ${firebaseUid}`);
      
      // Generate unique username
      let username = generateUsername(email, name);
      let attempts = 0;
      
      // Ensure username is unique
      while (!(await UserModel.isUsernameAvailable(username)) && attempts < 10) {
        username = generateUsername(email, name);
        attempts++;
      }

      try {
        user = await UserModel.create({
          firebase_uid: firebaseUid,
          email: email,
          username: username,
          name: name,
          avatar_url: avatar,
          role: 'both', // Default: User kann beides machen
          bio: ''
        });
        
        console.log(`New user created: ${user.id} (${user.email})`);
      } catch (createError) {
        // Handle race condition - user might have been created by another request
        if (createError.code === '23505') { // Unique constraint violation
          user = await UserModel.findByFirebaseUid(firebaseUid);
          if (!user) {
            throw createError;
          }
        } else {
          throw createError;
        }
      }
    }

    // Add user info to request
    req.userId = user.id;
    req.userEmail = user.email;
    req.user = user;
    req.firebaseUid = firebaseUid;

    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    
    return res.status(500).json({
      success: false,
      message: 'Authentifizierungsfehler'
    });
  }
};

/**
 * Optional authentication
 * Doesn't fail if no token present, but adds user if valid
 */
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      // No token - continue without auth
      return next();
    }

    const token = authHeader.split('Bearer ')[1];
    
    try {
      const decodedToken = await admin.auth().verifyIdToken(token);
      const user = await UserModel.findByFirebaseUid(decodedToken.uid);
      
      if (user) {
        req.userId = user.id;
        req.userEmail = user.email;
        req.user = user;
        req.firebaseUid = decodedToken.uid;
      }
    } catch (verifyError) {
      // Token invalid - continue without auth
      console.log('Optional auth: invalid token, continuing without auth');
    }

    next();
  } catch (error) {
    // Error - continue without auth
    console.error('Optional auth error:', error);
    next();
  }
};

/**
 * Check if user has specific role
 */
const requireRole = (roles) => {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'Nicht authentifiziert'
        });
      }

      const userRole = req.user.role;
      
      // 'both' role has access to everything
      if (userRole === 'both') {
        return next();
      }
      
      if (!roles.includes(userRole)) {
        return res.status(403).json({
          success: false,
          message: 'Keine Berechtigung für diese Aktion'
        });
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

module.exports = {
  authenticate,
  optionalAuth,
  requireRole
};
