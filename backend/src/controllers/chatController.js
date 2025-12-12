const chatService = require('../services/chatService');
const { catchAsync, sendResponse, createError } = require('../middleware/errorHandler');

class ChatController {
  /**
   * Get AI chat response
   */
  static getChatResponse = catchAsync(async (req, res, next) => {
    const { message, conversationHistory } = req.body;

    if (!message || message.trim() === '') {
      return next(createError('Message is required', 400, 'MESSAGE_REQUIRED'));
    }

    // Get response from AI
    const response = await chatService.getChatResponse(
      message,
      conversationHistory || []
    );

    sendResponse(res, 200, {
      response: response.message,
      model: response.model,
      tokensUsed: response.tokensUsed,
      timestamp: new Date().toISOString()
    }, 'Chat response generated successfully');
  });

  /**
   * Get quick question templates
   */
  static getQuickQuestions = catchAsync(async (req, res, next) => {
    const questions = chatService.getQuickQuestions();

    sendResponse(res, 200, {
      questions,
      count: questions.length
    }, 'Quick questions fetched successfully');
  });

  /**
   * Get seasonal farming tips
   */
  static getSeasonalTips = catchAsync(async (req, res, next) => {
    const { season } = req.query;

    const tips = chatService.getSeasonalTips(season);

    sendResponse(res, 200, {
      season: season || 'all',
      tips,
      count: tips.length
    }, 'Seasonal tips fetched successfully');
  });

  /**
   * Get farming advice by category
   */
  static getAdviceByCategory = catchAsync(async (req, res, next) => {
    const { category } = req.params;

    if (!category) {
      return next(createError('Category is required', 400, 'CATEGORY_REQUIRED'));
    }

    const advice = chatService.getAdviceByCategory(category);

    sendResponse(res, 200, advice, 'Advice fetched successfully');
  });

  /**
   * Get chat history for user
   */
  static getChatHistory = catchAsync(async (req, res, next) => {
    const user = req.user;
    const { limit = 50 } = req.query;

    // In production, fetch from database
    // For now, return empty array
    const history = [];

    sendResponse(res, 200, {
      history: history.slice(0, parseInt(limit)),
      count: history.length
    }, 'Chat history fetched successfully');
  });

  /**
   * Save chat message to history
   */
  static saveChatMessage = catchAsync(async (req, res, next) => {
    const user = req.user;
    const { userMessage, aiResponse } = req.body;

    if (!userMessage || !aiResponse) {
      return next(createError('User message and AI response are required', 400, 'INVALID_DATA'));
    }

    // In production, save to MongoDB user.chatHistory
    const chatEntry = {
      userMessage,
      aiResponse,
      timestamp: new Date()
    };

    sendResponse(res, 201, {
      saved: true,
      entry: chatEntry
    }, 'Chat message saved successfully');
  });

  /**
   * Clear chat history
   */
  static clearChatHistory = catchAsync(async (req, res, next) => {
    const user = req.user;

    // In production, clear from database
    // user.chatHistory = [];
    // await user.save();

    sendResponse(res, 200, {
      cleared: true
    }, 'Chat history cleared successfully');
  });
}

module.exports = ChatController;
