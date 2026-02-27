const Notification = require('../models/Notification');
const asyncHandler = require('../utils/asyncHandler');
const sendResponse = require('../utils/response');
const AppError = require('../utils/AppError');

// 1️⃣ getNotifications: Return latest 20, Sorted by createdAt DESC
exports.getNotifications = asyncHandler(async (req, res, next) => {
    const notifications = await Notification.find({ recipient: req.user._id })
        .sort({ createdAt: -1 })
        .limit(20)
        .populate('sender', 'name picture anonymousName');

    sendResponse(res, 200, 'Notifications fetched successfully', notifications);
});

// 2️⃣ getUnreadCount: Return count of isRead: false
exports.getUnreadCount = asyncHandler(async (req, res, next) => {
    const count = await Notification.countDocuments({
        recipient: req.user._id,
        isRead: false,
    });

    sendResponse(res, 200, 'Unread count fetched successfully', { count });
});

// 3️⃣ markAsRead: PATCH /:id/read
exports.markAsRead = asyncHandler(async (req, res, next) => {
    const notification = await Notification.findOne({
        _id: req.params.id,
        recipient: req.user._id,
    });

    if (!notification) {
        return next(new AppError('Notification not found or unauthorized', 404));
    }

    notification.isRead = true;
    await notification.save();

    sendResponse(res, 200, 'Notification marked as read', notification);
});

// 4️⃣ markAllAsRead: PATCH /read-all
exports.markAllAsRead = asyncHandler(async (req, res, next) => {
    await Notification.updateMany(
        { recipient: req.user._id, isRead: false },
        { $set: { isRead: true } }
    );

    sendResponse(res, 200, 'All notifications marked as read', null);
});
