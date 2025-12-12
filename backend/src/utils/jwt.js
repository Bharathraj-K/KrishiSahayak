const jwt = require('jsonwebtoken');

class JWTUtils {
  // Generate JWT token
  static generateToken(payload, expiresIn = process.env.JWT_EXPIRES_IN) {
    return jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn,
      issuer: 'krishisahayak-api',
      audience: 'krishisahayak-app'
    });
  }

  // Generate refresh token
  static generateRefreshToken(payload) {
    return jwt.sign(
      payload, 
      process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET, 
      {
        expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d',
        issuer: 'krishisahayak-api',
        audience: 'krishisahayak-app'
      }
    );
  }

  // Verify JWT token
  static verifyToken(token) {
    try {
      return jwt.verify(token, process.env.JWT_SECRET, {
        issuer: 'krishisahayak-api',
        audience: 'krishisahayak-app'
      });
    } catch (error) {
      throw new Error(`Token verification failed: ${error.message}`);
    }
  }

  // Verify refresh token
  static verifyRefreshToken(token) {
    try {
      return jwt.verify(token, process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET, {
        issuer: 'krishisahayak-api',
        audience: 'krishisahayak-app'
      });
    } catch (error) {
      throw new Error(`Refresh token verification failed: ${error.message}`);
    }
  }

  // Decode token without verification (for expired tokens)
  static decodeToken(token) {
    return jwt.decode(token);
  }

  // Generate token pair (access + refresh)
  static generateTokenPair(payload) {
    const accessToken = this.generateToken(payload);
    const refreshToken = this.generateRefreshToken({ userId: payload.id || payload.userId });
    
    return {
      accessToken,
      refreshToken,
      expiresIn: process.env.JWT_EXPIRES_IN || '7d'
    };
  }

  // Extract token from authorization header
  static extractTokenFromHeader(authHeader) {
    if (!authHeader) {
      throw new Error('No authorization header provided');
    }

    if (!authHeader.startsWith('Bearer ')) {
      throw new Error('Invalid authorization header format. Expected: Bearer <token>');
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix
    
    if (!token) {
      throw new Error('No token provided in authorization header');
    }

    return token;
  }

  // Check if token is expired
  static isTokenExpired(token) {
    try {
      const decoded = this.decodeToken(token);
      if (!decoded || !decoded.exp) {
        return true;
      }
      
      const currentTimestamp = Math.floor(Date.now() / 1000);
      return decoded.exp < currentTimestamp;
    } catch (error) {
      return true;
    }
  }

  // Get token expiration time
  static getTokenExpiration(token) {
    try {
      const decoded = this.decodeToken(token);
      return decoded.exp ? new Date(decoded.exp * 1000) : null;
    } catch (error) {
      return null;
    }
  }

  // Refresh access token using refresh token
  static async refreshAccessToken(refreshToken, getUserById) {
    try {
      // Verify refresh token
      const decoded = this.verifyRefreshToken(refreshToken);
      
      // Get user from database
      const user = await getUserById(decoded.userId);
      if (!user) {
        throw new Error('User not found');
      }

      if (!user.isActive) {
        throw new Error('User account is deactivated');
      }

      // Generate new access token
      const payload = {
        id: user._id,
        email: user.email,
        role: user.role || 'user'
      };

      return this.generateToken(payload);
    } catch (error) {
      throw new Error(`Token refresh failed: ${error.message}`);
    }
  }
}

module.exports = JWTUtils;