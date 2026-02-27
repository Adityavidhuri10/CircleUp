import React from "react";
import { motion } from "framer-motion";
import { FaBullseye, FaRobot, FaCamera, FaTimes, FaUserPlus, FaCheck } from "react-icons/fa";

const AVATAR_COLORS = [
    "bg-gradient-to-r from-purple-400 to-pink-500",
    "bg-gradient-to-r from-blue-400 to-teal-400",
    "bg-gradient-to-r from-orange-400 to-red-500",
    "bg-gradient-to-r from-green-400 to-blue-500",
    "bg-gradient-to-r from-yellow-400 to-orange-500",
];

export const getAvatarColor = (name = "") => {
    const hash = name.split("").reduce((acc, char) => char.charCodeAt(0) + acc, 0);
    return AVATAR_COLORS[hash % AVATAR_COLORS.length];
};

const PeopleCard = ({
    person, controls, onSwipe, onReject, onSendRequest,
    sentRequests, showAiMatches, aiMatchingResults, onOpenPhoto,
}) => {
    const matchData = showAiMatches && aiMatchingResults
        ? aiMatchingResults.similar_users?.find(
            (u) => u.username === (person.name || person.anonymousName)
        )
        : null;

    return (
        <motion.div
            key={person._id}
            drag="x"
            onDragEnd={(e, info) => onSwipe(info, person._id)}
            animate={controls}
            initial={{ x: 0, opacity: 1 }}
            className="absolute w-full h-[550px] bg-white rounded-3xl shadow-xl overflow-hidden"
        >
            {/* Photo area */}
            <div className={`h-3/4 relative flex items-center justify-center ${getAvatarColor(person.name || person.anonymousName)}`}>
                {person.picture ? (
                    <>
                        <img src={person.picture} alt={person.anonymousName} className="w-full h-full object-cover" />
                        <button
                            onClick={() => onOpenPhoto(person.picture)}
                            className="absolute bottom-4 right-4 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70 transition-all z-50"
                            title="View profile photo"
                        >
                            <FaCamera size={20} />
                        </button>
                    </>
                ) : (
                    <div className="text-white text-4xl font-bold">
                        {person.anonymousName?.charAt(0).toUpperCase()}
                    </div>
                )}
            </div>

            {/* Info panel */}
            <div className="absolute bottom-24 left-4 right-4 p-4 bg-white bg-opacity-90 rounded-xl shadow-sm">
                <div className="flex justify-between items-center mb-2">
                    <h2 className="text-2xl font-bold text-gray-800">{person.anonymousName}</h2>
                    {matchData && (
                        <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded">
                            {(matchData.similarity_score * 100).toFixed(0)}% match
                        </span>
                    )}
                </div>
                <p className="text-sm text-gray-600 mb-2"><span className="font-medium">Location:</span> {person.location}</p>
                {/* Primary Goal Badge */}
                {person.primaryGoal && (
                    <div className="absolute top-4 right-4 bg-purple-600 text-white px-3 py-1 rounded-full text-sm font-semibold shadow-md">
                        {person.primaryGoal}
                    </div>
                )}

                {/* Secondary Goals / Interests */}
                {person.secondaryGoals?.length > 0 && (
                    <div className="mt-3">
                        <div className="flex items-center text-purple-600 mb-1">
                            <FaBullseye className="mr-2" /><span className="font-semibold">Interests</span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {person.secondaryGoals.map((goal, i) => (
                                <span key={i} className="text-xs bg-purple-50 text-purple-700 px-2 py-1 rounded border border-purple-100">
                                    {goal}
                                </span>
                            ))}
                        </div>
                    </div>
                )}
                {matchData && (
                    <div className="bg-purple-50 p-3 rounded mt-2">
                        <div className="flex items-center text-purple-700 mb-1">
                            <FaRobot className="mr-2" /><span className="font-semibold">Why we matched you</span>
                        </div>
                        <ul className="list-disc list-inside text-gray-700 text-sm">
                            {matchData.similarity_reasons?.slice(0, 2).map((reason, i) => <li key={i}>{reason}</li>)}
                        </ul>
                    </div>
                )}
            </div>

            {/* Action buttons */}
            <div className="absolute bottom-4 left-0 right-0 flex justify-center space-x-8">
                <button onClick={() => onReject(person._id)} className="w-14 h-14 rounded-full bg-white shadow-lg flex items-center justify-center text-red-500 hover:bg-red-50">
                    <FaTimes size={24} />
                </button>
                {sentRequests.includes(person._id) ? (
                    <button className="w-14 h-14 rounded-full bg-white shadow-lg flex items-center justify-center text-gray-400 cursor-default" title="Request sent">
                        <FaCheck size={24} />
                    </button>
                ) : (
                    <button onClick={() => onSendRequest(person._id)} className="w-14 h-14 rounded-full bg-white shadow-lg flex items-center justify-center text-purple-500 hover:bg-purple-50" title="Send friend request">
                        <FaUserPlus size={24} />
                    </button>
                )}
            </div>
        </motion.div>
    );
};

export default PeopleCard;
