const communityService = require('../services/communityService');
const chatService = require('../services/chatService'); // For fetching messages
const asyncHandler = require('../utils/asyncHandler');
const sendResponse = require('../utils/response');

const Community = require('../models/Community');
const AppError = require('../utils/AppError');

exports.createCommunity = asyncHandler(async (req, res, next) => {
    const community = await communityService.createCommunity({
        ...req.body,
        admin: req.user._id
    });
    sendResponse(res, 201, 'Community created successfully', community);
});

exports.addUsersToCommunity = asyncHandler(async (req, res, next) => {
    const { userIds } = req.body;
    const adminId = req.user._id;
    const communityId = req.params.communityId;

    const community = await communityService.addUsersToCommunity(communityId, adminId, userIds);
    sendResponse(res, 200, 'Users added to community successfully', community);
});

exports.getUserCommunities = asyncHandler(async (req, res, next) => {
    const userId = req.user._id;
    const communities = await communityService.getUserCommunities(userId);
    sendResponse(res, 200, 'User communities fetched successfully', communities);
});

exports.getAllCommunities = asyncHandler(async (req, res, next) => {
    const { search } = req.query;
    const communities = await communityService.getAllCommunities(search);
    sendResponse(res, 200, 'All communities fetched successfully', communities);
});

exports.getEligibleMembers = asyncHandler(async (req, res, next) => {
    const { communityId } = req.params;
    const userId = req.user._id;

    const eligible = await communityService.getEligibleMembers(communityId, userId);
    sendResponse(res, 200, 'Eligible members fetched successfully', eligible);
});

exports.joinCommunity = asyncHandler(async (req, res, next) => {
    const { communityId } = req.params;
    const userId = req.user._id;

    const community = await communityService.joinCommunity(communityId, userId);
    sendResponse(res, 200, 'Joined community successfully', community);
});

exports.requestToJoin = asyncHandler(async (req, res, next) => {
    const { communityId } = req.params;
    const userId = req.user._id;

    const result = await communityService.requestToJoin(communityId, userId);
    sendResponse(res, 200, 'Join request sent successfully', result);
});

exports.manageJoinRequest = asyncHandler(async (req, res, next) => {
    const { communityId, userId: targetUserId } = req.params;
    const { action } = req.body; // 'approve' or 'reject'
    const adminId = req.user._id;

    const community = await communityService.manageJoinRequest(communityId, adminId, targetUserId, action);
    sendResponse(res, 200, `Join request ${action}ed successfully`, community);
});

exports.getCommunityMessages = asyncHandler(async (req, res, next) => {
    const { communityId } = req.params;
    const { page, limit } = req.query;
    const userId = req.user._id;

    // ── Membership Validation (CRITICAL) ──────────────────────────────────────
    const community = await Community.findById(communityId);
    if (!community) return next(new AppError('Community not found', 404));

    if (!community.isMember(userId)) {
        return next(new AppError('You must be a member of this community to access messages', 403));
    }

    const result = await chatService.getCommunityMessages(communityId, page, limit);
    sendResponse(res, 200, 'Messages fetched successfully', result);
});

exports.leaveCommunity = asyncHandler(async (req, res, next) => {
    const { communityId } = req.params;
    const userId = req.user._id;

    const community = await communityService.leaveCommunity(communityId, userId);
    sendResponse(res, 200, 'You have left the community successfully', community);
});

exports.removeMember = asyncHandler(async (req, res, next) => {
    const { communityId, userId: targetUserId } = req.params;
    const adminId = req.user._id;

    const community = await communityService.removeMember(communityId, adminId, targetUserId);
    sendResponse(res, 200, 'Member removed successfully', community);
});
