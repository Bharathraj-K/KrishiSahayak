const express = require('express');
const router = express.Router();
const NotificationController = require('../controllers/notificationController');
const { protect } = require('../middleware/auth');

// All routes require authentication
router.use(protect);

// Get notifications
router.get('/', NotificationController.getNotifications);

// Get unread count
router.get('/unread-count', NotificationController.getUnreadCount);

// Mark notification as read
router.put('/:id/read', NotificationController.markAsRead);

// Mark all as read
router.put('/read-all', NotificationController.markAllAsRead);

// Delete notification
router.delete('/:id', NotificationController.deleteNotification);

// Delete all read notifications
router.delete('/read/all', NotificationController.deleteAllRead);

// Create notification (internal/admin use)
router.post('/', NotificationController.createNotification);

module.exports = router;
