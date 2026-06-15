const axios = require('axios');

class CropRecommendationService {
  constructor() {
    this.aiServiceUrl = process.env.CROP_RECOMMENDATION_SERVICE_URL || 'http://localhost:5002';
  }

  async predictCrop(input) {
    try {
      const response = await axios.post(
        `${this.aiServiceUrl}/predict`,
        input,
        {
          headers: {
            'Content-Type': 'application/json'
          },
          timeout: 15000
        }
      );

      if (!response.data || !response.data.success) {
        throw new Error(response.data?.error || 'Crop recommendation failed');
      }

      return {
        ...response.data.data,
        modelUsed: response.data.modelUsed || 'RandomForest (Crop Recommendation)'
      };
    } catch (error) {
      console.error('Crop recommendation service error:', error.message);
      return this.getMockRecommendation(input);
    }
  }

  getMockRecommendation(input) {
    return {
      prediction: 'rice',
      confidence: 78.5,
      topPredictions: [
        { crop: 'rice', confidence: 78.5 },
        { crop: 'maize', confidence: 12.3 },
        { crop: 'jute', confidence: 6.8 }
      ],
      input,
      modelUsed: 'Mock (service unavailable)'
    };
  }
}

module.exports = new CropRecommendationService();
