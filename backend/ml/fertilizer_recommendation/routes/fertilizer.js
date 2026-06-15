const express = require('express');
const FertilizerController = require('../controllers/fertilizerController');
const { protect } = require('../../../src/middleware/auth');

const router = express.Router();

router.use(protect);

router.get('/crops', FertilizerController.getSupportedCrops);
router.post('/recommend', FertilizerController.recommend);

module.exports = router;
