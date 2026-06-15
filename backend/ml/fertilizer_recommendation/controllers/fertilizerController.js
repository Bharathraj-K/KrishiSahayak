const fertilizerRecommendationService = require('../services/fertilizerRecommendationService');
const { catchAsync, sendResponse, createError } = require('../../../src/middleware/errorHandler');

class FertilizerController {
  static getSupportedCrops = catchAsync(async (req, res) => {
    const crops = fertilizerRecommendationService.getSupportedCrops();
    sendResponse(res, 200, { crops, count: crops.length }, 'Fertilizer crops fetched successfully');
  });

  static recommend = catchAsync(async (req, res, next) => {
    const {
      cropName,
      crop,
      nitrogen,
      phosphorus,
      phosphorous,
      potassium,
      pottasium
    } = req.body;

    const selectedCrop = cropName || crop;
    const normalizedPhosphorus = phosphorus ?? phosphorous;
    const normalizedPotassium = potassium ?? pottasium;

    const requiredFields = {
      cropName: selectedCrop,
      nitrogen,
      phosphorus: normalizedPhosphorus,
      potassium: normalizedPotassium
    };

    const missing = Object.entries(requiredFields)
      .filter(([, value]) => value === undefined || value === null || value === '')
      .map(([key]) => key);

    if (missing.length > 0) {
      return next(createError(`Missing fields: ${missing.join(', ')}`, 400, 'MISSING_FIELDS'));
    }

    const numericInput = {
      nitrogen: Number(nitrogen),
      phosphorus: Number(normalizedPhosphorus),
      potassium: Number(normalizedPotassium)
    };

    const invalid = Object.entries(numericInput)
      .filter(([, value]) => !Number.isFinite(value) || value < 0)
      .map(([key]) => key);

    if (invalid.length > 0) {
      return next(createError(`Invalid numeric values: ${invalid.join(', ')}`, 400, 'INVALID_INPUT'));
    }

    const result = fertilizerRecommendationService.getRecommendation({
      cropName: selectedCrop,
      ...numericInput
    });

    if (!result) {
      return next(createError('Unsupported crop for fertilizer recommendation', 400, 'UNSUPPORTED_CROP'));
    }

    sendResponse(res, 200, result, 'Fertilizer recommendation generated successfully');
  });
}

module.exports = FertilizerController;
