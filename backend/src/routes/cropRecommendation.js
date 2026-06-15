const express = require('express');
const CropRecommendationController = require('../controllers/cropRecommendationController');
const { protect } = require('../middleware/auth');

const router = express.Router();

// All crop recommendation routes require authentication
router.use(protect);

// Predict best crop based on soil and weather data
router.post('/predict', CropRecommendationController.predict);

module.exports = router;
