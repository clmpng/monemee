/**
 * Authentication Middleware
 * Verifies Firebase ID tokens
 */

// const admin = require('../config/firebase');

/**
 * Authenticate user via Firebase token
 * Adds userId to request object
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
  
      // TODO: Verify Firebase token
      // const decodedToken = await admin.auth().verifyIdToken(token);
      // req.userId = decodedToken.uid;
      // req.userEmail = decodedToken.email;
  
      // Für MVP: Mock user ID
      req.userId = 1;
      req.userEmail = 'demo@earnflow.app';
  
      next();
    } catch (error) {
      console.error('Auth error:', error);
      
      if (error.code === 'auth/id-token-expired') {
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
  };
  
  /**
   * Optional authentication
   * Doesn't fail if no token present, but adds user if valid
   */
  const optionalAuth = async (req, res, next) => {
    try {
      const authHeader = req.headers.authorization;
      
      if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.split('Bearer ')[1];
        
        // TODO: Verify Firebase token
        // const decodedToken = await admin.auth().verifyIdToken(token);
        // req.userId = decodedToken.uid;
        
        // Für MVP: Mock
        req.userId = 1;
      }
  
      next();
    } catch (error) {
      // Token invalid, but continue without auth
      next();
    }
  };
  
  /**
   * Check if user has specific role
   */
  const requireRole = (roles) => {
    return async (req, res, next) => {
      try {
        // TODO: Get user role from database
        const userRole = 'creator'; // Mock
        
        if (!roles.includes(userRole) && !roles.includes('both')) {
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