const axios = require('axios');

class WeatherService {
  constructor() {
    this.apiKey = process.env.OPENWEATHER_API_KEY;
    this.baseUrl = 'https://api.openweathermap.org/data/2.5';
  }

  /**
   * Get current weather by city name
   */
  async getCurrentWeather(city, country = 'IN') {
    try {
      const response = await axios.get(`${this.baseUrl}/weather`, {
        params: {
          q: `${city},${country}`,
          appid: this.apiKey,
          units: 'metric'
        }
      });

      return this.formatCurrentWeather(response.data);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get current weather by coordinates
   */
  async getCurrentWeatherByCoords(lat, lon) {
    try {
      const response = await axios.get(`${this.baseUrl}/weather`, {
        params: {
          lat,
          lon,
          appid: this.apiKey,
          units: 'metric'
        }
      });

      return this.formatCurrentWeather(response.data);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get 5-day forecast by city name
   */
  async getForecast(city, country = 'IN') {
    try {
      const response = await axios.get(`${this.baseUrl}/forecast`, {
        params: {
          q: `${city},${country}`,
          appid: this.apiKey,
          units: 'metric'
        }
      });

      return this.formatForecast(response.data);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get 5-day forecast by coordinates
   */
  async getForecastByCoords(lat, lon) {
    try {
      const response = await axios.get(`${this.baseUrl}/forecast`, {
        params: {
          lat,
          lon,
          appid: this.apiKey,
          units: 'metric'
        }
      });

      return this.formatForecast(response.data);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Format current weather data
   */
  formatCurrentWeather(data) {
    return {
      location: {
        name: data.name,
        country: data.sys.country,
        coordinates: {
          lat: data.coord.lat,
          lon: data.coord.lon
        }
      },
      current: {
        temperature: Math.round(data.main.temp),
        feelsLike: Math.round(data.main.feels_like),
        tempMin: Math.round(data.main.temp_min),
        tempMax: Math.round(data.main.temp_max),
        humidity: data.main.humidity,
        pressure: data.main.pressure,
        description: data.weather[0].description,
        main: data.weather[0].main,
        icon: data.weather[0].icon,
        windSpeed: data.wind.speed,
        windDirection: data.wind.deg,
        cloudiness: data.clouds.all,
        visibility: data.visibility,
        sunrise: new Date(data.sys.sunrise * 1000),
        sunset: new Date(data.sys.sunset * 1000)
      },
      timestamp: new Date(data.dt * 1000),
      farmingAdvice: this.generateFarmingAdvice(data)
    };
  }

  /**
   * Format forecast data
   */
  formatForecast(data) {
    const dailyForecasts = {};

    // Group forecasts by day
    data.list.forEach(item => {
      const date = new Date(item.dt * 1000).toLocaleDateString();
      
      if (!dailyForecasts[date]) {
        dailyForecasts[date] = {
          date: new Date(item.dt * 1000),
          temps: [],
          conditions: [],
          humidity: [],
          rainfall: 0
        };
      }

      dailyForecasts[date].temps.push(item.main.temp);
      dailyForecasts[date].conditions.push(item.weather[0].main);
      dailyForecasts[date].humidity.push(item.main.humidity);
      
      if (item.rain && item.rain['3h']) {
        dailyForecasts[date].rainfall += item.rain['3h'];
      }
    });

    // Format daily summaries
    const forecast = Object.values(dailyForecasts).slice(0, 5).map(day => ({
      date: day.date,
      tempMin: Math.round(Math.min(...day.temps)),
      tempMax: Math.round(Math.max(...day.temps)),
      avgTemp: Math.round(day.temps.reduce((a, b) => a + b, 0) / day.temps.length),
      avgHumidity: Math.round(day.humidity.reduce((a, b) => a + b, 0) / day.humidity.length),
      condition: this.getMostCommonCondition(day.conditions),
      rainfall: Math.round(day.rainfall * 10) / 10
    }));

    return {
      location: {
        name: data.city.name,
        country: data.city.country,
        coordinates: {
          lat: data.city.coord.lat,
          lon: data.city.coord.lon
        }
      },
      forecast,
      weeklyAdvice: this.generateWeeklyAdvice(forecast)
    };
  }

  /**
   * Get most common weather condition
   */
  getMostCommonCondition(conditions) {
    const counts = {};
    conditions.forEach(c => counts[c] = (counts[c] || 0) + 1);
    return Object.keys(counts).reduce((a, b) => counts[a] > counts[b] ? a : b);
  }

  /**
   * Generate farming advice based on current weather
   */
  generateFarmingAdvice(data) {
    const advice = [];
    const temp = data.main.temp;
    const humidity = data.main.humidity;
    const rain = data.weather[0].main.toLowerCase();

    // Temperature advice
    if (temp > 35) {
      advice.push({
        type: 'warning',
        message: 'High temperature alert! Ensure adequate irrigation and shade for crops.',
        icon: '🌡️'
      });
    } else if (temp < 10) {
      advice.push({
        type: 'warning',
        message: 'Low temperature warning. Protect sensitive crops from cold stress.',
        icon: '❄️'
      });
    } else if (temp >= 20 && temp <= 30) {
      advice.push({
        type: 'info',
        message: 'Ideal temperature for most crops. Good time for planting and maintenance.',
        icon: '✅'
      });
    }

    // Rainfall advice
    if (rain.includes('rain')) {
      advice.push({
        type: 'info',
        message: 'Rainfall expected. Postpone irrigation and pesticide application.',
        icon: '🌧️'
      });
    }

    // Humidity advice
    if (humidity > 80) {
      advice.push({
        type: 'warning',
        message: 'High humidity may increase fungal disease risk. Monitor crops closely.',
        icon: '💧'
      });
    } else if (humidity < 30) {
      advice.push({
        type: 'info',
        message: 'Low humidity. Increase irrigation frequency.',
        icon: '🏜️'
      });
    }

    return advice;
  }

  /**
   * Generate weekly farming advice
   */
  generateWeeklyAdvice(forecast) {
    const advice = [];
    const avgTemp = forecast.reduce((sum, day) => sum + day.avgTemp, 0) / forecast.length;
    const totalRainfall = forecast.reduce((sum, day) => sum + day.rainfall, 0);
    const rainyDays = forecast.filter(day => day.rainfall > 0).length;

    if (totalRainfall > 50) {
      advice.push({
        type: 'warning',
        message: `Heavy rainfall expected this week (${totalRainfall}mm). Ensure proper drainage.`,
        icon: '⛈️'
      });
    } else if (totalRainfall < 5) {
      advice.push({
        type: 'info',
        message: 'Dry week ahead. Plan irrigation schedule accordingly.',
        icon: '☀️'
      });
    }

    if (avgTemp > 32) {
      advice.push({
        type: 'warning',
        message: 'Hot week expected. Consider mulching to conserve soil moisture.',
        icon: '🌡️'
      });
    }

    if (rainyDays >= 3) {
      advice.push({
        type: 'info',
        message: 'Multiple rainy days ahead. Good time for transplanting rice/vegetables.',
        icon: '🌱'
      });
    }

    return advice;
  }

  /**
   * Handle API errors
   */
  handleError(error) {
    if (error.response) {
      const status = error.response.status;
      if (status === 404) {
        return new Error('Location not found. Please check the city name.');
      } else if (status === 401) {
        return new Error('Weather service authentication failed. Please check API key.');
      } else if (status === 429) {
        return new Error('Too many requests. Please try again later.');
      }
    }
    return new Error('Weather service temporarily unavailable. Please try again later.');
  }
}

module.exports = new WeatherService();
