import React from "react";
import { FaUserFriends } from "react-icons/fa";

const UserCard = ({ person }) => {
  return (
    <div className="bg-white shadow-md rounded-xl p-4 flex flex-col items-center hover:shadow-lg transition">
      <img
        src={person.picture || "/default-avatar.png"}
        alt={person.name}
        className="w-20 h-20 object-cover rounded-full border-2 border-blue-400 mb-3"
      />
      <h3 className="text-lg font-semibold text-gray-800">{person.name}</h3>
      <p className="text-gray-500 text-sm">{person.location}</p>

      <button className="mt-3 bg-blue-600 text-white px-4 py-1 rounded-md text-sm flex items-center gap-2 hover:bg-blue-700">
        <FaUserFriends /> Add Friend
      </button>
    </div>
  );
};

export default UserCard;
