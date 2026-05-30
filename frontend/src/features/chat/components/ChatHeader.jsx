import React from "react";
import { FaUserCircle } from "react-icons/fa";

const ChatHeader = ({ friend, friendEntry, isTyping, onlineUsers, onBack }) => {
    if (!friend) return null;
    const displayName = friendEntry?.showName ? friend.name : friend.anonymousName;
    const isOnline = onlineUsers.includes(friend._id);

    return (
        <div className="flex items-center p-4 border-b border-gray-200 bg-white">
            {onBack && (
                <button
                    onClick={onBack}
                    className="mr-2.5 p-2 text-purple-600 hover:bg-purple-50 rounded-full md:hidden transition-colors"
                    title="Back to friends list"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                    </svg>
                </button>
            )}
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
