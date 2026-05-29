import { useState, useEffect, useRef, useCallback } from 'react';
import { getSocket } from '@/api/socket';
import { communityService } from '../services/community.service';

export const useCommunityChat = () => {
    const [communities, setCommunities] = useState([]);
    const [selectedCommunity, setSelectedCommunity] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [typingUser, setTypingUser] = useState(null);
    const [currentUser, setCurrentUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const messagesEndRef = useRef(null);
    const typingTimeoutRef = useRef(null);
    // Bug 4/8 Fix: Use a ref to track the current community for socket cleanup
    // This avoids stale closure issues in useCallback and useEffect
    const selectedCommunityRef = useRef(null);

    useEffect(() => {
        const stored = localStorage.getItem('user');
        if (stored) setCurrentUser(JSON.parse(stored));
        loadCommunities();
    }, []);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // Bug 4 Fix: Keep ref in sync with state
    useEffect(() => {
        selectedCommunityRef.current = selectedCommunity;
    }, [selectedCommunity]);

    useEffect(() => {
        const socket = getSocket();

        const handleCommunityMessage = (msg) => {
            const current = selectedCommunityRef.current;
            // Bug 3 Fix: Use String() for safe comparison — msg.community may be
            // a Mongoose ObjectId (serialized) while selectedCommunity._id is a string
            if (current && String(msg.community) === String(current._id)) {
                setMessages((prev) => [...prev, msg]);
            }
        };

        const handleCommunityTyping = ({ from, communityId }) => {
            const current = selectedCommunityRef.current;
            if (current && String(communityId) === String(current._id)) {
                setTypingUser(from);
                setIsTyping(true);
            }
        };

        const handleCommunityStopTyping = ({ communityId }) => {
            const current = selectedCommunityRef.current;
            if (current && String(communityId) === String(current._id)) {
                setIsTyping(false);
                setTypingUser(null);
            }
        };

        socket.on('community-message', handleCommunityMessage);
        socket.on('community-typing', handleCommunityTyping);
        socket.on('community-stop-typing', handleCommunityStopTyping);

        return () => {
            socket.off('community-message', handleCommunityMessage);
            socket.off('community-typing', handleCommunityTyping);
            socket.off('community-stop-typing', handleCommunityStopTyping);
        };
    // Bug 4 Fix: Empty dependency array — listeners use refs, not stale state
    // This prevents listener re-registration on every community selection
    }, []);

    const loadCommunities = async () => {
        try {
            const { data } = await communityService.getMyCommunities();
            setCommunities(data.data || []);
        } catch (error) {
            console.error('Failed to load communities:', error);
        } finally {
            setLoading(false);
        }
    };

    const selectCommunity = useCallback(async (community) => {
        const socket = getSocket();
        // Bug 8 Fix: Use ref (not stale closure) for the previous community
        const prev = selectedCommunityRef.current;
        if (prev) socket.emit('leave-community', prev._id);

        setSelectedCommunity(community);
        setMessages([]);
        socket.emit('join-community', community._id);

        try {
            const { data } = await communityService.getMessages(community._id);
            // Handle paginated response { messages, page, totalPages, totalMessages }
            setMessages(data.data.messages || []);
        } catch (error) {
            console.error('Failed to load messages:', error);
        }
    }, []); // No dependencies needed — uses ref for previous community

    const sendMessage = useCallback(() => {
        if (!newMessage.trim() || !selectedCommunityRef.current || !currentUser) return;
        const socket = getSocket();
        socket.emit('community-message', {
            communityId: selectedCommunityRef.current._id,
            sender: currentUser._id,
            message: newMessage,
            anonymousName: currentUser.anonymousName,
        });
        socket.emit('community-stop-typing', { communityId: selectedCommunityRef.current._id, sender: currentUser._id });
        setNewMessage('');
    }, [newMessage, currentUser]);

    const handleTyping = useCallback(() => {
        if (!currentUser || !selectedCommunityRef.current) return;
        const socket = getSocket();
        socket.emit('community-typing', { communityId: selectedCommunityRef.current._id, from: currentUser.anonymousName });
        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = setTimeout(() => {
            socket.emit('community-stop-typing', { communityId: selectedCommunityRef.current?._id });
        }, 2000);
    }, [currentUser]);

    const leaveCommunity = useCallback(async (communityId) => {
        try {
            await communityService.leaveCommunity(communityId);
            const socket = getSocket();
            socket.emit('leave-community', communityId);
            setSelectedCommunity(null);
            setMessages([]);
            loadCommunities();
            return { success: true };
        } catch (error) {
            console.error('Failed to leave community:', error);
            return { success: false, error: error.response?.data?.message || 'Failed to leave community' };
        }
    }, []);

    return {
        communities, selectedCommunity, messages,
        newMessage, setNewMessage, isTyping, typingUser, currentUser, loading,
        messagesEndRef,
        selectCommunity, sendMessage, handleTyping, leaveCommunity,
    };
};
