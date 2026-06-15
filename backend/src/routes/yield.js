const express = require('express');
const YieldController = require('../controllers/yieldController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router.get('/meta', (req, res) => {
  // Lazy import avoids circular deps in tests.
  // eslint-disable-next-line global-require
  const yieldMetaService = require('../services/yieldMetaService');
  const { sendResponse } = require('../middleware/errorHandler');
  sendResponse(res, 200, yieldMetaService.getMeta(), 'Yield metadata fetched successfully');
});

router.get('/suggest', (req, res) => {
  // eslint-disable-next-line global-require
  const yieldMetaService = require('../services/yieldMetaService');
  const { sendResponse, createError } = require('../middleware/errorHandler');

  const crop = req.query.crop;
  const state = req.query.state;
  const season = req.query.season;

  if (!crop || !state || !season) {
    throw createError('crop, state, and season are required', 400, 'MISSING_FIELDS');
  }

  const suggested = yieldMetaService.suggestDefaults({ crop, state, season });
  sendResponse(res, 200, { suggested: suggested || null }, 'Yield defaults suggested successfully');
});

router.post('/predict', YieldController.predict);

module.exports = router;

