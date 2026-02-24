const Notification = require('../models/Notification');

// @desc    Get user notifications
// @route   GET /api/notifications
// @access  Private
exports.getNotifications = async (req, res) => {
  try {
    const { page = 1, limit = 20, unreadOnly } = req.query;

    const query = { user: req.user._id };
    if (unreadOnly === 'true') {
      query.isRead = false;
    }

    const notifications = await Notification.find(query)
      .populate('demand', 'title status')
      .sort({ createdAt: -1 })
      .skip((parseInt(page) - 1) * parseInt(limit))
      .limit(parseInt(limit));

    const total = await Notification.countDocuments(query);
    const unreadCount = await Notification.countDocuments({ 
      user: req.user._id, 
      isRead: false 
    });

    res.json({
      success: true,
      notifications,
      unreadCount,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({
      success: false,
      message: 'নোটিফিকেশনগুলো লোড করতে সমস্যা হয়েছে',
      error: error.message
    });
  }
};

// @desc    Mark notification as read
// @route   PUT /api/notifications/:id/read
// @access  Private
exports.markAsRead = async (req, res) => {
  try {
    const notification = await Notification.findOne({
      _id: req.params.id,
      user: req.user._id
    });

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'নোটিফিকেশন পাওয়া যায়নি'
      });
    }

    notification.isRead = true;
    await notification.save();

    res.json({
      success: true,
      message: 'নোটিফিকেশন পড়া হয়েছে',
      notification
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'নোটিফিকেশন আপডেট করতে সমস্যা হয়েছে'
    });
  }
};

// @desc    Mark all notifications as read
// @route   PUT /api/notifications/read-all
// @access  Private
exports.markAllAsRead = async (req, res) => {
  try {
    await Notification.updateMany(
      { user: req.user._id, isRead: false },
      { isRead: true }
    );

    res.json({
      success: true,
      message: 'সকল নোটিফিকেশন পড়া হয়েছে'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'নোটিফিকেশনগুলো আপডেট করতে সমস্যা হয়েছে'
    });
  }
};

// @desc    Delete notification
// @route   DELETE /api/notifications/:id
// @access  Private
exports.deleteNotification = async (req, res) => {
  try {
    const notification = await Notification.findOne({
      _id: req.params.id,
      user: req.user._id
    });

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'নোটিফিকেশন পাওয়া যায়নি'
      });
    }

    await notification.deleteOne();

    res.json({
      success: true,
      message: 'নোটিফিকেশন মুছে ফেলা হয়েছে'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'নোটিফিকেশন মুছে ফেলতে সমস্যা হয়েছে'
    });
  }
};

// @desc    Get unread count
// @route   GET /api/notifications/unread-count
// @access  Private
exports.getUnreadCount = async (req, res) => {
  try {
    const count = await Notification.countDocuments({
      user: req.user._id,
      isRead: false
    });

    res.json({
      success: true,
      unreadCount: count
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'আনরিড কাউন্ট লোড করতে সমস্যা হয়েছে'
    });
  }
};
