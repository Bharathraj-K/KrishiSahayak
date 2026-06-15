const weatherService = require('./weatherService');
const marketService = require('./marketService');

const STATE_DEFAULT_CITY_MAP = {
  'Andhra Pradesh': 'Amaravati',
  'Arunachal Pradesh': 'Itanagar',
  Assam: 'Guwahati',
  Bihar: 'Patna',
  Chhattisgarh: 'Raipur',
  Goa: 'Panaji',
  Gujarat: 'Ahmedabad',
  Haryana: 'Chandigarh',
  'Himachal Pradesh': 'Shimla',
  Jharkhand: 'Ranchi',
  Karnataka: 'Bengaluru',
  Kerala: 'Thiruvananthapuram',
  'Madhya Pradesh': 'Bhopal',
  Maharashtra: 'Mumbai',
  Manipur: 'Imphal',
  Meghalaya: 'Shillong',
  Mizoram: 'Aizawl',
  Nagaland: 'Kohima',
  Odisha: 'Bhubaneswar',
  Punjab: 'Chandigarh',
  Rajasthan: 'Jaipur',
  Sikkim: 'Gangtok',
  'Tamil Nadu': 'Chennai',
  Telangana: 'Hyderabad',
  Tripura: 'Agartala',
  'Uttar Pradesh': 'Lucknow',
  Uttarakhand: 'Dehradun',
  'West Bengal': 'Kolkata',
  'Andaman and Nicobar Islands': 'Port Blair',
  Chandigarh: 'Chandigarh',
  'Dadra and Nagar Haveli and Daman and Diu': 'Daman',
  Delhi: 'New Delhi',
  'Jammu and Kashmir': 'Srinagar',
  Ladakh: 'Leh',
  Lakshadweep: 'Kavaratti',
  Puducherry: 'Puducherry'
};

class RiskAlertService {
  resolveLocation(profile = {}) {
    const rawState = (profile?.location?.state || 'Uttar Pradesh').trim();
    const normalizedStateKey = Object.keys(STATE_DEFAULT_CITY_MAP).find(
      (stateName) => stateName.toLowerCase() === rawState.toLowerCase()
    );
    const state = normalizedStateKey || rawState;
    const cityFromProfile = (profile?.location?.city || '').trim();
    const fallbackCity = STATE_DEFAULT_CITY_MAP[state] || 'Lucknow';
    const hasCoordinates =
      Array.isArray(profile?.location?.coordinates) &&
      profile.location.coordinates.length === 2 &&
      Number.isFinite(Number(profile.location.coordinates[0])) &&
      Number.isFinite(Number(profile.location.coordinates[1]));

    return {
      state,
      city: cityFromProfile || fallbackCity,
      coordinates: hasCoordinates
        ? {
            lon: Number(profile.location.coordinates[0]),
            lat: Number(profile.location.coordinates[1])
          }
        : null
    };
  }

  getLevelMeta(level) {
    switch (level) {
      case 'high':
        return { score: 3, color: 'error', label: 'High' };
      case 'medium':
        return { score: 2, color: 'warning', label: 'Medium' };
      default:
        return { score: 1, color: 'success', label: 'Low' };
    }
  }

  normalizeAlert(id, title, level, summary, details, action) {
    return {
      id,
      title,
      level,
      ...this.getLevelMeta(level),
      summary,
      details,
      action
    };
  }

