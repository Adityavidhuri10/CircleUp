const Message = require('../models/Message');
const CommunityMessage = require('../models/CommunityMessage');

const getPrivateMessages = async (userId, otherUserId) => {
    return await Message.find({
        $or: [
            { sender: userId, receiver: otherUserId },
            { sender: otherUserId, receiver: userId },
        ],
    }).sort({ timestamp: 1 });
};

const savePrivateMessage = async (sender, receiver, message) => {
    const newMessage = await Message.create({ sender, receiver, message });

    // Notify receiver
    const { createNotification } = require('./notificationService');
    const User = require('../models/User');
    const senderUser = await User.findById(sender);
    await createNotification({
        recipient: receiver,
        sender: sender,
        type: 'NEW_MESSAGE',
        message: `New message from ${senderUser?.name || 'someone'}`,
    });

    return newMessage;
};

const getCommunityMessages = async (communityId, page = 1, limit = 20) => {
    const skip = (page - 1) * limit;

    const [messages, totalMessages] = await Promise.all([
        CommunityMessage.find({ community: communityId })
            .populate('sender', 'name email picture anonymousName')
            .sort({ createdAt: -1 }) // Sort by newest first for pagination
            .skip(skip)
            .limit(limit),
        CommunityMessage.countDocuments({ community: communityId }),
    ]);

    return {
        messages: messages.reverse(), // Reverse back to chronological order for the UI
        page: parseInt(page),
        totalPages: Math.ceil(totalMessages / limit),
        totalMessages,
    };
};

const saveCommunityMessage = async (communityId, sender, message) => {
    const newMessage = await CommunityMessage.create({
        community: communityId,
        sender,
        message,
    });

    return await CommunityMessage.findById(newMessage._id)
        .populate('sender', 'name email picture anonymousName')
        .exec();
};

module.exports = {
    getPrivateMessages,
    savePrivateMessage,
    getCommunityMessages,
    saveCommunityMessage,
};
