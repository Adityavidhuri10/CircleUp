import React from "react";
import { FaUserCircle } from "react-icons/fa";

const ChatHeader = ({ friend, friendEntry, isTyping, onlineUsers }) => {
    if (!friend) return null;
    const displayName = friendEntry?.showName ? friend.name : friend.anonymousName;
    const isOnline = onlineUsers.includes(friend._id);

    return (
        <div className="flex items-center p-4 border-b border-gray-200 bg-white">
            <div className="relative mr-3">
                {friend.picture ? (
                    <img src={friend.picture} alt={displayName} className="w-10 h-10 rounded-full object-cover" />
                ) : (
                    <FaUserCircle className="w-10 h-10 text-gray-400" />
                )}
                <span className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${isOnline ? "bg-green-400" : "bg-gray-300"}`} />
            </div>
            <div>
                <p className="font-semibold text-gray-800">{displayName}</p>
                <p className="text-xs text-gray-400">
                    {isTyping ? <span className="text-purple-500 animate-pulse">Typing...</span> : isOnline ? "Online" : "Offline"}
                </p>
            </div>
        </div>
    );
};

export default ChatHeader;
