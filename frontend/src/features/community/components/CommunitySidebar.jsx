import React from "react";
import { FaUsers, FaGlobe } from "react-icons/fa";
import { Link } from "react-router-dom";

const CommunitySidebar = ({ communities, selectedCommunity, onSelect }) => (
    <div className="w-60 bg-white border-r border-gray-200 flex flex-col h-full">
        <div className="p-4 border-b border-gray-200">
            <h2 className="text-xl font-bold text-purple-800">Communities</h2>
        </div>
        <div className="flex-1 overflow-y-auto p-3 space-y-1">
            {communities.length === 0 ? (
                <div className="text-center text-gray-400 p-4">
                    <FaUsers className="mx-auto text-3xl mb-2 opacity-50" />
                    <p className="text-sm">No communities yet</p>
                </div>
            ) : (
                communities.map((community) => (
                    <button
                        key={community._id}
                        onClick={() => onSelect(community)}
                        className={`w-full text-left p-3 rounded-xl transition-all ${selectedCommunity?._id === community._id ? "bg-purple-100 border border-purple-300" : "hover:bg-gray-100"}`}
                    >
                        <p className="font-medium text-gray-800 truncate">{community.name}</p>
                        <p className="text-xs text-gray-500">{community.members?.length || 0} members</p>
                    </button>
                ))
            )}
        </div>
        <div className="p-4 border-t border-gray-100">
            <Link
                to="/communities/explore"
                className="flex items-center justify-center gap-2 w-full py-3 bg-purple-600 text-white rounded-2xl hover:bg-purple-700 transition-colors font-bold shadow-md shadow-purple-100"
            >
                <FaGlobe size={14} />
                Explore New
            </Link>
        </div>
    </div>
);

export default CommunitySidebar;
