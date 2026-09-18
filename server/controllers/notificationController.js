const Notification = require('../models/Notification');

// @desc    Get current user's notifications
// @route   GET /api/notifications
// @access  Private
const getMyNotifications = async (req, res, next) => {
  try {
    const notifications = await Notification.find({ user: req.user.id })
      .populate('sender', 'name profilePhoto')
      .sort({ createdAt: -1 })
      .limit(30);

    const unreadCount = await Notification.countDocuments({
      user: req.user.id,
      isRead: false,
    });

    res.status(200).json({
      success: true,
      notifications,
      unreadCount,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Mark a notification or all notifications as read
// @route   PUT /api/notifications/mark-read
// @access  Private
const markAsRead = async (req, res, next) => {
  try {
    const { notificationId, markAll } = req.body;

    if (markAll) {
      await Notification.updateMany({ user: req.user.id, isRead: false }, { isRead: true });
    } else if (notificationId) {
      await Notification.findOneAndUpdate(
        { _id: notificationId, user: req.user.id },
        { isRead: true }
      );
    }

    res.status(200).json({
      success: true,
      message: 'Notifications updated',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getMyNotifications,
  markAsRead,
};
