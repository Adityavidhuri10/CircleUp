import React from "react";
import { FaCheck, FaTimes, FaUsers } from "react-icons/fa";
import { getAvatarColor } from "./PeopleCard";

const PendingRequests = ({ requests, onAccept, onReject, onBack }) => (
    <div className="w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-purple-800">
                Pending Requests ({requests.length})
            </h2>
            <button onClick={onBack} className="text-purple-600 hover:text-purple-800">
                Back to Discover
            </button>
        </div>

        {requests.length > 0 ? (
            <div className="space-y-3">
                {requests.map((request) => (
                    <div key={request._id} className="bg-white p-4 rounded-xl shadow-md">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center">
                                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${getAvatarColor(request.from.name)} mr-3`}>
                                    {request.from.picture ? (
                                        <img src={request.from.picture} alt="" className="w-full h-full object-cover rounded-full" />
                                    ) : (
                                        <span className="text-white font-bold">{request.from.name.charAt(0).toUpperCase()}</span>
                                    )}
                                </div>
                                <div>
                                    <h3 className="font-semibold">{request.from.name}</h3>
                                    <p className="text-sm text-gray-500">Sent {new Date(request.createdAt).toLocaleDateString()}</p>
                                </div>
                            </div>
                            <div className="flex space-x-2">
                                <button onClick={() => onAccept(request._id)} className="p-2 bg-green-500 text-white rounded-full hover:bg-green-600" title="Accept">
                                    <FaCheck />
                                </button>
                                <button onClick={() => onReject(request._id)} className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600" title="Reject">
                                    <FaTimes />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        ) : (
            <div className="bg-white p-6 rounded-xl shadow-md text-center">
                <FaUsers className="mx-auto text-4xl text-gray-400 mb-3" />
                <p className="text-gray-600">No pending friend requests</p>
            </div>
        )}
    </div>
);

export default PendingRequests;
