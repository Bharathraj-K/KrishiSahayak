import apiClient, { tokenService } from './api';

class AuthService {
  // Register new user
  async register(userData) {
    try {
      const response = await apiClient.post('/api/auth/register', userData);
      
      if (response.data.success) {
        const { user, accessToken, refreshToken } = response.data.data;
        
        // Save tokens
        await tokenService.saveTokens(accessToken, refreshToken);
        
        return {
          success: true,
          user,
          message: response.data.message,
        };
      }
    } catch (error) {
      console.error('Registration error:', error);
      return {
        success: false,
        message: error.response?.data?.error?.message || 'Registration failed',
        details: error.response?.data?.error?.details || null,
      };
    }
  }

  // Login user
  async login(email, password, deviceInfo = {}) {
    try {
      const response = await apiClient.post('/api/auth/login', {
        email,
        password,
        deviceInfo: {
          deviceType: 'mobile',
          ...deviceInfo,
        },
      });
      
      if (response.data.success) {
        const { user, accessToken, refreshToken } = response.data.data;
        
        // Save tokens
        await tokenService.saveTokens(accessToken, refreshToken);
        
        return {
          success: true,
          user,
          message: response.data.message,
        };
      }
    } catch (error) {
      console.error('Login error:', error);
      return {
        success: false,
        message: error.response?.data?.error?.message || 'Login failed',
      };
    }
  }

  // Get user profile
  async getProfile() {
    try {
      const response = await apiClient.get('/api/auth/profile');
      
      if (response.data.success) {
        return {
          success: true,
          user: response.data.data.user,
        };
      }
    } catch (error) {
      console.error('Get profile error:', error);
      return {
        success: false,
        message: error.response?.data?.error?.message || 'Failed to get profile',
      };
    }
  }

  // Update user profile
  async updateProfile(profileData) {
    try {
      const response = await apiClient.put('/api/auth/profile', profileData);
      
      if (response.data.success) {
        return {
          success: true,
          user: response.data.data.user,
          message: response.data.message,
        };
      }
    } catch (error) {
      console.error('Update profile error:', error);
      return {
        success: false,
        message: error.response?.data?.error?.message || 'Failed to update profile',
        details: error.response?.data?.error?.details || null,
      };
    }
  }

  // Change password
  async changePassword(currentPassword, newPassword) {
    try {
      const response = await apiClient.patch('/api/auth/change-password', {
        currentPassword,
        newPassword,
        confirmPassword: newPassword,
      });
      
      if (response.data.success) {
        return {
          success: true,
          message: response.data.message,
        };
      }
    } catch (error) {
      console.error('Change password error:', error);
      return {
        success: false,
        message: error.response?.data?.error?.message || 'Failed to change password',
        details: error.response?.data?.error?.details || null,
      };
    }
  }

  // Logout user
  async logout() {
    try {
      await apiClient.post('/api/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Always clear tokens locally
      await tokenService.clearTokens();
    }
    
    return { success: true };
  }

  // Check if user is logged in
  async isLoggedIn() {
    return await tokenService.isLoggedIn();
  }

  // Delete account
  async deleteAccount(password) {
    try {
      const response = await apiClient.delete('/api/auth/account', {
        data: { password },
      });
      
      if (response.data.success) {
        await tokenService.clearTokens();
        return {
          success: true,
          message: response.data.message,
        };
      }
    } catch (error) {
      console.error('Delete account error:', error);
      return {
        success: false,
        message: error.response?.data?.error?.message || 'Failed to delete account',
      };
    }
  }

  // Update FCM token for push notifications
  async updateFCMToken(fcmToken, deviceType = 'mobile') {
    try {
      const response = await apiClient.patch('/api/auth/fcm-token', {
        fcmToken,
        deviceType,
      });
      
      return {
        success: response.data.success,
        message: response.data.message,
      };
    } catch (error) {
      console.error('Update FCM token error:', error);
      return {
        success: false,
        message: error.response?.data?.error?.message || 'Failed to update FCM token',
      };
    }
  }
}

export default new AuthService();