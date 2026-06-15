const { validationResult } = require('express-validator');
const { OAuth2Client } = require('google-auth-library');
const User = require('../models/User');
const JWTUtils = require('../utils/jwt');
const NotificationService = require('../services/notificationService');
const { 
  createError, 
  catchAsync, 
  sendResponse, 
  validationError 
} = require('../middleware/errorHandler');

class AuthController {
  static googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

  // Register new user
  static register = catchAsync(async (req, res, next) => {
    const { email, password, name, phone, role } = req.body;
    const selectedRole = ['farmer', 'customer'].includes(role) ? role : 'farmer';

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return next(createError('User with this email already exists', 400, 'USER_EXISTS'));
    }

    // Create new user
    const user = await User.create({
      email,
      role: selectedRole,
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

    // Create welcome notification for new users
    NotificationService.createWelcomeNotification(user._id, user.profile.name);

    // Remove password from output
    user.password = undefined;

    sendResponse(res, 201, {
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
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

    const { email, password, deviceInfo, expectedRole } = req.body;

    // Check if user exists and get password
    const user = await User.findOne({ email }).select('+password');
    
    if (!user || !(await user.correctPassword(password))) {
      return next(createError('Invalid email or password', 401, 'INVALID_CREDENTIALS'));
    }

    const userRole = user.role || 'farmer';
    if (!user.role) {
      user.role = 'farmer';
    }

    if (expectedRole && ['farmer', 'customer'].includes(expectedRole) && userRole !== expectedRole) {
      return next(createError(`This account is registered as ${userRole}. Please use the ${userRole} login page.`, 403, 'ROLE_MISMATCH'));
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
        role: userRole,
        profile: user.profile,
        settings: user.settings,
        isVerified: user.isVerified,
        stats: user.stats
      },
      ...tokenData
    }, 'Login successful');
  });

  // Google OAuth (ID token based)
  static googleAuth = catchAsync(async (req, res, next) => {
    const { idToken, expectedRole } = req.body;

    if (!idToken) {
      return next(createError('Google ID token is required', 400, 'GOOGLE_TOKEN_REQUIRED'));
    }

    if (!process.env.GOOGLE_CLIENT_ID) {
      return next(createError('Google OAuth is not configured on server', 500, 'GOOGLE_OAUTH_NOT_CONFIGURED'));
    }

    let payload;
    try {
      const ticket = await AuthController.googleClient.verifyIdToken({
        idToken,
        audience: process.env.GOOGLE_CLIENT_ID
      });
      payload = ticket.getPayload();
    } catch (error) {
      return next(createError('Invalid Google token', 401, 'INVALID_GOOGLE_TOKEN'));
    }

    const email = String(payload?.email || '').toLowerCase().trim();
    const name = String(payload?.name || '').trim();
    const emailVerified = Boolean(payload?.email_verified);

    if (!email || !name) {
      return next(createError('Google account data is incomplete', 400, 'INVALID_GOOGLE_PROFILE'));
    }

    if (!emailVerified) {
      return next(createError('Google email is not verified', 403, 'GOOGLE_EMAIL_NOT_VERIFIED'));
    }

    let user = await User.findOne({ email });
    const selectedRole = ['farmer', 'customer'].includes(expectedRole) ? expectedRole : 'farmer';

    if (!user) {
      const oauthPassword = `oauth_google_${Math.random().toString(36).slice(2)}_${Date.now()}`;
      user = await User.create({
        email,
        role: selectedRole,
        password: oauthPassword,
        isVerified: true,
        profile: {
          name
        }
      });
    } else {
      const userRole = user.role || 'farmer';
      if (expectedRole && ['farmer', 'customer'].includes(expectedRole) && userRole !== expectedRole) {
        return next(createError(`This account is registered as ${userRole}. Please use the ${userRole} login page.`, 403, 'ROLE_MISMATCH'));
      }

      if (!user.role) {
        user.role = 'farmer';
      }
      if (!user.profile?.name && name) {
        user.profile = {
          ...(user.profile || {}),
          name
        };
      }
      if (!user.isVerified) {
        user.isVerified = true;
      }
    }

    if (!user.isActive) {
      return next(createError('Account is deactivated. Please contact support.', 401, 'ACCOUNT_DEACTIVATED'));
    }

    user.stats.loginCount += 1;
    await user.save({ validateBeforeSave: false });

    const tokenData = JWTUtils.generateTokenPair({
      id: user._id,
      email: user.email
    });

    sendResponse(res, 200, {
      user: {
        id: user._id,
        email: user.email,
        role: user.role || 'farmer',
        profile: user.profile,
        settings: user.settings,
        isVerified: user.isVerified,
        stats: user.stats
      },
      ...tokenData
    }, 'Google login successful');
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
        role: userData.role || 'farmer',
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
    const { user } = req;
    const { profile, settings } = req.body;

    // Build update object with only provided fields
    const updateObj = {};
    
    if (profile) {
      updateObj.profile = { ...user.profile, ...profile };
      
      // Handle nested location object
      if (profile.location) {
        updateObj.profile.location = { 
          ...user.profile.location, 
          ...profile.location 
        };
      }
      
      // Handle nested farmDetails object
      if (profile.farmDetails) {
        const effectiveRole = user.role || 'farmer';
        if (effectiveRole === 'farmer') {
          updateObj.profile.farmDetails = {
            ...user.profile.farmDetails,
            ...profile.farmDetails
          };
        }
      }
    }
    
    if (settings) {
      updateObj.settings = { ...user.settings, ...settings };
      
      // Handle nested notifications object
      if (settings.notifications) {
        updateObj.settings.notifications = { 
          ...user.settings.notifications, 
          ...settings.notifications 
        };
      }
    }

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
        role: updatedUser.role || 'farmer',
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