import React, { useEffect } from "react";
import Select from "react-select";
import api from "@/api/axios";
import { useCommunity } from "../hooks/useCommunity";

const AdminCommunityPage = () => {
    const {
        communityName, setCommunityName,
        communityDescription, setCommunityDescription,
        communityIsPrivate, setCommunityIsPrivate,
        communityMustApprove, setCommunityMustApprove,
        allUsers, setAllUsers,
        selectedMembers, setSelectedMembers,
        createdCommunity, communities,
        selectedCommunity, setSelectedCommunity,
        loading, activeTab, setActiveTab,
        error, setError, success, setSuccess,
        handleCreateCommunity, handleAddMembers,
        loadEligibleMembers, handleManageRequest,
    } = useCommunity();

    const communityOptions = communities.map((c) => ({ value: c._id, label: c.name }));

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 py-8 px-4">
            <div className="max-w-2xl mx-auto">
                <h1 className="text-3xl font-bold text-purple-800 mb-6">Community Management</h1>

                {/* Tabs */}
                <div className="flex border-b border-gray-200 mb-6">
                    {["create", "manage"].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => { setActiveTab(tab); setError(null); setSuccess(null); }}
                            className={`px-6 py-3 text-sm font-medium capitalize border-b-2 transition-colors ${activeTab === tab ? "border-purple-600 text-purple-600" : "border-transparent text-gray-500 hover:text-gray-700"}`}
                        >
                            {tab === "create" ? "Create Community" : "Manage"}
                        </button>
                    ))}
                </div>

                {/* Feedback */}
                {error && <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg text-sm">{error}</div>}
                {success && <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-lg text-sm">{success}</div>}

                {/* Create Tab */}
                {activeTab === "create" && (
                    <form onSubmit={handleCreateCommunity} className="bg-white rounded-xl shadow-md p-6 space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Community Name *</label>
                            <input
                                type="text" value={communityName} onChange={(e) => setCommunityName(e.target.value)}
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                placeholder="e.g. Python Devs" required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                            <textarea
                                value={communityDescription} onChange={(e) => setCommunityDescription(e.target.value)}
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                placeholder="What is this community about?" rows={3}
                            />
                        </div>
                        <div className="space-y-3">
                            <label className="block text-sm font-medium text-gray-700">Privacy & Joining</label>
                            <div className="grid grid-cols-2 gap-3">
                                <button
                                    type="button"
                                    onClick={() => setCommunityIsPrivate(false)}
                                    className={`p-3 rounded-xl border text-sm font-medium transition-all ${!communityIsPrivate ? 'border-purple-600 bg-purple-50 text-purple-700' : 'border-gray-200 text-gray-500 hover:border-gray-300'}`}
                                >
                                    Public Tribe
                                    <span className="block text-[10px] font-normal mt-1">Visible to everyone in Explore</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setCommunityIsPrivate(true)}
                                    className={`p-3 rounded-xl border text-sm font-medium transition-all ${communityIsPrivate ? 'border-amber-600 bg-amber-50 text-amber-700' : 'border-gray-200 text-gray-500 hover:border-gray-300'}`}
                                >
                                    Private Tribe
                                    <span className="block text-[10px] font-normal mt-1">Hidden, join by request only</span>
                                </button>
                            </div>

                            {!communityIsPrivate && (
                                <div className="mt-4 p-4 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Joining Policy</p>
                                    <div className="flex items-center justify-between">
                                        <div className="pr-4">
                                            <p className="text-sm font-bold text-gray-700">{communityMustApprove ? 'Require Approval' : 'Open Entry'}</p>
                                            <p className="text-[10px] text-gray-500">{communityMustApprove ? 'New members wait for your okay' : 'Anyone can join with one click'}</p>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => setCommunityMustApprove(!communityMustApprove)}
                                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${communityMustApprove ? 'bg-purple-600' : 'bg-gray-300'}`}
                                        >
                                            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${communityMustApprove ? 'translate-x-6' : 'translate-x-1'}`} />
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                        <button type="submit" disabled={loading} className="w-full py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 font-medium">
                            {loading ? "Creating..." : "Create Community"}
                        </button>
                    </form>
                )}

                {/* Manage Tab */}
                {activeTab === "manage" && (
                    <div className="bg-white rounded-xl shadow-md p-6 space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Select Community</label>
                            <Select
                                classNamePrefix="react-select"
                                options={communityOptions}
                                value={selectedCommunity}
                                onChange={(val) => {
                                    setSelectedCommunity(val);
                                    if (val) loadEligibleMembers(val.value);
                                }}
                                placeholder="Pick a community..."
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1 font-semibold">
                                Add Members (Friends only)
                            </label>
                            <Select
                                classNamePrefix="react-select"
                                isMulti
                                options={allUsers}
                                value={selectedMembers}
                                onChange={setSelectedMembers}
                                placeholder={selectedCommunity ? "Select friends to add..." : "← Select a community first"}
                                isDisabled={!selectedCommunity}
                                noOptionsMessage={() =>
                                    !selectedCommunity
                                        ? "Please select a community first"
                                        : "No eligible friends found (everyone is already a member or no friends yet)"
                                }
                            />
                        </div>
                        <button onClick={handleAddMembers} disabled={loading || !selectedCommunity || selectedMembers.length === 0} className="w-full py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 font-medium">
                            {loading ? "Adding..." : "Add Members"}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminCommunityPage;
