import React, { useState, useEffect } from "react";
import { FaSearch, FaUsers, FaLock, FaGlobe, FaChevronRight } from "react-icons/fa";
import { toast } from "react-hot-toast";
import { communityService } from "../services/community.service";
import { useNavigate } from "react-router-dom";

const ExploreCommunitiesPage = () => {
    const [communities, setCommunities] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const navigate = useNavigate();

    useEffect(() => {
        loadCommunities();
    }, []);

    const loadCommunities = async (searchTerm = "") => {
        try {
            setLoading(true);
            const { data } = await communityService.getAllCommunities(searchTerm);
            setCommunities(data.data || []);
        } catch (error) {
            toast.error("Failed to load communities");
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e) => {
        const value = e.target.value;
        setSearch(value);
        // Debounce search in a real app, here we just trigger on change or enter
    };

    const onSearchSubmit = (e) => {
        e.preventDefault();
        loadCommunities(search);
    };

    const handleJoin = async (communityId) => {
        try {
            await communityService.joinCommunity(communityId);
            toast.success("Joined community successfully!");
            navigate("/community");
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to join community");
        }
    };

    const handleRequest = async (communityId) => {
        try {
            await communityService.requestToJoin(communityId);
            toast.success("Join request sent to admins!");
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to send request");
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-6xl mx-auto">
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-purple-900 flex items-center gap-3">
                            <FaGlobe className="text-purple-600" />
                            Explore Communities
                        </h1>
                        <p className="text-gray-600 mt-2">Find your tribe and start collaborating!</p>
                    </div>

                    <form onSubmit={onSearchSubmit} className="relative w-full md:w-96">
                        <input
                            type="text"
                            placeholder="Search communities..."
                            value={search}
                            onChange={handleSearch}
                            className="w-full pl-10 pr-4 py-3 rounded-2xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500 shadow-sm"
                        />
                        <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <button
                            type="submit"
                            className="absolute right-2 top-1/2 -translate-y-1/2 bg-purple-600 text-white px-3 py-1.5 rounded-xl hover:bg-purple-700 transition-colors"
                        >
                            Search
                        </button>
                    </form>
                </div>

                {loading ? (
                    <div className="flex items-center justify-center h-64 text-purple-600 font-medium">
                        Loading communities...
                    </div>
                ) : communities.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-64 text-gray-400 bg-white rounded-3xl shadow-sm border border-gray-100">
                        <FaUsers size={48} className="mb-4 opacity-20" />
                        <p className="text-xl">No communities found</p>
                        <p className="text-sm">Try a different search term or check back later.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {communities.map((community) => (
                            <div
                                key={community._id}
                                className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow flex flex-col"
                            >
                                <div className="flex justify-between items-start mb-4">
                                    <div className="p-3 bg-purple-50 rounded-2xl text-purple-600">
                                        <FaUsers size={24} />
                                    </div>
                                    <span className={`text-xs font-semibold px-3 py-1 rounded-full flex items-center gap-1 ${community.isPrivate ? 'bg-amber-50 text-amber-600' : 'bg-emerald-50 text-emerald-600'}`}>
                                        {community.isPrivate ? <><FaLock size={10} /> Private</> : <><FaGlobe size={10} /> Public</>}
                                    </span>
                                </div>

                                <h3 className="text-xl font-bold text-gray-800 mb-2 truncate">
                                    {community.name}
                                </h3>

                                <p className="text-sm text-gray-600 mb-6 flex-1 line-clamp-3">
                                    {community.description || "No description provided for this community."}
                                </p>

                                <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-50">
                                    <div className="flex items-center gap-2 text-gray-500">
                                        <FaUsers size={14} />
                                        <span className="text-xs font-medium">{community.memberCount} members</span>
                                    </div>

                                    {community.isPrivate || community.mustApprove ? (
                                        <button
                                            onClick={() => handleRequest(community._id)}
                                            className="bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-xl text-sm font-bold transition-colors flex items-center gap-2"
                                        >
                                            Request to Join
                                        </button>
                                    ) : (
                                        <button
                                            onClick={() => handleJoin(community._id)}
                                            className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-xl text-sm font-bold transition-colors flex items-center gap-2"
                                        >
                                            Join Now <FaChevronRight size={12} />
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ExploreCommunitiesPage;
