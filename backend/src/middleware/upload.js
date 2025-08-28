const multer = require('multer');
const config = require('../config/config');

// Configure multer for memory storage
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  // Accept images only
  if (config.allowedFileTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`File type ${file.mimetype} not allowed. Supported types: ${config.allowedFileTypes.join(', ')}`), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: config.maxFileSize,
  },
});

// Error handling middleware for multer
const handleMulterError = (error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        error: `File too large. Maximum size is ${config.maxFileSize / 1024 / 1024}MB`,
        code: 'FILE_TOO_LARGE'
      });
    }
    return res.status(400).json({
      error: `Upload error: ${error.message}`,
      code: 'UPLOAD_ERROR'
    });
  }
  
  if (error.message.includes('File type')) {
    return res.status(400).json({
      error: error.message,
      code: 'INVALID_FILE_TYPE'
    });
  }
  
  next(error);
};

module.exports = {
  upload,
  handleMulterError,
};
