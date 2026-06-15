const yieldPredictionService = require('../services/yieldPredictionService');
const yieldMetaService = require('../services/yieldMetaService');
const { catchAsync, sendResponse, createError } = require('../middleware/errorHandler');

class YieldController {
  static predict = catchAsync(async (req, res, next) => {
    const {
      crop,
      Crop,
      state,
      State,
      season,
      Season,
      year,
      Year,
      area,
      Area,
      rainfall,
      Rainfall,
      fertilizer,
      Fertilizer,
      pesticide,
      Pesticide
    } = req.body;

    const payload = {
      Crop: (Crop ?? crop),
      State: (State ?? state),
      Season: (Season ?? season),
      Year: (Year ?? year),
      Area: (Area ?? area),
      Rainfall: (Rainfall ?? rainfall),
      Fertilizer: (Fertilizer ?? fertilizer),
      Pesticide: (Pesticide ?? pesticide)
    };

    const missing = Object.entries(payload)
      .filter(([, value]) => value === undefined || value === null || value === '')
      .map(([key]) => key);

    if (missing.length > 0) {
      return next(createError(`Missing fields: ${missing.join(', ')}`, 400, 'MISSING_FIELDS'));
    }

    const numericFields = ['Year', 'Area', 'Rainfall', 'Fertilizer', 'Pesticide'];
    const normalized = {
      Crop: String(payload.Crop).trim(),
      State: String(payload.State).trim(),
      Season: String(payload.Season).trim(),
      Year: Number(payload.Year),
      Area: Number(payload.Area),
      Rainfall: Number(payload.Rainfall),
      Fertilizer: Number(payload.Fertilizer),
      Pesticide: Number(payload.Pesticide)
    };

    const invalid = numericFields.filter((k) => !Number.isFinite(normalized[k]) || normalized[k] < 0);
    if (invalid.length > 0) {
      return next(createError(`Invalid numeric values: ${invalid.join(', ')}`, 400, 'INVALID_INPUT'));
    }

    const meta = yieldMetaService.getMeta();

    // Validate categorical values against training data to prevent nonsense strings.
    if (meta.crops.length > 0 && !yieldMetaService.isValidCrop(normalized.Crop)) {
      return next(createError('Unsupported crop. Please choose a crop from the dataset list.', 400, 'UNSUPPORTED_CROP'));
    }
    if (meta.states.length > 0 && !yieldMetaService.isValidState(normalized.State)) {
      return next(createError('Unsupported state. Please choose a state from the dataset list.', 400, 'UNSUPPORTED_STATE'));
    }
    if (meta.seasons.length > 0 && !yieldMetaService.isValidSeason(normalized.Season)) {
      return next(createError('Unsupported season. Please choose a season from the dataset list.', 400, 'UNSUPPORTED_SEASON'));
    }

    // User-facing year bounds (forecast window).
    const yearMin = 2018;
    const yearMax = 2028;
    if (normalized.Year < yearMin || normalized.Year > yearMax) {
      return next(createError(`Year must be between ${yearMin} and ${yearMax}`, 400, 'OUT_OF_RANGE'));
    }

    const ranges = meta.numericRanges || {};
    const rangeErrors = [];
    const checkRange = (key, label) => {
      const r = ranges[key];
      if (!r) return;
      if (normalized[key] < r.min || normalized[key] > r.max) {
        rangeErrors.push(`${label} must be between ${r.min} and ${r.max}`);
      }
    };

    checkRange('Area', 'Area');
    checkRange('Rainfall', 'Rainfall');
    checkRange('Fertilizer', 'Fertilizer');
    checkRange('Pesticide', 'Pesticide');

    if (rangeErrors.length > 0) {
      return next(createError(rangeErrors.join('. '), 400, 'OUT_OF_RANGE'));
    }

    const result = await yieldPredictionService.predictYield(normalized);
    sendResponse(res, 200, result, 'Yield prediction generated successfully');
  });
}

module.exports = YieldController;

