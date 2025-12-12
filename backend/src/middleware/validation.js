const { body } = require('express-validator');

// Validation rules for user registration
const registerValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  
  body('password')
    .isLength({ min: 6, max: 50 })
    .withMessage('Password must be between 6 and 50 characters'),
  
  body('name')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters')
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage('Name can only contain letters and spaces'),
  
  body('phone')
    .optional()
    .isMobilePhone('en-IN')
    .withMessage('Please provide a valid Indian phone number')
];

// Validation rules for user login
const loginValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  
  body('password')
    .notEmpty()
    .withMessage('Password is required')
];

// Validation rules for password change
const changePasswordValidation = [
  body('currentPassword')
    .notEmpty()
    .withMessage('Current password is required'),
  
  body('newPassword')
    .isLength({ min: 6, max: 50 })
    .withMessage('New password must be between 6 and 50 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('New password must contain at least one uppercase letter, one lowercase letter, and one number'),
  
  body('confirmPassword')
    .custom((value, { req }) => {
      if (value !== req.body.newPassword) {
        throw new Error('Password confirmation does not match new password');
      }
      return true;
    })
];

// Validation rules for profile update
const updateProfileValidation = [
  body('profile.name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters')
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage('Name can only contain letters and spaces'),
  
  body('profile.phone')
    .optional()
    .isMobilePhone('en-IN')
    .withMessage('Please provide a valid Indian phone number'),
  
  body('profile.location.address')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('Address cannot exceed 200 characters'),
  
  body('profile.location.pincode')
    .optional()
    .matches(/^\d{6}$/)
    .withMessage('Please provide a valid 6-digit pincode'),
  
  body('profile.location.coordinates')
    .optional()
    .isArray({ min: 2, max: 2 })
    .withMessage('Coordinates must be an array of [longitude, latitude]'),
  
  body('profile.location.coordinates.*')
    .optional()
    .isFloat({ min: -180, max: 180 })
    .withMessage('Coordinates must be valid longitude and latitude values'),
  
  body('profile.farmDetails.farmSize')
    .optional()
    .isIn(['Small (< 2 acres)', 'Medium (2-10 acres)', 'Large (> 10 acres)', 'Commercial'])
    .withMessage('Invalid farm size option'),
  
  body('profile.farmDetails.farmType')
    .optional()
    .isIn(['Organic', 'Conventional', 'Mixed'])
    .withMessage('Invalid farm type option'),
  
  body('profile.farmDetails.cropsGrown')
    .optional()
    .isArray()
    .withMessage('Crops grown must be an array'),
  
  body('profile.farmDetails.cropsGrown.*')
    .optional()
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Each crop name must be between 1 and 50 characters'),
  
  body('profile.farmDetails.soilType')
    .optional()
    .isIn(['Clay', 'Sandy', 'Loamy', 'Silt', 'Chalky', 'Peaty'])
    .withMessage('Invalid soil type option'),
  
  body('profile.farmDetails.irrigationType')
    .optional()
    .isIn(['Rain-fed', 'Drip', 'Sprinkler', 'Flood', 'Mixed'])
    .withMessage('Invalid irrigation type option'),
  
  body('settings.notifications.weather')
    .optional()
    .isBoolean()
    .withMessage('Weather notification setting must be true or false'),
  
  body('settings.notifications.priceAlerts')
    .optional()
    .isBoolean()
    .withMessage('Price alerts setting must be true or false'),
  
  body('settings.notifications.diseases')
    .optional()
    .isBoolean()
    .withMessage('Disease notification setting must be true or false'),
  
  body('settings.notifications.general')
    .optional()
    .isBoolean()
    .withMessage('General notification setting must be true or false'),
  
  body('settings.language')
    .optional()
    .isIn(['en', 'hi'])
    .withMessage('Language must be either English (en) or Hindi (hi)'),
  
  body('settings.theme')
    .optional()
    .isIn(['light', 'dark', 'auto'])
    .withMessage('Theme must be light, dark, or auto'),
  
  body('settings.units.temperature')
    .optional()
    .isIn(['celsius', 'fahrenheit'])
    .withMessage('Temperature unit must be celsius or fahrenheit'),
  
  body('settings.units.area')
    .optional()
    .isIn(['acre', 'hectare'])
    .withMessage('Area unit must be acre or hectare')
];

// Validation for FCM token update
const fcmTokenValidation = [
  body('fcmToken')
    .notEmpty()
    .withMessage('FCM token is required')
    .isLength({ min: 10 })
    .withMessage('Invalid FCM token format'),
  
  body('deviceType')
    .optional()
    .isIn(['android', 'ios', 'web'])
    .withMessage('Device type must be android, ios, or web')
];

// Validation for account deletion
const deleteAccountValidation = [
  body('password')
    .notEmpty()
    .withMessage('Password is required to delete account')
];

module.exports = {
  registerValidation,
  loginValidation,
  changePasswordValidation,
  updateProfileValidation,
  fcmTokenValidation,
  deleteAccountValidation
};