const marketService = require('../services/marketService');
const { catchAsync, sendResponse, createError } = require('../middleware/errorHandler');

class MarketController {
  /**
   * Get current market prices for a commodity
   */
  static getCurrentPrices = catchAsync(async (req, res, next) => {
    const { commodity, state, limit } = req.query;

    const prices = await marketService.getCurrentPrices(
      commodity,
      state,
      parseInt(limit) || 50
    );

    // Generate insights
    const insights = marketService.generateMarketInsights(prices);

    sendResponse(res, 200, {
      prices,
      insights,
      count: prices.length
    }, 'Market prices fetched successfully');
  });

  /**
   * Get all crop categories
   */
  static getCategories = catchAsync(async (req, res, next) => {
    const categories = await marketService.getCategories();
    
    sendResponse(res, 200, {
      categories,
      count: categories.length
    }, 'Categories fetched successfully');
  });

  /**
   * Get crops by category
   */
  static getCropsByCategory = catchAsync(async (req, res, next) => {
    const { category } = req.params;

    if (!category) {
      return next(createError('Category is required', 400, 'CATEGORY_REQUIRED'));
    }

    const crops = await marketService.getCropsByCategory(category);
    
    if (crops.length === 0) {
      return next(createError('Invalid category', 404, 'INVALID_CATEGORY'));
    }

    sendResponse(res, 200, {
      category,
      crops,
      count: crops.length
    }, 'Crops fetched successfully');
  });

  /**
   * Get price comparison across markets/states
   */
  static getPriceComparison = catchAsync(async (req, res, next) => {
    const { commodity, states } = req.query;

    if (!commodity) {
      return next(createError('Commodity name is required', 400, 'COMMODITY_REQUIRED'));
    }

    const stateList = states ? states.split(',').map(s => s.trim()) : [];
    const comparison = await marketService.getPriceComparison(commodity, stateList);

    // Sort by average price (descending)
    comparison.sort((a, b) => b.avgPrice - a.avgPrice);

    sendResponse(res, 200, {
      commodity,
      comparison,
      count: comparison.length
    }, 'Price comparison fetched successfully');
  });

  /**
   * Get historical price trends
   */
  static getHistoricalPrices = catchAsync(async (req, res, next) => {
    const { commodity, days } = req.query;

    if (!commodity) {
      return next(createError('Commodity name is required', 400, 'COMMODITY_REQUIRED'));
    }

    const daysCount = parseInt(days) || 30;
    if (daysCount > 365) {
      return next(createError('Maximum 365 days of historical data allowed', 400, 'INVALID_DAYS'));
    }

    const historical = await marketService.getHistoricalPrices(commodity, daysCount);

    // Calculate statistics
    const prices = historical.map(h => h.price);
    const avgPrice = prices.reduce((a, b) => a + b, 0) / prices.length;
    const maxPrice = Math.max(...prices);
    const minPrice = Math.min(...prices);

    sendResponse(res, 200, {
      commodity,
      historical,
      statistics: {
        avgPrice: avgPrice.toFixed(2),
        maxPrice,
        minPrice,
        priceRange: (maxPrice - minPrice).toFixed(2),
        dataPoints: historical.length
      }
    }, 'Historical prices fetched successfully');
  });

  /**
   * Get market insights and recommendations
   */
  static getMarketInsights = catchAsync(async (req, res, next) => {
    const { commodity, state } = req.query;

    if (!commodity) {
      return next(createError('Commodity name is required', 400, 'COMMODITY_REQUIRED'));
    }

    const prices = await marketService.getCurrentPrices(commodity, state);
    const insights = marketService.generateMarketInsights(prices);

    sendResponse(res, 200, insights, 'Market insights generated successfully');
  });

  /**
   * Get user's saved price alerts (from user profile)
   */
  static getUserAlerts = catchAsync(async (req, res, next) => {
    const user = req.user;

    const alerts = user.priceAlerts || [];

    sendResponse(res, 200, {
      alerts,
      count: alerts.length
    }, 'Price alerts fetched successfully');
  });

  /**
   * Create a new price alert
   */
  static createPriceAlert = catchAsync(async (req, res, next) => {
    const user = req.user;
    const { commodity, targetPrice, condition, state } = req.body;

    if (!commodity || !targetPrice || !condition) {
      return next(createError('Commodity, target price, and condition are required', 400, 'INVALID_ALERT_DATA'));
    }

    if (!['above', 'below'].includes(condition)) {
      return next(createError('Condition must be "above" or "below"', 400, 'INVALID_CONDITION'));
    }

    // Initialize priceAlerts array if it doesn't exist
    if (!user.priceAlerts) {
      user.priceAlerts = [];
    }

    // Check for duplicate alerts
    const duplicate = user.priceAlerts.find(
      alert => alert.commodity === commodity && 
               alert.targetPrice === targetPrice && 
               alert.condition === condition
    );

    if (duplicate) {
      return next(createError('Duplicate alert already exists', 400, 'DUPLICATE_ALERT'));
    }

    // Add new alert
    const newAlert = {
      commodity,
      targetPrice: parseFloat(targetPrice),
      condition,
      state: state || null,
      isActive: true,
      createdAt: new Date()
    };

    user.priceAlerts.push(newAlert);
    await user.save();

    sendResponse(res, 201, {
      alert: newAlert
    }, 'Price alert created successfully');
  });

  /**
   * Delete a price alert
   */
  static deletePriceAlert = catchAsync(async (req, res, next) => {
    const user = req.user;
    const { alertId } = req.params;

    if (!user.priceAlerts || user.priceAlerts.length === 0) {
      return next(createError('No alerts found', 404, 'NO_ALERTS'));
    }

    const alertIndex = user.priceAlerts.findIndex(
      (alert, index) => index.toString() === alertId
    );

    if (alertIndex === -1) {
      return next(createError('Alert not found', 404, 'ALERT_NOT_FOUND'));
    }

    user.priceAlerts.splice(alertIndex, 1);
    await user.save();

    sendResponse(res, 200, {
      message: 'Alert deleted successfully'
    }, 'Price alert deleted successfully');
  });
}

module.exports = MarketController;
