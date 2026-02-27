const Notification = require('../models/Notification');
const { getIO } = require('./socketService');
const logger = require('../utils/logger');

/**
 * Creates a notification and emits it via socket
 * @param {Object} data - Notification data
 * @param {String} data.recipient - Recipient user ID
 * @param {String} data.sender - Sender user ID (optional)
 * @param {String} data.type - Notification type (enum)
 * @param {String} data.referenceId - Related ID (Community/Friend Request) (optional)
 * @param {String} data.message - Notification message
 */
const createNotification = async ({ recipient, sender, type, referenceId, message }) => {
    try {
        const notification = await Notification.create({
            recipient,
            sender,
            type,
            referenceId,
            message,
        });

        // Populate sender for frontend
        const populatedNotification = await Notification.findById(notification._id)
            .populate('sender', 'name picture anonymousName');

        // Emit real-time notification via socket
        try {
            const io = getIO();
            io.to(recipient.toString()).emit('new-notification', populatedNotification);
            logger.info(`Real-time notification sent to ${recipient} (Type: ${type})`);
        } catch (socketErr) {
            // Log but don't fail if socket is not available
            logger.warn(`Socket notification failed: ${socketErr.message}`);
        }

        return populatedNotification;
    } catch (error) {
        logger.error(`Error creating notification: ${error.message}`);
        // We don't throw error here to avoid breaking the main business flow
        return null;
    }
};

module.exports = {
    createNotification,
};
