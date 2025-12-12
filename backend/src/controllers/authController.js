const { validationResult } = require('express-validator');
const User = require('../models/User');
const JWTUtils = require('../utils/jwt');
const { 
  createError, 
  catchAsync, 
  sendResponse, 
  validationError 
} = require('../middleware/errorHandler');

class AuthController {
  // Register new user
  static register = catchAsync(async (req, res, next) => {
    const { email, password, name, phone } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return next(createError('User with this email already exists', 400, 'USER_EXISTS'));
    }

    // Create new user
    const user = await User.create({
      email,
      password,
      profile: {
        name,
        phone: phone || undefined
      }
    });

    // Generate tokens
    const tokenData = JWTUtils.generateTokenPair({
      id: user._id,
      email: user.email
    });

    // Update login stats
    user.stats.loginCount += 1;
    await user.save({ validateBeforeSave: false });

    // Remove password from output
    user.password = undefined;

    sendResponse(res, 201, {
      user: {
        id: user._id,
        email: user.email,
        profile: user.profile,
        settings: user.settings,
        isVerified: user.isVerified
      },
      ...tokenData
    }, 'Account created successfully');
  });

  // Login user
  static login = catchAsync(async (req, res, next) => {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return next(validationError(errors.array()));
    }

    const { email, password, deviceInfo } = req.body;

    // Check if user exists and get password
    const user = await User.findOne({ email }).select('+password');
    
    if (!user || !(await user.correctPassword(password))) {
      return next(createError('Invalid email or password', 401, 'INVALID_CREDENTIALS'));
    }

    // Check if user is active
    if (!user.isActive) {
      return next(createError('Account is deactivated. Please contact support.', 401, 'ACCOUNT_DEACTIVATED'));
    }

    // Update device info if provided
    if (deviceInfo) {
      user.deviceInfo = {
        ...user.deviceInfo,
        ...deviceInfo,
        lastLoginDevice: deviceInfo.deviceType || user.deviceInfo?.lastLoginDevice
      };
    }

    // Update login stats
    user.stats.loginCount += 1;
    await user.save({ validateBeforeSave: false });

    // Generate tokens
    const tokenData = JWTUtils.generateTokenPair({
      id: user._id,
      email: user.email
    });

    // Remove password from output
    user.password = undefined;

    sendResponse(res, 200, {
      user: {
        id: user._id,
        email: user.email,
        profile: user.profile,
        settings: user.settings,
        isVerified: user.isVerified,
        stats: user.stats
      },
      ...tokenData
    }, 'Login successful');
  });

  // Refresh access token
  static refreshToken = catchAsync(async (req, res, next) => {
    const { user } = req; // Set by validateRefreshToken middleware

    // Generate new access token
    const tokenData = JWTUtils.generateTokenPair({
      id: user._id,
      email: user.email
    });

    sendResponse(res, 200, {
      ...tokenData
    }, 'Token refreshed successfully');
  });

  // Logout user
  static logout = catchAsync(async (req, res, next) => {
    sendResponse(res, 200, {}, 'Logged out successfully');

    // In a real-world scenario, you might want to blacklist the token
    // For now, we'll just send a success response
    sendResponse(res, 200, null, 'Logout successful');
  });

  // Get current user profile
  static getProfile = catchAsync(async (req, res, next) => {
    const { user } = req;

    // Get user from database
    const userData = await User.findById(user._id);

    if (!userData) {
      return next(createError('User not found', 404, 'USER_NOT_FOUND'));
    }

    sendResponse(res, 200, {
      user: {
        id: userData._id,
        email: userData.email,
        profile: userData.profile,
        settings: userData.settings,
        isVerified: userData.isVerified,
        stats: userData.stats,
        subscription: userData.subscription,
        memberSince: userData.createdAt
      }
    });
  });

  // Update user profile
  static updateProfile = catchAsync(async (req, res, next) => {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return next(validationError(errors.array()));
    }

    const { user } = req;
    const updateData = req.body;

    // Fields that can be updated
    const allowedFields = [
      'profile.name',
      'profile.phone',
      'profile.location',
      'profile.farmDetails',
      'settings'
    ];

    // Build update object
    const updateObj = {};
    Object.keys(updateData).forEach(key => {
      if (allowedFields.some(field => key.startsWith(field.split('.')[0]))) {
        updateObj[key] = updateData[key];
      }
    });

    if (Object.keys(updateObj).length === 0) {
      return next(createError('No valid fields to update', 400, 'NO_UPDATE_FIELDS'));
    }

    // Update user
    const updatedUser = await User.findByIdAndUpdate(
      user._id,
      updateObj,
      { new: true, runValidators: true }
    );

    sendResponse(res, 200, {
      user: {
        id: updatedUser._id,
        email: updatedUser.email,
        profile: updatedUser.profile,
        settings: updatedUser.settings,
        isVerified: updatedUser.isVerified
      }
    }, 'Profile updated successfully');
  });

  // Change password
  static changePassword = catchAsync(async (req, res, next) => {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return next(validationError(errors.array()));
    }

    const { currentPassword, newPassword } = req.body;
    const { user } = req;

    // Get user with password
    const userWithPassword = await User.findById(user._id).select('+password');

    // Check current password
    if (!(await userWithPassword.correctPassword(currentPassword))) {
      return next(createError('Current password is incorrect', 400, 'INCORRECT_PASSWORD'));
    }

    // Update password
    userWithPassword.password = newPassword;
    userWithPassword.passwordChangedAt = new Date();
    await userWithPassword.save();

    sendResponse(res, 200, null, 'Password changed successfully');
  });

  // Delete account
  static deleteAccount = catchAsync(async (req, res, next) => {
    const { user } = req;
    const { password } = req.body;

    // Verify password
    const userWithPassword = await User.findById(user._id).select('+password');
    if (!(await userWithPassword.correctPassword(password))) {
      return next(createError('Password is incorrect', 400, 'INCORRECT_PASSWORD'));
    }

    // Deactivate account instead of deleting
    await User.findByIdAndUpdate(user._id, { 
      isActive: false,
      email: `deleted_${Date.now()}_${user.email}` // Prevent email conflicts
    });

    sendResponse(res, 200, null, 'Account deleted successfully');
  });

  // Update FCM token for push notifications
  static updateFCMToken = catchAsync(async (req, res, next) => {
    const { fcmToken, deviceType } = req.body;
    const { user } = req;

    if (!fcmToken) {
      return next(createError('FCM token is required', 400, 'FCM_TOKEN_REQUIRED'));
    }

    await User.findByIdAndUpdate(user._id, {
      'deviceInfo.fcmToken': fcmToken,
      'deviceInfo.deviceType': deviceType || user.deviceInfo?.deviceType
    });

    sendResponse(res, 200, null, 'FCM token updated successfully');
  });
}

module.exports = AuthController;