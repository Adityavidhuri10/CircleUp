import React from "react";
import { FaUsers, FaSignOutAlt } from "react-icons/fa";
import { toast } from "react-hot-toast";
import { useCommunityChat } from "../hooks/useCommunityChat";
import CommunitySidebar from "../components/CommunitySidebar";
import { CommunityMessageList, MessageInput } from "../components/CommunityMessages";

const CommunityPage = () => {
    const {
        communities, selectedCommunity, messages,
        newMessage, setNewMessage, isTyping, typingUser, currentUser, loading,
        messagesEndRef,
        selectCommunity, sendMessage, handleTyping, leaveCommunity,
    } = useCommunityChat();

    if (loading) return <div className="min-h-screen flex items-center justify-center text-purple-700">Loading...</div>;

    return (
        <div className="h-screen flex flex-col bg-gray-50">
            <div className="flex flex-1 overflow-hidden">
                <CommunitySidebar
                    communities={communities}
                    selectedCommunity={selectedCommunity}
                    onSelect={selectCommunity}
                />

                <div className="flex-1 flex flex-col">
                    {selectedCommunity ? (
                        <>
                            <div className="p-4 border-b border-gray-200 bg-white flex items-center justify-between">
                                <div>
                                    <h2 className="text-lg font-bold text-purple-800">{selectedCommunity.name}</h2>
                                    <p className="text-xs text-gray-500">{selectedCommunity.members?.length || 0} members</p>
                                </div>
                                <button
                                    onClick={async () => {
                                        if (window.confirm(`Are you sure you want to leave ${selectedCommunity.name}?`)) {
                                            const result = await leaveCommunity(selectedCommunity._id);
                                            if (result.success) {
                                                toast.success(`You have left ${selectedCommunity.name}`);
                                            } else {
                                                toast.error(result.error);
                                            }
                                        }
                                    }}
                                    className="px-4 py-2 text-sm font-bold text-red-500 hover:bg-red-50 rounded-xl transition-colors flex items-center gap-2"
                                    title="Leave Community"
                                >
                                    <FaSignOutAlt size={16} />
                                    Leave
                                </button>
                            </div>
                            <CommunityMessageList
                                messages={messages}
                                currentUser={currentUser}
                                isTyping={isTyping}
                                typingUser={typingUser}
                                messagesEndRef={messagesEndRef}
                            />
                            <MessageInput
                                value={newMessage}
                                onChange={setNewMessage}
                                onSend={sendMessage}
                                onTyping={handleTyping}
                            />
                        </>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
                            <FaUsers size={64} className="mb-4 opacity-30" />
                            <p className="text-lg font-medium">Select a community to chat</p>
                            <p className="text-sm mt-1">Join the conversation!</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CommunityPage;
