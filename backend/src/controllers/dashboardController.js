const riskAlertService = require('../services/riskAlertService');
const { catchAsync, sendResponse } = require('../middleware/errorHandler');

class DashboardController {
  static getRiskAlerts = catchAsync(async (req, res) => {
    const crop = typeof req.query.crop === 'string' ? req.query.crop.trim() : '';
    const riskSummary = await riskAlertService.generateForUser(req.user, {
      crop: crop || null
    });

    sendResponse(res, 200, riskSummary, 'Risk alerts generated successfully');
  });
}

module.exports = DashboardController;
