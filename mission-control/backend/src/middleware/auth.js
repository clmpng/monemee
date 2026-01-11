import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.ADMIN_JWT_SECRET || 'change-this-secret';

// Admin-Authentifizierung
export const authenticateAdmin = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized: No token provided'
      });
    }

    const token = authHeader.substring(7); // Remove "Bearer "

    const decoded = jwt.verify(token, JWT_SECRET);

    // Admin-spezifische Validierung
    if (!decoded.isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: Admin access required'
      });
    }

    // Füge Admin-Info zum Request hinzu
    req.admin = {
      id: decoded.id,
      username: decoded.username,
      role: decoded.role || 'admin'
    };

    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expired'
      });
    }

    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token'
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Authentication error'
    });
  }
};

// Token generieren
export const generateToken = (adminData) => {
  return jwt.sign(
    {
      id: adminData.id,
      username: adminData.username,
      isAdmin: true,
      role: adminData.role || 'admin'
    },
    JWT_SECRET,
    {
      expiresIn: process.env.ADMIN_SESSION_DURATION || '24h'
    }
  );
};

// Role-basierte Autorisierung
export const requireRole = (allowedRoles) => {
  return (req, res, next) => {
    if (!req.admin) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized'
      });
    }

    if (!allowedRoles.includes(req.admin.role)) {
      return res.status(403).json({
        success: false,
        message: `Forbidden: Requires one of: ${allowedRoles.join(', ')}`
      });
    }

    next();
  };
};
