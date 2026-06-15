const cropRecommendationService = require('../services/cropRecommendationService');
const { catchAsync, sendResponse, createError } = require('../middleware/errorHandler');

class CropRecommendationController {
  static predict = catchAsync(async (req, res, next) => {
    const {
      nitrogen,
      phosphorus,
      potassium,
      temperature,
      humidity,
      ph,
      rainfall
    } = req.body;

    const requiredFields = {
      nitrogen,
      phosphorus,
      potassium,
      temperature,
      humidity,
      ph,
      rainfall
    };

    const missing = Object.entries(requiredFields)
      .filter(([, value]) => value === undefined || value === null || value === '')
      .map(([key]) => key);

    if (missing.length > 0) {
      return next(createError(`Missing fields: ${missing.join(', ')}`, 400, 'MISSING_FIELDS'));
    }

    const input = {
      nitrogen: parseFloat(nitrogen),
      phosphorus: parseFloat(phosphorus),
      potassium: parseFloat(potassium),
      temperature: parseFloat(temperature),
      humidity: parseFloat(humidity),
      ph: parseFloat(ph),
      rainfall: parseFloat(rainfall)
    };

    const invalid = Object.entries(input)
      .filter(([, value]) => !Number.isFinite(value))
      .map(([key]) => key);

    if (invalid.length > 0) {
      return next(createError(`Invalid numeric values: ${invalid.join(', ')}`, 400, 'INVALID_INPUT'));
    }

    const ranges = {
      nitrogen: { min: 0, max: 140, label: 'Nitrogen (N)' },
      phosphorus: { min: 0, max: 150, label: 'Phosphorus (P)' },
      potassium: { min: 0, max: 210, label: 'Potassium (K)' },
      temperature: { min: 0, max: 60, label: 'Temperature (°C)' },
      humidity: { min: 0, max: 100, label: 'Humidity (%)' },
      ph: { min: 0, max: 14, label: 'pH' },
      rainfall: { min: 0, max: 500, label: 'Rainfall (mm)' }
    };

    const outOfRange = Object.entries(ranges)
      .filter(([key, meta]) => input[key] < meta.min || input[key] > meta.max)
      .map(([, meta]) => `${meta.label} must be between ${meta.min} and ${meta.max}`);

    if (outOfRange.length > 0) {
      return next(createError(outOfRange.join('. '), 400, 'OUT_OF_RANGE'));
    }

    if (input.ph < 0 || input.ph > 14) {
      return next(createError('pH must be between 0 and 14', 400, 'INVALID_PH'));
    }

    if (input.humidity < 0 || input.humidity > 100) {
      return next(createError('Humidity must be between 0 and 100', 400, 'INVALID_HUMIDITY'));
    }

    if (input.rainfall < 0) {
      return next(createError('Rainfall must be a positive value', 400, 'INVALID_RAINFALL'));
    }

    const recommendation = await cropRecommendationService.predictCrop(input);

    sendResponse(res, 200, recommendation, 'Crop recommendation generated successfully');
  });
}

module.exports = CropRecommendationController;
