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
} from '@mui/icons-material';

const Dashboard = ({ onLogout }) => {
  const navigate = useNavigate();

  const handleWeatherClick = () => {
    navigate('/weather');
  };
  return (
    <Box>
      <AppBar position="static">
        <Toolbar>
          <Agriculture sx={{ mr: 2 }} />
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            कृषि सहायक - KrishiSahayak
          </Typography>
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
            <Card>
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
            <Card>
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
            <Card>
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
            🎉 Authentication System Complete!
          </Typography>
          <Typography variant="body1" paragraph>
            Your KrishiSahayak web application is now fully functional with:
          </Typography>
          <ul>
            <li>User Registration & Login</li>
            <li>JWT Token Authentication</li>
            <li>Protected Dashboard</li>
            <li>Logout Functionality</li>
            <li>Modern Material-UI Design</li>
          </ul>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
            Ready to implement Phase 3 (Weather Integration) and other features!
          </Typography>
        </Paper>
      </Container>
    </Box>
  );
};

export default Dashboard;
