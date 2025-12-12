const express = require('express');
const MarketController = require('../controllers/marketController');
const { protect } = require('../middleware/auth');

const router = express.Router();

// All market routes require authentication
router.use(protect);

// Get current market prices
router.get('/prices', MarketController.getCurrentPrices);

// Get all crop categories
router.get('/categories', MarketController.getCategories);

// Get crops by category
router.get('/categories/:category', MarketController.getCropsByCategory);

// Get price comparison across markets
router.get('/comparison', MarketController.getPriceComparison);

// Get historical price trends
router.get('/historical', MarketController.getHistoricalPrices);

// Get market insights and recommendations
router.get('/insights', MarketController.getMarketInsights);

// Price alerts
router.get('/alerts', MarketController.getUserAlerts);
router.post('/alerts', MarketController.createPriceAlert);
router.delete('/alerts/:alertId', MarketController.deletePriceAlert);

module.exports = router;
