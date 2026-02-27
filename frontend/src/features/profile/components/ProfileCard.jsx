import React from "react";
import { FaCamera, FaMapMarkerAlt, FaCrosshairs, FaEnvelope, FaUserCircle } from "react-icons/fa";

const ProfileCard = ({ user, newLocation, onLocationChange, onLocationUpdate, onDetectLocation, onImageUpload, isSaving, isLoadingLocation, isUploadingImage }) => (
    <div className="bg-white rounded-2xl shadow-md p-6">
        {/* Avatar */}
        <div className="flex flex-col items-center mb-6">
            <div className="relative mb-4">
                {user.picture ? (
                    <img src={user.picture} alt={user.name} className="w-28 h-28 rounded-full object-cover border-4 border-purple-200" />
                ) : (
                    <div className="w-28 h-28 rounded-full bg-purple-200 flex items-center justify-center">
                        <FaUserCircle size={60} className="text-purple-400" />
                    </div>
                )}
                <label htmlFor="avatar-upload" className="absolute bottom-0 right-0 bg-purple-600 text-white p-2 rounded-full cursor-pointer hover:bg-purple-700" title="Change photo">
                    {isUploadingImage ? <span className="text-xs">...</span> : <FaCamera size={14} />}
                    <input id="avatar-upload" type="file" accept="image/*" className="hidden" onChange={(e) => onImageUpload(e.target.files[0])} disabled={isUploadingImage} />
                </label>
            </div>
            <h2 className="text-2xl font-bold text-gray-800">{user.name}</h2>
            <p className="text-gray-500 text-sm italic">{user.anonymousName}</p>
        </div>

        {/* Email */}
        <div className="flex items-center text-gray-600 mb-4">
            <FaEnvelope className="mr-2 text-purple-400" />
            <span className="text-sm">{user.email}</span>
        </div>

        {/* Location */}
        <div className="mb-4">
            <div className="flex items-center text-gray-600 mb-2">
                <FaMapMarkerAlt className="mr-2 text-purple-400" />
                <span className="text-sm font-medium">Location:</span>
                <span className="ml-2 text-sm text-gray-500">{user.location || "Not set"}</span>
            </div>
            <div className="flex space-x-2">
                <input
                    type="text" placeholder="New location..." value={newLocation}
                    onChange={(e) => onLocationChange(e.target.value)}
                    className="flex-1 text-sm p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-400 focus:border-transparent"
                />
                <button onClick={onDetectLocation} disabled={isLoadingLocation} className="px-2 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg" title="Detect location">
                    <FaCrosshairs className="text-gray-600" />
                </button>
                <button onClick={onLocationUpdate} disabled={isSaving || !newLocation.trim()} className="px-3 py-2 bg-purple-600 text-white text-sm rounded-lg hover:bg-purple-700 disabled:opacity-50">
                    {isSaving ? "..." : "Update"}
                </button>
            </div>
        </div>
    </div>
);

export default ProfileCard;
