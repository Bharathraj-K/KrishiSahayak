import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  TextField,
  Grid,
  Card,
  CardContent,
  Chip,
  Button,
  Alert,
  CircularProgress,
  Tabs,
  Tab,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Paper,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  TrendingUp,
  TrendingDown,
  TrendingFlat,
  ShowChart,
  Search,
  Category,
  CompareArrows,
  NotificationsActive,
  Delete,
  Refresh,
} from '@mui/icons-material';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import api from '../services/api.web';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const MarketScreen = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedCrop, setSelectedCrop] = useState('');
  const [crops, setCrops] = useState([]);
  const [prices, setPrices] = useState([]);
  const [insights, setInsights] = useState(null);
  const [historical, setHistorical] = useState([]);
  const [comparison, setComparison] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [alertDialogOpen, setAlertDialogOpen] = useState(false);
  const [newAlert, setNewAlert] = useState({
    commodity: '',
    targetPrice: '',
    condition: 'above'
  });

  // Fetch categories on mount
  useEffect(() => {
    fetchCategories();
    fetchAlerts();
  }, []);

  // Fetch crops when category changes
  useEffect(() => {
    if (selectedCategory) {
      fetchCropsByCategory(selectedCategory);
    }
  }, [selectedCategory]);

  // Fetch prices when crop changes
  useEffect(() => {
    if (selectedCrop) {
      fetchPrices(selectedCrop);
      fetchHistorical(selectedCrop);
    }
  }, [selectedCrop]);

  const fetchCategories = async () => {
    try {
      const response = await api.get('/market/categories');
      setCategories(response.data.data.categories);
      if (response.data.data.categories.length > 0) {
        setSelectedCategory(response.data.data.categories[0].id);
      }
    } catch (err) {
      setError('Failed to load categories');
    }
  };

  const fetchCropsByCategory = async (category) => {
    try {
      const response = await api.get(`/market/categories/${category}`);
      setCrops(response.data.data.crops);
      if (response.data.data.crops.length > 0) {
        setSelectedCrop(response.data.data.crops[0]);
      }
    } catch (err) {
      setError('Failed to load crops');
    }
  };

  const fetchPrices = async (commodity) => {
    setLoading(true);
    setError('');
    try {
      const response = await api.get(`/market/prices?commodity=${encodeURIComponent(commodity)}&limit=20`);
      setPrices(response.data.data.prices);
      setInsights(response.data.data.insights);
    } catch (err) {
      setError('Failed to fetch market prices');
    } finally {
      setLoading(false);
    }
  };

  const fetchHistorical = async (commodity, days = 30) => {
    try {
      const response = await api.get(`/market/historical?commodity=${encodeURIComponent(commodity)}&days=${days}`);
      setHistorical(response.data.data.historical);
    } catch (err) {
      console.error('Failed to fetch historical data:', err);
    }
  };

  const fetchComparison = async (commodity) => {
    setLoading(true);
    try {
      const response = await api.get(`/market/comparison?commodity=${encodeURIComponent(commodity)}`);
      setComparison(response.data.data.comparison);
    } catch (err) {
      setError('Failed to fetch price comparison');
    } finally {
      setLoading(false);
    }
  };

  const fetchAlerts = async () => {
    try {
      const response = await api.get('/market/alerts');
      setAlerts(response.data.data.alerts);
    } catch (err) {
      console.error('Failed to fetch alerts:', err);
    }
  };

  const createAlert = async () => {
    try {
      await api.post('/market/alerts', newAlert);
      setAlertDialogOpen(false);
      setNewAlert({ commodity: '', targetPrice: '', condition: 'above' });
      fetchAlerts();
    } catch (err) {
      setError('Failed to create alert');
    }
  };

  const deleteAlert = async (alertId) => {
    try {
      await api.delete(`/market/alerts/${alertId}`);
      fetchAlerts();
    } catch (err) {
      setError('Failed to delete alert');
    }
  };

  const handleSearch = () => {
    if (searchQuery.trim()) {
      fetchPrices(searchQuery);
      fetchHistorical(searchQuery);
    }
  };

  const handleRefresh = () => {
    if (selectedCrop) {
      fetchPrices(selectedCrop);
      fetchHistorical(selectedCrop);
    }
  };

  // Chart configuration
  const chartData = {
    labels: historical.map(h => h.date),
    datasets: [
      {
        label: `${selectedCrop} Price Trend`,
        data: historical.map(h => h.price),
        borderColor: '#4CAF50',
        backgroundColor: 'rgba(76, 175, 80, 0.1)',
        fill: true,
        tension: 0.4,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: '30-Day Price Trend',
      },
    },
    scales: {
      y: {
        beginAtZero: false,
        ticks: {
          callback: (value) => `₹${value}`,
        },
      },
    },
  };

  const getTrendIcon = (trend) => {
    switch (trend) {
      case 'up':
        return <TrendingUp sx={{ color: 'success.main' }} />;
      case 'down':
        return <TrendingDown sx={{ color: 'error.main' }} />;
      default:
        return <TrendingFlat sx={{ color: 'text.secondary' }} />;
    }
  };

  const getTrendColor = (trend) => {
    switch (trend) {
      case 'up':
        return 'success';
      case 'down':
        return 'error';
      default:
        return 'default';
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom>
        <ShowChart sx={{ fontSize: 40, verticalAlign: 'middle', mr: 1 }} />
        Market Prices
      </Typography>

      {error && (
        <Alert severity="error" onClose={() => setError('')} sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* Category and Crop Selection */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={4}>
            <FormControl fullWidth>
              <InputLabel>Category</InputLabel>
              <Select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                label="Category"
              >
                {categories.map((cat) => (
                  <MenuItem key={cat.id} value={cat.id}>
                    {cat.name} ({cat.count})
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={4}>
            <FormControl fullWidth>
              <InputLabel>Crop</InputLabel>
              <Select
                value={selectedCrop}
                onChange={(e) => setSelectedCrop(e.target.value)}
                label="Crop"
              >
                {crops.map((crop) => (
                  <MenuItem key={crop} value={crop}>
                    {crop}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={4}>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <TextField
                fullWidth
                placeholder="Search any crop..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              />
              <IconButton color="primary" onClick={handleSearch}>
                <Search />
              </IconButton>
              <IconButton color="primary" onClick={handleRefresh}>
                <Refresh />
              </IconButton>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* Tabs */}
      <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)} sx={{ mb: 2 }}>
        <Tab label="Current Prices" />
        <Tab label="Price Trends" />
        <Tab label="Comparison" />
        <Tab label="Price Alerts" />
      </Tabs>

      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      )}

      {/* Tab 0: Current Prices */}
      {activeTab === 0 && !loading && (
        <>
          {/* Market Insights */}
          {insights && (
            <Alert severity="info" icon={<ShowChart />} sx={{ mb: 3 }}>
              <Typography variant="subtitle1" fontWeight="bold">
                {insights.summary}
              </Typography>
              {insights.recommendations?.map((rec, idx) => (
                <Typography key={idx} variant="body2" sx={{ mt: 1 }}>
                  • {rec.message}
                </Typography>
              ))}
            </Alert>
          )}

          {/* Price Cards */}
          <Grid container spacing={2}>
            {prices.map((price, idx) => (
              <Grid item xs={12} md={6} key={idx}>
                <Card>
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="h6">{price.commodity}</Typography>
                      <Chip
                        label={price.trend}
                        color={getTrendColor(price.trend)}
                        size="small"
                        icon={getTrendIcon(price.trend)}
                      />
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                      {price.market}, {price.district}, {price.state}
                    </Typography>
                    <Box sx={{ mt: 2 }}>
                      <Typography variant="h4" color="primary">
                        ₹{price.modalPrice}
                        <Typography component="span" variant="body2" sx={{ ml: 1 }}>
                          / {price.unit}
                        </Typography>
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
                        <Typography variant="body2">
                          Min: ₹{price.minPrice}
                        </Typography>
                        <Typography variant="body2">
                          Max: ₹{price.maxPrice}
                        </Typography>
                        <Typography
                          variant="body2"
                          color={price.priceChange >= 0 ? 'success.main' : 'error.main'}
                        >
                          {price.priceChange >= 0 ? '+' : ''}{price.priceChange}%
                        </Typography>
                      </Box>
                      <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                        {new Date(price.date).toLocaleDateString()}
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </>
      )}

      {/* Tab 1: Price Trends */}
      {activeTab === 1 && !loading && historical.length > 0 && (
        <Paper sx={{ p: 3 }}>
          <Line data={chartData} options={chartOptions} />
        </Paper>
      )}

      {/* Tab 2: Comparison */}
      {activeTab === 2 && (
        <Box>
          <Button
            variant="contained"
            onClick={() => fetchComparison(selectedCrop)}
            sx={{ mb: 2 }}
          >
            Compare Prices Across States
          </Button>
          {comparison.length > 0 && (
            <Grid container spacing={2}>
              {comparison.map((item, idx) => (
                <Grid item xs={12} md={4} key={idx}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6">{item.state}</Typography>
                      <Typography variant="h4" color="primary" sx={{ my: 1 }}>
                        ₹{item.avgPrice}
                      </Typography>
                      <Typography variant="body2">Avg. Price / Quintal</Typography>
                      <Box sx={{ mt: 1 }}>
                        <Typography variant="caption" display="block">
                          Range: ₹{item.minPrice} - ₹{item.maxPrice}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {item.marketCount} markets
                        </Typography>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </Box>
      )}

      {/* Tab 3: Price Alerts */}
      {activeTab === 3 && (
        <Box>
          <Button
            variant="contained"
            startIcon={<NotificationsActive />}
            onClick={() => setAlertDialogOpen(true)}
            sx={{ mb: 2 }}
          >
            Create Price Alert
          </Button>

          <List>
            {alerts.map((alert, idx) => (
              <ListItem
                key={idx}
                secondaryAction={
                  <IconButton edge="end" onClick={() => deleteAlert(idx)}>
                    <Delete />
                  </IconButton>
                }
              >
                <ListItemText
                  primary={`${alert.commodity} - ₹${alert.targetPrice}`}
                  secondary={`Alert when price goes ${alert.condition} target`}
                />
              </ListItem>
            ))}
            {alerts.length === 0 && (
              <Typography variant="body2" color="text.secondary" sx={{ p: 2 }}>
                No price alerts set. Create one to get notified!
              </Typography>
            )}
          </List>
        </Box>
      )}

      {/* Create Alert Dialog */}
      <Dialog open={alertDialogOpen} onClose={() => setAlertDialogOpen(false)}>
        <DialogTitle>Create Price Alert</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Commodity"
            value={newAlert.commodity}
            onChange={(e) => setNewAlert({ ...newAlert, commodity: e.target.value })}
            sx={{ mt: 2, mb: 2 }}
          />
          <TextField
            fullWidth
            label="Target Price"
            type="number"
            value={newAlert.targetPrice}
            onChange={(e) => setNewAlert({ ...newAlert, targetPrice: e.target.value })}
            sx={{ mb: 2 }}
          />
          <FormControl fullWidth>
            <InputLabel>Condition</InputLabel>
            <Select
              value={newAlert.condition}
              onChange={(e) => setNewAlert({ ...newAlert, condition: e.target.value })}
              label="Condition"
            >
              <MenuItem value="above">Price goes above</MenuItem>
              <MenuItem value="below">Price goes below</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAlertDialogOpen(false)}>Cancel</Button>
          <Button onClick={createAlert} variant="contained">
            Create Alert
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default MarketScreen;
