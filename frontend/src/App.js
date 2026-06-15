import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { CircularProgress, Box } from '@mui/material';

// Import screens
import LoginScreen from './screens/LoginScreen';
import RegisterScreen from './screens/RegisterScreen';
import RoleSelectionScreen from './screens/RoleSelectionScreen';
import Dashboard from './screens/Dashboard';
import WeatherScreen from './screens/WeatherScreen';
import MarketScreen from './screens/MarketScreen';
import DiseaseScreen from './screens/DiseaseScreen';
import CropRecommendationScreen from './screens/CropRecommendationScreen';
import FertilizerRecommendationScreen from './screens/FertilizerRecommendationScreen';
import YieldPredictionScreen from './screens/YieldPredictionScreen';
import MarketplaceScreen from './screens/MarketplaceScreen';
import ChatScreen from './screens/ChatScreen';
import ProfileScreen from './screens/ProfileScreen';
import TestNotifications from './screens/TestNotifications';

// Create theme
const theme = createTheme({
  palette: {
    primary: {
      main: '#4CAF50',
    },
    secondary: {
      main: '#FFA726',
    },
  },
  typography: {
    fontFamily: [
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'Roboto',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif',
    ].join(','),
  },
});

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState('farmer');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = () => {
    const token = localStorage.getItem('accessToken');
    const savedRole = localStorage.getItem('userRole') || 'farmer';
    setIsAuthenticated(!!token);
    setUserRole(savedRole);
    setIsLoading(false);
  };

  const handleLogin = (user = null) => {
    const role = user?.role || localStorage.getItem('userRole') || 'farmer';
    localStorage.setItem('userRole', role);
    setUserRole(role);
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('userRole');
    setUserRole('farmer');
    setIsAuthenticated(false);
  };

  if (isLoading) {
    return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          minHeight="100vh"
        >
          <CircularProgress size={60} />
        </Box>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <Routes>
          <Route
            path="/choose-role"
            element={
              isAuthenticated ? (
                <Navigate to={userRole === 'customer' ? '/marketplace' : '/dashboard'} replace />
              ) : (
                <RoleSelectionScreen />
              )
            }
          />
          <Route
            path="/login"
            element={
              isAuthenticated ? (
                <Navigate to="/dashboard" replace />
              ) : (
                <LoginScreen onLogin={handleLogin} userRole="farmer" />
              )
            }
          />
          <Route
            path="/customer-login"
            element={
              isAuthenticated ? (
                <Navigate to="/marketplace" replace />
              ) : (
                <LoginScreen onLogin={handleLogin} userRole="customer" />
              )
            }
          />
          <Route
            path="/farmer-login"
            element={
              isAuthenticated ? (
                <Navigate to="/dashboard" replace />
              ) : (
                <LoginScreen onLogin={handleLogin} userRole="farmer" />
              )
            }
          />
          <Route
            path="/register"
            element={
              isAuthenticated ? (
                <Navigate to="/dashboard" replace />
              ) : (
                <RegisterScreen onRegister={handleLogin} userRole="farmer" />
              )
            }
          />
          <Route
            path="/customer-register"
            element={
              isAuthenticated ? (
                <Navigate to="/marketplace" replace />
              ) : (
                <RegisterScreen onRegister={handleLogin} userRole="customer" />
              )
            }
          />
          <Route
            path="/farmer-register"
            element={
              isAuthenticated ? (
                <Navigate to="/dashboard" replace />
              ) : (
                <RegisterScreen onRegister={handleLogin} userRole="farmer" />
              )
            }
          />
          <Route
            path="/dashboard/*"
            element={
              isAuthenticated ? (
                <Dashboard onLogout={handleLogout} />
              ) : (
                <Navigate to="/choose-role" replace />
              )
            }
          />
          <Route
            path="/weather"
            element={
              isAuthenticated ? (
                <WeatherScreen />
              ) : (
                <Navigate to="/choose-role" replace />
              )
            }
          />
          <Route
            path="/market"
            element={
              isAuthenticated ? (
                <MarketScreen />
              ) : (
                <Navigate to="/choose-role" replace />
              )
            }
          />
          <Route
            path="/disease"
            element={
              isAuthenticated ? (
                <DiseaseScreen />
              ) : (
                <Navigate to="/choose-role" replace />
              )
            }
          />
          <Route
            path="/crop-recommendation"
            element={
              isAuthenticated ? (
                <CropRecommendationScreen />
              ) : (
                <Navigate to="/choose-role" replace />
              )
            }
          />
          <Route
            path="/fertilizer-recommendation"
            element={
              isAuthenticated ? (
                <FertilizerRecommendationScreen />
              ) : (
                <Navigate to="/choose-role" replace />
              )
            }
          />
          <Route
            path="/yield-prediction"
            element={
              isAuthenticated ? (
                <YieldPredictionScreen />
              ) : (
                <Navigate to="/choose-role" replace />
              )
            }
          />
          <Route
            path="/marketplace"
            element={
              isAuthenticated ? (
                <MarketplaceScreen onLogout={handleLogout} />
              ) : (
                <Navigate to="/choose-role" replace />
              )
            }
          />
          <Route
            path="/chat"
            element={
              isAuthenticated ? (
                <ChatScreen />
              ) : (
                <Navigate to="/choose-role" replace />
              )
            }
          />
          <Route
            path="/profile"
            element={
              isAuthenticated ? (
                <ProfileScreen />
              ) : (
                <Navigate to="/choose-role" replace />
              )
            }
          />
          <Route
            path="/test-notifications"
            element={
              isAuthenticated ? (
                <TestNotifications />
              ) : (
                <Navigate to="/choose-role" replace />
              )
            }
          />
          <Route
            path="/"
            element={
              <Navigate to={isAuthenticated ? (userRole === 'customer' ? '/marketplace' : '/dashboard') : '/choose-role'} replace />
            }
          />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
