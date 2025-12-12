import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  AppBar,
  Toolbar,
  Typography,
  Button,
  Container,
  Paper,
  Grid,
  Card,
  CardContent,
} from '@mui/material';
import {
  Agriculture,
  CloudQueue,
  ShowChart,
  BugReport,
  AccountCircle,
  Logout,
  SmartToy,
} from '@mui/icons-material';
import NotificationBell from '../components/NotificationBell';

const Dashboard = ({ onLogout }) => {
  const navigate = useNavigate();

  const handleWeatherClick = () => {
    navigate('/weather');
  };

  const handleMarketClick = () => {
    navigate('/market');
  };

  const handleDiseaseClick = () => {
    navigate('/disease');
  };

  const handleChatClick = () => {
    navigate('/chat');
  };

  const handleProfileClick = () => {
    navigate('/profile');
  };
  
  return (
    <Box>
      <AppBar position="static">
        <Toolbar>
          <Agriculture sx={{ mr: 2 }} />
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            कृषि सहायक - KrishiSahayak
          </Typography>
          <NotificationBell />
          <Button color="inherit" startIcon={<Logout />} onClick={onLogout}>
            Logout
          </Button>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          Welcome to KrishiSahayak Dashboard
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph>
          Your digital farming assistant is ready to help!
        </Typography>

        <Grid container spacing={3} sx={{ mt: 2 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card 
              sx={{ cursor: 'pointer', '&:hover': { boxShadow: 6 } }}
              onClick={handleWeatherClick}
            >
              <CardContent sx={{ textAlign: 'center' }}>
                <CloudQueue sx={{ fontSize: 50, color: 'primary.main', mb: 2 }} />
                <Typography variant="h6" gutterBottom>
                  Weather
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Check weather forecasts and farming advice
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card 
              sx={{ cursor: 'pointer', '&:hover': { boxShadow: 6 } }}
              onClick={handleMarketClick}
            >
              <CardContent sx={{ textAlign: 'center' }}>
                <ShowChart sx={{ fontSize: 50, color: 'success.main', mb: 2 }} />
                <Typography variant="h6" gutterBottom>
                  Market Prices
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  View current crop prices and trends
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card 
              sx={{ cursor: 'pointer', '&:hover': { boxShadow: 6 } }}
              onClick={handleDiseaseClick}
            >
              <CardContent sx={{ textAlign: 'center' }}>
                <BugReport sx={{ fontSize: 50, color: 'warning.main', mb: 2 }} />
                <Typography variant="h6" gutterBottom>
                  Disease Detection
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Identify plant diseases with AI
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card 
              sx={{ cursor: 'pointer', '&:hover': { boxShadow: 6 } }}
              onClick={handleChatClick}
            >
              <CardContent sx={{ textAlign: 'center' }}>
                <SmartToy sx={{ fontSize: 50, color: 'secondary.main', mb: 2 }} />
                <Typography variant="h6" gutterBottom>
                  AI Chat
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Get farming advice from AI assistant
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card 
              sx={{ cursor: 'pointer', '&:hover': { boxShadow: 6 } }}
              onClick={handleProfileClick}
            >
              <CardContent sx={{ textAlign: 'center' }}>
                <AccountCircle sx={{ fontSize: 50, color: 'info.main', mb: 2 }} />
                <Typography variant="h6" gutterBottom>
                  Profile
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Manage your farm details
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        <Paper sx={{ p: 3, mt: 4 }}>
          <Typography variant="h5" gutterBottom>
            🎉 Phase 6 Complete: AI Chat Assistant!
          </Typography>
          <Typography variant="body1" paragraph>
            Your KrishiSahayak application now has all major features:
          </Typography>
          <ul>
            <li>✅ Authentication System (Login/Register)</li>
            <li>✅ Weather Forecasts & Farming Advice</li>
            <li>✅ Market Prices & Price Trends</li>
            <li>✅ AI Disease Detection with Treatment</li>
            <li>✅ AI Chat Assistant for Farming Questions</li>
            <li>✅ Profile Management with Farm Details</li>
            <li>✅ In-App Notifications System</li>
          </ul>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
            All features are fully functional! 
          </Typography>
          <Button 
            variant="outlined" 
            sx={{ mt: 2 }}
            onClick={() => navigate('/test-notifications')}
          >
            Test Notifications
          </Button>
        </Paper>
      </Container>
    </Box>
  );
};

export default Dashboard;
