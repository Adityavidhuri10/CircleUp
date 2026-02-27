import api from '@/api/axios';

// C4 fix: all paths use /api/communities (was /api/community)
// m3 fix: addUserToCommunity sends correct body fields
export const communityService = {
    getMyCommunities: () =>
        api.post('/api/communities/my', {}),

    getAllCommunities: (search = '') =>
        api.get(`/api/communities${search ? `?search=${search}` : ''}`),

    createCommunity: (data) =>
        api.post('/api/communities', data),

    addUsersToCommunity: (communityId, userIds) =>
        api.post(`/api/communities/${communityId}/users`, { userIds }),

    getMessages: (communityId, page = 1, limit = 20) =>
        api.get(`/api/communities/${communityId}/messages?page=${page}&limit=${limit}`),

    getEligibleMembers: (communityId) =>
        api.get(`/api/communities/${communityId}/eligible-members`),

    joinCommunity: (communityId) =>
        api.post(`/api/communities/${communityId}/join`),

    requestToJoin: (communityId) =>
        api.post(`/api/communities/${communityId}/request`),

    manageJoinRequest: (communityId, userId, action) =>
        api.post(`/api/communities/${communityId}/requests/${userId}/manage`, { action }),

    leaveCommunity: (communityId) =>
        api.delete(`/api/communities/${communityId}/leave`),

    removeMember: (communityId, userId) =>
        api.delete(`/api/communities/${communityId}/users/${userId}`),
};
