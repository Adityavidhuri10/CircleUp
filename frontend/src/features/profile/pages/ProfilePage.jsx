import React from "react";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useProfile } from "../hooks/useProfile";
import ProfileCard from "../components/ProfileCard";
import GoalsList from "../components/GoalsList";
import DeleteModal from "../components/DeleteModal";
import { FaTrash } from "react-icons/fa";

const ProfilePage = () => {
    const {
        user, newGoal, setNewGoal, newLocation, setNewLocation,
        isLoadingLocation, isUploadingImage, isSaving, showDeleteModal, setShowDeleteModal,
        loading,
        addGoal, deleteGoal, updatePrimaryGoal, updateLocation, detectLocation, uploadImage, deleteAccount,
    } = useProfile();

    if (loading) return <div className="min-h-screen flex items-center justify-center text-purple-700 text-xl">Loading...</div>;
    if (!user) return null;

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 py-10 px-4">
            <ToastContainer position="top-right" autoClose={3000} />
            <div className="max-w-xl mx-auto space-y-6">
                <ProfileCard
                    user={user}
                    newLocation={newLocation}
                    onLocationChange={setNewLocation}
                    onLocationUpdate={updateLocation}
                    onDetectLocation={detectLocation}
                    onImageUpload={uploadImage}
                    isSaving={isSaving}
                    isLoadingLocation={isLoadingLocation}
                    isUploadingImage={isUploadingImage}
                />

                <GoalsList
                    secondaryGoals={user.secondaryGoals}
                    primaryGoal={user.primaryGoal}
                    onUpdatePrimary={updatePrimaryGoal}
                    newGoal={newGoal}
                    onNewGoalChange={setNewGoal}
                    onAdd={addGoal}
                    onDelete={deleteGoal}
                />

                {/* Danger Zone */}
                <div className="bg-white rounded-2xl shadow-md p-6">
                    <h3 className="text-lg font-semibold text-red-600 mb-3">Danger Zone</h3>
                    <button
                        onClick={() => setShowDeleteModal(true)}
                        className="flex items-center text-red-500 border border-red-400 px-4 py-2 rounded-xl hover:bg-red-50 text-sm"
                    >
                        <FaTrash className="mr-2" />Delete Account
                    </button>
                </div>
            </div>

            {showDeleteModal && (
                <DeleteModal onConfirm={deleteAccount} onCancel={() => setShowDeleteModal(false)} />
            )}
        </div>
    );
};

export default ProfilePage;
