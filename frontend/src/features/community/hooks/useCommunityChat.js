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

    useEffect(() => {
        const stored = localStorage.getItem('user');
        if (stored) setCurrentUser(JSON.parse(stored));
        loadCommunities();
    }, []);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    useEffect(() => {
        const socket = getSocket();
        socket.on('community-message', (msg) => {
            if (selectedCommunity && msg.community === selectedCommunity._id) {
                setMessages((prev) => [...prev, msg]);
            }
        });
        socket.on('community-typing', ({ from, communityId }) => {
            if (selectedCommunity && communityId === selectedCommunity._id) {
                setTypingUser(from);
                setIsTyping(true);
            }
        });
        socket.on('community-stop-typing', ({ communityId }) => {
            if (selectedCommunity && communityId === selectedCommunity._id) {
                setIsTyping(false);
                setTypingUser(null);
            }
        });
        return () => {
            socket.off('community-message');
            socket.off('community-typing');
            socket.off('community-stop-typing');
        };
    }, [selectedCommunity]);

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
        setSelectedCommunity(community);
        setMessages([]);
        const socket = getSocket();
        if (selectedCommunity) socket.emit('leave-community', selectedCommunity._id);
        socket.emit('join-community', community._id);
        try {
            const { data } = await communityService.getMessages(community._id);
            // Updated to handle paginated response { messages, page, totalPages, totalMessages }
            setMessages(data.data.messages || []);
        } catch (error) {
            console.error('Failed to load messages:', error);
        }
    }, [selectedCommunity]);

    const sendMessage = useCallback(() => {
        if (!newMessage.trim() || !selectedCommunity || !currentUser) return;
        const socket = getSocket();
        socket.emit('community-message', {
            communityId: selectedCommunity._id,
            sender: currentUser._id,
            message: newMessage,
            anonymousName: currentUser.anonymousName,
        });
        socket.emit('community-stop-typing', { communityId: selectedCommunity._id, sender: currentUser._id });
        setNewMessage('');
    }, [newMessage, selectedCommunity, currentUser]);

    const handleTyping = useCallback(() => {
        if (!currentUser || !selectedCommunity) return;
        const socket = getSocket();
        socket.emit('community-typing', { communityId: selectedCommunity._id, from: currentUser.anonymousName });
        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = setTimeout(() => {
            socket.emit('community-stop-typing', { communityId: selectedCommunity._id });
        }, 2000);
    }, [currentUser, selectedCommunity]);

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
    }, [selectedCommunity]);

    return {
        communities, selectedCommunity, messages,
        newMessage, setNewMessage, isTyping, typingUser, currentUser, loading,
        messagesEndRef,
        selectCommunity, sendMessage, handleTyping, leaveCommunity,
    };
};
