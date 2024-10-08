const Notification = require('./../model/notificationModel');
const AppError = require('./../utils/appError');
const catchAsync = require('./../utils/catchAsync');
// Create a new notification
exports.createNotification =catchAsync(async (req, res, next) => {
    
    const { category, sent_by, url } = req.body;
    const notification = new Notification({
      category,
      sent_by,
      url
    });
    await notification.save();
    res.status(201).json(notification);
});

// Get all notifications
const getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find().populate('sent_by', 'name'); // Assuming User model has a name field
    res.status(200).json(notifications);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get a single notification by ID
const getNotificationById = async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id).populate('sent_by', 'name');
    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }
    res.status(200).json(notification);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update a notification by ID
const updateNotification = async (req, res) => {
  try {
    const { category, sent_by, url } = req.body;
    const notification = await Notification.findByIdAndUpdate(
      req.params.id,
      { category, sent_by, url, sent_at: Date.now() },
      { new: true, runValidators: true }
    );
    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }
    res.status(200).json(notification);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Delete a notification by ID
const deleteNotification = async (req, res) => {
  try {
    const notification = await Notification.findByIdAndDelete(req.params.id);
    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }
    res.status(200).json({ message: 'Notification deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  createNotification,
  getNotifications,
  getNotificationById,
  updateNotification,
  deleteNotification
};
