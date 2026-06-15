const axios = require('axios');

class MarketService {
  constructor() {
    // Data.gov.in API configuration
    this.apiKey = process.env.DATA_GOV_API_KEY || 'YOUR_API_KEY';
    this.baseUrl = 'https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070';
    this.defaultState = process.env.DEFAULT_MARKET_STATE || 'Uttar Pradesh';
    
    // Common crop mappings
    this.cropCategories = {
      cereals: ['Rice', 'Wheat', 'Maize', 'Bajra', 'Jowar'],
      pulses: ['Arhar (Tur)', 'Moong', 'Urad', 'Masoor', 'Chana'],
      oilseeds: ['Groundnut', 'Soyabean', 'Sunflower', 'Mustard', 'Cotton Seed'],
      vegetables: ['Tomato', 'Onion', 'Potato', 'Cabbage', 'Cauliflower', 'Brinjal'],
      fruits: ['Mango', 'Banana', 'Apple', 'Orange', 'Pomegranate'],
      spices: ['Turmeric', 'Chilli', 'Coriander', 'Cumin', 'Black Pepper']
    };

    this.cacheTtlMs = 10 * 60 * 1000;
    this.currentPricesCache = new Map();
    this.historicalCache = new Map();
    this.inFlightRequests = new Map();
  }

  getCacheKey(prefix, payload) {
    return `${prefix}:${JSON.stringify(payload)}`;
  }

  getCached(cache, key) {
    const cached = cache.get(key);
    if (!cached) return null;

    if (Date.now() - cached.timestamp > this.cacheTtlMs) {
      cache.delete(key);
      return null;
    }

    return cached.data;
  }

  setCached(cache, key, data) {
    cache.set(key, {
      timestamp: Date.now(),
      data
    });
  }

  sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  async fetchAgmarknet(params, timeout = 10000, maxRetries = 2) {
    let attempt = 0;

    while (attempt <= maxRetries) {
      try {
        return await axios.get(this.baseUrl, {
          params,
          timeout
        });
      } catch (error) {
        const status = error?.response?.status;
        const isLastAttempt = attempt >= maxRetries;
        const shouldRetry = status === 429 || !status;

        if (!shouldRetry || isLastAttempt) {
          throw error;
        }

        const retryAfterHeader = Number(error?.response?.headers?.['retry-after']);
        const retryDelayMs = Number.isFinite(retryAfterHeader) && retryAfterHeader > 0
          ? retryAfterHeader * 1000
          : 500 * Math.pow(2, attempt);

        await this.sleep(retryDelayMs);
        attempt += 1;
      }
    }
  }

  /**
   * Parse Agmarknet arrival date values (supports dd/mm/yyyy and yyyy-mm-dd)
   */
  parseArrivalDate(value) {
    if (!value) return null;

    const str = String(value).trim();
    if (!str) return null;

    if (str.includes('/')) {
      const parts = str.split('/');
      if (parts.length === 3) {
        const [dd, mm, yyyy] = parts;
        const iso = `${yyyy}-${mm.padStart(2, '0')}-${dd.padStart(2, '0')}`;
        const parsed = new Date(iso);
        return Number.isNaN(parsed.getTime()) ? null : parsed;
      }
    }

    const parsed = new Date(str);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  }

  /**
   * Convert arrival date to stable yyyy-mm-dd format for frontend charts/cards.
   */
  formatApiDate(value) {
    const parsed = this.parseArrivalDate(value);
    if (!parsed) {
      return new Date().toISOString().split('T')[0];
    }
    return parsed.toISOString().split('T')[0];
  }

  /**
   * Resolve state for API calls.
   * - If a state is explicitly provided, use it.
   * - Otherwise use configured default state unless all states are requested.
   */
  resolveState(state, allowAllStates = false) {
    const trimmed = typeof state === 'string' ? state.trim() : '';
    if (trimmed) {
      return trimmed;
    }

    if (allowAllStates) {
      return null;
    }

    return this.defaultState;
  }

