const express = require('express');
const purchaseController = require('../controllers/purchaseController');
const cognitoAuth = require('../middleware/cognitoAuth');
const { validatePurchase, validateUpdatePurchase } = require('../middleware/validation');

const router = express.Router();

// Get all user purchases with pagination and filtering
router.get('/', 
  cognitoAuth, 
  purchaseController.getPurchases
);

// Create new purchase
router.post('/', 
  cognitoAuth, 
  validatePurchase,
  purchaseController.createPurchase
);

// Get purchase statistics
router.get('/stats', 
  cognitoAuth, 
  purchaseController.getPurchaseStats
);

// Get all categories used by user
router.get('/categories', 
  cognitoAuth, 
  purchaseController.getPurchaseCategories
);

// Get specific purchase by ID
router.get('/:id', 
  cognitoAuth, 
  purchaseController.getPurchaseById
);

// Update purchase
router.put('/:id', 
  cognitoAuth, 
  validateUpdatePurchase,
  purchaseController.updatePurchase
);

// Delete purchase
router.delete('/:id', 
  cognitoAuth, 
  purchaseController.deletePurchase
);

module.exports = router;
