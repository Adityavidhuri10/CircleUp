import React from "react";
import { FaPaperPlane } from "react-icons/fa";

const CommunityMessageList = ({ messages, currentUser, isTyping, typingUser, messagesEndRef }) => (
    <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {messages.map((msg, idx) => {
            const senderId = msg.sender?._id || msg.sender;
            const isMine = senderId === currentUser?._id;
            const senderName = msg.sender?.anonymousName || msg.anonymousName || "Unknown";

            return (
                <div key={idx} className={`flex ${isMine ? "justify-end" : "justify-start"}`}>
                    {!isMine && (
                        <div className="mr-2 flex flex-col items-center">
                            <div className="w-7 h-7 rounded-full bg-purple-200 flex items-center justify-center text-xs font-bold text-purple-700">
                                {senderName.charAt(0).toUpperCase()}
                            </div>
                        </div>
                    )}
                    <div className={`max-w-[70%] ${isMine ? "items-end" : "items-start"} flex flex-col`}>
                        {!isMine && <span className="text-xs text-gray-500 mb-1 ml-1">{senderName}</span>}
                        <div className={`px-4 py-2 rounded-2xl text-sm shadow-sm ${isMine ? "bg-purple-600 text-white rounded-br-none" : "bg-white text-gray-800 rounded-bl-none border border-gray-100"}`}>
                            {msg.message}
                        </div>
                    </div>
                </div>
            );
        })}
        {isTyping && (
            <p className="text-xs text-purple-500 italic pl-2 animate-pulse">{typingUser} is typing...</p>
        )}
        <div ref={messagesEndRef} />
    </div>
);

const MessageInput = ({ value, onChange, onSend, onTyping }) => {
    const handleKeyDown = (e) => {
        if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); onSend(); }
    };
    return (
        <div className="p-4 border-t border-gray-200 bg-white flex items-center space-x-3">
            <input
                type="text" value={value}
                onChange={(e) => { onChange(e.target.value); onTyping(); }}
                onKeyDown={handleKeyDown}
                placeholder="Type a message..."
                className="flex-1 px-4 py-2 border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-purple-400 text-sm"
            />
            <button onClick={onSend} disabled={!value.trim()} className="w-10 h-10 rounded-full bg-purple-600 text-white flex items-center justify-center hover:bg-purple-700 disabled:opacity-40">
                <FaPaperPlane size={14} />
            </button>
        </div>
    );
};

export { CommunityMessageList, MessageInput };