  /**
   * Get current market prices for a commodity
   */
  async getCurrentPrices(commodity, state = null, limit = 50, options = {}) {
    const selectedState = this.resolveState(state, options.allowAllStates === true);
    const cacheKey = this.getCacheKey('current', {
      commodity: commodity || null,
      state: selectedState,
      limit,
      allowAllStates: options.allowAllStates === true
    });

    const cached = this.getCached(this.currentPricesCache, cacheKey);
    if (cached) {
      return cached;
    }

    if (this.inFlightRequests.has(cacheKey)) {
      return this.inFlightRequests.get(cacheKey);
    }

    const requestPromise = (async () => {
    try {
      const params = {
        'api-key': this.apiKey,
        format: 'json',
        limit: limit
      };

      // Add filters in the correct format
      if (commodity) {
        params['filters[commodity]'] = commodity;
      }

      if (selectedState) {
        params['filters[state.keyword]'] = selectedState;
      }

      let response = await this.fetchAgmarknet(params, 10000, 2);

      // Some records may not be indexed for state.keyword. Retry with state field.
      if (selectedState && (!response.data?.records || response.data.records.length === 0)) {
        const fallbackParams = {
          ...params,
          'filters[state]': selectedState
        };
        delete fallbackParams['filters[state.keyword]'];

        response = await this.fetchAgmarknet(fallbackParams, 10000, 2);
      }

      if (response.data && response.data.records) {
        const formatted = this.formatPriceData(response.data.records);
        this.setCached(this.currentPricesCache, cacheKey, formatted);
        return formatted;
      }

      return [];
    } catch (error) {
      console.error('Agmarknet API error:', error.message);
      throw this.handleError(error);
    } finally {
      this.inFlightRequests.delete(cacheKey);
    }
    })();

    this.inFlightRequests.set(cacheKey, requestPromise);
    return requestPromise;
  }

  /**
   * Format price data from API response
   */
  formatPriceData(records) {
    return records.map(record => ({
      commodity: record.commodity || record.Commodity,
      market: record.market || record.Market,
      state: record.state || record.State,
      district: record.district || record.District,
      minPrice: parseFloat(record.min_price || record.Min_Price || 0),
      maxPrice: parseFloat(record.max_price || record.Max_Price || 0),
      modalPrice: parseFloat(record.modal_price || record.Modal_Price || 0),
      date: this.formatApiDate(record.arrival_date || record.Arrival_Date),
      unit: 'Quintal',
      priceChange: this.calculatePriceChange(record),
      trend: this.determineTrend(record)
    }));
  }

  /**
   * Calculate price change percentage
   */
  calculatePriceChange(record) {
    const minPrice = parseFloat(record.min_price || record.Min_Price || 0);
    const maxPrice = parseFloat(record.max_price || record.Max_Price || 0);
    const modalPrice = parseFloat(record.modal_price || record.Modal_Price || 0);

    if (!Number.isFinite(minPrice) || !Number.isFinite(maxPrice) || !Number.isFinite(modalPrice)) {
      return 0;
    }

    const midpoint = (minPrice + maxPrice) / 2;
    if (!Number.isFinite(midpoint) || midpoint === 0) {
      return 0;
    }

    return parseFloat((((modalPrice - midpoint) / midpoint) * 100).toFixed(2));
  }

  /**
   * Determine price trend
   */
  determineTrend(record) {
    const minPrice = parseFloat(record.min_price || record.Min_Price || 0);
    const maxPrice = parseFloat(record.max_price || record.Max_Price || 0);
    const modalPrice = parseFloat(record.modal_price || record.Modal_Price || 0);

    if (!Number.isFinite(minPrice) || !Number.isFinite(maxPrice) || !Number.isFinite(modalPrice) || maxPrice <= minPrice) {
      return 'stable';
    }

    const position = (modalPrice - minPrice) / (maxPrice - minPrice);
    if (position >= 0.66) return 'up';
    if (position <= 0.33) return 'down';
    return 'stable';
  }

  /**
   * Get all crop categories
   */
  async getCategories() {
    return Object.keys(this.cropCategories).map(key => ({
      id: key,
      name: key.charAt(0).toUpperCase() + key.slice(1),
      crops: this.cropCategories[key],
      count: this.cropCategories[key].length
    }));
  }

  /**
   * Get crops by category
   */
  async getCropsByCategory(category) {
    const categoryLower = category.toLowerCase();
    if (this.cropCategories[categoryLower]) {
      return this.cropCategories[categoryLower];
    }
    return [];
  }

