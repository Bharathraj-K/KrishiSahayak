const axios = require('axios');

class YieldPredictionService {
  constructor() {
    this.aiServiceUrl = process.env.YIELD_PREDICTION_SERVICE_URL || 'http://localhost:5004';
  }

  async predictYield(input) {
    try {
      const response = await axios.post(`${this.aiServiceUrl}/predict`, input, {
        headers: { 'Content-Type': 'application/json' },
        timeout: 20000
      });

      if (!response.data || !response.data.success) {
        throw new Error(response.data?.error || 'Yield prediction failed');
      }

      return {
        ...response.data.data,
        modelUsed: response.data.modelUsed || 'Yield pipeline'
      };
    } catch (error) {
      console.error('Yield prediction service error:', error.message);
      throw error;
    }
  }
}

module.exports = new YieldPredictionService();

