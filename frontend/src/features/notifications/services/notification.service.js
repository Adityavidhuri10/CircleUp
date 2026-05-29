import API from '../../../api/axios';

const notificationService = {
    getNotifications: async () => {
        const response = await API.get('/api/notifications');
        return response.data;
    },

    getUnreadCount: async () => {
        const response = await API.get('/api/notifications/unread-count');
        return response.data;
    },

    markAsRead: async (id) => {
        const response = await API.patch(`/api/notifications/${id}/read`);
        return response.data;
    },

    markAllAsRead: async () => {
        const response = await API.patch('/api/notifications/read-all');
        return response.data;
    }
};

export default notificationService;
