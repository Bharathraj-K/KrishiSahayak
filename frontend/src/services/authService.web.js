import apiClient, { tokenService } from './api.web';

const extractErrorMessage = (error, fallback) => {
  return (
    error?.response?.data?.error?.message ||
    error?.response?.data?.message ||
    error?.message ||
    fallback
  );
};

const AuthService = {
  // Register new user
  async register(userData) {
    try {
      const response = await apiClient.post('/auth/register', userData);
      
      // Save tokens (they're in response.data.data)
      const { data } = response.data;
      if (data.accessToken && data.refreshToken) {
        tokenService.saveTokens(
          data.accessToken,
          data.refreshToken
        );
      }

      return {
        success: true,
        user: data.user,
        tokens: {
          accessToken: data.accessToken,
          refreshToken: data.refreshToken,
          expiresIn: data.expiresIn
        },
      };
    } catch (error) {
      return {
        success: false,
        message: extractErrorMessage(error, 'Registration failed'),
      };
    }
  },

  // Login user
  async login(credentials) {
    try {
      const response = await apiClient.post('/auth/login', credentials);
      
      // Save tokens (they're in response.data.data)
      const { data } = response.data;
      if (data.accessToken && data.refreshToken) {
        tokenService.saveTokens(
          data.accessToken,
          data.refreshToken
        );
      }

      return {
        success: true,
        user: data.user,
        tokens: {
          accessToken: data.accessToken,
          refreshToken: data.refreshToken,
          expiresIn: data.expiresIn
        },
      };
    } catch (error) {
      return {
        success: false,
        message: extractErrorMessage(error, 'Login failed'),
      };
    }
  },

  // Google OAuth login/register
  async googleAuth(payload) {
    try {
      const response = await apiClient.post('/auth/google', payload);
      const { data } = response.data;
      if (data.accessToken && data.refreshToken) {
        tokenService.saveTokens(data.accessToken, data.refreshToken);
      }

      return {
        success: true,
        user: data.user,
        tokens: {
          accessToken: data.accessToken,
          refreshToken: data.refreshToken,
          expiresIn: data.expiresIn
        }
      };
    } catch (error) {
      return {
        success: false,
        message: extractErrorMessage(error, 'Google login failed')
      };
    }
  },

  // Get user profile
  async getProfile() {
    try {
      const response = await apiClient.get('/auth/me');
      return {
        success: true,
        user: response.data.user,
      };
    } catch (error) {
      return {
        success: false,
        message: extractErrorMessage(error, 'Failed to fetch profile'),
      };
    }
  },

  // Update user profile
  async updateProfile(updates) {
    try {
      const response = await apiClient.put('/auth/me', updates);
      return {
        success: true,
        user: response.data.user,
      };
    } catch (error) {
      return {
        success: false,
        message: extractErrorMessage(error, 'Failed to update profile'),
      };
    }
  },

  // Change password
  async changePassword(passwords) {
    try {
      const response = await apiClient.put('/auth/password', passwords);
      return {
        success: true,
        message: response.data.message,
      };
    } catch (error) {
      return {
        success: false,
        message: extractErrorMessage(error, 'Failed to change password'),
      };
    }
  },

  // Delete account
  async deleteAccount() {
    try {
      const response = await apiClient.delete('/auth/me');
      tokenService.clearTokens();
      return {
        success: true,
        message: response.data.message,
      };
    } catch (error) {
      return {
        success: false,
        message: extractErrorMessage(error, 'Failed to delete account'),
      };
    }
  },

  // Logout
  async logout() {
    tokenService.clearTokens();
    return { success: true };
  },

  // Check if logged in
  isLoggedIn() {
    return tokenService.isLoggedIn();
  },
};

export default AuthService;
