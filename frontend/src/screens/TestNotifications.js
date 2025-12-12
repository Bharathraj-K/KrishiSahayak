import React, { useState } from 'react';
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Grid,
  Alert,
  Box,
} from '@mui/material';
import { Send } from '@mui/icons-material';
import api from '../services/api.web';

const TestNotifications = () => {
  const [formData, setFormData] = useState({
    type: 'general',
    title: '',
    message: '',
    link: ''
  });
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError('');
      setSuccess('');

      // Get current user ID from profile
      const profileResponse = await api.get('/auth/profile');
      const userId = profileResponse.data.data.user.id;

      await api.post('/notifications', {
        userId,
        ...formData
      });

      setSuccess('Notification created successfully!');
      setFormData({
        type: 'general',
        title: '',
        message: '',
        link: ''
      });
      
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create notification');
    } finally {
      setLoading(false);
    }
  };

  const quickNotifications = [
    {
      type: 'weather',
      title: 'Heavy Rain Alert',
      message: 'Heavy rainfall expected in your area tomorrow. Secure your crops and prepare drainage.',
      link: '/weather'
    },
    {
      type: 'price',
      title: 'Price Increase: Wheat',
      message: 'Wheat prices increased by 12% to ₹2,150/quintal at Delhi market. Good time to sell!',
      link: '/market'
    },
    {
      type: 'disease',
      title: 'Disease Alert: Late Blight',
      message: 'Late blight detected in tomato crops in nearby farms. Check your plants immediately.',
      link: '/disease'
    },
    {
      type: 'general',
      title: 'New Feature: AI Chat',
      message: 'Try our new AI chat assistant! Get instant answers to your farming questions.',
      link: '/chat'
    }
  ];

  const handleQuickNotification = async (notif) => {
    setFormData(notif);
    // Auto submit after a brief delay
    setTimeout(() => {
      document.getElementById('notification-form').requestSubmit();
    }, 100);
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom>
        Test Notifications
      </Typography>
      <Typography variant="body2" color="text.secondary" paragraph>
        Create test notifications to see how the notification system works.
      </Typography>

      {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {/* Quick Test Notifications */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>Quick Test Notifications</Typography>
        <Grid container spacing={2}>
          {quickNotifications.map((notif, idx) => (
            <Grid item xs={12} sm={6} key={idx}>
              <Button
                fullWidth
                variant="outlined"
                onClick={() => handleQuickNotification(notif)}
                disabled={loading}
              >
                {notif.title}
              </Button>
            </Grid>
          ))}
        </Grid>
      </Paper>

      {/* Custom Notification Form */}
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>Create Custom Notification</Typography>
        <Box component="form" id="notification-form" onSubmit={handleSubmit}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Type</InputLabel>
                <Select
                  value={formData.type}
                  label="Type"
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                >
                  <MenuItem value="general">General</MenuItem>
                  <MenuItem value="weather">Weather</MenuItem>
                  <MenuItem value="price">Price Alert</MenuItem>
                  <MenuItem value="disease">Disease Alert</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Link (optional)"
                value={formData.link}
                onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                placeholder="/weather"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Message"
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                required
                multiline
                rows={3}
              />
            </Grid>
            <Grid item xs={12}>
              <Button
                type="submit"
                variant="contained"
                fullWidth
                startIcon={<Send />}
                disabled={loading}
              >
                {loading ? 'Creating...' : 'Create Notification'}
              </Button>
            </Grid>
          </Grid>
        </Box>
      </Paper>
    </Container>
  );
};

export default TestNotifications;
