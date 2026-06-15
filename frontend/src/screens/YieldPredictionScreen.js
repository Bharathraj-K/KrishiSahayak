import React, { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Container,
  Divider,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  TextField,
  Typography
} from '@mui/material';
import { AutoGraph } from '@mui/icons-material';
import api from '../services/api.web';

const defaultValues = {
  crop: '',
  state: '',
  season: '',
  year: '',
  area: '',
  rainfall: '',
  fertilizer: '',
  pesticide: ''
};

const YieldPredictionScreen = () => {
  const [formData, setFormData] = useState(defaultValues);
  const [loading, setLoading] = useState(false);
  const [loadingMeta, setLoadingMeta] = useState(true);
  const [loadingMarketMeta, setLoadingMarketMeta] = useState(true);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);
  const [meta, setMeta] = useState(null);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [categoryCrops, setCategoryCrops] = useState([]);

  useEffect(() => {
    const fetchMeta = async () => {
      try {
        const response = await api.get('/yield/meta');
        const data = response.data?.data || null;
        setMeta(data);

        const riceCrop = (data?.crops || []).find((c) => String(c).trim().toLowerCase() === 'rice') || '';
        const firstCrop = riceCrop || data?.crops?.[0] || '';
        const firstState = data?.states?.[0] || '';
        const kharifSeason = (data?.seasons || []).find((s) => String(s).trim().toLowerCase().startsWith('kharif')) || '';
        const firstSeason = kharifSeason || data?.seasons?.[0] || '';
        const defaultYear = 2026;

        setFormData((prev) => ({
          ...prev,
          crop: prev.crop || firstCrop,
          state: prev.state || firstState,
          season: prev.season || firstSeason,
          year: prev.year || defaultYear
        }));
      } catch (err) {
        setError(err.response?.data?.error?.message || 'Failed to load yield metadata');
      } finally {
        setLoadingMeta(false);
      }
    };

    fetchMeta();
  }, []);

  useEffect(() => {
    const fetchProfileDefaults = async () => {
      try {
        const response = await api.get('/auth/profile');
        const state = response.data?.data?.user?.profile?.location?.state || '';
        if (!state) return;

        setFormData((prev) => {
          const stateExists = meta?.states?.includes(state);
          return {
            ...prev,
            state: stateExists ? state : prev.state
          };
        });
      } catch {
        // ignore
      }
    };

    if (!loadingMeta) {
      fetchProfileDefaults();
    }
  }, [loadingMeta, meta]);

  useEffect(() => {
    const fetchMarketCategories = async () => {
      try {
        const response = await api.get('/market/categories');
        const apiCategories = response.data?.data?.categories || [];
        if (apiCategories.length) {
          setCategories(apiCategories);
          setSelectedCategory((prev) => prev || apiCategories[0].id);
        }
      } catch {
        // ignore; category dropdown will stay empty
      } finally {
        setLoadingMarketMeta(false);
      }
    };

    fetchMarketCategories();
  }, []);

  useEffect(() => {
    const fetchCropsByCategory = async () => {
      if (!selectedCategory) {
        setCategoryCrops([]);
        return;
      }

      try {
        const response = await api.get(`/market/categories/${selectedCategory}`);
        const crops = response.data?.data?.crops || [];
        setCategoryCrops(crops);
      } catch {
        setCategoryCrops([]);
      }
    };

    fetchCropsByCategory();
  }, [selectedCategory]);

  const categoryCropOptions = useMemo(() => {
    const datasetCrops = meta?.crops || [];
    if (!selectedCategory || categoryCrops.length === 0 || datasetCrops.length === 0) return [];

    const datasetLower = new Set(datasetCrops.map((c) => String(c).trim().toLowerCase()));
    return categoryCrops.filter((c) => datasetLower.has(String(c).trim().toLowerCase()));
  }, [categoryCrops, meta, selectedCategory]);

  useEffect(() => {
    // If category filter is active and current crop not in that category, switch to first valid crop.
    if (categoryCropOptions.length === 0) return;
    if (!formData.crop) return;
    const selectedLower = String(formData.crop).trim().toLowerCase();
    const valid = categoryCropOptions.some((c) => String(c).trim().toLowerCase() === selectedLower);
    if (!valid) {
      setFormData((prev) => ({ ...prev, crop: categoryCropOptions[0] }));
    }
  }, [categoryCropOptions, formData.crop]);

  useEffect(() => {
    const fetchSuggested = async () => {
      if (loadingMeta) return;
      if (!formData.crop || !formData.state || !formData.season) return;

      try {
        const response = await api.get('/yield/suggest', {
          params: {
            crop: formData.crop,
            state: formData.state,
            season: formData.season
          }
        });

        const suggested = response.data?.data?.suggested || null;
        if (!suggested) return;

        setFormData((prev) => ({
          ...prev,
          area: prev.area === '' ? Math.round(suggested.Area ?? 0) : prev.area,
          rainfall: prev.rainfall === '' ? Math.round(suggested.Rainfall ?? 0) : prev.rainfall,
          fertilizer: prev.fertilizer === '' ? Math.round(suggested.Fertilizer ?? 0) : prev.fertilizer,
          pesticide: prev.pesticide === '' ? Number((suggested.Pesticide ?? 0).toFixed(2)) : prev.pesticide
        }));
      } catch {
        // ignore
      }
    };

    fetchSuggested();
  }, [formData.crop, formData.state, formData.season, loadingMeta]);

  const missingFields = useMemo(() => {
    const required = ['crop', 'state', 'season', 'year', 'area', 'rainfall', 'fertilizer', 'pesticide'];
    return required.filter((key) => formData[key] === '' || formData[key] === null || formData[key] === undefined);
  }, [formData]);

  const handleChange = (field) => (event) => {
    setFormData((prev) => ({
      ...prev,
      [field]: event.target.value
    }));
  };

  const handlePredict = async () => {
    setError('');
    setResult(null);

    if (missingFields.length) {
      setError(`Please fill all fields: ${missingFields.join(', ')}`);
      return;
    }

    setLoading(true);
    try {
      const response = await api.post('/yield/predict', {
        crop: formData.crop,
        state: formData.state,
        season: formData.season,
        year: Number(formData.year),
        area: Number(formData.area),
        rainfall: Number(formData.rainfall),
        fertilizer: Number(formData.fertilizer),
        pesticide: Number(formData.pesticide)
      });

      setResult(response.data?.data || null);
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Failed to predict yield');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom>
        <AutoGraph sx={{ fontSize: 40, verticalAlign: 'middle', mr: 1 }} />
        Yield Prediction
      </Typography>
      <Typography variant="body2" color="text.secondary" gutterBottom>
        Predict expected crop yield based on state, season, area, rainfall, fertilizer and pesticide inputs.
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
              Inputs
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth disabled={loadingMarketMeta || categories.length === 0}>
                  <InputLabel>Category</InputLabel>
                  <Select value={selectedCategory} label="Category" onChange={(e) => setSelectedCategory(e.target.value)}>
                    {categories.map((cat) => (
                      <MenuItem key={cat.id} value={cat.id}>
                        {cat.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth disabled={loadingMeta || !meta?.crops?.length}>
                  <InputLabel>Crop</InputLabel>
                  <Select value={formData.crop} label="Crop" onChange={handleChange('crop')}>
                    {(categoryCropOptions.length ? categoryCropOptions : (meta?.crops || [])).map((crop) => (
                      <MenuItem key={crop} value={crop}>
                        {crop}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth disabled={loadingMeta || !meta?.states?.length}>
                  <InputLabel>State</InputLabel>
                  <Select value={formData.state} label="State" onChange={handleChange('state')}>
                    {(meta?.states || []).map((state) => (
                      <MenuItem key={state} value={state}>
                        {state}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth disabled={loadingMeta || !meta?.seasons?.length}>
                  <InputLabel>Season</InputLabel>
                  <Select value={formData.season} label="Season" onChange={handleChange('season')}>
                    {(meta?.seasons || []).map((season) => (
                      <MenuItem key={season} value={season}>
                        {season}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Year"
                  fullWidth
                  type="number"
                  value={formData.year}
                  onChange={handleChange('year')}
                  inputProps={{
                    min: 2018,
                    max: 2028,
                    step: 1
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Area"
                  fullWidth
                  type="number"
                  value={formData.area}
                  onChange={handleChange('area')}
                  inputProps={{
                    min: meta?.numericRanges?.Area?.min ?? 0,
                    max: meta?.numericRanges?.Area?.max ?? undefined,
                    step: 1
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Annual Rainfall (mm)"
                  fullWidth
                  type="number"
                  value={formData.rainfall}
                  onChange={handleChange('rainfall')}
                  inputProps={{
                    min: meta?.numericRanges?.Rainfall?.min ?? 0,
                    max: meta?.numericRanges?.Rainfall?.max ?? 10000,
                    step: 1
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Fertilizer"
                  fullWidth
                  type="number"
                  value={formData.fertilizer}
                  onChange={handleChange('fertilizer')}
                  inputProps={{
                    min: meta?.numericRanges?.Fertilizer?.min ?? 0,
                    max: meta?.numericRanges?.Fertilizer?.max ?? undefined,
                    step: 1
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Pesticide"
                  fullWidth
                  type="number"
                  value={formData.pesticide}
                  onChange={handleChange('pesticide')}
                  inputProps={{
                    min: meta?.numericRanges?.Pesticide?.min ?? 0,
                    max: meta?.numericRanges?.Pesticide?.max ?? undefined,
                    step: 0.1
                  }}
                />
              </Grid>
            </Grid>

            <Box sx={{ mt: 3 }}>
              <Button
                variant="contained"
                onClick={handlePredict}
                fullWidth
                disabled={loading || loadingMeta}
                startIcon={loading ? <CircularProgress size={18} /> : <AutoGraph />}
              >
                {loading ? 'Predicting...' : 'Predict Yield'}
              </Button>
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Result
            </Typography>

            {!loading && !result && (
              <Box sx={{ textAlign: 'center', py: 6 }}>
                <AutoGraph sx={{ fontSize: 70, color: 'text.secondary', mb: 1 }} />
                <Typography variant="body1" color="text.secondary">
                  Enter values and run a prediction
                </Typography>
              </Box>
            )}

            {result && (
              <Box>
                <Typography variant="h4" sx={{ fontWeight: 800, color: 'success.main' }}>
                  {result.predictedYield}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {result.unit}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Model: {result.modelUsed || 'Yield model'}
                </Typography>

                <Divider sx={{ my: 2 }} />
                <Typography variant="subtitle2" gutterBottom>
                  Input Summary
                </Typography>
                <Grid container spacing={1}>
                  <Grid item xs={6}>Crop: {result.input?.Crop}</Grid>
                  <Grid item xs={6}>State: {result.input?.State}</Grid>
                  <Grid item xs={6}>Season: {result.input?.Season}</Grid>
                  <Grid item xs={6}>Year: {result.input?.Year}</Grid>
                  <Grid item xs={6}>Area: {result.input?.Area}</Grid>
                  <Grid item xs={6}>Rainfall: {result.input?.Rainfall}</Grid>
                  <Grid item xs={6}>Fertilizer: {result.input?.Fertilizer}</Grid>
                  <Grid item xs={6}>Pesticide: {result.input?.Pesticide}</Grid>
                </Grid>
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default YieldPredictionScreen;

