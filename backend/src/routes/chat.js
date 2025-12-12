const express = require('express');
const ChatController = require('../controllers/chatController');
const { protect } = require('../middleware/auth');

const router = express.Router();

// All chat routes require authentication
router.use(protect);

// Get AI chat response
router.post('/message', ChatController.getChatResponse);

// Get quick question templates
router.get('/quick-questions', ChatController.getQuickQuestions);

// Get seasonal tips
router.get('/seasonal-tips', ChatController.getSeasonalTips);

// Get advice by category
router.get('/advice/:category', ChatController.getAdviceByCategory);

// Chat history management
router.get('/history', ChatController.getChatHistory);
router.post('/history', ChatController.saveChatMessage);
router.delete('/history', ChatController.clearChatHistory);

module.exports = router;
