const express = require('express');
const DashboardController = require('../controllers/dashboardController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router.get('/risk-alerts', DashboardController.getRiskAlerts);

module.exports = router;
