const Notification = require('../models/Notification');

/**
 * Helper functions to create notifications for various events
 */

class NotificationService {
  /**
   * Create a weather alert notification
   */
  static async createWeatherAlert(userId, weatherData) {
    try {
      const { condition, temperature, description } = weatherData;
      
      await Notification.create({
        userId,
        type: 'weather',
        title: `Weather Alert: ${condition}`,
        message: `${description}. Temperature: ${temperature}°C`,
        link: '/weather',
        metadata: { weatherData }
      });
    } catch (error) {
      console.error('Error creating weather notification:', error);
    }
  }

  /**
   * Create a price alert notification
   */
  static async createPriceAlert(userId, priceData) {
    try {
      const { commodity, price, change, market } = priceData;
      const direction = change > 0 ? 'increased' : 'decreased';
      
      await Notification.create({
        userId,
        type: 'price',
        title: `Price Alert: ${commodity}`,
        message: `${commodity} price ${direction} to ₹${price}/${priceData.unit || 'quintal'} at ${market}`,
        link: '/market',
        metadata: { priceData }
      });
    } catch (error) {
      console.error('Error creating price notification:', error);
    }
  }

  /**
   * Create a disease alert notification
   */
  static async createDiseaseAlert(userId, diseaseData) {
    try {
      const { diseaseName, cropName, severity } = diseaseData;
      
      await Notification.create({
        userId,
        type: 'disease',
        title: `Disease Alert: ${diseaseName}`,
        message: `${diseaseName} detected in ${cropName}. Severity: ${severity}. Check for treatment options.`,
        link: '/disease',
        metadata: { diseaseData }
      });
    } catch (error) {
      console.error('Error creating disease notification:', error);
    }
  }

  /**
   * Create a general notification
   */
  static async createGeneralNotification(userId, title, message, link = null) {
    try {
      await Notification.create({
        userId,
        type: 'general',
        title,
        message,
        link,
        metadata: {}
      });
    } catch (error) {
      console.error('Error creating general notification:', error);
    }
  }

  /**
   * Create welcome notification for new users
   */
  static async createWelcomeNotification(userId, userName) {
    try {
      await Notification.create({
        userId,
        type: 'general',
        title: '🌾 Welcome to KrishiSahayak!',
        message: `Hello ${userName}! Start by checking weather forecasts, market prices, or chat with our AI assistant for farming advice.`,
        link: '/dashboard',
        metadata: {}
      });
    } catch (error) {
      console.error('Error creating welcome notification:', error);
    }
  }
}

module.exports = NotificationService;
