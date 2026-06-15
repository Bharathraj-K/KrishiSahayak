import React, { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Container,
  FormControl,
  Grid,
  InputLabel,
  List,
  ListItem,
  ListItemText,
  MenuItem,
  Paper,
  Select,
  TextField,
  Typography
} from '@mui/material';
import { Biotech, AutoAwesome } from '@mui/icons-material';
import api from '../services/api.web';

const FertilizerRecommendationScreen = () => {
  const [crops, setCrops] = useState([]);
  const [loadingCrops, setLoadingCrops] = useState(true);
  const [loadingRecommendation, setLoadingRecommendation] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);
  const [formData, setFormData] = useState({
    cropName: '',
    nitrogen: '',
    phosphorus: '',
    potassium: ''
  });

  useEffect(() => {
    const fetchCrops = async () => {
      try {
        const response = await api.get('/fertilizer/crops');
        const cropOptions = response.data?.data?.crops || [];
        setCrops(cropOptions);
        if (cropOptions.length > 0) {
          setFormData((prev) => ({ ...prev, cropName: cropOptions[0] }));
        }
      } catch (err) {
        setError(err.response?.data?.error?.message || 'Failed to load fertilizer crops');
      } finally {
        setLoadingCrops(false);
      }
    };

    fetchCrops();
  }, []);

  const isFormValid = useMemo(() => {
    return Boolean(
      formData.cropName &&
      formData.nitrogen !== '' &&
      formData.phosphorus !== '' &&
      formData.potassium !== ''
    );
  }, [formData]);

  const handleChange = (field) => (event) => {
    setFormData((prev) => ({
      ...prev,
      [field]: event.target.value
    }));
  };

  const handleUseSample = () => {
    setFormData({
      cropName: crops[0] || 'rice',
      nitrogen: 45,
      phosphorus: 25,
      potassium: 20
    });
    setResult(null);
    setError('');
  };

  const handleRecommend = async () => {
    if (!isFormValid) {
      setError('Please fill crop and all nutrient values');
      return;
    }

    try {
      setError('');
      setResult(null);
      setLoadingRecommendation(true);

      const response = await api.post('/fertilizer/recommend', {
        cropName: formData.cropName,
        nitrogen: Number(formData.nitrogen),
        phosphorus: Number(formData.phosphorus),
        potassium: Number(formData.potassium)
      });

      setResult(response.data?.data || null);
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Failed to generate fertilizer recommendation');
    } finally {
      setLoadingRecommendation(false);
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom>
        <Biotech sx={{ fontSize: 40, verticalAlign: 'middle', mr: 1 }} />
        Fertilizer Recommendation
      </Typography>
      <Typography variant="body2" color="text.secondary" gutterBottom>
        Get crop-specific fertilizer guidance based on N, P, K levels.
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
              Soil Inputs
            </Typography>

            {loadingCrops ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                <CircularProgress />
              </Box>
            ) : (
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <FormControl fullWidth>
                    <InputLabel>Crop</InputLabel>
                    <Select
                      value={formData.cropName}
                      label="Crop"
                      onChange={handleChange('cropName')}
                    >
                      {crops.map((crop) => (
                        <MenuItem key={crop} value={crop}>
                          {crop}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12} sm={4}>
                  <TextField
                    label="Nitrogen (N)"
                    fullWidth
                    type="number"
                    value={formData.nitrogen}
                    onChange={handleChange('nitrogen')}
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField
                    label="Phosphorus (P)"
                    fullWidth
                    type="number"
                    value={formData.phosphorus}
                    onChange={handleChange('phosphorus')}
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField
                    label="Potassium (K)"
                    fullWidth
                    type="number"
                    value={formData.potassium}
                    onChange={handleChange('potassium')}
                  />
                </Grid>
              </Grid>
            )}

            <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
              <Button variant="outlined" onClick={handleUseSample} fullWidth disabled={loadingCrops}>
                Use Sample
              </Button>
              <Button
                variant="contained"
                onClick={handleRecommend}
                fullWidth
                disabled={loadingCrops || loadingRecommendation}
                startIcon={loadingRecommendation ? <CircularProgress size={18} /> : <AutoAwesome />}
              >
                {loadingRecommendation ? 'Analyzing...' : 'Get Recommendation'}
              </Button>
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Recommendation
            </Typography>

            {!loadingRecommendation && !result && (
              <Box sx={{ textAlign: 'center', py: 6 }}>
                <AutoAwesome sx={{ fontSize: 70, color: 'text.secondary', mb: 1 }} />
                <Typography variant="body1" color="text.secondary">
                  Select crop and nutrient values to get fertilizer guidance
                </Typography>
              </Box>
            )}

            {result && (
              <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider' }}>
                <CardContent>
                  <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5 }}>
                    {result.recommendation?.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {result.recommendation?.summary}
                  </Typography>
                  <Typography variant="subtitle2" sx={{ mb: 1 }}>
                    Crop: {result.crop}
                  </Typography>
                  <Typography variant="subtitle2" sx={{ mb: 2 }}>
                    Key issue: {result.limitingNutrient} is {result.direction} by {result.difference}
                  </Typography>

                  <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                    Actionable Suggestions
                  </Typography>
                  <List dense>
                    {(result.recommendation?.suggestions || []).map((item) => (
                      <ListItem key={item} sx={{ px: 0 }}>
                        <ListItemText primary={`• ${item}`} />
                      </ListItem>
                    ))}
                  </List>
                </CardContent>
              </Card>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default FertilizerRecommendationScreen;
