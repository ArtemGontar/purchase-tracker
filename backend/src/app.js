const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
require('dotenv').config();

const receiptRoutes = require('./routes/receipts');
const purchaseRoutes = require('./routes/purchases');
const userRoutes = require('./routes/users');
const errorHandler = require('./middleware/errorHandler');
const config = require('./config/config');
const logger = require('./utils/logger');

const app = express();

// Security middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// CORS middleware
app.use(cors(config.cors));

// Logging middleware
if (config.isDevelopment) {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// Body parsing middleware
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Request logging
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.path}`, {
    ip: req.ip,
    userAgent: req.get('User-Agent'),
  });
  next();
});

// API Routes
app.use('/api/receipts', receiptRoutes);
app.use('/api/purchases', purchaseRoutes);
app.use('/api/users', userRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    environment: config.nodeEnv,
    version: process.env.npm_package_version || '1.0.0'
  });
});

// API documentation endpoint
app.get('/api', (req, res) => {
  res.json({
    name: 'Purchase Tracker API',
    version: '1.0.0',
    environment: config.nodeEnv,
    endpoints: {
      receipts: {
        'POST /api/receipts/upload': 'Upload receipt image',
        'GET /api/receipts': 'Get user receipts',
        'GET /api/receipts/:id': 'Get specific receipt',
        'DELETE /api/receipts/:id': 'Delete receipt',
        'POST /api/receipts/:id/reprocess': 'Reprocess receipt with Textract',
      },
      purchases: {
        'GET /api/purchases': 'Get user purchases',
        'POST /api/purchases': 'Create new purchase',
        'GET /api/purchases/stats': 'Get purchase statistics',
        'GET /api/purchases/categories': 'Get purchase categories',
        'GET /api/purchases/:id': 'Get specific purchase',
        'PUT /api/purchases/:id': 'Update purchase',
        'DELETE /api/purchases/:id': 'Delete purchase',
      },
      users: {
        'GET /api/users/profile': 'Get user profile',
        'PUT /api/users/profile': 'Update user profile',
        'GET /api/users/dashboard': 'Get dashboard data',
        'DELETE /api/users/account': 'Delete user account',
      },
    },
    authentication: 'AWS Cognito JWT tokens required in Authorization header',
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Endpoint not found',
    code: 'NOT_FOUND',
    path: req.originalUrl,
  });
});

// Error handling middleware (must be last)
app.use(errorHandler);

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  logger.info('SIGINT received, shutting down gracefully');
  process.exit(0);
});

// Start server
const PORT = config.port;

const server = app.listen(PORT, () => {
  logger.info(`🚀 Purchase Tracker API server running on port ${PORT}`);
  logger.info(`📚 API documentation available at http://localhost:${PORT}/api`);
  logger.info(`🏥 Health check available at http://localhost:${PORT}/health`);
  logger.info(`🌍 Environment: ${config.nodeEnv}`);
});

// Handle server errors
server.on('error', (error) => {
  if (error.code === 'EADDRINUSE') {
    logger.error(`Port ${PORT} is already in use`);
    process.exit(1);
  } else {
    logger.error('Server error:', error);
  }
});

module.exports = app;
