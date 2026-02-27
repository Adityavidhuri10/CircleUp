import React from "react";
import { FaSearch, FaTimes } from "react-icons/fa";
import { getAvatarColor } from "./PeopleCard";

const SearchBar = ({ searchQuery, onChange, onClear, results, isSearching, onSelectUser }) => (
    <div className="w-full max-w-md mb-4 relative">
        <div className="relative">
            <input
                type="text"
                placeholder="Search by location..."
                value={searchQuery}
                onChange={onChange}
                className="w-full p-3 pl-10 pr-10 rounded-full border border-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
            <FaSearch className="absolute left-3 top-3.5 text-gray-400" />
            {searchQuery && (
                <button onClick={onClear} className="absolute right-3 top-3.5 text-gray-400 hover:text-gray-600">
                    <FaTimes />
                </button>
            )}
        </div>

        {isSearching && (
            <div className="absolute top-full left-0 right-0 bg-white mt-1 rounded-lg shadow-lg z-10 max-h-60 overflow-y-auto">
                {results.length > 0 ? (
                    results.map((user) => (
                        <div
                            key={user._id}
                            className="p-3 hover:bg-purple-50 cursor-pointer flex items-center"
                            onClick={() => onSelectUser(user._id)}
                        >
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${getAvatarColor(user.name || user.anonymousName)} mr-3`}>
                                {user.picture ? (
                                    <img src={user.picture} alt="" className="w-full h-full object-cover rounded-full" />
                                ) : (
                                    <span className="text-white text-xs font-bold">{(user.name || user.anonymousName).charAt(0).toUpperCase()}</span>
                                )}
                            </div>
                            <div>
                                <p className="font-medium">{user.anonymousName}</p>
                                <p className="text-xs text-gray-500">{user.location}</p>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="p-3 text-gray-500 text-center">No users found in this location</div>
                )}
            </div>
        )}
    </div>
);

export default SearchBar;
