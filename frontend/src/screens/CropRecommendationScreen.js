import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Grid,
  TextField,
  Button,
  Alert,
  CircularProgress,
  Chip,
  Divider
} from '@mui/material';
import { Agriculture, AutoGraph } from '@mui/icons-material';
import api from '../services/api.web';

const defaultValues = {
  nitrogen: '',
  phosphorus: '',
  potassium: '',
  temperature: '',
  humidity: '',
  ph: '',
  rainfall: ''
};

const sampleValues = {
  nitrogen: 90,
  phosphorus: 42,
  potassium: 43,
  temperature: 20.5,
  humidity: 82,
  ph: 6.5,
  rainfall: 200
};

const CropRecommendationScreen = () => {
  const [formData, setFormData] = useState(defaultValues);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);

  const handleChange = (field) => (event) => {
    setFormData((prev) => ({
      ...prev,
      [field]: event.target.value
    }));
  };

  const handleUseSample = () => {
    setFormData(sampleValues);
    setResult(null);
    setError('');
  };

  const handlePredict = async () => {
    setError('');
    setResult(null);

    const missing = Object.entries(formData)
      .filter(([, value]) => value === '' || value === null)
      .map(([key]) => key);

    if (missing.length > 0) {
      setError(`Please fill all fields: ${missing.join(', ')}`);
      return;
    }

    setLoading(true);
    try {
      const response = await api.post('/crop-recommendation/predict', formData);
      setResult(response.data.data);
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Failed to get recommendation');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom>
        <Agriculture sx={{ fontSize: 40, verticalAlign: 'middle', mr: 1 }} />
        Crop Recommendation
      </Typography>
      <Typography variant="body2" color="text.secondary" gutterBottom>
        Get the best crop suggestion based on soil nutrients and climate conditions
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mt: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3} sx={{ mt: 1 }}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Input Parameters
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={4}>
                <TextField
                  label="Nitrogen (N)"
                  fullWidth
                  value={formData.nitrogen}
                  onChange={handleChange('nitrogen')}
                  type="number"
                  inputProps={{ min: 0, max: 140, step: 1 }}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  label="Phosphorus (P)"
                  fullWidth
                  value={formData.phosphorus}
                  onChange={handleChange('phosphorus')}
                  type="number"
                  inputProps={{ min: 0, max: 150, step: 1 }}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  label="Potassium (K)"
                  fullWidth
                  value={formData.potassium}
                  onChange={handleChange('potassium')}
                  type="number"
                  inputProps={{ min: 0, max: 210, step: 1 }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Temperature (C)"
                  fullWidth
                  value={formData.temperature}
                  onChange={handleChange('temperature')}
                  type="number"
                  inputProps={{ min: 0, max: 60, step: 0.1 }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Humidity (%)"
                  fullWidth
                  value={formData.humidity}
                  onChange={handleChange('humidity')}
                  type="number"
                  inputProps={{ min: 0, max: 100, step: 1 }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="pH"
                  fullWidth
                  value={formData.ph}
                  onChange={handleChange('ph')}
                  type="number"
                  inputProps={{ min: 0, max: 14, step: 0.1 }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Rainfall (mm)"
                  fullWidth
                  value={formData.rainfall}
                  onChange={handleChange('rainfall')}
                  type="number"
                  inputProps={{ min: 0, max: 500, step: 1 }}
                />
              </Grid>
            </Grid>

            <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
              <Button variant="outlined" onClick={handleUseSample} fullWidth>
                Use Sample Values
              </Button>
              <Button
                variant="contained"
                onClick={handlePredict}
                fullWidth
                disabled={loading}
                startIcon={loading ? <CircularProgress size={18} /> : <AutoGraph />}
              >
                {loading ? 'Predicting...' : 'Get Recommendation'}
              </Button>
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Recommendation Result
            </Typography>

            {!loading && !result && (
              <Box sx={{ textAlign: 'center', py: 6 }}>
                <AutoGraph sx={{ fontSize: 70, color: 'text.secondary', mb: 1 }} />
                <Typography variant="body1" color="text.secondary">
                  Enter values and generate a recommendation
                </Typography>
              </Box>
            )}

            {result && (
              <Box>
                <Typography variant="h4" sx={{ fontWeight: 700, color: 'success.main' }}>
                  {result.prediction}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Confidence: {result.confidence}%
                </Typography>

                <Divider sx={{ my: 2 }} />

                <Typography variant="subtitle1" gutterBottom>
                  Top Predictions
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  {result.topPredictions?.map((item) => (
                    <Chip
                      key={item.crop}
                      label={`${item.crop} (${item.confidence}%)`}
                      color="primary"
                      variant="outlined"
                    />
                  ))}
                </Box>

                <Divider sx={{ my: 2 }} />

                <Typography variant="subtitle2" gutterBottom>
                  Input Summary
                </Typography>
                <Grid container spacing={1}>
                  <Grid item xs={6}>N: {result.input?.nitrogen}</Grid>
                  <Grid item xs={6}>P: {result.input?.phosphorus}</Grid>
                  <Grid item xs={6}>K: {result.input?.potassium}</Grid>
                  <Grid item xs={6}>Temp: {result.input?.temperature} C</Grid>
                  <Grid item xs={6}>Humidity: {result.input?.humidity}%</Grid>
                  <Grid item xs={6}>pH: {result.input?.ph}</Grid>
                  <Grid item xs={6}>Rainfall: {result.input?.rainfall} mm</Grid>
                </Grid>
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default CropRecommendationScreen;
