/**
 * Error Handler Middleware
 * Catches all errors and sends appropriate responses
 */
const errorHandler = (err, req, res, next) => {
    console.error('❌ Error:', err);
  
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
  
    res.status(statusCode).json({
      success: false,
      message,
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
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