  /**
   * Get price comparison across markets
   */
  async getPriceComparison(commodity, states = []) {
    try {
      const prices = await this.getCurrentPrices(commodity, null, 500, { allowAllStates: true });
      
      if (states.length > 0) {
        return prices.filter(p => states.includes(p.state));
      }

      // Group by state and get average prices
      const stateWisePrices = {};
      prices.forEach(price => {
        if (!stateWisePrices[price.state]) {
          stateWisePrices[price.state] = {
            state: price.state,
            prices: [],
            markets: []
          };
        }
        stateWisePrices[price.state].prices.push(price.modalPrice);
        stateWisePrices[price.state].markets.push(price.market);
      });

      // Calculate averages
      return Object.values(stateWisePrices).map(item => ({
        state: item.state,
        avgPrice: (item.prices.reduce((a, b) => a + b, 0) / item.prices.length).toFixed(2),
        minPrice: Math.min(...item.prices),
        maxPrice: Math.max(...item.prices),
        marketCount: item.markets.length,
        commodity: commodity
      }));
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get historical price trends from Agmarknet (data.gov.in)
   */
  async getHistoricalPrices(commodity, days = 30, market = null, state = null) {
    const selectedState = this.resolveState(state, false);
    const cacheKey = this.getCacheKey('historical', {
      commodity: commodity || null,
      days,
      market: market || null,
      state: selectedState
    });

    const cached = this.getCached(this.historicalCache, cacheKey);
    if (cached) {
      return cached;
    }

    if (this.inFlightRequests.has(cacheKey)) {
      return this.inFlightRequests.get(cacheKey);
    }

    const requestPromise = (async () => {
    try {
      // Exclude the current day because intraday records are often incomplete.
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);
      const endDate = new Date(todayStart.getTime() - 1);

      const startDate = new Date();
      startDate.setHours(0, 0, 0, 0);
      startDate.setDate(startDate.getDate() - days);

      const fetchRecords = async (stateFilterField = null) => {
        const allRecords = [];
        const pageLimit = 100;
        let offset = 0;
        const targetUniqueDates = Math.max(7, Math.min(days, 30));
        const uniqueDates = new Set();

        // Keep paging until we collect a useful spread of distinct dates.
        // Popular crop/state combinations can have thousands of same-day mandi
        // rows, so a small fixed page cap often collapses the chart to one date.
        for (let page = 0; page < 60; page++) {
          const params = {
            'api-key': this.apiKey,
            format: 'json',
            limit: pageLimit,
            offset
          };

          if (commodity) {
            params['filters[commodity]'] = commodity;
          }

          if (market) {
            params['filters[market]'] = market;
          }

          if (selectedState && stateFilterField) {
            params[stateFilterField] = selectedState;
          }

          const response = await this.fetchAgmarknet(params, 15000, 2);

          const records = response.data?.records || [];
          if (records.length === 0) {
            break;
          }

          allRecords.push(...records);

          const parsedDates = records
            .map((r) => this.parseArrivalDate(r.arrival_date || r.Arrival_Date))
            .filter(Boolean)
            .sort((a, b) => a - b);

          parsedDates.forEach((date) => {
            uniqueDates.add(date.toISOString().split('T')[0]);
          });

          const oldestInBatch = parsedDates.length > 0 ? parsedDates[0] : null;
          if (oldestInBatch && oldestInBatch < startDate && uniqueDates.size >= targetUniqueDates) {
            break;
          }

          if (records.length < pageLimit) {
            break;
          }

          offset += records.length;
        }

        return allRecords;
      };

      const stateMatches = (recordState, requestedState) => {
        if (!requestedState) return true;
        const a = String(recordState || '').trim().toLowerCase();
        const b = String(requestedState || '').trim().toLowerCase();
        if (!a || !b) return false;
        return a === b;
      };

      const buildHistorical = (records) => {
        const seriesRows = records
          .map((record) => {
            const parsedDate = this.parseArrivalDate(record.arrival_date || record.Arrival_Date);
            const modalPrice = parseFloat(record.modal_price || record.Modal_Price || 0);

            return {
              parsedDate,
              date: parsedDate ? parsedDate.toISOString().split('T')[0] : null,
              price: Number.isFinite(modalPrice) ? modalPrice : null
            };
          })
          .filter((row) => row.parsedDate && row.price !== null)
          .filter((row) => row.parsedDate >= startDate && row.parsedDate <= endDate);

        const dailyMap = new Map();
        for (const row of seriesRows) {
          if (!dailyMap.has(row.date)) {
            dailyMap.set(row.date, { sum: 0, count: 0 });
          }
          const bucket = dailyMap.get(row.date);
          bucket.sum += row.price;
          bucket.count += 1;
        }

        // When market is not specified, this is the per-date average modal price
        // across all matching market/district records in the selected state.
        return Array.from(dailyMap.entries())
          .map(([date, bucket]) => ({
            date,
            price: parseFloat((bucket.sum / bucket.count).toFixed(2)),
            commodity
          }))
          .sort((a, b) => new Date(a.date) - new Date(b.date));
      };

      const primaryRecords = await fetchRecords(selectedState ? 'filters[state.keyword]' : null);
      let historical = buildHistorical(primaryRecords);

      const minimumUsefulPoints = Math.max(3, Math.min(days, 7));

      // Some data is searchable by 'state' but sparse/empty with 'state.keyword'.
      if (selectedState && historical.length < minimumUsefulPoints) {
        const secondaryRecords = await fetchRecords('filters[state]');
        const secondaryHistorical = buildHistorical(secondaryRecords);
        if (secondaryHistorical.length > historical.length) {
          historical = secondaryHistorical;
        }
      }

      // Final fallback: fetch without state filter and apply state filter locally.
      // This helps when API-side state filters return only one or two snapshot dates.
      if (selectedState && historical.length < minimumUsefulPoints) {
        const broadRecords = await fetchRecords(null);
        const locallyFiltered = broadRecords.filter((r) =>
          stateMatches(r.state || r.State, selectedState)
        );
        const tertiaryHistorical = buildHistorical(locallyFiltered);
        if (tertiaryHistorical.length > historical.length) {
          historical = tertiaryHistorical;
        }
      }

      this.setCached(this.historicalCache, cacheKey, historical);
      return historical;
    } catch (error) {
      console.error('Historical Agmarknet API error:', error.message);
      throw this.handleError(error);
    } finally {
      this.inFlightRequests.delete(cacheKey);
    }
    })();

    this.inFlightRequests.set(cacheKey, requestPromise);
    return requestPromise;
  }

  /**
   * Generate market insights and recommendations
   */
  generateMarketInsights(prices) {
    if (!prices || prices.length === 0) {
      return {
        summary: 'No market data available',
        recommendations: []
      };
    }

    const avgPrice = prices.reduce((sum, p) => sum + p.modalPrice, 0) / prices.length;
    const maxPrice = Math.max(...prices.map(p => p.modalPrice));
    const minPrice = Math.min(...prices.map(p => p.modalPrice));
    const priceRange = maxPrice - minPrice;
    
    const insights = {
      summary: `Average market price: ₹${avgPrice.toFixed(2)}/Quintal`,
      avgPrice: avgPrice.toFixed(2),
      maxPrice,
      minPrice,
      priceRange: priceRange.toFixed(2),
      marketCount: prices.length,
      recommendations: []
    };

    // Generate recommendations
    if (priceRange > avgPrice * 0.2) {
      insights.recommendations.push({
        type: 'high_variation',
        message: 'High price variation across markets. Consider selling in higher-priced markets.',
        severity: 'info'
      });
    }

    const highPriceMarkets = prices.filter(p => p.modalPrice > avgPrice * 1.1);
    if (highPriceMarkets.length > 0) {
      insights.recommendations.push({
        type: 'best_markets',
        message: `Best markets: ${highPriceMarkets.slice(0, 3).map(p => `${p.market} (${p.state})`).join(', ')}`,
        severity: 'success',
        markets: highPriceMarkets.slice(0, 5)
      });
    }

    const upTrend = prices.filter(p => p.trend === 'up').length;
    const downTrend = prices.filter(p => p.trend === 'down').length;
    
    if (upTrend > downTrend * 2) {
      insights.recommendations.push({
        type: 'trend',
        message: 'Prices are trending upward. Good time to sell.',
        severity: 'success'
      });
    } else if (downTrend > upTrend * 2) {
      insights.recommendations.push({
        type: 'trend',
        message: 'Prices are trending downward. Consider holding or selling in premium markets.',
        severity: 'warning'
      });
    }

    return insights;
  }

  /**
   * Error handler
   */
  handleError(error) {
    if (error.response) {
      // API responded with error
      const statusCode = error.response.status;
      const message = `Market API Error: ${statusCode} - ${error.response?.data?.message || 'Unknown error'}`;
      const appError = new Error(message);
      appError.statusCode = statusCode;
      appError.code = statusCode === 429 ? 'UPSTREAM_RATE_LIMIT' : 'MARKET_API_ERROR';
      appError.isOperational = true;
      return appError;
    } else if (error.request) {
      // Request made but no response
      const appError = new Error('Market API is not responding. Please try again later.');
      appError.statusCode = 503;
      appError.code = 'MARKET_API_UNAVAILABLE';
      appError.isOperational = true;
      return appError;
    } else {
      // Other errors
      const appError = new Error(`Market Service Error: ${error.message}`);
      appError.statusCode = 500;
      appError.code = 'MARKET_SERVICE_ERROR';
      appError.isOperational = true;
      return appError;
    }
  }
}

module.exports = new MarketService();
