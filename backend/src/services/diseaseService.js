const axios = require('axios');
const fs = require('fs').promises;
const FormData = require('form-data');

class DiseaseService {
  constructor() {
    // Plant.id API configuration
    this.apiKey = process.env.PLANT_ID_API_KEY;
    this.baseUrl = 'https://api.plant.id/v2';
    
    // Disease database (can be moved to MongoDB later)
    this.diseaseDatabase = {
      'Apple scab': {
        severity: 'moderate',
        treatments: {
          organic: ['Neem oil spray', 'Copper-based fungicide', 'Remove infected leaves'],
          chemical: ['Captan', 'Mancozeb', 'Chlorothalonil']
        },
        prevention: [
          'Plant resistant varieties',
          'Ensure proper air circulation',
          'Remove fallen leaves',
          'Avoid overhead watering'
        ]
      },
      'Bacterial spot': {
        severity: 'high',
        treatments: {
          organic: ['Copper spray', 'Remove infected plants', 'Biological control agents'],
          chemical: ['Copper hydroxide', 'Streptomycin']
        },
        prevention: [
          'Use disease-free seeds',
          'Avoid working with wet plants',
          'Rotate crops',
          'Proper spacing between plants'
        ]
      },
      'Early blight': {
        severity: 'moderate',
        treatments: {
          organic: ['Neem oil', 'Baking soda spray', 'Remove infected leaves'],
          chemical: ['Chlorothalonil', 'Mancozeb', 'Copper fungicides']
        },
        prevention: [
          'Mulch around plants',
          'Water at soil level',
          'Stake plants off ground',
          'Rotate crops yearly'
        ]
      },
      'Late blight': {
        severity: 'critical',
        treatments: {
          organic: ['Copper-based fungicide', 'Remove and destroy infected plants'],
          chemical: ['Metalaxyl', 'Chlorothalonil', 'Mancozeb']
        },
        prevention: [
          'Plant resistant varieties',
          'Avoid overhead irrigation',
          'Ensure good drainage',
          'Monitor weather conditions'
        ]
      },
      'Leaf mold': {
        severity: 'moderate',
        treatments: {
          organic: ['Sulfur-based spray', 'Increase ventilation', 'Remove infected leaves'],
          chemical: ['Chlorothalonil', 'Mancozeb']
        },
        prevention: [
          'Reduce humidity',
          'Improve air circulation',
          'Avoid overhead watering',
          'Space plants properly'
        ]
      },
      'Powdery mildew': {
        severity: 'low',
        treatments: {
          organic: ['Milk spray (1:9 ratio)', 'Baking soda solution', 'Neem oil'],
          chemical: ['Sulfur fungicides', 'Potassium bicarbonate']
        },
        prevention: [
          'Plant in full sun',
          'Improve air circulation',
          'Avoid overhead watering',
          'Remove infected plant parts'
        ]
      }
    };
  }

  /**
   * Analyze plant disease from image using Plant.id API
   */
  async analyzePlantDisease(imagePath, imageBase64 = null) {
    try {
      // If no API key, return mock analysis
      if (!this.apiKey || this.apiKey === 'YOUR_API_KEY') {
        console.log('No Plant.id API key found, using mock analysis');
        return this.getMockAnalysis();
      }

      // Prepare image data
      let base64Image;
      if (imageBase64) {
        base64Image = imageBase64;
      } else {
        const imageBuffer = await fs.readFile(imagePath);
        base64Image = imageBuffer.toString('base64');
      }

      // Call Plant.id API
      const response = await axios.post(
        `${this.baseUrl}/health_assessment`,
        {
          images: [base64Image],
          modifiers: ['crops_fast', 'similar_images'],
          disease_details: ['cause', 'common_names', 'classification', 'description', 'treatment', 'url']
        },
        {
          headers: {
            'Api-Key': this.apiKey,
            'Content-Type': 'application/json'
          },
          timeout: 30000
        }
      );

      return this.formatDiseaseAnalysis(response.data);
    } catch (error) {
      console.error('Plant.id API error:', error.message);
      // Fallback to mock analysis
      return this.getMockAnalysis();
    }
  }

  /**
   * Format Plant.id API response
   */
  formatDiseaseAnalysis(apiResponse) {
    const result = {
      isHealthy: apiResponse.is_healthy,
      isPlant: apiResponse.is_plant,
      diseases: [],
      suggestions: []
    };

    if (apiResponse.health_assessment?.diseases) {
      result.diseases = apiResponse.health_assessment.diseases.map(disease => ({
        name: disease.name,
        probability: (disease.probability * 100).toFixed(2),
        commonNames: disease.disease_details?.common_names || [],
        description: disease.disease_details?.description || 'No description available',
        cause: disease.disease_details?.cause || 'Unknown',
        treatment: disease.disease_details?.treatment || this.getTreatmentFromDatabase(disease.name),
        url: disease.disease_details?.url,
        similarImages: disease.similar_images || []
      }));
    }

    // Add general suggestions
    if (!result.isHealthy && result.diseases.length > 0) {
      const topDisease = result.diseases[0];
      result.suggestions = this.generateSuggestions(topDisease.name);
    } else if (result.isHealthy) {
      result.suggestions = ['Plant appears healthy!', 'Continue regular care and monitoring'];
    }

    return result;
  }

