import React from "react";
import { FaPaperPlane } from "react-icons/fa";

const ChatInput = ({ value, onChange, onSend, onTyping }) => {
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
            <button
                onClick={onSend}
                disabled={!value.trim()}
                className="w-10 h-10 rounded-full bg-purple-600 text-white flex items-center justify-center hover:bg-purple-700 disabled:opacity-40"
            >
                <FaPaperPlane size={14} />
            </button>
        </div>
    );
};

export default ChatInput;
