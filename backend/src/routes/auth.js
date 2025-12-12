const express = require('express');
const { validationResult } = require('express-validator');
const AuthController = require('../controllers/authController');
const { 
  protect, 
  validateRefreshToken, 
  sensitiveOperationLimit 
} = require('../middleware/auth');
const {
  registerValidation,
  loginValidation,
  changePasswordValidation,
  updateProfileValidation,
  fcmTokenValidation,
  deleteAccountValidation
} = require('../middleware/validation');
const { validationError } = require('../middleware/errorHandler');

const router = express.Router();

// Middleware to check validation results
const checkValidation = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(validationError(errors.array()));
  }
  next();
};

// Public routes (no authentication required)

// User registration
router.post('/register',
  ...registerValidation,
  checkValidation,
  AuthController.register
);

// User login
router.post('/login', 
  ...loginValidation,
  AuthController.login
);

// Refresh access token
router.post('/refresh-token', 
  validateRefreshToken,
  AuthController.refreshToken
);

// Protected routes (authentication required)
router.use(protect); // All routes after this middleware require authentication

// Get current user profile
router.get('/profile', AuthController.getProfile);

// Update user profile
router.put('/profile', 
  ...updateProfileValidation,
  AuthController.updateProfile
);

// Change password
router.patch('/change-password', 
  ...changePasswordValidation,
  sensitiveOperationLimit(3, 60 * 60 * 1000), // 3 attempts per hour
  AuthController.changePassword
);

// Update FCM token for push notifications
router.patch('/fcm-token', 
  ...fcmTokenValidation,
  AuthController.updateFCMToken
);

// Logout user
router.post('/logout', AuthController.logout);

// Delete user account
router.delete('/account', 
  ...deleteAccountValidation,
  sensitiveOperationLimit(2, 60 * 60 * 1000), // 2 attempts per hour
  AuthController.deleteAccount
);

module.exports = router;