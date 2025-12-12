const axios = require('axios');

class MarketService {
  constructor() {
    // Data.gov.in API configuration
    this.apiKey = process.env.DATA_GOV_API_KEY || 'YOUR_API_KEY';
    this.baseUrl = 'https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070';
    
    // Common crop mappings
    this.cropCategories = {
      cereals: ['Rice', 'Wheat', 'Maize', 'Bajra', 'Jowar'],
      pulses: ['Arhar (Tur)', 'Moong', 'Urad', 'Masoor', 'Chana'],
      oilseeds: ['Groundnut', 'Soyabean', 'Sunflower', 'Mustard', 'Cotton Seed'],
      vegetables: ['Tomato', 'Onion', 'Potato', 'Cabbage', 'Cauliflower', 'Brinjal'],
      fruits: ['Mango', 'Banana', 'Apple', 'Orange', 'Pomegranate'],
      spices: ['Turmeric', 'Chilli', 'Coriander', 'Cumin', 'Black Pepper']
    };
  }

  /**
   * Get current market prices for a commodity
   */
  async getCurrentPrices(commodity, state = null, limit = 50) {
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

      if (state) {
        params['filters[state.keyword]'] = state;
      }

      const response = await axios.get(this.baseUrl, {
        params: params,
        timeout: 10000
      });

      if (response.data && response.data.records) {
        return this.formatPriceData(response.data.records);
      }

      return [];
    } catch (error) {
      // Fallback to mock data if API fails
      console.error('Agmarknet API error:', error.message);
      return this.getMockPrices(commodity, state);
    }
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
      date: record.arrival_date || record.Arrival_Date || new Date().toISOString(),
      unit: 'Quintal',
      priceChange: this.calculatePriceChange(record),
      trend: this.determineTrend(record)
    }));
  }

  /**
   * Calculate price change percentage
   */
  calculatePriceChange(record) {
    // Simulate price change (in real scenario, compare with historical data)
    const change = Math.random() * 10 - 5; // -5% to +5%
    return parseFloat(change.toFixed(2));
  }

  /**
   * Determine price trend
   */
  determineTrend(record) {
    const change = this.calculatePriceChange(record);
    if (change > 2) return 'up';
    if (change < -2) return 'down';
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
      const prices = await this.getCurrentPrices(commodity);
      
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
   * Get historical price trends (mock implementation)
   */
  async getHistoricalPrices(commodity, days = 30) {
    // In production, this would fetch historical data
    // For now, generate mock historical data
    const historical = [];
    const basePrice = 2000 + Math.random() * 1000;
    
    for (let i = days; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      
      const variation = Math.sin(i / 5) * 100 + (Math.random() * 100 - 50);
      const price = basePrice + variation;
      
      historical.push({
        date: date.toISOString().split('T')[0],
        price: parseFloat(price.toFixed(2)),
        commodity: commodity
      });
    }

    return historical;
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
   * Mock data fallback
   */
  getMockPrices(commodity = 'Wheat', state = null) {
    const mockData = [
      { commodity: 'Wheat', market: 'Delhi', state: 'Delhi', district: 'New Delhi', minPrice: 2100, maxPrice: 2300, modalPrice: 2200 },
      { commodity: 'Wheat', market: 'Karnal', state: 'Haryana', district: 'Karnal', minPrice: 2150, maxPrice: 2350, modalPrice: 2250 },
      { commodity: 'Rice', market: 'Amritsar', state: 'Punjab', district: 'Amritsar', minPrice: 2800, maxPrice: 3100, modalPrice: 2950 },
      { commodity: 'Rice', market: 'Patna', state: 'Bihar', district: 'Patna', minPrice: 2700, maxPrice: 3000, modalPrice: 2850 },
      { commodity: 'Tomato', market: 'Bengaluru', state: 'Karnataka', district: 'Bangalore Urban', minPrice: 800, maxPrice: 1200, modalPrice: 1000 },
      { commodity: 'Onion', market: 'Nashik', state: 'Maharashtra', district: 'Nashik', minPrice: 1500, maxPrice: 1800, modalPrice: 1650 },
      { commodity: 'Potato', market: 'Agra', state: 'Uttar Pradesh', district: 'Agra', minPrice: 1200, maxPrice: 1500, modalPrice: 1350 }
    ];

    let filtered = mockData;
    if (commodity) {
      filtered = filtered.filter(p => p.commodity.toLowerCase().includes(commodity.toLowerCase()));
    }
    if (state) {
      filtered = filtered.filter(p => p.state.toLowerCase() === state.toLowerCase());
    }

    return filtered.map(record => ({
      ...record,
      date: new Date().toISOString(),
      unit: 'Quintal',
      priceChange: (Math.random() * 10 - 5).toFixed(2),
      trend: Math.random() > 0.5 ? 'up' : 'down'
    }));
  }

  /**
   * Error handler
   */
  handleError(error) {
    if (error.response) {
      // API responded with error
      return new Error(`Market API Error: ${error.response.status} - ${error.response.data.message || 'Unknown error'}`);
    } else if (error.request) {
      // Request made but no response
      return new Error('Market API is not responding. Please try again later.');
    } else {
      // Other errors
      return new Error(`Market Service Error: ${error.message}`);
    }
  }
}

module.exports = new MarketService();
