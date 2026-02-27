import React from "react";
import { FaUserCircle, FaEye, FaEyeSlash, FaUserMinus } from "react-icons/fa";

const FriendsList = ({ friends, currentUser, onlineUsers, selectedFriend, onSelect, onToggleName, onRemove }) => {
    const visibleFriends = friends.filter((f) => f.showName);
    const anonymousFriends = friends.filter((f) => !f.showName);

    const FriendItem = ({ f }) => {
        const isOnline = onlineUsers.includes(f.friend._id);
        const displayName = f.showName ? f.friend.name : f.friend.anonymousName;
        const isSelected = selectedFriend?._id === f.friend._id;

        return (
            <div
                onClick={() => onSelect(f.friend)}
                className={`flex items-center p-3 rounded-xl cursor-pointer transition-all ${isSelected ? "bg-purple-100 border border-purple-300" : "hover:bg-gray-100"}`}
            >
                <div className="relative mr-3">
                    {f.friend.picture ? (
                        <img src={f.friend.picture} alt={displayName} className="w-10 h-10 rounded-full object-cover" />
                    ) : (
                        <FaUserCircle className="w-10 h-10 text-gray-400" />
                    )}
                    <span className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${isOnline ? "bg-green-400" : "bg-gray-300"}`} />
                </div>
                <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-800 truncate">{displayName}</p>
                    <p className="text-xs text-gray-400">{isOnline ? "Online" : "Offline"}</p>
                </div>
                <div className="flex items-center space-x-1">
                    <button
                        onClick={(e) => { e.stopPropagation(); onToggleName(f.friend._id); }}
                        className={`p-1.5 rounded-full transition-colors ${f.wantsToShowName ? "bg-blue-100 text-blue-600" : "text-gray-400 hover:bg-gray-100"}`}
                        title={f.showName ? "Name visible" : f.wantsToShowName ? "Request sent (Pending)" : "Show name"}
                    >
                        {f.showName ? <FaEye size={14} /> : f.wantsToShowName ? <FaEye size={14} className="opacity-50" /> : <FaEyeSlash size={14} />}
                    </button>
                    <button onClick={(e) => { e.stopPropagation(); onRemove(f.friend._id); }} className="p-1.5 text-red-400 hover:bg-red-50 rounded-full" title="Remove friend">
                        <FaUserMinus size={14} />
                    </button>
                </div>
            </div>
        );
    };

    return (
        <div className="w-72 bg-white border-r border-gray-200 flex flex-col h-full">
            <div className="p-4 border-b border-gray-200">
                <h2 className="text-xl font-bold text-purple-800">Messages</h2>
                {currentUser && (
                    <p className="text-sm text-gray-500 mt-1">
                        Logged in as <span className="font-medium">{currentUser.name}</span>
                    </p>
                )}
            </div>
            <div className="flex-1 overflow-y-auto p-3 space-y-1">
                {visibleFriends.length > 0 && (
                    <>
                        <p className="text-xs text-gray-400 uppercase font-semibold px-2 pb-1">Friends</p>
                        {visibleFriends.map((f) => <FriendItem key={f.friend._id} f={f} />)}
                    </>
                )}
                {anonymousFriends.length > 0 && (
                    <>
                        <p className="text-xs text-gray-400 uppercase font-semibold px-2 pb-1 pt-3">Anonymous</p>
                        {anonymousFriends.map((f) => <FriendItem key={f.friend._id} f={f} />)}
                    </>
                )}
                {friends.length === 0 && (
                    <div className="text-center text-gray-400 p-4">No friends yet</div>
                )}
            </div>
        </div>
    );
};

export default FriendsList;