  buildDiseaseRisk(currentWeather, forecastDays) {
    const humidity = currentWeather?.current?.humidity ?? 0;
    const rainyDays = forecastDays.filter((day) => day.rainfall > 0).length;
    const totalRainfall = forecastDays.reduce((sum, day) => sum + (day.rainfall || 0), 0);
    const warmDays = forecastDays.filter((day) => day.avgTemp >= 24 && day.avgTemp <= 32).length;

    let level = 'low';
    if ((humidity >= 85 && totalRainfall >= 15) || (humidity >= 80 && rainyDays >= 2 && warmDays >= 2)) {
      level = 'high';
    } else if (humidity >= 75 || rainyDays >= 2 || totalRainfall >= 10) {
      level = 'medium';
    }

    return this.normalizeAlert(
      'disease-risk',
      'Disease Risk',
      level,
      level === 'high'
        ? 'Warm, humid conditions may strongly favor fungal outbreaks.'
        : level === 'medium'
          ? 'Some weather signals could support disease development.'
          : 'Current conditions are less favorable for rapid disease spread.',
      `Humidity ${humidity}% with ${rainyDays} rainy day(s) and ${totalRainfall.toFixed(1)} mm forecast rainfall.`,
      level === 'high'
        ? 'Inspect leaves daily and avoid overhead irrigation if possible.'
        : 'Monitor crop canopy for spots, mildew, or rot after rainfall.'
    );
  }

  buildHeatRisk(currentWeather, forecastDays) {
    const currentTemp = currentWeather?.current?.temperature ?? 0;
    const maxForecastTemp = forecastDays.reduce((max, day) => Math.max(max, day.tempMax || day.avgTemp || 0), currentTemp);

    let level = 'low';
    if (currentTemp >= 36 || maxForecastTemp >= 38) {
      level = 'high';
    } else if (currentTemp >= 32 || maxForecastTemp >= 34) {
      level = 'medium';
    }

    return this.normalizeAlert(
      'heat-stress',
      'Heat Stress Risk',
      level,
      level === 'high'
        ? 'Crop stress is likely if heat persists through the day.'
        : level === 'medium'
          ? 'Afternoon heat may affect sensitive crops and young plants.'
          : 'Temperature outlook is within a safer range for most crops.',
      `Current ${currentTemp}°C, forecast peak ${maxForecastTemp}°C.`,
      level === 'high'
        ? 'Prioritize irrigation, mulching, and shade for vulnerable crops.'
        : 'Check soil moisture and avoid spraying during peak afternoon heat.'
    );
  }

  buildRainRisk(forecastDays) {
    const rainyDays = forecastDays.filter((day) => day.rainfall > 0).length;
    const totalRainfall = forecastDays.reduce((sum, day) => sum + (day.rainfall || 0), 0);
    const maxDailyRainfall = forecastDays.reduce((max, day) => Math.max(max, day.rainfall || 0), 0);

    let level = 'low';
    if (totalRainfall >= 40 || maxDailyRainfall >= 20 || rainyDays >= 4) {
      level = 'high';
    } else if (totalRainfall >= 15 || maxDailyRainfall >= 8 || rainyDays >= 2) {
      level = 'medium';
    }

    return this.normalizeAlert(
      'rainfall-risk',
      'Rainfall Risk',
      level,
      level === 'high'
        ? 'Heavy rain could disrupt field work and waterlogging-sensitive crops.'
        : level === 'medium'
          ? 'Intermittent rain may affect spraying and irrigation plans.'
          : 'No major rainfall disruption is indicated in the near-term forecast.',
      `${totalRainfall.toFixed(1)} mm across ${rainyDays} rainy day(s); max daily rainfall ${maxDailyRainfall.toFixed(1)} mm.`,
      level === 'high'
        ? 'Check drainage channels and postpone fertilizer or pesticide application.'
        : 'Plan field operations around wet periods and recheck before spraying.'
    );
  }

