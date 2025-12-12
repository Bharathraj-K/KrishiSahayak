const User = require('../models/User');
const JWTUtils = require('../utils/jwt');
const { createError } = require('./errorHandler');

// Protect routes - require valid JWT token
const protect = async (req, res, next) => {
  try {
    // 1. Get token from header
    let token;
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith('Bearer')) {
      token = JWTUtils.extractTokenFromHeader(authHeader);
    }

    if (!token) {
      return next(createError('Access denied. No token provided.', 401, 'UNAUTHORIZED'));
    }

    // 2. Verify token
    let decoded;
    try {
      decoded = JWTUtils.verifyToken(token);
    } catch (error) {
      if (error.message.includes('expired')) {
        return next(createError('Token expired. Please login again.', 401, 'TOKEN_EXPIRED'));
      }
      return next(createError('Invalid token. Please login again.', 401, 'INVALID_TOKEN'));
    }

    // 3. Check if user still exists
    const user = await User.findById(decoded.id).select('+password');
    if (!user) {
      return next(createError('User no longer exists.', 401, 'USER_NOT_FOUND'));
    }

    // 4. Check if user is active
    if (!user.isActive) {
      return next(createError('User account is deactivated.', 401, 'ACCOUNT_DEACTIVATED'));
    }

    // 5. Check if user changed password after token was issued
    if (user.changedPasswordAfter(decoded.iat)) {
      return next(createError('Password recently changed. Please login again.', 401, 'PASSWORD_CHANGED'));
    }

    // 6. Grant access to protected route
    req.user = user;
    req.token = token;
    next();

  } catch (error) {
    next(createError('Authentication failed.', 500, 'AUTH_ERROR', error.message));
  }
};

// Optional authentication - doesn't fail if no token
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (authHeader && authHeader.startsWith('Bearer')) {
      const token = JWTUtils.extractTokenFromHeader(authHeader);
      
      try {
        const decoded = JWTUtils.verifyToken(token);
        const user = await User.findById(decoded.id);
        
        if (user && user.isActive) {
          req.user = user;
          req.token = token;
        }
      } catch (error) {
        // Ignore token errors in optional auth
        console.log('Optional auth token error:', error.message);
      }
    }
    
    next();
  } catch (error) {
    next();
  }
};

// Restrict to specific roles
const restrictTo = (...roles) => {
  return (req, res, next) => {
    const userRole = req.user?.role || 'user';
    
    if (!roles.includes(userRole)) {
      return next(createError('Access denied. Insufficient permissions.', 403, 'INSUFFICIENT_PERMISSIONS'));
    }
    
    next();
  };
};

// Check if user is verified
const requireVerification = (req, res, next) => {
  if (!req.user?.isVerified) {
    return next(createError('Email verification required.', 403, 'EMAIL_NOT_VERIFIED'));
  }
  
  next();
};

// Validate refresh token
const validateRefreshToken = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    
    if (!refreshToken) {
      return next(createError('Refresh token is required.', 400, 'REFRESH_TOKEN_REQUIRED'));
    }

    try {
      const decoded = JWTUtils.verifyRefreshToken(refreshToken);
      const user = await User.findById(decoded.userId);
      
      if (!user || !user.isActive) {
        return next(createError('Invalid refresh token.', 401, 'INVALID_REFRESH_TOKEN'));
      }

      req.user = user;
      req.refreshToken = refreshToken;
      next();

    } catch (error) {
      return next(createError('Invalid or expired refresh token.', 401, 'INVALID_REFRESH_TOKEN'));
    }

  } catch (error) {
    next(createError('Refresh token validation failed.', 500, 'REFRESH_VALIDATION_ERROR', error.message));
  }
};

// Rate limiting for sensitive operations
const sensitiveOperationLimit = (maxAttempts = 5, windowMs = 15 * 60 * 1000) => {
  const attempts = new Map();
  
  return (req, res, next) => {
    const key = req.ip + (req.user?.id || '');
    const now = Date.now();
    
    // Clean old attempts
    for (const [k, v] of attempts.entries()) {
      if (now - v.timestamp > windowMs) {
        attempts.delete(k);
      }
    }
    
    const userAttempts = attempts.get(key);
    
    if (userAttempts && userAttempts.count >= maxAttempts) {
      return next(createError(
        `Too many attempts. Please try again in ${Math.ceil(windowMs / 60000)} minutes.`,
        429,
        'RATE_LIMIT_EXCEEDED'
      ));
    }
    
    // Increment attempts
    attempts.set(key, {
      count: (userAttempts?.count || 0) + 1,
      timestamp: now
    });
    
    next();
  };
};

module.exports = {
  protect,
  optionalAuth,
  restrictTo,
  requireVerification,
  validateRefreshToken,
  sensitiveOperationLimit
};