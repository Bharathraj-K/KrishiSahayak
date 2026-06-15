import React, { useState, useEffect, useCallback } from 'react';
import {
  Container,
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  TextField,
  Button,
  CircularProgress,
  Alert,
  Chip,
  Divider,
} from '@mui/material';
import {
  WbSunny,
  Cloud,
  Opacity,
  Air,
  Visibility,
  ThermostatAuto,
  LocationOn,
  Search,
  WbTwilight,
  NightsStay,
} from '@mui/icons-material';
import api from '../services/api.web';

const DEFAULT_WEATHER_CITY = 'Noida';

const WeatherScreen = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [city, setCity] = useState(DEFAULT_WEATHER_CITY);
  const [currentWeather, setCurrentWeather] = useState(null);
  const [forecast, setForecast] = useState(null);

  const searchWeather = useCallback(async (targetCityInput) => {
    const targetCity = String(targetCityInput || '').trim();

    if (!targetCity) {
      setError('Please enter a city name');
      return;
    }

    try {
      setLoading(true);
      setError('');

      const [weatherResponse, forecastResponse] = await Promise.all([
        api.get(`/weather/current?city=${encodeURIComponent(targetCity)}`),
        api.get(`/weather/forecast?city=${encodeURIComponent(targetCity)}`)
      ]);

      if (weatherResponse.data.success) {
        setCurrentWeather(weatherResponse.data.data);
        setCity(targetCity);
      }

      if (forecastResponse.data.success) {
        setForecast(forecastResponse.data.data);
      }
    } catch (error) {
      setError(error.response?.data?.error?.message || 'Failed to fetch weather data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    searchWeather(DEFAULT_WEATHER_CITY);
  }, [searchWeather]);

  const getWeatherIcon = (condition) => {
    const icons = {
      Clear: <WbSunny sx={{ fontSize: 60, color: '#FDB813' }} />,
      Clouds: <Cloud sx={{ fontSize: 60, color: '#95A5A6' }} />,
      Rain: <Opacity sx={{ fontSize: 60, color: '#3498DB' }} />,
      Snow: <Cloud sx={{ fontSize: 60, color: '#ECF0F1' }} />,
      Mist: <Cloud sx={{ fontSize: 60, color: '#BDC3C7' }} />,
    };
    return icons[condition] || <Cloud sx={{ fontSize: 60 }} />;
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-IN', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom>
        Weather Forecast 🌤️
      </Typography>
      <Typography variant="body2" color="text.secondary" gutterBottom>
        Get accurate weather forecasts and farming advice
      </Typography>
      <Typography variant="body2" color="text.secondary" gutterBottom>
        Default city: {DEFAULT_WEATHER_CITY}
      </Typography>

      {/* Search Box */}
      <Paper sx={{ p: 2, mt: 3 }}>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <TextField
            fullWidth
            placeholder="Enter city name (e.g., Mumbai, Delhi)"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && searchWeather(city)}
            InputProps={{
              startAdornment: <LocationOn sx={{ mr: 1, color: 'text.secondary' }} />
            }}
          />
          <Button
            variant="contained"
            onClick={() => searchWeather(city)}
            disabled={loading}
            startIcon={loading ? <CircularProgress size={20} /> : <Search />}
            sx={{ minWidth: 120 }}
          >
            Search
          </Button>
        </Box>
      </Paper>

      {error && (
        <Alert severity="error" sx={{ mt: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {/* Current Weather */}
      {currentWeather && (
        <Paper sx={{ p: 3, mt: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <LocationOn sx={{ mr: 1, color: 'primary.main' }} />
            <Typography variant="h5">
              {currentWeather.location.name}, {currentWeather.location.country}
            </Typography>
          </Box>

          <Grid container spacing={3}>
            {/* Main Weather */}
            <Grid item xs={12} md={6}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                {getWeatherIcon(currentWeather.current.main)}
                <Box>
                  <Typography variant="h2" sx={{ fontWeight: 'bold' }}>
                    {currentWeather.current.temperature}°C
                  </Typography>
                  <Typography variant="h6" color="text.secondary" sx={{ textTransform: 'capitalize' }}>
                    {currentWeather.current.description}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Feels like {currentWeather.current.feelsLike}°C
                  </Typography>
                </Box>
              </Box>
            </Grid>

            {/* Weather Details */}
            <Grid item xs={12} md={6}>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <ThermostatAuto color="error" />
                    <Box>
                      <Typography variant="body2" color="text.secondary">High / Low</Typography>
                      <Typography variant="body1">{currentWeather.current.tempMax}° / {currentWeather.current.tempMin}°</Typography>
                    </Box>
                  </Box>
                </Grid>
                <Grid item xs={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Opacity color="info" />
                    <Box>
                      <Typography variant="body2" color="text.secondary">Humidity</Typography>
                      <Typography variant="body1">{currentWeather.current.humidity}%</Typography>
                    </Box>
                  </Box>
                </Grid>
                <Grid item xs={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Air color="primary" />
                    <Box>
                      <Typography variant="body2" color="text.secondary">Wind Speed</Typography>
                      <Typography variant="body1">{currentWeather.current.windSpeed} m/s</Typography>
                    </Box>
                  </Box>
                </Grid>
                <Grid item xs={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Visibility color="action" />
                    <Box>
                      <Typography variant="body2" color="text.secondary">Visibility</Typography>
                      <Typography variant="body1">{(currentWeather.current.visibility / 1000).toFixed(1)} km</Typography>
                    </Box>
                  </Box>
                </Grid>
              </Grid>

              <Box sx={{ mt: 2, display: 'flex', gap: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <WbTwilight color="warning" fontSize="small" />
                  <Typography variant="caption">
                    {new Date(currentWeather.current.sunrise).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <NightsStay color="primary" fontSize="small" />
                  <Typography variant="caption">
                    {new Date(currentWeather.current.sunset).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                  </Typography>
                </Box>
              </Box>
            </Grid>
          </Grid>

          {/* Farming Advice */}
          {currentWeather.farmingAdvice && currentWeather.farmingAdvice.length > 0 && (
            <>
              <Divider sx={{ my: 3 }} />
              <Typography variant="h6" gutterBottom>
                Farming Advice
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                {currentWeather.farmingAdvice.map((advice, index) => (
                  <Alert
                    key={index}
                    severity={advice.type === 'warning' ? 'warning' : 'info'}
                    icon={<span style={{ fontSize: 20 }}>{advice.icon}</span>}
                  >
                    {advice.message}
                  </Alert>
                ))}
              </Box>
            </>
          )}
        </Paper>
      )}

      {/* 5-Day Forecast */}
      {forecast && forecast.forecast && (
        <Box sx={{ mt: 3 }}>
          <Typography variant="h5" gutterBottom>
            5-Day Forecast
          </Typography>
          <Grid container spacing={2}>
            {forecast.forecast.map((day, index) => (
              <Grid item xs={12} sm={6} md={2.4} key={index}>
                <Card>
                  <CardContent>
                    <Typography variant="subtitle2" align="center" gutterBottom>
                      {formatDate(day.date)}
                    </Typography>
                    <Box sx={{ display: 'flex', justifyContent: 'center', my: 1 }}>
                      {getWeatherIcon(day.condition)}
                    </Box>
                    <Typography variant="body2" align="center" color="text.secondary" gutterBottom>
                      {day.condition}
                    </Typography>
                    <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1 }}>
                      <Chip label={`${day.tempMax}°`} size="small" color="error" />
                      <Chip label={`${day.tempMin}°`} size="small" color="primary" />
                    </Box>
                    {day.rainfall > 0 && (
                      <Typography variant="caption" display="block" align="center" sx={{ mt: 1 }}>
                        💧 {day.rainfall}mm rain
                      </Typography>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>

          {/* Weekly Advice */}
          {forecast.weeklyAdvice && forecast.weeklyAdvice.length > 0 && (
            <Paper sx={{ p: 2, mt: 2 }}>
              <Typography variant="h6" gutterBottom>
                This Week's Farming Advice
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                {forecast.weeklyAdvice.map((advice, index) => (
                  <Alert
                    key={index}
                    severity={advice.type === 'warning' ? 'warning' : 'info'}
                    icon={<span style={{ fontSize: 20 }}>{advice.icon}</span>}
                  >
                    {advice.message}
                  </Alert>
                ))}
              </Box>
            </Paper>
          )}
        </Box>
      )}

      {loading && !currentWeather && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress />
        </Box>
      )}
    </Container>
  );
};

export default WeatherScreen;
