import React, { useState } from 'react';
import {
  Container,
  Box,
  TextField,
  Button,
  Typography,
  Paper,
  InputAdornment,
  IconButton,
  Alert,
  CircularProgress,
  Link as MuiLink,
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  Agriculture,
  Email,
  Lock,
} from '@mui/icons-material';
import { Link, useNavigate } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import AuthService from '../services/authService.web';

const LoginScreen = ({ onLogin, userRole = 'farmer' }) => {
  const navigate = useNavigate();
  const isCustomer = userRole === 'customer';
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const googleClientId = process.env.REACT_APP_GOOGLE_CLIENT_ID;

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!formData.email || !formData.password) {
      setError('Please fill in all fields');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Please enter a valid email address');
      return;
    }

    try {
      setIsLoading(true);
      const result = await AuthService.login({
        email: formData.email.toLowerCase().trim(),
        password: formData.password,
        expectedRole: userRole
      });

      if (result.success) {
        onLogin({
          ...(result.user || {}),
          role: userRole
        });
        navigate(isCustomer ? '/marketplace' : '/dashboard');
      } else {
        setError(result.message || 'Login failed. Please check your credentials.');
      }
    } catch (error) {
      setError('Network error. Please check your connection.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    const idToken = credentialResponse?.credential;
    if (!idToken) {
      setError('Google login failed. Missing credential token.');
      return;
    }

    try {
      setIsLoading(true);
      setError('');
      const result = await AuthService.googleAuth({
        idToken,
        expectedRole: userRole
      });

      if (result.success) {
        onLogin({
          ...(result.user || {}),
          role: result.user?.role || userRole
        });
        navigate(isCustomer ? '/marketplace' : '/dashboard');
      } else {
        setError(result.message || 'Google login failed');
      }
    } catch (err) {
      setError('Google login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleError = () => {
    setError('Google sign-in was unsuccessful. Please try again.');
  };

  return (
    <Container component="main" maxWidth="xs">
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <Paper
          elevation={3}
          sx={{
            padding: 4,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            width: '100%',
          }}
        >
          {/* Logo and Title */}
          <Agriculture
            sx={{
              fontSize: 60,
              color: 'primary.main',
              marginBottom: 2,
            }}
          />
          <Typography component="h1" variant="h4" gutterBottom color="primary.main">
            कृषि सहायक
          </Typography>
          <Typography variant="subtitle1" color="text.secondary" gutterBottom>
            {isCustomer ? 'KrishiSahayak - Customer Access' : 'KrishiSahayak - Farmer Access'}
          </Typography>

          <Box sx={{ width: '100%', marginTop: 3 }}>
            <Typography variant="h5" gutterBottom>
              {isCustomer ? 'Welcome Customer!' : 'Welcome Farmer!'}
            </Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Login to continue
            </Typography>

            {error && (
              <Alert severity="error" sx={{ marginTop: 2, marginBottom: 2 }}>
                {error}
              </Alert>
            )}

            <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3 }}>
              <TextField
                fullWidth
                label="Email Address"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                margin="normal"
                required
                autoComplete="email"
                autoFocus
                disabled={isLoading}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Email />
                    </InputAdornment>
                  ),
                }}
              />

              <TextField
                fullWidth
                label="Password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={handleChange}
                margin="normal"
                required
                autoComplete="current-password"
                disabled={isLoading}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Lock />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />

              <Button
                type="submit"
                fullWidth
                variant="contained"
                size="large"
                sx={{ mt: 3, mb: 2 }}
                disabled={isLoading}
              >
                {isLoading ? <CircularProgress size={24} color="inherit" /> : 'Login'}
              </Button>

              {googleClientId && (
                <Box sx={{ mt: 1, mb: 2, display: 'flex', justifyContent: 'center' }}>
                  <GoogleLogin onSuccess={handleGoogleSuccess} onError={handleGoogleError} />
                </Box>
              )}

              <Box sx={{ textAlign: 'center', mt: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  Don't have an account?{' '}
                  <MuiLink
                    component={Link}
                    to={isCustomer ? '/customer-register' : '/farmer-register'}
                    underline="hover"
                    color="primary"
                  >
                    Register Now
                  </MuiLink>
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  {isCustomer ? 'Are you a farmer?' : 'Are you a customer?'}{' '}
                  <MuiLink
                    component={Link}
                    to={isCustomer ? '/farmer-login' : '/customer-login'}
                    underline="hover"
                    color="primary"
                  >
                    {isCustomer ? 'Farmer Login' : 'Customer Login'}
                  </MuiLink>
                </Typography>
              </Box>
            </Box>
          </Box>
        </Paper>

        {/* Footer */}
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ marginTop: 4, marginBottom: 2 }}
        >
          Made with ❤️ for Indian Farmers
        </Typography>
      </Box>
    </Container>
  );
};

export default LoginScreen;
