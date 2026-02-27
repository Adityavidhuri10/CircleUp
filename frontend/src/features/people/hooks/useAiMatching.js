import { useState } from 'react';
import { toast } from 'react-hot-toast';
import { peopleService } from '../services/people.service';

export const useAiMatching = (filteredPeople, allPeople) => {
    const [aiMatchingResults, setAiMatchingResults] = useState(null);
    const [aiLoading, setAiLoading] = useState(false);
    const [showAiMatches, setShowAiMatches] = useState(false);

    const handleAiMatching = async (onSuccess) => {
        try {
            setAiLoading(true);

            // Always fetch the freshest user from localStorage
            const user = JSON.parse(localStorage.getItem('user'));

            // ── Guard: primaryGoal must exist before calling the backend ───────
            if (!user?.primaryGoal?.trim()) {
                toast.error('Please set your primary goal in your profile before using AI Match.');
                return;
            }

            const requestData = {
                logged_in_user: {
                    username: user.name || user.anonymousName,
                    role: user.role || 'Member',
                    primaryGoal: user.primaryGoal.trim(),
                    secondaryGoals: user.secondaryGoals || [],
                    location: user.location || '',
                    _id: user._id,
                },
                // Send ALL filtered people so the backend can apply goal filtering.
                // Include _id so we can reliably reverse-look-up results afterwards.
                users_list: filteredPeople.map((person) => ({
                    _id: person._id,
                    username: person.name || person.anonymousName,
                    role: person.role || 'Member',
                    primaryGoal: person.primaryGoal,
                    secondaryGoals: person.secondaryGoals || [],
                    location: person.location || '',
                })),
            };

            // Debug log — remove once confirmed working
            console.log('[AI Match] Sending primaryGoal:', requestData.logged_in_user.primaryGoal);
            console.log('[AI Match] users_list goals:', requestData.users_list.map(u => `${u.username}: ${u.primaryGoal}`));

            // axios returns the full response object; our backend wraps the payload
            // as { status, data: { similar_users, ... } }, so we need .data.data
            const response = await peopleService.findAiMatches(requestData);
            const data = response.data.data; // unwrap axios + sendResponse wrapper

            console.log('[AI Match] Response data:', data);

            if (!data.similar_users || data.similar_users.length === 0) {
                toast.error('No users match with your goals. Try adding more goals.');
                return;
            }

            // ── Reverse-lookup by _id (reliable) ─────────────────────────────
            const similarUsers = data.similar_users
                .map((su) => allPeople.find((u) => u._id === su._id))
                .filter(Boolean);

            if (similarUsers.length === 0) {
                toast.error('AI Match found results but could not resolve user profiles.');
                return;
            }

            setAiMatchingResults({ ...data, similarUsers });
            setShowAiMatches(true);
            onSuccess?.();
            toast.success(`Found ${similarUsers.length} match${similarUsers.length > 1 ? 'es' : ''}!`);
        } catch (error) {
            console.error('AI matching error:', error);
            toast.error(error?.response?.data?.message || 'Failed to perform AI matching');
        } finally {
            setAiLoading(false);
        }
    };

    const exitAiMatches = () => {
        setShowAiMatches(false);
        setAiMatchingResults(null);
    };

    return { aiMatchingResults, aiLoading, showAiMatches, handleAiMatching, exitAiMatches };
};
