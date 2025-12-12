import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  TextField,
  Button,
  Paper,
  Grid,
  Avatar,
  IconButton,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  Switch,
  FormControlLabel,
  Divider,
  Alert,
  CircularProgress,
} from '@mui/material';
import {
  Person,
  Edit,
  Save,
  Cancel,
  Phone,
  LocationOn,
  Agriculture,
  Notifications,
} from '@mui/icons-material';
import api from '../services/api.web';

const ProfileScreen = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const [profile, setProfile] = useState({
    name: '',
    phone: '',
    location: {
      address: '',
      city: '',
      state: '',
      pincode: ''
    },
    farmDetails: {
      farmSize: 'Small (< 2 acres)',
      farmType: 'Conventional',
      cropsGrown: [],
      soilType: '',
      irrigationType: ''
    }
  });

  const [settings, setSettings] = useState({
    notifications: {
      weather: true,
      priceAlerts: true,
      diseases: true,
      general: true
    },
    language: 'en',
    theme: 'light'
  });

  const [userInfo, setUserInfo] = useState({
    email: '',
    memberSince: '',
    isVerified: false
  });

  const [newCrop, setNewCrop] = useState('');

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await api.get('/auth/profile');
      const userData = response.data.data.user;
      
      setProfile({
        name: userData.profile.name || '',
        phone: userData.profile.phone || '',
        location: userData.profile.location || {
          address: '',
          city: '',
          state: '',
          pincode: ''
        },
        farmDetails: userData.profile.farmDetails || {
          farmSize: 'Small (< 2 acres)',
          farmType: 'Conventional',
          cropsGrown: [],
          soilType: '',
          irrigationType: ''
        }
      });

      setSettings(userData.settings || {
        notifications: {
          weather: true,
          priceAlerts: true,
          diseases: true,
          general: true
        },
        language: 'en',
        theme: 'light'
      });

      setUserInfo({
        email: userData.email,
        memberSince: new Date(userData.memberSince).toLocaleDateString(),
        isVerified: userData.isVerified
      });

      setError('');
    } catch (err) {
      setError('Failed to load profile');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError('');
      
      await api.put('/auth/profile', {
        profile,
        settings
      });

      setSuccess('Profile updated successfully!');
      setEditing(false);
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleAddCrop = () => {
    if (newCrop.trim() && !profile.farmDetails.cropsGrown.includes(newCrop.trim())) {
      setProfile({
        ...profile,
        farmDetails: {
          ...profile.farmDetails,
          cropsGrown: [...profile.farmDetails.cropsGrown, newCrop.trim()]
        }
      });
      setNewCrop('');
    }
  };

  const handleRemoveCrop = (cropToRemove) => {
    setProfile({
      ...profile,
      farmDetails: {
        ...profile.farmDetails,
        cropsGrown: profile.farmDetails.cropsGrown.filter(crop => crop !== cropToRemove)
      }
    });
  };

  if (loading) {
    return (
      <Container sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4">
          <Person sx={{ fontSize: 40, verticalAlign: 'middle', mr: 1 }} />
          My Profile
        </Typography>
        {!editing ? (
          <Button
            variant="contained"
            startIcon={<Edit />}
            onClick={() => setEditing(true)}
          >
            Edit Profile
          </Button>
        ) : (
          <Box>
            <Button
              variant="contained"
              startIcon={<Save />}
              onClick={handleSave}
              disabled={saving}
              sx={{ mr: 1 }}
            >
              {saving ? 'Saving...' : 'Save'}
            </Button>
            <Button
              variant="outlined"
              startIcon={<Cancel />}
              onClick={() => {
                setEditing(false);
                fetchProfile();
              }}
              disabled={saving}
            >
              Cancel
            </Button>
          </Box>
        )}
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

      {/* Account Information */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>Account Information</Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <Typography variant="body2" color="text.secondary">Email</Typography>
            <Typography variant="body1">{userInfo.email}</Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography variant="body2" color="text.secondary">Member Since</Typography>
            <Typography variant="body1">{userInfo.memberSince}</Typography>
          </Grid>
        </Grid>
      </Paper>

      {/* Personal Information */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>Personal Information</Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Name"
              value={profile.name}
              onChange={(e) => setProfile({ ...profile, name: e.target.value })}
              disabled={!editing}
              InputProps={{
                startAdornment: <Person sx={{ mr: 1, color: 'action.active' }} />
              }}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Phone"
              value={profile.phone}
              onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
              disabled={!editing}
              InputProps={{
                startAdornment: <Phone sx={{ mr: 1, color: 'action.active' }} />
              }}
            />
          </Grid>
        </Grid>
      </Paper>

      {/* Location */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          <LocationOn sx={{ verticalAlign: 'middle', mr: 1 }} />
          Location
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Address"
              value={profile.location.address}
              onChange={(e) => setProfile({
                ...profile,
                location: { ...profile.location, address: e.target.value }
              })}
              disabled={!editing}
              multiline
              rows={2}
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              label="City"
              value={profile.location.city}
              onChange={(e) => setProfile({
                ...profile,
                location: { ...profile.location, city: e.target.value }
              })}
              disabled={!editing}
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              label="State"
              value={profile.location.state}
              onChange={(e) => setProfile({
                ...profile,
                location: { ...profile.location, state: e.target.value }
              })}
              disabled={!editing}
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              label="Pincode"
              value={profile.location.pincode}
              onChange={(e) => setProfile({
                ...profile,
                location: { ...profile.location, pincode: e.target.value }
              })}
              disabled={!editing}
            />
          </Grid>
        </Grid>
      </Paper>

      {/* Farm Details */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          <Agriculture sx={{ verticalAlign: 'middle', mr: 1 }} />
          Farm Details
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth disabled={!editing}>
              <InputLabel>Farm Size</InputLabel>
              <Select
                value={profile.farmDetails.farmSize}
                label="Farm Size"
                onChange={(e) => setProfile({
                  ...profile,
                  farmDetails: { ...profile.farmDetails, farmSize: e.target.value }
                })}
              >
                <MenuItem value="Small (< 2 acres)">Small (&lt; 2 acres)</MenuItem>
                <MenuItem value="Medium (2-10 acres)">Medium (2-10 acres)</MenuItem>
                <MenuItem value="Large (> 10 acres)">Large (&gt; 10 acres)</MenuItem>
                <MenuItem value="Commercial">Commercial</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth disabled={!editing}>
              <InputLabel>Farm Type</InputLabel>
              <Select
                value={profile.farmDetails.farmType}
                label="Farm Type"
                onChange={(e) => setProfile({
                  ...profile,
                  farmDetails: { ...profile.farmDetails, farmType: e.target.value }
                })}
              >
                <MenuItem value="Organic">Organic</MenuItem>
                <MenuItem value="Conventional">Conventional</MenuItem>
                <MenuItem value="Mixed">Mixed</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth disabled={!editing}>
              <InputLabel>Soil Type</InputLabel>
              <Select
                value={profile.farmDetails.soilType}
                label="Soil Type"
                onChange={(e) => setProfile({
                  ...profile,
                  farmDetails: { ...profile.farmDetails, soilType: e.target.value }
                })}
              >
                <MenuItem value="">Select Soil Type</MenuItem>
                <MenuItem value="Clay">Clay</MenuItem>
                <MenuItem value="Sandy">Sandy</MenuItem>
                <MenuItem value="Loamy">Loamy</MenuItem>
                <MenuItem value="Silt">Silt</MenuItem>
                <MenuItem value="Chalky">Chalky</MenuItem>
                <MenuItem value="Peaty">Peaty</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth disabled={!editing}>
              <InputLabel>Irrigation Type</InputLabel>
              <Select
                value={profile.farmDetails.irrigationType}
                label="Irrigation Type"
                onChange={(e) => setProfile({
                  ...profile,
                  farmDetails: { ...profile.farmDetails, irrigationType: e.target.value }
                })}
              >
                <MenuItem value="">Select Irrigation</MenuItem>
                <MenuItem value="Rain-fed">Rain-fed</MenuItem>
                <MenuItem value="Drip">Drip</MenuItem>
                <MenuItem value="Sprinkler">Sprinkler</MenuItem>
                <MenuItem value="Flood">Flood</MenuItem>
                <MenuItem value="Mixed">Mixed</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12}>
            <Typography variant="body2" gutterBottom>Crops Grown</Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 1 }}>
              {profile.farmDetails.cropsGrown.map((crop, idx) => (
                <Chip
                  key={idx}
                  label={crop}
                  onDelete={editing ? () => handleRemoveCrop(crop) : undefined}
                  color="primary"
                  variant="outlined"
                />
              ))}
            </Box>
            {editing && (
              <Box sx={{ display: 'flex', gap: 1 }}>
                <TextField
                  size="small"
                  placeholder="Add crop"
                  value={newCrop}
                  onChange={(e) => setNewCrop(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleAddCrop()}
                />
                <Button variant="outlined" onClick={handleAddCrop}>Add</Button>
              </Box>
            )}
          </Grid>
        </Grid>
      </Paper>

      {/* Notification Settings */}
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          <Notifications sx={{ verticalAlign: 'middle', mr: 1 }} />
          Notification Settings
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <FormControlLabel
              control={
                <Switch
                  checked={settings.notifications.weather}
                  onChange={(e) => setSettings({
                    ...settings,
                    notifications: { ...settings.notifications, weather: e.target.checked }
                  })}
                  disabled={!editing}
                />
              }
              label="Weather Alerts"
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormControlLabel
              control={
                <Switch
                  checked={settings.notifications.priceAlerts}
                  onChange={(e) => setSettings({
                    ...settings,
                    notifications: { ...settings.notifications, priceAlerts: e.target.checked }
                  })}
                  disabled={!editing}
                />
              }
              label="Price Alerts"
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormControlLabel
              control={
                <Switch
                  checked={settings.notifications.diseases}
                  onChange={(e) => setSettings({
                    ...settings,
                    notifications: { ...settings.notifications, diseases: e.target.checked }
                  })}
                  disabled={!editing}
                />
              }
              label="Disease Alerts"
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormControlLabel
              control={
                <Switch
                  checked={settings.notifications.general}
                  onChange={(e) => setSettings({
                    ...settings,
                    notifications: { ...settings.notifications, general: e.target.checked }
                  })}
                  disabled={!editing}
                />
              }
              label="General Notifications"
            />
          </Grid>
        </Grid>
      </Paper>
    </Container>
  );
};

export default ProfileScreen;
