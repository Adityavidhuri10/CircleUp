import React from "react";
import { FaBullseye, FaTimes, FaPlus } from "react-icons/fa";

const GoalsList = ({
    secondaryGoals,
    primaryGoal,
    onUpdatePrimary,
    newGoal,
    onNewGoalChange,
    onAdd,
    onDelete
}) => {
    const safeSecondaryGoals = secondaryGoals || [];
    const PRIMARY_GOALS = ['Gym Buddy', 'Coding Buddy', 'Travel Partner', 'Flatmate', 'Relationship', 'Friendship', 'Networking'];

    return (
        <div className="bg-white rounded-2xl shadow-md p-6 space-y-6">
            {/* Primary Goal Section */}
            <div>
                <div className="flex items-center mb-3">
                    <FaBullseye className="text-purple-600 mr-2 text-xl" />
                    <h3 className="text-lg font-semibold text-gray-800">Primary Goal</h3>
                </div>
                <p className="text-sm text-gray-500 mb-2">What are you looking for most?</p>
                <div className="flex flex-wrap gap-2">
                    {PRIMARY_GOALS.map((goal) => (
                        <button
                            key={goal}
                            onClick={() => onUpdatePrimary(goal)}
                            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors border ${primaryGoal === goal
                                ? "bg-purple-600 text-white border-purple-600"
                                : "bg-gray-50 text-gray-700 border-gray-200 hover:bg-purple-50 hover:border-purple-200"
                                }`}
                        >
                            {goal}
                        </button>
                    ))}
                </div>
            </div>

            <hr className="border-gray-100" />

            {/* Secondary Goals Section */}
            <div>
                <div className="flex items-center mb-3">
                    <h3 className="text-lg font-semibold text-gray-800">Interests & Specifics</h3>
                </div>
                <div className="flex space-x-2 mb-4">
                    <input
                        type="text"
                        placeholder="e.g. Weight Training, C++, London trip..."
                        value={newGoal}
                        onChange={(e) => onNewGoalChange(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && onAdd(newGoal, 'secondary')}
                        className="flex-1 text-sm p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                    <button
                        onClick={() => onAdd(newGoal, 'secondary')}
                        disabled={!newGoal.trim()}
                        className="px-4 py-2 bg-purple-600 text-white rounded-xl hover:bg-purple-700 disabled:opacity-50 transition-colors"
                    >
                        <FaPlus />
                    </button>
                </div>
                <div className="flex flex-wrap gap-2">
                    {safeSecondaryGoals.length === 0 && <p className="text-gray-400 text-sm italic">Add details to help people find you matching your primary goal.</p>}
                    {safeSecondaryGoals.map((goal) => (
                        <div key={goal} className="flex items-center bg-purple-50 text-purple-700 px-3 py-1.5 rounded-lg text-sm border border-purple-100">
                            <span>{goal}</span>
                            <button
                                onClick={() => onDelete(goal, 'secondary')}
                                className="ml-2 text-purple-400 hover:text-red-500 transition-colors"
                            >
                                <FaTimes size={12} />
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default GoalsList;
