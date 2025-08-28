const express = require('express');
const receiptController = require('../controllers/receiptController');
const cognitoAuth = require('../middleware/cognitoAuth');
const { upload, handleMulterError } = require('../middleware/upload');

const router = express.Router();

// Upload receipt
router.post('/upload', 
  cognitoAuth, 
  upload.single('receipt'), 
  handleMulterError,
  receiptController.uploadReceipt
);

// Get all user receipts with pagination
router.get('/', 
  cognitoAuth, 
  receiptController.getReceipts
);

// Get specific receipt by ID
router.get('/:id', 
  cognitoAuth, 
  receiptController.getReceiptById
);

// Delete receipt
router.delete('/:id', 
  cognitoAuth, 
  receiptController.deleteReceipt
);

// Reprocess receipt with Textract
router.post('/:id/reprocess', 
  cognitoAuth, 
  receiptController.reprocessReceipt
);

module.exports = router;
