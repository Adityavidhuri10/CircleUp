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
            <div className="flex flex-1 overflow-hidden relative">
                {/* Community Sidebar - full width on mobile if no community selected, hidden if selected */}
                <div className={`h-full border-r border-gray-200 flex-shrink-0 ${selectedCommunity ? "hidden md:flex md:w-60" : "flex w-full md:w-60"}`}>
                    <CommunitySidebar
                        communities={communities}
                        selectedCommunity={selectedCommunity}
                        onSelect={selectCommunity}
                    />
                </div>

                {/* Message area - hidden on mobile if no community selected, full width if selected */}
                <div className={`flex-1 flex flex-col ${!selectedCommunity ? "hidden md:flex" : "flex"}`}>
                    {selectedCommunity ? (
                        <>
                            <div className="p-4 border-b border-gray-200 bg-white flex items-center justify-between">
                                <div className="flex items-center">
                                    <button
                                        onClick={() => selectCommunity(null)}
                                        className="mr-2.5 p-2 text-purple-600 hover:bg-purple-50 rounded-full md:hidden transition-colors"
                                        title="Back to community list"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                                        </svg>
                                    </button>
                                    <div>
                                        <h2 className="text-lg font-bold text-purple-800">{selectedCommunity.name}</h2>
                                        <p className="text-xs text-gray-500">{selectedCommunity.members?.length || 0} members</p>
                                    </div>
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
                        <div className="flex-1 flex flex-col items-center justify-center text-gray-400 bg-white">
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