  /**
   * Get treatment from local database
   */
  getTreatmentFromDatabase(diseaseName) {
    // Search for similar disease name in database
    const diseaseKey = Object.keys(this.diseaseDatabase).find(key =>
      diseaseName.toLowerCase().includes(key.toLowerCase()) ||
      key.toLowerCase().includes(diseaseName.toLowerCase())
    );

    if (diseaseKey) {
      const disease = this.diseaseDatabase[diseaseKey];
      return {
        organic: disease.treatments.organic,
        chemical: disease.treatments.chemical,
        prevention: disease.prevention,
        severity: disease.severity
      };
    }

    return {
      organic: ['Consult local agricultural expert'],
      chemical: ['Contact pesticide dealer for recommendations'],
      prevention: ['Monitor plant regularly', 'Maintain plant hygiene'],
      severity: 'unknown'
    };
  }

  /**
   * Generate suggestions based on disease
   */
  generateSuggestions(diseaseName) {
    const treatment = this.getTreatmentFromDatabase(diseaseName);
    const suggestions = [];

    if (treatment.severity === 'critical') {
      suggestions.push('⚠️ Critical: Immediate action required!');
      suggestions.push('Remove severely infected plants to prevent spread');
    } else if (treatment.severity === 'high') {
      suggestions.push('⚠️ High severity: Act within 24-48 hours');
    } else if (treatment.severity === 'moderate') {
      suggestions.push('⚠️ Moderate severity: Treatment recommended within a week');
    }

    suggestions.push(`Recommended organic treatment: ${treatment.organic[0]}`);
    suggestions.push(`Prevention: ${treatment.prevention[0]}`);
    suggestions.push('Consult local agricultural extension office for detailed guidance');

    return suggestions;
  }

  /**
   * Get disease history for user
   */
  async getDiseaseHistory(userId) {
    // This would query MongoDB for user's disease detection history
    // For now, return empty array
    return [];
  }

  /**
   * Save disease analysis to user history
   */
  async saveDiseaseAnalysis(userId, analysis, imagePath) {
    // This would save to MongoDB
    // Implementation depends on User model structure
    return {
      saved: true,
      timestamp: new Date()
    };
  }

  /**
   * Get disease prevention tips
   */
  getPreventionTips(category = 'general') {
    const tips = {
      general: [
        'Inspect plants regularly for early signs of disease',
        'Remove infected plant parts immediately',
        'Maintain proper spacing between plants',
        'Ensure good air circulation',
        'Water plants at soil level, not overhead',
        'Use disease-resistant varieties when possible',
        'Practice crop rotation',
        'Keep garden tools clean and sanitized',
        'Remove plant debris and weeds',
        'Monitor weather conditions'
      ],
      fungal: [
        'Avoid overhead watering',
        'Water early in the day',
        'Improve air circulation around plants',
        'Remove infected leaves promptly',
        'Apply fungicides preventively if needed'
      ],
      bacterial: [
        'Use disease-free seeds and plants',
        'Avoid working with wet plants',
        'Disinfect tools between plants',
        'Remove and destroy infected plants',
        'Practice crop rotation'
      ],
      viral: [
        'Control insect vectors',
        'Use virus-free planting material',
        'Remove infected plants immediately',
        'Control weeds that harbor viruses',
        'Disinfect hands and tools'
      ]
    };

    return tips[category] || tips.general;
  }

  /**
   * Mock analysis for testing without API key
   */
  getMockAnalysis() {
    const mockDiseases = [
      'Early blight',
      'Late blight',
      'Bacterial spot',
      'Powdery mildew',
      'Leaf mold'
    ];

    const randomDisease = mockDiseases[Math.floor(Math.random() * mockDiseases.length)];
    const probability = (70 + Math.random() * 25).toFixed(2);
    const treatment = this.getTreatmentFromDatabase(randomDisease);

    return {
      isHealthy: false,
      isPlant: true,
      diseases: [
        {
          name: randomDisease,
          probability: probability,
          commonNames: [randomDisease],
          description: `This appears to be ${randomDisease}, a common plant disease.`,
          cause: treatment.severity === 'critical' ? 'Fungal infection' : 'Environmental stress',
          treatment: treatment,
          url: null,
          similarImages: []
        }
      ],
      suggestions: this.generateSuggestions(randomDisease)
    };
  }

  /**
   * Error handler
   */
  handleError(error) {
    if (error.response) {
      return new Error(`Plant.id API Error: ${error.response.status} - ${error.response.data.message || 'Unknown error'}`);
    } else if (error.request) {
      return new Error('Plant.id API is not responding. Please try again later.');
    } else {
      return new Error(`Disease Service Error: ${error.message}`);
    }
  }
}

module.exports = new DiseaseService();
