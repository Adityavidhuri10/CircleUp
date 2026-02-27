import React from 'react';
import { formatDistanceToNow } from 'date-fns';

const NotificationItem = ({ notification, onRead }) => {
    const { sender, message, createdAt, isRead, type, referenceId } = notification;

    const getLink = () => {
        switch (type) {
            case 'FRIEND_REQUEST':
            case 'FRIEND_ACCEPTED':
                return '/peoples';
            case 'COMMUNITY_JOIN_REQUEST':
            case 'COMMUNITY_APPROVED':
            case 'COMMUNITY_INVITE':
                return `/community?id=${referenceId}`;
            case 'NEW_MESSAGE':
                return '/chat';
            default:
                return '#';
        }
    };

    return (
        <div
            onClick={() => onRead(notification._id)}
            className={`p-4 border-b hover:bg-gray-50 cursor-pointer transition-colors ${!isRead ? 'bg-blue-50' : 'bg-white'
                }`}
        >
            <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                    <img
                        src={sender?.picture || '/default.jpg'}
                        alt={sender?.name || 'System'}
                        className="w-10 h-10 rounded-full object-cover"
                    />
                </div>
                <div className="flex-1">
                    <div className="flex justify-between items-start">
                        <p className={`text-sm ${!isRead ? 'font-semibold text-gray-900' : 'text-gray-600'}`}>
                            {message}
                        </p>
                        {!isRead && (
                            <span className="w-2 h-2 bg-blue-500 rounded-full mt-1"></span>
                        )}
                    </div>
                    <span className="text-xs text-gray-400 mt-1 block">
                        {formatDistanceToNow(new Date(createdAt), { addSuffix: true })}
                    </span>
                </div>
            </div>
        </div>
    );
};

export default NotificationItem;
