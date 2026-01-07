/**
 * Error Handler Middleware
 * Catches all errors and sends appropriate responses
 *
 * SECURITY: Stack Traces nur in Development, sensible Fehler werden maskiert
 */
const errorHandler = (err, req, res, next) => {
    const isDevelopment = process.env.NODE_ENV === 'development';
    const isProduction = process.env.NODE_ENV === 'production';

    // SECURITY: Strukturiertes Error-Logging
    const errorLog = {
      timestamp: new Date().toISOString(),
      path: req.originalUrl,
      method: req.method,
      ip: req.ip,
      userId: req.userId || null,
      error: err.message,
      code: err.code || null,
      ...(isDevelopment && { stack: err.stack })
    };

    // Fehler loggen (in Production ohne Stack)
    if (isProduction) {
      console.error('[ERROR]', JSON.stringify(errorLog));
    } else {
      console.error('❌ Error:', err);
    }

    // Default error
    let statusCode = err.statusCode || 500;
    let message = err.message || 'Interner Serverfehler';

    // Handle specific error types
    if (err.name === 'ValidationError') {
      statusCode = 400;
      message = err.message;
    }

    if (err.name === 'UnauthorizedError') {
      statusCode = 401;
      message = 'Nicht autorisiert';
    }

    if (err.code === '23505') {
      // PostgreSQL unique violation
      statusCode = 409;
      message = 'Eintrag existiert bereits';
    }

    if (err.code === '23503') {
      // PostgreSQL foreign key violation
      statusCode = 400;
      message = 'Ungültige Referenz';
    }

    // SECURITY: In Production keine internen Fehlermeldungen nach außen geben
    if (isProduction && statusCode >= 500) {
      message = 'Ein interner Fehler ist aufgetreten';
    }

    res.status(statusCode).json({
      success: false,
      message,
      // SECURITY: Stack Trace NUR in Development UND explizit NICHT in Production
      ...(isDevelopment && !isProduction && { stack: err.stack })
    });
  };
  
  /**
   * Custom Error Classes
   */
  class AppError extends Error {
    constructor(message, statusCode) {
      super(message);
      this.statusCode = statusCode;
      this.isOperational = true;
  
      Error.captureStackTrace(this, this.constructor);
    }
  }
  
  class NotFoundError extends AppError {
    constructor(message = 'Ressource nicht gefunden') {
      super(message, 404);
    }
  }
  
  class ValidationError extends AppError {
    constructor(message = 'Validierungsfehler') {
      super(message, 400);
    }
  }
  
  class UnauthorizedError extends AppError {
    constructor(message = 'Nicht autorisiert') {
      super(message, 401);
    }
  }
  
  class ForbiddenError extends AppError {
    constructor(message = 'Zugriff verweigert') {
      super(message, 403);
    }
  }
  
  module.exports = {
    errorHandler,
    AppError,
    NotFoundError,
    ValidationError,
    UnauthorizedError,
    ForbiddenError
  };