// Error Handler Middleware
export const errorHandler = (err, req, res, next) => {
  const isDevelopment = process.env.NODE_ENV !== 'production';

  // Log Error
  console.error('❌ Error:', {
    message: err.message,
    path: req.path,
    method: req.method,
    admin: req.admin?.username || 'anonymous',
    ...(isDevelopment && { stack: err.stack })
  });

  // Bestimme Status Code
  const statusCode = err.statusCode || 500;

  // Response
  res.status(statusCode).json({
    success: false,
    message: isDevelopment ? err.message : 'Internal Server Error',
    ...(isDevelopment && { stack: err.stack }),
    ...(err.errors && { errors: err.errors })
  });
};

// Custom Error Classes
export class AppError extends Error {
  constructor(message, statusCode = 500) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class NotFoundError extends AppError {
  constructor(message = 'Resource not found') {
    super(message, 404);
  }
}

export class ValidationError extends AppError {
  constructor(message = 'Validation failed', errors = []) {
    super(message, 400);
    this.errors = errors;
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = 'Unauthorized') {
    super(message, 401);
  }
}

export class ForbiddenError extends AppError {
  constructor(message = 'Forbidden') {
    super(message, 403);
  }
}
