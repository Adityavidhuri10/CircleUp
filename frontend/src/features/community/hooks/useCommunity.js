import { useState, useEffect } from 'react';
import { communityService } from '../services/community.service';

export const useCommunity = () => {
    const [communityName, setCommunityName] = useState('');
    const [communityDescription, setCommunityDescription] = useState('');
    const [communityIsPrivate, setCommunityIsPrivate] = useState(false);
    const [communityMustApprove, setCommunityMustApprove] = useState(false);
    const [allUsers, setAllUsers] = useState([]);
    const [selectedMembers, setSelectedMembers] = useState([]);
    const [createdCommunity, setCreatedCommunity] = useState(null);
    const [communities, setCommunities] = useState([]);
    const [selectedCommunity, setSelectedCommunity] = useState(null);
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState('create');
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [joinRequests, setJoinRequests] = useState([]);

    useEffect(() => {
        loadMyCommunities();
    }, []);

    const loadMyCommunities = async () => {
        try {
            const { data } = await communityService.getMyCommunities();
            setCommunities(data.data || []);
        } catch (error) {
            console.error('Failed to load communities:', error);
        }
    };

    const loadEligibleMembers = async (communityId) => {
        try {
            const { data } = await communityService.getEligibleMembers(communityId);
            setAllUsers((data.data || []).map(u => ({
                value: u._id,
                label: u.name || u.anonymousName
            })));
        } catch (error) {
            console.error('Failed to load eligible members:', error);
        }
    };

    const handleCreateCommunity = async (e) => {
        e.preventDefault();
        if (!communityName.trim()) { setError('Community name is required'); return; }
        setLoading(true);
        setError(null);
        try {
            const { data } = await communityService.createCommunity({
                name: communityName,
                description: communityDescription,
                isPrivate: communityIsPrivate,
                mustApprove: communityMustApprove
            });
            setCreatedCommunity(data.data);
            setSuccess(`Community "${communityName}" created successfully!`);
            setCommunityName('');
            setCommunityDescription('');
            setCommunityIsPrivate(false);
            setCommunityMustApprove(false);
            setActiveTab('manage');
            loadMyCommunities();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to create community');
        } finally {
            setLoading(false);
        }
    };

    const handleManageRequest = async (communityId, userId, action) => {
        setLoading(true);
        try {
            await communityService.manageJoinRequest(communityId, userId, action);
            setSuccess(`Request ${action}ed!`);
            // Refresh logic here if possible
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to manage request');
        } finally {
            setLoading(false);
        }
    };

    const handleAddMembers = async () => {
        if (!selectedCommunity || selectedMembers.length === 0) { setError('Select a community and members'); return; }
        setLoading(true);
        setError(null);
        try {
            const memberIds = selectedMembers.map((m) => m.value);
            await communityService.addUsersToCommunity(selectedCommunity.value, memberIds);
            setSuccess('Members added successfully!');
            setSelectedMembers([]);
            loadEligibleMembers(selectedCommunity.value); // Refresh eligible list
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to add members');
        } finally {
            setLoading(false);
        }
    };

    return {
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
        joinRequests, handleCreateCommunity, handleAddMembers,
        loadEligibleMembers, handleManageRequest,
    };
};
