import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { peopleService } from '../services/people.service';

export const usePeople = () => {
    const [allPeople, setAllPeople] = useState([]);
    const [filteredPeople, setFilteredPeople] = useState([]);
    const [loading, setLoading] = useState(true);
    const [userId, setUserId] = useState('');
    const [userFriends, setUserFriends] = useState([]);
    const [sentRequests, setSentRequests] = useState([]);
    const [pendingRequests, setPendingRequests] = useState([]);
    const [showPendingRequests, setShowPendingRequests] = useState(false);

    useEffect(() => {
        const user = localStorage.getItem('user');
        if (user) {
            const parsedUser = JSON.parse(user);
            setUserId(parsedUser._id);
            setUserFriends(parsedUser.friends?.map((f) => f.friend._id) || []);
            setSentRequests(parsedUser.sentRequests || []);
            loadPendingRequests(parsedUser._id);
        }
        fetchAllPeople();
    }, []);

    useEffect(() => {
        if (allPeople.length > 0 && userId) {
            const filtered = allPeople.filter((person) => {
                if (person._id === userId) return false;
                if (userFriends.includes(person._id)) return false;
                if (sentRequests.includes(person._id)) return false;
                if (person.friends?.some((f) => f.friend._id === userId)) return false;
                return true;
            });
            setFilteredPeople(filtered);
            setLoading(false);
        }
    }, [allPeople, userId, userFriends, sentRequests]);

    const fetchAllPeople = async () => {
        try {
            setLoading(true);
            const { data } = await peopleService.getAllUsers();
            setAllPeople(data.data);
        } catch {
            toast.error('Failed to fetch users');
            setLoading(false);
        }
    };

    const loadPendingRequests = async (uid) => {
        try {
            const response = await peopleService.getPendingRequests(uid);
            setPendingRequests(response.data.data.requests);
        } catch (error) {
            console.error('Error loading requests:', error);
        }
    };

    const handleSendRequest = async (controls, receiverId, rejectedUsers, setRejectedUsers, showAiMatches, rejectedAiMatches, setRejectedAiMatches) => {
        try {
            await peopleService.sendFriendRequest(receiverId);
            toast.success('Friend request sent!');
            setSentRequests((prev) => [...prev, receiverId]);
            if (showAiMatches) {
                setRejectedAiMatches([...rejectedAiMatches, receiverId]);
            } else {
                setRejectedUsers([...rejectedUsers, receiverId]);
            }
            await controls.start({ x: '100%', opacity: 0, transition: { duration: 0.5 } });
            // Do NOT call goToNext() — the user is added to sentRequests/rejected
            // which shrinks availablePeople. The next person naturally appears
            // at the same index position. Calling goToNext caused double-skip.
            setTimeout(() => {
                controls.start({ x: 0, opacity: 1 });
            }, 300);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to send request');
        }
    };

    const handleAcceptRequest = async (requestId) => {
        try {
            await peopleService.acceptFriendRequest(requestId);
            toast.success('Friend request accepted!');
            setPendingRequests((prev) => prev.filter((req) => req._id !== requestId));
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to accept request');
        }
    };

    const handleRejectRequest = async (requestId) => {
        try {
            await peopleService.rejectFriendRequest(requestId);
            toast.success('Friend request rejected');
            setPendingRequests((prev) => prev.filter((req) => req._id !== requestId));
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to reject request');
        }
    };

    return {
        allPeople, filteredPeople, loading,
        userId, sentRequests, setSentRequests,
        pendingRequests,
        showPendingRequests, setShowPendingRequests,
        handleSendRequest, handleAcceptRequest, handleRejectRequest,
    };
};
