import React from "react";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useChat } from "../hooks/useChat";
import FriendsList from "../components/FriendsList";
import ChatHeader from "../components/ChatHeader";
import MessageBubble from "../components/MessageBubble";
import ChatInput from "../components/ChatInput";
import { FaCommentDots } from "react-icons/fa";

const ChatPage = () => {
    const {
        currentUser, friends, selectedFriend, messages,
        newMessage, setNewMessage, isTyping, onlineUsers, loading,
        messagesEndRef,
        selectFriend, sendMessage, handleTyping, toggleNameVisibility, removeFriend,
    } = useChat();

    const selectedFriendEntry = friends.find((f) => f.friend._id === selectedFriend?._id);

    if (loading) {
        return <div className="min-h-screen flex items-center justify-center text-purple-700 text-xl">Loading...</div>;
    }

    return (
        <div className="h-screen flex flex-col bg-gray-50">
            <ToastContainer />
            <div className="flex flex-1 overflow-hidden relative">
                {/* Friends List - full-width on mobile if no friend selected, hidden if a friend is selected */}
                <div className={`h-full border-r border-gray-200 flex-shrink-0 ${selectedFriend ? "hidden md:flex md:w-72" : "flex w-full md:w-72"}`}>
                    <FriendsList
                        friends={friends}
                        currentUser={currentUser}
                        onlineUsers={onlineUsers}
                        selectedFriend={selectedFriend}
                        onSelect={selectFriend}
                        onToggleName={toggleNameVisibility}
                        onRemove={removeFriend}
                    />
                </div>

                {/* Chat area - hidden on mobile if no friend selected, full-width if a friend is selected */}
                <div className={`flex-1 flex flex-col ${!selectedFriend ? "hidden md:flex" : "flex"}`}>
                    {selectedFriend ? (
                        <>
                            <ChatHeader
                                friend={selectedFriend}
                                friendEntry={selectedFriendEntry}
                                isTyping={isTyping}
                                onlineUsers={onlineUsers}
                                onBack={() => selectFriend(null)}
                            />
                            <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
                                {messages.map((msg, idx) => (
                                    <MessageBubble key={idx} message={msg} currentUserId={currentUser?._id} />
                                ))}
                                <div ref={messagesEndRef} />
                            </div>
                            <ChatInput
                                value={newMessage}
                                onChange={setNewMessage}
                                onSend={sendMessage}
                                onTyping={handleTyping}
                            />
                        </>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center text-gray-400 bg-white">
                            <FaCommentDots size={64} className="mb-4 opacity-30" />
                            <p className="text-lg font-medium">Select a friend to chat</p>
                            <p className="text-sm mt-1">Your conversations will appear here</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ChatPage;