  buildPriceRisk(prices, commodity, state) {
    if (!Array.isArray(prices) || prices.length === 0) {
      return this.normalizeAlert(
        'price-drop-risk',
        'Price Drop Risk',
        'medium',
        'Live mandi quotes are unavailable right now.',
        `Could not assess ${commodity} prices for ${state}.`,
        'Retry later or compare nearby states before planning a sale.'
      );
    }

    const downCount = prices.filter((price) => price.trend === 'down').length;
    const downRatio = downCount / prices.length;
    const avgPriceChange = prices.reduce((sum, price) => sum + (Number(price.priceChange) || 0), 0) / prices.length;

    let level = 'low';
    if (downRatio >= 0.5 || avgPriceChange <= -4) {
      level = 'high';
    } else if (downRatio >= 0.25 || avgPriceChange <= -1.5) {
      level = 'medium';
    }

    return this.normalizeAlert(
      'price-drop-risk',
      'Price Drop Risk',
      level,
      level === 'high'
        ? 'Many mandi quotes are sitting near the lower end of today’s price band.'
        : level === 'medium'
          ? 'Market signals are mixed and worth watching before selling.'
          : 'Current mandi quotes look comparatively stable for today.',
      `${downCount}/${prices.length} tracked market(s) show downward pressure for ${commodity} in ${state}.`,
      level === 'high'
        ? 'Check comparison markets before selling large quantities today.'
        : 'Track a few nearby mandis for better timing on sale decisions.'
    );
  }

  buildUnavailableAlert(id, title, details, action) {
    return this.normalizeAlert(
      id,
      title,
      'medium',
      'This alert is temporarily unavailable from the live source.',
      details,
      action
    );
  }

  async generateForUser(user, options = {}) {
    const { city, state, coordinates } = this.resolveLocation(user?.profile);
    const crop = options.crop || user?.profile?.farmDetails?.cropsGrown?.[0] || 'Wheat';
    const availableCrops = Array.isArray(user?.profile?.farmDetails?.cropsGrown)
      ? user.profile.farmDetails.cropsGrown.filter(Boolean)
      : [];

    const weatherCurrentPromise = coordinates
      ? weatherService.getCurrentWeatherByCoords(coordinates.lat, coordinates.lon)
      : weatherService.getCurrentWeather(city);
    const weatherForecastPromise = coordinates
      ? weatherService.getForecastByCoords(coordinates.lat, coordinates.lon)
      : weatherService.getForecast(city);

    const [currentWeatherResult, forecastResult, pricesResult] = await Promise.allSettled([
      weatherCurrentPromise,
      weatherForecastPromise,
      marketService.getCurrentPrices(crop, state, 12)
    ]);

    const currentWeather = currentWeatherResult.status === 'fulfilled' ? currentWeatherResult.value : null;
    const forecastData = forecastResult.status === 'fulfilled' ? forecastResult.value : null;
    const prices = pricesResult.status === 'fulfilled' ? pricesResult.value : null;
    const forecastDays = forecastData?.forecast || [];
    const resolvedLocationName = currentWeather?.location?.name || city;

    const alerts = [];

    if (currentWeather && forecastDays.length > 0) {
      alerts.push(this.buildDiseaseRisk(currentWeather, forecastDays));
      alerts.push(this.buildHeatRisk(currentWeather, forecastDays));
      alerts.push(this.buildRainRisk(forecastDays));
    } else {
      alerts.push(
        this.buildUnavailableAlert(
          'disease-risk',
          'Disease Risk',
          `Weather data is unavailable for ${resolvedLocationName}, ${state}.`,
          'Retry in a moment to refresh humidity and rainfall-based disease risk.'
        )
      );
      alerts.push(
        this.buildUnavailableAlert(
          'heat-stress',
          'Heat Stress Risk',
          `Temperature forecast is unavailable for ${resolvedLocationName}, ${state}.`,
          'Retry in a moment to refresh the heat-stress outlook.'
        )
      );
      alerts.push(
        this.buildUnavailableAlert(
          'rainfall-risk',
          'Rainfall Risk',
          `Rainfall forecast is unavailable for ${resolvedLocationName}, ${state}.`,
          'Retry in a moment to refresh rainfall disruption risk.'
        )
      );
    }

    alerts.push(this.buildPriceRisk(prices, crop, state));

    const highestScore = alerts.reduce((max, alert) => Math.max(max, alert.score), 1);
    const overallLevel = highestScore >= 3 ? 'high' : highestScore === 2 ? 'medium' : 'low';

    return {
      location: resolvedLocationName,
      state,
      crop,
      availableCrops,
      generatedAt: new Date().toISOString(),
      overallLevel,
      alerts
    };
  }
}

module.exports = new RiskAlertService();
