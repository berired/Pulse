export const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

export const errorHandler = (err, req, res, next) => {
  console.error('Error:', {
    message: err.message,
    status: err.status || 500,
    path: req.path,
    method: req.method,
    stack: err.stack,
  });

  const status = err.status || err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  // Supabase specific errors
  if (err.message?.includes('JWT')) {
    return res.status(401).json({
      error: 'Authentication Failed',
      message: 'Invalid or expired token',
    });
  }

  if (err.message?.includes('unique')) {
    return res.status(400).json({
      error: 'Conflict',
      message: 'Resource already exists',
    });
  }

  if (err.message?.includes('foreign key')) {
    return res.status(400).json({
      error: 'Validation Error',
      message: 'Invalid reference to related resource',
    });
  }

  // Generic error response
  res.status(status).json({
    error: err.name || 'Error',
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

export class AppError extends Error {
  constructor(message, statusCode = 500) {
    super(message);
    this.statusCode = statusCode;
    Error.captureStackTrace(this, this.constructor);
  }
}
