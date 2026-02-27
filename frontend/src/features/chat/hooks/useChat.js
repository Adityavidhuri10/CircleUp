import { useState, useEffect, useRef, useCallback } from 'react';
import { getSocket } from '@/api/socket';
import { chatService } from '../services/chat.service';

export const useChat = () => {
    const [currentUser, setCurrentUser] = useState(null);
    const [friends, setFriends] = useState([]);
    const [selectedFriend, setSelectedFriend] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [onlineUsers, setOnlineUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const messagesEndRef = useRef(null);
    const typingTimeoutRef = useRef(null);

    // Load user from localStorage and their friends
    useEffect(() => {
        const initUser = async () => {
            const stored = localStorage.getItem('user');
            if (!stored) return;
            const user = JSON.parse(stored);
            setCurrentUser(user);

            try {
                const { data } = await chatService.getSingleUser(user._id);
                const fullUser = data.data;
                setCurrentUser(fullUser);
                setFriends(fullUser.friends || []);
            } catch (error) {
                console.error('Failed to load user:', error);
            } finally {
                setLoading(false);
            }
        };
        initUser();
    }, []);

    // Socket events
    useEffect(() => {
        if (!currentUser) return;
        const socket = getSocket();
        socket.emit('join', currentUser._id);

        socket.on('online-users', setOnlineUsers);
        socket.on('receive-message', (msg) => {
            setMessages((prev) => [...prev, msg]);
        });
        socket.on('typing', ({ from }) => {
            if (selectedFriend && from === selectedFriend._id) setIsTyping(true);
        });
        socket.on('stop-typing', ({ from }) => {
            if (selectedFriend && from === selectedFriend._id) setIsTyping(false);
        });

        return () => {
            socket.off('online-users');
            socket.off('receive-message');
            socket.off('typing');
            socket.off('stop-typing');
        };
    }, [currentUser, selectedFriend]);

    // Auto-scroll
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const selectFriend = useCallback(async (friend) => {
        setSelectedFriend(friend);
        setMessages([]);
        try {
            const { data } = await chatService.getPrivateMessages(friend._id);
            setMessages(data.data || []);
        } catch (error) {
            console.error('Failed to load messages:', error);
        }
    }, []);

    const sendMessage = useCallback(() => {
        if (!newMessage.trim() || !selectedFriend || !currentUser) return;
        const socket = getSocket();

        // P2 Fix: Match backend expectation (sender, receiver)
        const msgPayload = {
            sender: currentUser._id,
            receiver: selectedFriend._id,
            message: newMessage
        };

        socket.emit('send-message', msgPayload);

        // Optimistic UI update
        setMessages((prev) => [...prev, { ...msgPayload, createdAt: new Date().toISOString() }]);

        // Stop typing indicator
        socket.emit('stop-typing', { receiver: selectedFriend._id });
        setNewMessage('');
    }, [newMessage, selectedFriend, currentUser]);

    const handleTyping = useCallback(() => {
        if (!currentUser || !selectedFriend) return;
        const socket = getSocket();
        socket.emit('typing', { receiver: selectedFriend._id });
        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = setTimeout(() => {
            socket.emit('stop-typing', { receiver: selectedFriend._id });
        }, 2000);
    }, [currentUser, selectedFriend]);

    const toggleNameVisibility = useCallback(async (friendId) => {
        try {
            const friend = friends.find((f) => f.friend._id === friendId);
            if (!friend) return;

            // Calculate new value (toggle current want)
            const newValue = !friend.wantsToShowName;

            const { data } = await chatService.toggleNameVisibility(currentUser._id, friendId, newValue);

            // Backend returns { bothAgreed: boolean } (and updated user object usually, but let's check service)
            // Actually, we should optimistically update or refetch. 
            // Better: update local state based on what we sent + backend confirmation of agreement.

            setFriends((prev) =>
                prev.map((f) => {
                    if (f.friend._id === friendId) {
                        return {
                            ...f,
                            wantsToShowName: newValue,
                            showName: data.data.bothAgreed || (newValue && f.showName) // Keep true if already true? no, depends on bothAgreed
                        };
                    }
                    return f;
                })
            );

            // If both agreed, immediate update. If not, we wait or just show pending state.
            // Let's re-fetch the user to be sure of the state, or trust the return.
            // The backend returns { bothAgreed }. logic:
            if (data.data.bothAgreed) {
                setFriends((prev) => prev.map(f => f.friend._id === friendId ? { ...f, showName: true, wantsToShowName: true } : f));
            }

        } catch (error) {
            console.error('Failed to toggle name visibility:', error);
        }
    }, [currentUser, friends]);

    const removeFriend = useCallback(async (friendId) => {
        try {
            await chatService.removeFriend(currentUser._id, friendId);
            setFriends((prev) => prev.filter((f) => f.friend._id !== friendId));
            if (selectedFriend?._id === friendId) setSelectedFriend(null);
        } catch (error) {
            console.error('Failed to remove friend:', error);
        }
    }, [currentUser, selectedFriend]);

    return {
        currentUser, friends, selectedFriend, messages,
        newMessage, setNewMessage, isTyping, onlineUsers, loading,
        messagesEndRef,
        selectFriend, sendMessage, handleTyping, toggleNameVisibility, removeFriend,
    };
};
