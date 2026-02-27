import api from '@/api/axios';

export const peopleService = {
    getAllUsers: () =>
        api.get('/api/users/all'),

    getPendingRequests: (userId) =>
        api.get(`/api/users/${userId}/friend-requests`),

    // H4 Fix: senderId removed from body — backend reads it from JWT (req.user.id)
    sendFriendRequest: (receiverId) =>
        api.post('/api/users/friend-request/send', { receiverId }),

    // H4 Fix: userId removed from body — backend reads it from JWT (req.user.id)
    acceptFriendRequest: (requestId) =>
        api.post('/api/users/friend-request/accept', { requestId }),

    rejectFriendRequest: (requestId) =>
        api.post('/api/users/friend-request/reject', { requestId }),

    // AI match now goes through the Node.js backend (JWT auth + rate limiting applied)
    findAiMatches: (requestData) =>
        api.post('/api/ai/find-similar-users', requestData),
};
