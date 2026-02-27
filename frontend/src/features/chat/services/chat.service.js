import api from '@/api/axios';

// C7 fix: GET (was POST), C8 fix: toggle-name path fixed
export const chatService = {
    getSingleUser: (userId) =>
        api.get(`/api/users/${userId}`),

    // C7 fix: GET not POST, path uses /api/messages
    getPrivateMessages: (friendId) =>
        api.get(`/api/messages/${friendId}`),

    // C8 fix: /toggle-name-visibility → /:id/toggle-name, send value field (m1 fix)
    toggleNameVisibility: (userId, friendId, value) =>
        api.post(`/api/users/${userId}/toggle-name`, { friendId, value }),

    removeFriend: (userId, friendId) =>
        api.delete(`/api/users/${userId}/friends/${friendId}`),
};
