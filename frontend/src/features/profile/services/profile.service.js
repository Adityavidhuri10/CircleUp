import api from '@/api/axios';

// C5 fix: all paths corrected to match backend userRoutes
export const profileService = {
    getSingleUser: (userId) =>
        api.get(`/api/users/${userId}`),

    // PUT /:id — general update (name, picture, anonymousName)
    updateUser: (userId, updates) =>
        api.put(`/api/users/${userId}`, updates),

    // POST /:id/goals (add), DELETE /:id/goals (remove), PUT /:id/goals (update)
    addGoal: (userId, goal, type = 'secondary') =>
        api.post(`/api/users/${userId}/goals`, { goal, type }),

    deleteGoal: (userId, goal, type = 'secondary') =>
        api.delete(`/api/users/${userId}/goals`, { data: { goal, type } }),

    updateGoal: (userId, oldGoal, newGoal, type = 'secondary') =>
        api.put(`/api/users/${userId}/goals`, { oldGoal, newGoal, type }),

    // m2 fix: PUT /:id/location, body field matches backend ({location})
    changeLocation: (userId, location) =>
        api.put(`/api/users/${userId}/location`, { location }),

    // C5 fix: DELETE /:id (was DELETE /api/user/:id which didn't exist)
    deleteAccount: (userId) =>
        api.delete(`/api/users/${userId}`),
};
