const weatherService = require('../services/weatherService');
const { catchAsync, sendResponse, createError } = require('../middleware/errorHandler');

class WeatherController {
  /**
   * Get current weather by city
   */
  static getCurrentWeather = catchAsync(async (req, res, next) => {
    const { city, country } = req.query;

    if (!city) {
      return next(createError('City name is required', 400, 'CITY_REQUIRED'));
    }

    const weather = await weatherService.getCurrentWeather(city, country);
    
    sendResponse(res, 200, weather, 'Current weather fetched successfully');
  });

  /**
   * Get current weather by coordinates
   */
  static getCurrentWeatherByCoords = catchAsync(async (req, res, next) => {
    const { lat, lon } = req.query;

    if (!lat || !lon) {
      return next(createError('Latitude and longitude are required', 400, 'COORDS_REQUIRED'));
    }

    const weather = await weatherService.getCurrentWeatherByCoords(
      parseFloat(lat),
      parseFloat(lon)
    );
    
    sendResponse(res, 200, weather, 'Current weather fetched successfully');
  });

  /**
   * Get 5-day forecast by city
   */
  static getForecast = catchAsync(async (req, res, next) => {
    const { city, country } = req.query;

    if (!city) {
      return next(createError('City name is required', 400, 'CITY_REQUIRED'));
    }

    const forecast = await weatherService.getForecast(city, country);
    
    sendResponse(res, 200, forecast, 'Weather forecast fetched successfully');
  });

  /**
   * Get 5-day forecast by coordinates
   */
  static getForecastByCoords = catchAsync(async (req, res, next) => {
    const { lat, lon } = req.query;

    if (!lat || !lon) {
      return next(createError('Latitude and longitude are required', 400, 'COORDS_REQUIRED'));
    }

    const forecast = await weatherService.getForecastByCoords(
      parseFloat(lat),
      parseFloat(lon)
    );
    
    sendResponse(res, 200, forecast, 'Weather forecast fetched successfully');
  });

  /**
   * Get user's location weather (from profile)
   */
  static getUserLocationWeather = catchAsync(async (req, res, next) => {
    const { user } = req;

    // Check if user has coordinates in profile
    if (user.profile?.location?.coordinates && user.profile.location.coordinates.length === 2) {
      const [lon, lat] = user.profile.location.coordinates;
      const weather = await weatherService.getCurrentWeatherByCoords(lat, lon);
      return sendResponse(res, 200, weather, 'Weather for your location fetched successfully');
    }

    // Check if user has city in profile
    if (user.profile?.location?.city) {
      const weather = await weatherService.getCurrentWeather(user.profile.location.city);
      return sendResponse(res, 200, weather, 'Weather for your location fetched successfully');
    }

    // No location data
    return next(createError(
      'No location data in your profile. Please update your profile or provide a city name.',
      400,
      'NO_LOCATION_DATA'
    ));
  });
}

module.exports = WeatherController;
