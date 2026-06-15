import React, { useEffect, useMemo, useState } from 'react';
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
  Paper,
  Alert,
  Chip,
  CircularProgress,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import {
  Agriculture,
  CloudQueue,
  ShowChart,
  BugReport,
  AccountCircle,
  Logout,
  SmartToy,
  WarningAmber,
  LocalFireDepartment,
  WaterDrop,
  ShowChartOutlined,
  Biotech,
  AutoAwesome,
  AutoGraph,
  Storefront,
} from '@mui/icons-material';
import NotificationBell from '../components/NotificationBell';
import api from '../services/api.web';
import { FALLBACK_CATEGORIES, FALLBACK_CATEGORY_MAP } from '../constants/marketOptions';

const Dashboard = ({ onLogout }) => {
  const navigate = useNavigate();
  const [riskLoading, setRiskLoading] = useState(true);
  const [riskError, setRiskError] = useState('');
  const [riskSummary, setRiskSummary] = useState(null);
  const [selectedRiskCrop, setSelectedRiskCrop] = useState('');
  const [riskCategories, setRiskCategories] = useState([]);
  const [selectedRiskCategory, setSelectedRiskCategory] = useState('');
  const [riskCropOptions, setRiskCropOptions] = useState([]);

  const features = useMemo(() => ([
    {
      title: 'Disease Detection',
      description: 'Upload leaf images and detect diseases using AI.',
      icon: BugReport,
      color: '#FF9800',
      gradient: 'linear-gradient(135deg, #FF9800 0%, #F57C00 100%)',
      path: '/disease',
      isAI: true
    },
    {
      title: 'Crop Recommendation',
      description: 'Predict the best crop using soil + climate inputs.',
      icon: Agriculture,
      color: '#7CB342',
      gradient: 'linear-gradient(135deg, #7CB342 0%, #558B2F 100%)',
      path: '/crop-recommendation',
      isAI: true
    },
    {
      title: 'Fertilizer Guide',
      description: 'Get NPK-based fertilizer guidance for your crop.',
      icon: Biotech,
      color: '#8E24AA',
      gradient: 'linear-gradient(135deg, #8E24AA 0%, #6A1B9A 100%)',
      path: '/fertilizer-recommendation',
      isAI: true
    },
    {
      title: 'Yield Prediction',
      description: 'Forecast yield using state-wise historical + inputs.',
      icon: AutoGraph,
      color: '#00897B',
      gradient: 'linear-gradient(135deg, #00897B 0%, #00695C 100%)',
      path: '/yield-prediction',
      isAI: true
    },
    {
      title: 'AI Chat Assistant',
      description: 'Ask farming questions and get instant guidance.',
      icon: SmartToy,
      color: '#9C27B0',
      gradient: 'linear-gradient(135deg, #9C27B0 0%, #7B1FA2 100%)',
      path: '/chat',
      isAI: true
    },
    {
      title: 'Weather',
      description: 'Forecasts and advisories (supporting signal).',
      icon: CloudQueue,
      color: '#2196F3',
      gradient: 'linear-gradient(135deg, #2196F3 0%, #1976D2 100%)',
      path: '/weather',
      isAI: false
    },
    {
      title: 'Market Prices',
      description: 'Mandi prices and trends (supporting signal).',
      icon: ShowChart,
      color: '#4CAF50',
      gradient: 'linear-gradient(135deg, #4CAF50 0%, #388E3C 100%)',
      path: '/market',
      isAI: false
    },
    {
      title: 'Farmer Marketplace',
      description: 'Post produce and connect directly with buyers.',
      icon: Storefront,
      color: '#EF6C00',
      gradient: 'linear-gradient(135deg, #EF6C00 0%, #E65100 100%)',
      path: '/marketplace',
      isAI: false
    }
  ]), []);

  useEffect(() => {
    const fetchRiskAlerts = async () => {
      try {
        setRiskLoading(true);
        const params = selectedRiskCrop ? { crop: selectedRiskCrop } : {};
        const response = await api.get('/dashboard/risk-alerts', { params });
        const summary = response.data?.data || null;
        setRiskSummary(summary);
        if (!selectedRiskCrop && summary?.crop) {
          setSelectedRiskCrop(summary.crop);
        }
        setRiskError('');
      } catch (error) {
        setRiskError(error?.response?.data?.error?.message || 'Unable to load live risk alerts right now.');
      } finally {
        setRiskLoading(false);
      }
    };

    fetchRiskAlerts();
  }, [selectedRiskCrop]);

  useEffect(() => {
    const fetchMarketCategoriesAndCrops = async () => {
      try {
        const categoriesResponse = await api.get('/market/categories');
        const categories = categoriesResponse.data?.data?.categories || [];

        if (categories.length) {
          setRiskCategories(categories);
          setSelectedRiskCategory((prev) => prev || categories[0].id);
          return;
        }
      } catch (error) {
        // Fallback to static market crop map when API is unavailable.
      }

      setRiskCategories(FALLBACK_CATEGORIES);
      setSelectedRiskCategory((prev) => prev || FALLBACK_CATEGORIES[0]?.id || '');
    };

    fetchMarketCategoriesAndCrops();
  }, []);

  const riskIcons = useMemo(() => ({
    'heat-stress': LocalFireDepartment,
    'rainfall-risk': WaterDrop,
    'price-drop-risk': ShowChartOutlined,
    'disease-risk': BugReport
  }), []);

  useEffect(() => {
    const fetchCropsForCategory = async () => {
      if (!selectedRiskCategory) return;

      try {
        const response = await api.get(`/market/categories/${selectedRiskCategory}`);
        const crops = response.data?.data?.crops || [];

        if (crops.length) {
          setRiskCropOptions(crops);
          setSelectedRiskCrop((prev) => (!prev || !crops.includes(prev) ? crops[0] : prev));
          return;
        }
      } catch (error) {
        // ignore and fallback below
      }

      const fallbackCrops = FALLBACK_CATEGORY_MAP[selectedRiskCategory] || [];
      setRiskCropOptions(fallbackCrops);
      if (fallbackCrops.length) {
        setSelectedRiskCrop((prev) => (!prev || !fallbackCrops.includes(prev) ? fallbackCrops[0] : prev));
      }
    };

    fetchCropsForCategory();
  }, [selectedRiskCategory]);

  const riskColors = {
    high: {
      accent: '#C62828',
      background: 'linear-gradient(135deg, #FFF1F0 0%, #FFE2DE 100%)',
      border: '#F1A7A0'
    },
    medium: {
      accent: '#EF6C00',
      background: 'linear-gradient(135deg, #FFF8E8 0%, #FFEBC2 100%)',
      border: '#F6C67A'
    },
    low: {
      accent: '#2E7D32',
      background: 'linear-gradient(135deg, #F0FFF2 0%, #DBF5E3 100%)',
      border: '#9ED5AD'
    }
  };

  const aiFeatures = useMemo(() => features.filter((feature) => feature.isAI), [features]);
  const weatherFeature = useMemo(() => features.find((feature) => feature.path === '/weather') || null, [features]);
  const marketFeature = useMemo(() => features.find((feature) => feature.path === '/market') || null, [features]);

  const FeatureCard = ({ feature, compact = false }) => {
    if (!feature) return null;
    const Icon = feature.icon;
    // Keep layout consistent: two compact cards (with gap=3 => 24px) should match one normal card.
    const normalCardMinHeight = 368;
    const compactCardMinHeight = 172; // (368 - 24) / 2

    return (
      <Card
        elevation={0}
        sx={{
          height: '100%',
          minHeight: compact ? compactCardMinHeight : normalCardMinHeight,
          borderRadius: 3,
          border: '1px solid',
          borderColor: 'divider',
          transition: 'all 0.3s ease',
          opacity: feature.isAI ? 1 : 0.88,
          '&:hover': {
            transform: feature.isAI ? 'scale(1.05)' : 'scale(1.02)',
            boxShadow: '0 12px 24px rgba(0,0,0,0.15)',
            borderColor: feature.color,
            zIndex: 1
          }
        }}
      >
        <CardActionArea onClick={() => navigate(feature.path)} sx={{ height: '100%' }}>
          <CardContent
            sx={{
              p: compact ? 2.5 : 3,
              textAlign: 'center',
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center'
            }}
          >
            <Box
              sx={{
                width: feature.isAI ? (compact ? 68 : 80) : (compact ? 56 : 64),
                height: feature.isAI ? (compact ? 68 : 80) : (compact ? 56 : 64),
                borderRadius: 3,
                background: feature.gradient,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto',
                mb: compact ? 1.5 : 2
              }}
            >
              <Icon sx={{ fontSize: feature.isAI ? (compact ? 34 : 40) : (compact ? 28 : 32), color: 'white' }} />
            </Box>
            <Typography
              variant="h5"
              gutterBottom
              sx={{
                fontWeight: feature.isAI ? 800 : 600,
                color: 'text.primary',
                fontSize: feature.isAI
                  ? { xs: '1.05rem', sm: '1.15rem', md: '1.2rem' }
                  : { xs: '1rem', sm: (compact ? '1.02rem' : '1.08rem') },
                mb: compact ? 0.5 : undefined
              }}
            >
              <Box
                component="span"
                sx={{
                  display: '-webkit-box',
                  WebkitLineClamp: compact ? 2 : 2,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                  wordBreak: 'break-word'
                }}
              >
                {feature.title}
              </Box>
            </Typography>
            {feature.isAI && (
              <Chip
                icon={<AutoAwesome />}
                label="AI"
                size="small"
                sx={{ mb: compact ? 0.75 : 1, bgcolor: 'rgba(156,39,176,0.08)', fontWeight: 700 }}
              />
            )}
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{
                lineHeight: 1.6,
                display: '-webkit-box',
                WebkitLineClamp: compact ? 2 : 3,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
                wordBreak: 'break-word'
              }}
            >
              {feature.description}
            </Typography>
          </CardContent>
        </CardActionArea>
      </Card>
    );
  };
  
  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'transparent' }}>
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
          <IconButton
            color="inherit"
            onClick={() => navigate('/profile')}
            aria-label="Profile"
            sx={{ mr: 0.5 }}
          >
            <AccountCircle />
          </IconButton>
          <NotificationBell />
          <Button color="inherit" startIcon={<Logout />} onClick={onLogout}>
            Logout
          </Button>
        </Toolbar>
      </AppBar>

      <Container
        maxWidth="xl"
        sx={{
          py: 6,
          // Slightly wider than default xl for roomy dashboard layout
          maxWidth: '1500px'
        }}
      >
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
            AI-first farming assistant for crop intelligence, disease detection, and decision support.
          </Typography>
          <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: 1 }}>
            <Chip icon={<AutoAwesome />} label="AI-driven insights" color="primary" variant="outlined" />
            <Chip label="Vision: Disease detection" variant="outlined" />
            <Chip label="ML: Crop prediction" variant="outlined" />
            <Chip label="Advisory: Fertilizer guidance" variant="outlined" />
            <Chip label="Signals: Weather + Market" variant="outlined" />
          </Box>
        </Box>

        <Paper
          elevation={0}
          sx={{
            p: { xs: 3, md: 4 },
            mb: 5,
            borderRadius: 4,
            border: '1px solid',
            borderColor: 'divider',
            background: 'linear-gradient(135deg, #F3E5F5 0%, #E3F2FD 100%)'
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
            <WarningAmber sx={{ color: '#E65100' }} />
            <Typography variant="h5" sx={{ fontWeight: 700 }}>
              AI Risk Radar
            </Typography>
          </Box>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            Real-time decision support combining weather + mandi signals for your location and crop.
          </Typography>

          {riskLoading && (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
              <CircularProgress />
            </Box>
          )}

          {!riskLoading && riskError && (
            <Alert severity="warning" sx={{ mb: 2 }}>
              {riskError}
            </Alert>
          )}

          {!riskLoading && riskSummary && (
            <>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5, mb: 3 }}>
                <Chip label={`Location: ${riskSummary.location}, ${riskSummary.state}`} variant="outlined" />
                <FormControl size="small" sx={{ minWidth: 200, bgcolor: 'white' }}>
                  <InputLabel>Category</InputLabel>
                  <Select
                    value={selectedRiskCategory}
                    label="Category"
                    onChange={(e) => setSelectedRiskCategory(e.target.value)}
                  >
                    {riskCategories.map((category) => (
                      <MenuItem key={category.id} value={category.id}>
                        {category.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <FormControl size="small" sx={{ minWidth: 220, bgcolor: 'white' }}>
                  <InputLabel>Primary Crop</InputLabel>
                  <Select
                    value={selectedRiskCrop || riskSummary.crop || ''}
                    label="Primary Crop"
                    onChange={(e) => setSelectedRiskCrop(e.target.value)}
                  >
                    {riskCropOptions.map((crop) => (
                      <MenuItem key={crop} value={crop}>
                        {crop}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <Chip
                  label={`Overall Risk: ${String(riskSummary.overallLevel || 'low').toUpperCase()}`}
                  sx={{
                    bgcolor: riskColors[riskSummary.overallLevel || 'low'].accent,
                    color: 'white',
                    fontWeight: 700
                  }}
                />
              </Box>

              <Grid container spacing={2.5}>
                {(riskSummary.alerts || []).map((alert) => {
                  const palette = riskColors[alert.level] || riskColors.low;
                  const Icon = riskIcons[alert.id] || WarningAmber;

                  return (
                    <Grid item xs={12} sm={6} lg={3} key={alert.id}>
                      <Card
                        elevation={0}
                        sx={{
                          height: '100%',
                          borderRadius: 3,
                          border: '1px solid',
                          borderColor: palette.border,
                          background: palette.background
                        }}
                      >
                        <CardContent sx={{ p: 2.5 }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                            <Box
                              sx={{
                                width: 52,
                                height: 52,
                                borderRadius: 2.5,
                                bgcolor: 'rgba(255,255,255,0.72)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                              }}
                            >
                              <Icon sx={{ color: palette.accent, fontSize: 28 }} />
                            </Box>
                            <Chip
                              label={alert.label}
                              size="small"
                              sx={{
                                bgcolor: palette.accent,
                                color: 'white',
                                fontWeight: 700
                              }}
                            />
                          </Box>
                          <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
                            {alert.title}
                          </Typography>
                          <Typography variant="body2" sx={{ color: 'text.primary', mb: 1.5, lineHeight: 1.6 }}>
                            {alert.summary}
                          </Typography>
                          <Typography variant="caption" sx={{ display: 'block', color: 'text.secondary', mb: 1 }}>
                            {alert.details}
                          </Typography>
                          <Typography variant="body2" sx={{ fontWeight: 600, color: palette.accent }}>
                            {alert.action}
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                  );
                })}
              </Grid>
            </>
          )}
        </Paper>

        {/* Feature Cards */}
        <Grid container spacing={3} alignItems="flex-start">
          {/* Signals */}
          <Grid item xs={12} md={3}>
            <Paper
              elevation={0}
              sx={{
                p: { xs: 2.5, md: 3 },
                borderRadius: 4,
                border: '1px solid',
                borderColor: 'divider',
                background: 'linear-gradient(135deg, #F3FAFF 0%, #EAF5FF 100%)'
              }}
            >
              <Typography
                variant="subtitle1"
                sx={{
                  fontWeight: 800,
                  color: 'primary.main',
                  textAlign: 'center',
                  mb: 2,
                  letterSpacing: 0.3
                }}
              >
                Signals
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6} md={12}>
                  <FeatureCard feature={weatherFeature} compact />
                </Grid>
                <Grid item xs={12} sm={6} md={12}>
                  <FeatureCard feature={marketFeature} compact />
                </Grid>
              </Grid>
            </Paper>
          </Grid>

          {/* AI Powered Tools */}
          <Grid item xs={12} md={9}>
            <Paper
              elevation={0}
              sx={{
                p: { xs: 2.5, md: 3 },
                borderRadius: 4,
                border: '1px solid',
                borderColor: 'divider',
                background: 'linear-gradient(135deg, #FBF3FF 0%, #F2F8FF 100%)'
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1, mb: 2 }}>
                <AutoAwesome sx={{ color: '#7B1FA2' }} />
                <Typography
                  variant="subtitle1"
                  sx={{
                    fontWeight: 800,
                    color: '#7B1FA2',
                    textAlign: 'center',
                    letterSpacing: 0.3
                  }}
                >
                  AI Powered Tools
                </Typography>
              </Box>

              <Box
                sx={{
                  display: 'grid',
                  gap: 2,
                  gridTemplateColumns: {
                    xs: '1fr',
                    sm: 'repeat(2, minmax(0, 1fr))',
                    md: 'repeat(5, minmax(0, 1fr))'
                  }
                }}
              >
                {aiFeatures.map((feature) => (
                  <Box key={feature.path} sx={{ display: 'flex' }}>
                    <FeatureCard feature={feature} />
                  </Box>
                ))}
              </Box>
            </Paper>
          </Grid>
        </Grid>

        <Paper
          elevation={0}
          sx={{
            mt: 3,
            p: 3,
            borderRadius: 3,
            border: '1px solid',
            borderColor: 'divider',
            background: 'linear-gradient(135deg, #FFF4E8 0%, #FFE8CC 100%)'
          }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 700, color: '#E65100' }}>
                Farmer Marketplace Listings
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Create produce listings and manage customer bargaining requests from one place.
              </Typography>
            </Box>
            <Button
              variant="contained"
              startIcon={<Storefront />}
              sx={{ bgcolor: '#E65100', '&:hover': { bgcolor: '#BF360C' } }}
              onClick={() => navigate('/marketplace?mode=create')}
            >
              Create Listing
            </Button>
          </Box>
        </Paper>

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
                Multi-module Intelligence
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
                {aiFeatures.length}+
              </Typography>
              <Typography variant="body1" color="text.secondary">
                AI Workflows
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
                Live
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Signals + Recommendations
              </Typography>
            </Card>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default Dashboard;
