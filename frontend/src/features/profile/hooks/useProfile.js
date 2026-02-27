import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { profileService } from '../services/profile.service';
import { useNavigate } from 'react-router-dom';

const CLOUDINARY_URL = `https://api.cloudinary.com/v1_1/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || 'didyxuyd5'}/image/upload`;
const CLOUDINARY_PRESET = import.meta.env.VITE_CLOUDINARY_PRESET || 'hg73yvrn';

export const useProfile = () => {
    const [user, setUser] = useState(null);
    const [newGoal, setNewGoal] = useState('');
    const [newLocation, setNewLocation] = useState('');
    const [isLoadingLocation, setIsLoadingLocation] = useState(false);
    const [isUploadingImage, setIsUploadingImage] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchUser = async () => {
            const stored = localStorage.getItem('user');
            if (!stored) { navigate('/login'); return; }
            const { _id } = JSON.parse(stored);
            try {
                const { data } = await profileService.getSingleUser(_id);
                const userData = data.data;
                if (userData && !userData.secondaryGoals) userData.secondaryGoals = [];
                setUser(userData);
            } catch {
                toast.error('Failed to load profile');
            } finally {
                setLoading(false);
            }
        };
        fetchUser();
    }, [navigate]);

    const addGoal = useCallback(async (goal, type = 'secondary') => {
        if (!goal.trim() || !user) return;
        try {
            await profileService.addGoal(user._id, goal.trim(), type);
            setUser((prev) => {
                const updated = { ...prev };
                if (type === 'primary') {
                    updated.primaryGoal = goal.trim();
                } else {
                    updated.secondaryGoals = [...(prev.secondaryGoals || []), goal.trim()];
                }
                return updated;
            });
            if (type === 'secondary') setNewGoal('');
        } catch {
            toast.error('Failed to add goal');
        }
    }, [user]);

    const deleteGoal = useCallback(async (goal, type = 'secondary') => {
        try {
            await profileService.deleteGoal(user._id, goal, type);
            setUser((prev) => {
                const updated = { ...prev };
                if (type === 'primary') {
                    updated.primaryGoal = undefined;
                } else {
                    updated.secondaryGoals = prev.secondaryGoals.filter((g) => g !== goal);
                }
                return updated;
            });
        } catch {
            toast.error('Failed to delete goal');
        }
    }, [user]);

    const updatePrimaryGoal = useCallback(async (goal) => {
        if (!user) return;
        try {
            await profileService.addGoal(user._id, goal, 'primary'); // 'add' upserts primary goal
            setUser((prev) => ({ ...prev, primaryGoal: goal }));
            toast.success('Primary goal updated');
        } catch {
            toast.error('Failed to update primary goal');
        }
    }, [user]);

    const updateLocation = useCallback(async () => {
        if (!newLocation.trim() || !user) return;
        setIsSaving(true);
        try {
            await profileService.changeLocation(user._id, newLocation.trim());
            setUser((prev) => ({ ...prev, location: newLocation.trim() }));
            setNewLocation('');
            toast.success('Location updated');
        } catch {
            toast.error('Failed to update location');
        } finally {
            setIsSaving(false);
        }
    }, [newLocation, user]);

    const detectLocation = useCallback(async () => {
        if (!navigator.geolocation) { toast.error('Geolocation not supported'); return; }
        setIsLoadingLocation(true);
        navigator.geolocation.getCurrentPosition(
            async ({ coords }) => {
                try {
                    const resp = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${coords.latitude}&lon=${coords.longitude}`);
                    const data = await resp.json();
                    const city = data.address?.city || data.address?.town || data.address?.village || '';
                    const country = data.address?.country || '';
                    const locationStr = [city, country].filter(Boolean).join(', ');
                    setNewLocation(locationStr);
                } catch {
                    toast.error('Failed to get location name');
                } finally {
                    setIsLoadingLocation(false);
                }
            },
            () => { toast.error('Location access denied'); setIsLoadingLocation(false); }
        );
    }, []);

    const uploadImage = useCallback(async (file) => {
        if (!file) return;
        if (file.size > 5 * 1024 * 1024) { toast.error('Max file size is 5MB'); return; }
        setIsUploadingImage(true);
        const form = new FormData();
        form.append('file', file);
        form.append('upload_preset', CLOUDINARY_PRESET);
        try {
            const { data: cloudData } = await axios.post(CLOUDINARY_URL, form);
            await profileService.updateUser(user._id, { picture: cloudData.secure_url });
            setUser((prev) => ({ ...prev, picture: cloudData.secure_url }));
            toast.success('Profile picture updated');
        } catch {
            toast.error('Failed to upload image');
        } finally {
            setIsUploadingImage(false);
        }
    }, [user]);

    const deleteAccount = useCallback(async () => {
        if (!user) return;
        try {
            await profileService.deleteAccount(user._id);
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            toast.success('Account deleted');
            navigate('/login');
        } catch {
            toast.error('Failed to delete account');
        }
    }, [user, navigate]);

    return {
        user, newGoal, setNewGoal, newLocation, setNewLocation,
        isLoadingLocation, isUploadingImage, isSaving, showDeleteModal, setShowDeleteModal,
        loading,
        addGoal, deleteGoal, updatePrimaryGoal, updateLocation, detectLocation, uploadImage, deleteAccount,
    };
};
