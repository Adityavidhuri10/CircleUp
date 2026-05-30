import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Toaster } from "react-hot-toast";
import { FaRobot, FaUsers, FaHourglass } from "react-icons/fa";
import { usePeople } from "../hooks/usePeople";
import { useSwipe } from "../hooks/useSwipe";
import { useAiMatching } from "../hooks/useAiMatching";
import PeopleCard from "../components/PeopleCard";
import SearchBar from "../components/SearchBar";
import PendingRequests from "../components/PendingRequests";
import PhotoModal from "../components/PhotoModal";

const PeoplesPage = () => {
    const {
        allPeople, filteredPeople, loading,
        userId, sentRequests, setSentRequests,
        pendingRequests,
        showPendingRequests, setShowPendingRequests,
        handleSendRequest, handleAcceptRequest, handleRejectRequest,
    } = usePeople();

    const {
        controls, currentIndex, setCurrentIndex,
        rejectedUsers, setRejectedUsers,
        rejectedAiMatches, setRejectedAiMatches,
        handleSwipe, rejectUser, clampIndex,
    } = useSwipe();

    const { aiMatchingResults, aiLoading, showAiMatches, handleAiMatching, exitAiMatches } = useAiMatching(filteredPeople, allPeople);

    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);
    const [selectedPhoto, setSelectedPhoto] = useState(null);

    const availablePeople = showAiMatches
        ? (aiMatchingResults?.similarUsers?.filter((u) => !rejectedAiMatches.includes(u._id)) ?? [])
        : filteredPeople.filter((p) => !rejectedUsers.includes(p._id));

    // Clamp currentIndex whenever the available list shrinks (e.g. after reject/send)
    // This prevents out-of-bounds access when the last person in the list is removed.
    useEffect(() => {
        clampIndex(availablePeople.length);
    }, [availablePeople.length]);

    const currentPerson = availablePeople[currentIndex];

    const handleSearchChange = (e) => {
        const query = e.target.value;
        setSearchQuery(query);
        if (query.trim() === "") { setIsSearching(false); setSearchResults([]); return; }
        const results = allPeople.filter((p) => {
            const matchesLocation = p.location?.toLowerCase().includes(query.toLowerCase());
            const matchesName = p.name?.toLowerCase().includes(query.toLowerCase());
            const matchesAnon = p.anonymousName?.toLowerCase().includes(query.toLowerCase());
            return (matchesLocation || matchesName || matchesAnon) && p._id !== userId;
        });
        setSearchResults(results);
        setIsSearching(true);
    };

    const handleSelectSearchUser = (uid) => {
        const idx = availablePeople.findIndex((p) => p._id === uid);
        if (idx !== -1) { setCurrentIndex(idx); setSearchQuery(""); setIsSearching(false); }
    };

    const onSwipe = (info, personId) => handleSwipe(
        info, personId,
        sentRequests.includes(personId),
        (id) => handleSendRequest(controls, id, rejectedUsers, setRejectedUsers, showAiMatches, rejectedAiMatches, setRejectedAiMatches),
        (id) => rejectUser(id, showAiMatches, availablePeople.length),
        availablePeople.length,
    );

    const onSendRequest = (id) => handleSendRequest(controls, id, rejectedUsers, setRejectedUsers, showAiMatches, rejectedAiMatches, setRejectedAiMatches);
    const onReject = (id) => rejectUser(id, showAiMatches, availablePeople.length);

    if (loading) return <div className="min-h-screen flex items-center justify-center text-purple-700 text-xl">Loading...</div>;

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 py-8 px-4">
            <Toaster position="top-center" />
            <div className="max-w-4xl mx-auto">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6">
                    <h1 className="text-3xl font-bold text-purple-800">{showAiMatches ? "AI Matched People" : "Discover People"}</h1>
                    <div className="flex flex-wrap gap-2">
                        {showAiMatches && (
                            <button onClick={exitAiMatches} className="flex items-center space-x-1 bg-gray-100 text-gray-700 px-3 py-2 rounded-full text-sm hover:bg-gray-200 cursor-pointer">
                                <FaUsers /><span>All People</span>
                            </button>
                        )}
                        <button
                            onClick={() => handleAiMatching(null)} disabled={aiLoading}
                            className="flex items-center space-x-1 bg-purple-600 text-white px-3 py-2 rounded-full text-sm hover:bg-purple-700 disabled:opacity-50 cursor-pointer"
                        >
                            <FaRobot /><span>{aiLoading ? "Matching..." : "AI Match"}</span>
                        </button>
                        <button
                            onClick={() => setShowPendingRequests(!showPendingRequests)}
                            className="flex items-center space-x-1 bg-white text-purple-600 border border-purple-300 px-3 py-2 rounded-full text-sm hover:bg-purple-50 cursor-pointer"
                        >
                            <FaHourglass /><span>Pending ({pendingRequests.length})</span>
                        </button>
                    </div>
                </div>

                <SearchBar
                    searchQuery={searchQuery} onChange={handleSearchChange}
                    onClear={() => { setSearchQuery(""); setIsSearching(false); }}
                    results={searchResults} isSearching={isSearching} onSelectUser={handleSelectSearchUser}
                />

                {showPendingRequests ? (
                    <PendingRequests requests={pendingRequests} onAccept={handleAcceptRequest} onReject={handleRejectRequest} onBack={() => setShowPendingRequests(false)} />
                ) : (
                    <div className="relative h-[550px] mx-auto max-w-sm">
                        {currentPerson ? (
                            <AnimatePresence>
                                <PeopleCard
                                    key={currentPerson._id}
                                    person={currentPerson} controls={controls}
                                    onSwipe={onSwipe} onReject={onReject} onSendRequest={onSendRequest}
                                    sentRequests={sentRequests} showAiMatches={showAiMatches}
                                    aiMatchingResults={aiMatchingResults}
                                    onOpenPhoto={setSelectedPhoto}
                                />
                            </AnimatePresence>
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center bg-white rounded-3xl shadow-xl">
                                <FaUsers className="text-6xl text-gray-300 mb-4" />
                                <h2 className="text-xl font-semibold text-gray-600">No more people to discover</h2>
                                <p className="text-gray-400 text-sm mt-2">Check back later!</p>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {selectedPhoto && <PhotoModal photoUrl={selectedPhoto} onClose={() => setSelectedPhoto(null)} />}
        </div>
    );
};

export default PeoplesPage;
