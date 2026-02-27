import React from 'react';
import useNotifications from '../hooks/useNotifications';
import NotificationItem from '../components/NotificationItem';
import { useNavigate } from 'react-router-dom';

const NotificationPage = () => {
    const { notifications, loading, markAsRead, markAllAsRead, refresh } = useNotifications();
    const navigate = useNavigate();

    const handleNotificationClick = (id) => {
        markAsRead(id);
        // You could also navigate based on type here if desired
    };

    return (
        <div className="max-w-2xl mx-auto py-8 px-4">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
                {notifications.some(n => !n.isRead) && (
                    <button
                        onClick={markAllAsRead}
                        className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                    >
                        Mark all as read
                    </button>
                )}
            </div>

            <div className="bg-white rounded-lg shadow overflow-hidden border">
                {loading && notifications.length === 0 ? (
                    <div className="p-8 text-center text-gray-500">Loading notifications...</div>
                ) : notifications.length > 0 ? (
                    notifications.map((notification) => (
                        <NotificationItem
                            key={notification._id}
                            notification={notification}
                            onRead={handleNotificationClick}
                        />
                    ))
                ) : (
                    <div className="p-12 text-center text-gray-500 italic">
                        No notifications yet!
                    </div>
                )}
            </div>
        </div>
    );
};

export default NotificationPage;
