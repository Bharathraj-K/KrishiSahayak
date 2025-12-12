import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  AppBar,
  Toolbar,
  Typography,
  Button,
  Container,
  Grid,
  Card,
  CardContent,
  CardActionArea,
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

  const features = [
    {
      title: 'Weather',
      description: 'Get weather forecasts and farming advice',
      icon: CloudQueue,
      color: '#2196F3',
      gradient: 'linear-gradient(135deg, #2196F3 0%, #1976D2 100%)',
      path: '/weather'
    },
    {
      title: 'Market Prices',
      description: 'View current crop prices and trends',
      icon: ShowChart,
      color: '#4CAF50',
      gradient: 'linear-gradient(135deg, #4CAF50 0%, #388E3C 100%)',
      path: '/market'
    },
    {
      title: 'Disease Detection',
      description: 'Identify plant diseases with AI',
      icon: BugReport,
      color: '#FF9800',
      gradient: 'linear-gradient(135deg, #FF9800 0%, #F57C00 100%)',
      path: '/disease'
    },
    {
      title: 'AI Chat',
      description: 'Get farming advice from AI assistant',
      icon: SmartToy,
      color: '#9C27B0',
      gradient: 'linear-gradient(135deg, #9C27B0 0%, #7B1FA2 100%)',
      path: '/chat'
    },
    {
      title: 'Profile',
      description: 'Manage your farm details',
      icon: AccountCircle,
      color: '#00BCD4',
      gradient: 'linear-gradient(135deg, #00BCD4 0%, #0097A7 100%)',
      path: '/profile'
    }
  ];
  
  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f5f5f5' }}>
      <AppBar position="static" elevation={0}>
        <Toolbar>
          <Agriculture sx={{ mr: 2, fontSize: 32 }} />
          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="h6" component="div">
              KrishiSahayak
            </Typography>
            <Typography variant="caption" sx={{ opacity: 0.8 }}>
              कृषि सहायक
            </Typography>
          </Box>
          <NotificationBell />
          <Button color="inherit" startIcon={<Logout />} onClick={onLogout}>
            Logout
          </Button>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ py: 6 }}>
        {/* Welcome Section */}
        <Box sx={{ mb: 6, textAlign: 'center' }}>
          <Typography 
            variant="h3" 
            gutterBottom 
            sx={{ 
              fontWeight: 600,
              color: 'primary.main',
              mb: 1
            }}
          >
            Welcome to KrishiSahayak
          </Typography>
          <Typography 
            variant="h6" 
            color="text.secondary"
            sx={{ fontWeight: 400 }}
          >
            Your complete digital farming assistant
          </Typography>
        </Box>

        {/* Feature Cards */}
        <Grid container spacing={3} justifyContent="center">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Grid item xs={12} sm={6} md={4} lg={2.4} key={index}>
                <Card 
                  elevation={0}
                  sx={{ 
                    height: '100%',
                    borderRadius: 3,
                    border: '1px solid',
                    borderColor: 'divider',
                    transition: 'all 0.3s ease',
                    '&:hover': { 
                      transform: 'scale(1.05)',
                      boxShadow: '0 12px 24px rgba(0,0,0,0.15)',
                      borderColor: feature.color,
                      zIndex: 1
                    }
                  }}
                >
                  <CardActionArea 
                    onClick={() => navigate(feature.path)}
                    sx={{ height: '100%' }}
                  >
                    <CardContent sx={{ p: 3, textAlign: 'center', height: '100%' }}>
                      <Box
                        sx={{
                          width: 80,
                          height: 80,
                          borderRadius: 3,
                          background: feature.gradient,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          margin: '0 auto',
                          mb: 2
                        }}
                      >
                        <Icon sx={{ fontSize: 40, color: 'white' }} />
                      </Box>
                      <Typography 
                        variant="h5" 
                        gutterBottom
                        sx={{ fontWeight: 600, color: 'text.primary' }}
                      >
                        {feature.title}
                      </Typography>
                      <Typography 
                        variant="body2" 
                        color="text.secondary"
                        sx={{ lineHeight: 1.6 }}
                      >
                        {feature.description}
                      </Typography>
                    </CardContent>
                  </CardActionArea>
                </Card>
              </Grid>
            );
          })}
        </Grid>

        {/* Quick Stats */}
        <Grid container spacing={3} sx={{ mt: 4 }}>
          <Grid item xs={12} sm={4}>
            <Card 
              elevation={0}
              sx={{ 
                p: 3, 
                borderRadius: 3,
                border: '1px solid',
                borderColor: 'divider',
                textAlign: 'center'
              }}
            >
              <Typography variant="h3" color="primary.main" sx={{ fontWeight: 700 }}>
                AI
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Disease Prediction
              </Typography>
            </Card>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Card 
              elevation={0}
              sx={{ 
                p: 3, 
                borderRadius: 3,
                border: '1px solid',
                borderColor: 'divider',
                textAlign: 'center'
              }}
            >
              <Typography variant="h3" color="success.main" sx={{ fontWeight: 700 }}>
                24/7
              </Typography>
              <Typography variant="body1" color="text.secondary">
                AI Assistance
              </Typography>
            </Card>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Card 
              elevation={0}
              sx={{ 
                p: 3, 
                borderRadius: 3,
                border: '1px solid',
                borderColor: 'divider',
                textAlign: 'center'
              }}
            >
              <Typography variant="h3" color="warning.main" sx={{ fontWeight: 700 }}>
                100%
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Free to Use
              </Typography>
            </Card>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default Dashboard;
