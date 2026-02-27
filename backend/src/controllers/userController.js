const userService = require('../services/userService');
const friendService = require('../services/friendService');
const asyncHandler = require('../utils/asyncHandler');
const sendResponse = require('../utils/response');
const AppError = require('../utils/AppError');

// ── Ownership helper — H3 Fix ─────────────────────────────────────────────────
// Ensures the authenticated user can only mutate their own resource.
// Allow if: caller is the resource owner, or no :id param (route-level access).
const assertOwner = (req, next) => {
    if (req.params.id && req.params.id !== req.user.id.toString()) {
        next(new AppError('You are not authorized to modify this resource', 403));
        return false;
    }
    return true;
};

// ── User CRUD ─────────────────────────────────────────────────────────────────

exports.getAllUsers = asyncHandler(async (req, res, next) => {
    const users = await userService.getAllUsers(req.user.id);
    sendResponse(res, 200, 'Users fetched successfully', users);
});

// Supports both body.id (legacy POST /singleUser) and params.id (RESTful GET /:id)
exports.getSingleUser = asyncHandler(async (req, res, next) => {
    const id = req.params.id || req.body.id;
    const user = await userService.getSingleUser(id);
    sendResponse(res, 200, 'User fetched successfully', user);
});

// PUT /api/users/:id — general field update (picture etc.)
// H3 Fix: caller must own the resource
exports.updateUser = asyncHandler(async (req, res, next) => {
    if (!assertOwner(req, next)) return;
    const user = await userService.updateUser(req.params.id, req.body);
    sendResponse(res, 200, 'User updated successfully', user);
});

// DELETE /api/users/:id
// H3 Fix: caller must own the resource
exports.deleteAccount = asyncHandler(async (req, res, next) => {
    if (!assertOwner(req, next)) return;
    await userService.deleteAccount(req.params.id);
    sendResponse(res, 200, 'Account deleted successfully');
});

// ── Goals — POST/DELETE/PUT /:id/goals ───────────────────────────────────────
// H3 Fix: caller must own the resource

exports.addGoal = asyncHandler(async (req, res, next) => {
    if (!assertOwner(req, next)) return;
    const { goal, type } = req.body;
    const user = await userService.updateGoals(req.params.id, 'add', goal, null, type);
    sendResponse(res, 200, 'Goal added successfully', { user });
});

exports.deleteGoal = asyncHandler(async (req, res, next) => {
    if (!assertOwner(req, next)) return;
    const { goal, type } = req.body;
    const user = await userService.updateGoals(req.params.id, 'remove', goal, null, type);
    sendResponse(res, 200, 'Goal removed successfully', { user });
});

exports.updateGoal = asyncHandler(async (req, res, next) => {
    if (!assertOwner(req, next)) return;
    const { oldGoal, newGoal } = req.body;
    const user = await userService.updateGoals(req.params.id, 'update', newGoal, oldGoal);
    sendResponse(res, 200, 'Goal updated successfully', { user });
});

// PUT /:id/location
// H3 Fix: caller must own the resource
exports.changeLocation = asyncHandler(async (req, res, next) => {
    if (!assertOwner(req, next)) return;
    const { location } = req.body;
    const user = await userService.updateLocation(req.params.id, location);
    sendResponse(res, 200, 'Location updated successfully', user);
});

// POST /:id/change-password (in-app password change when already logged in)
// H3 Fix: caller must own the resource
exports.changePassword = asyncHandler(async (req, res, next) => {
    if (!assertOwner(req, next)) return;
    const { newPassword } = req.body;
    const bcrypt = require('bcryptjs');
    const User = require('../models/User');
    const user = await User.findById(req.params.id);
    if (!user) return next(new AppError('User not found', 404));
    user.password = await bcrypt.hash(newPassword, 12);
    await user.save({ validateBeforeSave: false });
    sendResponse(res, 200, 'Password changed successfully');
});

// ── Friend management ─────────────────────────────────────────────────────────

// POST /api/users/friend-request/send
// H4 Fix: senderId is ALWAYS req.user.id — never from body
exports.sendFriendRequest = asyncHandler(async (req, res, next) => {
    const senderId = req.user.id;            // H4 Fix: cannot be spoofed
    const { receiverId } = req.body;         // only receiverId comes from client
    if (!receiverId) return next(new AppError('receiverId is required', 400));
    await friendService.sendFriendRequest(senderId, receiverId);
    sendResponse(res, 200, 'Friend request sent successfully');
});

// POST /api/users/friend-request/accept
// H4 Fix: userId is always req.user.id — the accepting user is the caller
exports.acceptFriendRequest = asyncHandler(async (req, res, next) => {
    const { requestId } = req.body;
    if (!requestId) return next(new AppError('requestId is required', 400));
    await friendService.respondToFriendRequest(req.user.id, requestId, 'accepted');
    sendResponse(res, 200, 'Friend request accepted successfully');
});

// POST /api/users/friend-request/reject
// H4 Fix: userId is always req.user.id
exports.rejectFriendRequest = asyncHandler(async (req, res, next) => {
    const { requestId } = req.body;
    if (!requestId) return next(new AppError('requestId is required', 400));
    await friendService.respondToFriendRequest(req.user.id, requestId, 'rejected');
    sendResponse(res, 200, 'Friend request rejected successfully');
});

// DELETE /:id/friends/:friendId
// H3 Fix: :id must match caller; H4 Fix: userId from JWT not body
exports.removeFriend = asyncHandler(async (req, res, next) => {
    if (!assertOwner(req, next)) return;
    const user = await friendService.removeFriend(req.params.id, req.params.friendId);
    sendResponse(res, 200, 'Friend removed successfully', { user });
});

// GET /:id/friend-requests
// H3 Fix: can only view your own requests
exports.getFriendRequests = asyncHandler(async (req, res, next) => {
    if (!assertOwner(req, next)) return;
    const requests = await friendService.getFriendRequests(req.params.id);
    sendResponse(res, 200, 'Friend requests fetched successfully', { requests });
});

// POST /:id/toggle-name
// H3 Fix: caller must own the resource
exports.toggleNameVisibility = asyncHandler(async (req, res, next) => {
    if (!assertOwner(req, next)) return;
    const { friendId, value } = req.body;
    const result = await friendService.toggleNameVisibility(req.params.id, friendId, value);
    sendResponse(res, 200,
        result.bothAgreed ? 'Names are now visible to each other' : 'Request sent. Names visible when both agree',
        result
    );
});
