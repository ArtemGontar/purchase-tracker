const config = require('../config/config');

const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);

  // Default error
  let error = {
    message: 'Internal Server Error',
    status: 500,
    code: 'INTERNAL_ERROR'
  };

  // Prisma errors
  if (err.code && err.code.startsWith('P')) {
    switch (err.code) {
      case 'P2002':
        error = {
          message: 'A record with this data already exists',
          status: 409,
          code: 'DUPLICATE_RECORD'
        };
        break;
      case 'P2025':
        error = {
          message: 'Record not found',
          status: 404,
          code: 'RECORD_NOT_FOUND'
        };
        break;
      default:
        error = {
          message: 'Database error',
          status: 500,
          code: 'DATABASE_ERROR'
        };
    }
  }

  // AWS SDK errors
  if (err.name && err.name.includes('AWS')) {
    error = {
      message: 'AWS service error',
      status: 500,
      code: 'AWS_ERROR'
    };
  }

  // Validation errors
  if (err.name === 'ValidationError') {
    error = {
      message: err.message,
      status: 400,
      code: 'VALIDATION_ERROR'
    };
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    error = {
      message: 'Invalid token',
      status: 401,
      code: 'INVALID_TOKEN'
    };
  }

  // Custom errors
  if (err.status) {
    error = {
      message: err.message,
      status: err.status,
      code: err.code || 'CUSTOM_ERROR'
    };
  }

  // Don't expose internal errors in production
  if (config.isProduction && error.status === 500) {
    error.message = 'Internal Server Error';
  }

  res.status(error.status).json({
    error: error.message,
    code: error.code,
    ...(config.isDevelopment && { stack: err.stack })
  });
};

module.exports = errorHandler;
