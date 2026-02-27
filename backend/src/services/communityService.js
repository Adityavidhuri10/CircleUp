const Community = require('../models/Community');
const AppError = require('../utils/AppError');

const createCommunity = async (data) => {
    const community = await Community.create({
        ...data,
        members: [{
            user: data.admin,
            role: 'admin',
        }],
    });
    return community;
};

const addUsersToCommunity = async (communityId, adminId, userIds) => {
    const community = await Community.findById(communityId);
    if (!community) throw new AppError('Community not found', 404);

    if (!community.isAdmin(adminId)) {
        throw new AppError('Only the admin can add users', 403);
    }

    // Avoid duplicates
    const existingUserIds = new Set(community.members.map((m) => m.user.toString()));
    const newMembers = userIds
        .filter((id) => !existingUserIds.has(id.toString()))
        .map((id) => ({ user: id, role: 'member' }));

    if (newMembers.length > 0) {
        community.members.push(...newMembers);
        await community.save();

        // Notify each added user
        const { createNotification } = require('./notificationService');
        for (const userId of userIds) {
            await createNotification({
                recipient: userId,
                sender: adminId,
                type: 'COMMUNITY_INVITE',
                referenceId: communityId,
                message: `You have been added to the community: ${community.name}`,
            });
        }
    }

    return community;
};

const getUserCommunities = async (userId) => {
    return await Community.find({ 'members.user': userId })
        .populate('members.user', 'name email picture');
};

const getAllCommunities = async (search = '') => {
    const filter = search
        ? {
            name: { $regex: search, $options: 'i' },
            isPrivate: false
        }
        : { isPrivate: false };

    const communities = await Community.find(filter)
        .select('name description isPrivate mustApprove members')
        .lean();

    return communities.map(c => ({
        ...c,
        memberCount: c.members.length,
        members: undefined // Hide member details for public list
    }));
};

const leaveCommunity = async (communityId, userId) => {
    const community = await Community.findById(communityId);
    if (!community) throw new AppError('Community not found', 404);

    const memberIndex = community.members.findIndex(m => m.user.toString() === userId.toString());
    if (memberIndex === -1) throw new AppError('You are not a member of this community', 400);

    const member = community.members[memberIndex];

    // If sole admin, prevent leaving
    if (member.role === 'admin') {
        const adminCount = community.members.filter(m => m.role === 'admin').length;
        if (adminCount <= 1) {
            throw new AppError('As the sole admin, you cannot leave. Appoint another admin first or delete the community.', 400);
        }
    }

    community.members.splice(memberIndex, 1);
    await community.save();
    return community;
};

const removeMember = async (communityId, adminId, targetUserId) => {
    const community = await Community.findById(communityId);
    if (!community) throw new AppError('Community not found', 404);

    if (!community.isAdmin(adminId)) {
        throw new AppError('Only admins can remove members', 403);
    }

    if (adminId.toString() === targetUserId.toString()) {
        throw new AppError('You cannot remove yourself. Use the leave endpoint instead.', 400);
    }

    const memberIndex = community.members.findIndex(m => m.user.toString() === targetUserId.toString());
    if (memberIndex === -1) throw new AppError('User is not a member of this community', 404);

    const targetMember = community.members[memberIndex];
    if (targetMember.role === 'admin') {
        const adminCount = community.members.filter(m => m.role === 'admin').length;
        if (adminCount <= 1) {
            throw new AppError('Cannot remove the last admin', 400);
        }
    }

    community.members.splice(memberIndex, 1);
    await community.save();
    return community;
};

const getEligibleMembers = async (communityId, userId) => {
    const community = await Community.findById(communityId);
    if (!community) throw new AppError('Community not found', 404);

    const User = require('../models/User');
    const user = await User.findById(userId).populate('friends.friend', 'name email picture');
    if (!user) throw new AppError('User not found', 404);

    const currentMemberIds = new Set(community.members.map(m => m.user.toString()));

    // Return friends who are not already in the community
    const eligibleFriends = user.friends
        .filter(f => f.friend && !currentMemberIds.has(f.friend._id.toString()))
        .map(f => f.friend);

    return eligibleFriends;
};

const joinCommunity = async (communityId, userId) => {
    const community = await Community.findById(communityId);
    if (!community) throw new AppError('Community not found', 404);

    if (community.isPrivate || community.mustApprove) {
        throw new AppError('This community requires admin approval. Please send a request to join.', 400);
    }

    if (community.isMember(userId)) {
        throw new AppError('You are already a member of this community', 400);
    }

    community.members.push({ user: userId, role: 'member' });
    await community.save();
    return community;
};

const requestToJoin = async (communityId, userId) => {
    const community = await Community.findById(communityId);
    if (!community) throw new AppError('Community not found', 404);

    if (!community.isPrivate && !community.mustApprove) {
        throw new AppError('This community is public and open. Join directly.', 400);
    }

    if (community.isMember(userId)) {
        throw new AppError('You are already a member of this community', 400);
    }

    if (community.joinRequests.includes(userId)) {
        throw new AppError('Join request already pending', 400);
    }

    community.joinRequests.push(userId);
    await community.save();

    // Notify admin(s)
    const { createNotification } = require('./notificationService');
    const admins = community.members.filter(m => m.role === 'admin');
    const User = require('../models/User');
    const requester = await User.findById(userId);

    for (const admin of admins) {
        await createNotification({
            recipient: admin.user,
            sender: userId,
            type: 'COMMUNITY_JOIN_REQUEST',
            referenceId: communityId,
            message: `${requester.name} requested to join ${community.name}`,
        });
    }

    return { status: 'requested' };
};

const manageJoinRequest = async (communityId, adminId, targetUserId, action) => {
    const community = await Community.findById(communityId);
    if (!community) throw new AppError('Community not found', 404);

    if (!community.isAdmin(adminId)) {
        throw new AppError('Only admins can manage join requests', 403);
    }

    const requestIndex = community.joinRequests.indexOf(targetUserId);
    if (requestIndex === -1) {
        throw new AppError('No pending request found for this user', 404);
    }

    community.joinRequests.splice(requestIndex, 1);

    if (action === 'approve') {
        community.members.push({ user: targetUserId, role: 'member' });
    }

    await community.save();

    if (action === 'approve') {
        const { createNotification } = require('./notificationService');
        await createNotification({
            recipient: targetUserId,
            sender: adminId,
            type: 'COMMUNITY_APPROVED',
            referenceId: communityId,
            message: `Your request to join ${community.name} has been approved`,
        });
    }

    return community;
};

module.exports = {
    createCommunity,
    addUsersToCommunity,
    getUserCommunities,
    getAllCommunities,
    leaveCommunity,
    removeMember,
    getEligibleMembers,
    joinCommunity,
    requestToJoin,
    manageJoinRequest,
};
