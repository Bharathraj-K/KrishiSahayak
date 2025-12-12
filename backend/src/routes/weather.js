const express = require('express');
const WeatherController = require('../controllers/weatherController');
const { protect } = require('../middleware/auth');

const router = express.Router();

// All weather routes require authentication
router.use(protect);

// Get current weather by city
router.get('/current', WeatherController.getCurrentWeather);

// Get current weather by coordinates
router.get('/current/coords', WeatherController.getCurrentWeatherByCoords);

// Get 5-day forecast by city
router.get('/forecast', WeatherController.getForecast);

// Get 5-day forecast by coordinates
router.get('/forecast/coords', WeatherController.getForecastByCoords);

// Get weather for user's profile location
router.get('/my-location', WeatherController.getUserLocationWeather);

module.exports = router;
