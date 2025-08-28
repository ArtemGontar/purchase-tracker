/**
 * Format currency amount
 */
const formatCurrency = (amount, currency = 'USD') => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
  }).format(amount);
};

/**
 * Generate random string
 */
const generateRandomString = (length = 10) => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

/**
 * Sanitize filename for S3
 */
const sanitizeFilename = (filename) => {
  return filename.replace(/[^a-zA-Z0-9.-]/g, '_');
};

/**
 * Check if date is valid
 */
const isValidDate = (date) => {
  return date instanceof Date && !isNaN(date);
};

/**
 * Parse date string safely
 */
const parseDate = (dateString) => {
  const date = new Date(dateString);
  return isValidDate(date) ? date : null;
};

/**
 * Calculate percentage change
 */
const calculatePercentageChange = (current, previous) => {
  if (previous === 0) return current > 0 ? 100 : 0;
  return ((current - previous) / previous) * 100;
};

/**
 * Truncate text to specified length
 */
const truncateText = (text, maxLength = 100) => {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

/**
 * Extract file extension from filename
 */
const getFileExtension = (filename) => {
  return filename.split('.').pop().toLowerCase();
};

/**
 * Check if file type is allowed
 */
const isAllowedFileType = (mimetype, allowedTypes = []) => {
  return allowedTypes.includes(mimetype);
};

/**
 * Convert bytes to human readable format
 */
const formatBytes = (bytes, decimals = 2) => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};

/**
 * Sleep for specified milliseconds
 */
const sleep = (ms) => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

module.exports = {
  formatCurrency,
  generateRandomString,
  sanitizeFilename,
  isValidDate,
  parseDate,
  calculatePercentageChange,
  truncateText,
  getFileExtension,
  isAllowedFileType,
  formatBytes,
  sleep,
};
