const Notification = require('../models/Notification');
const { 
  createError, 
  catchAsync, 
  sendResponse 
} = require('../middleware/errorHandler');

class NotificationController {
  // Get user's notifications
  static getNotifications = catchAsync(async (req, res, next) => {
    const { user } = req;
    const { limit = 20, unreadOnly = false } = req.query;

    const query = { userId: user._id };
    if (unreadOnly === 'true') {
      query.isRead = false;
    }

    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit));

    const unreadCount = await Notification.countDocuments({
      userId: user._id,
      isRead: false
    });

    sendResponse(res, 200, {
      notifications,
      unreadCount
    });
  });

  // Get unread count only
  static getUnreadCount = catchAsync(async (req, res, next) => {
    const { user } = req;

    const unreadCount = await Notification.countDocuments({
      userId: user._id,
      isRead: false
    });

    sendResponse(res, 200, { unreadCount });
  });

  // Mark notification as read
  static markAsRead = catchAsync(async (req, res, next) => {
    const { user } = req;
    const { id } = req.params;

    const notification = await Notification.findOneAndUpdate(
      { _id: id, userId: user._id },
      { isRead: true },
      { new: true }
    );

    if (!notification) {
      return next(createError('Notification not found', 404, 'NOTIFICATION_NOT_FOUND'));
    }

    sendResponse(res, 200, { notification }, 'Notification marked as read');
  });

  // Mark all notifications as read
  static markAllAsRead = catchAsync(async (req, res, next) => {
    const { user } = req;

    await Notification.updateMany(
      { userId: user._id, isRead: false },
      { isRead: true }
    );

    sendResponse(res, 200, null, 'All notifications marked as read');
  });

  // Delete notification
  static deleteNotification = catchAsync(async (req, res, next) => {
    const { user } = req;
    const { id } = req.params;

    const notification = await Notification.findOneAndDelete({
      _id: id,
      userId: user._id
    });

    if (!notification) {
      return next(createError('Notification not found', 404, 'NOTIFICATION_NOT_FOUND'));
    }

    sendResponse(res, 200, null, 'Notification deleted');
  });

  // Delete all read notifications
  static deleteAllRead = catchAsync(async (req, res, next) => {
    const { user } = req;

    await Notification.deleteMany({
      userId: user._id,
      isRead: true
    });

    sendResponse(res, 200, null, 'All read notifications deleted');
  });

  // Create notification (for internal use or admin)
  static createNotification = catchAsync(async (req, res, next) => {
    const { userId, type, title, message, link, metadata } = req.body;

    const notification = await Notification.create({
      userId,
      type,
      title,
      message,
      link,
      metadata
    });

    sendResponse(res, 201, { notification }, 'Notification created');
  });
}

module.exports = NotificationController;
