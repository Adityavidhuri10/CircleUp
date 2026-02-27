const chatService = require('../services/chatService');
const asyncHandler = require('../utils/asyncHandler');
const sendResponse = require('../utils/response');

// C7 fix: GET route — logged-in user from req.user (set by protect middleware)
exports.getPrivateMessages = asyncHandler(async (req, res, next) => {
    const userId = req.user.id;          // from JWT via authMiddleware
    const otherUserId = req.params.friendId;

    const messages = await chatService.getPrivateMessages(userId, otherUserId);
    sendResponse(res, 200, 'Messages fetched successfully', messages);
});
