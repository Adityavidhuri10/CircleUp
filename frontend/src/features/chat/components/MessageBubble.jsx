import React from "react";

const formatTime = (ts) => {
    if (!ts) return "";
    const d = new Date(ts);
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
};

const MessageBubble = ({ message, currentUserId }) => {
    // Support both 'from' (legacy) and 'sender' (new standard)
    const senderId = message.sender || message.from?._id || message.from;
    const isSent = senderId === currentUserId;

    return (
        <div className={`flex ${isSent ? "justify-end" : "justify-start"} mb-3`}>
            <div className={`max-w-[70%] px-4 py-2 rounded-2xl text-sm shadow-sm ${isSent ? "bg-purple-600 text-white rounded-br-none" : "bg-gray-100 text-gray-800 rounded-bl-none"}`}>
                <p>{message.message}</p>
                <p className={`text-xs mt-1 ${isSent ? "text-purple-200" : "text-gray-400"} text-right`}>
                    {formatTime(message.createdAt)}
                </p>
            </div>
        </div>
    );
};

export default MessageBubble;
