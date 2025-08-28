const express = require('express');
const userController = require('../controllers/userController');
const cognitoAuth = require('../middleware/cognitoAuth');
const { validateUpdateUser } = require('../middleware/validation');

const router = express.Router();

// Get user profile
router.get('/profile', 
  cognitoAuth, 
  userController.getProfile
);

// Update user profile
router.put('/profile', 
  cognitoAuth, 
  validateUpdateUser,
  userController.updateProfile
);

// Get dashboard data
router.get('/dashboard', 
  cognitoAuth, 
  userController.getDashboard
);

// Delete user account (placeholder)
router.delete('/account', 
  cognitoAuth, 
  userController.deleteAccount
);

module.exports = router;
