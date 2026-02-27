const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
    {
        recipient: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: [true, 'Recipient is required'],
        },
        sender: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
        },
        type: {
            type: String,
            required: [true, 'Notification type is required'],
            enum: [
                'FRIEND_REQUEST',
                'FRIEND_ACCEPTED',
                'COMMUNITY_JOIN_REQUEST',
                'COMMUNITY_APPROVED',
                'COMMUNITY_INVITE',
                'NEW_MESSAGE',
            ],
        },
        referenceId: {
            type: mongoose.Schema.Types.ObjectId,
        },
        message: {
            type: String,
            required: [true, 'Notification message is required'],
        },
        isRead: {
            type: Boolean,
            default: false,
        },
    },
    {
        timestamps: true,
    }
);

// Index for fast retrieval of user's latest notifications
notificationSchema.index({ recipient: 1, createdAt: -1 });

const Notification = mongoose.model('Notification', notificationSchema);

module.exports = Notification;
