import api from '@/api/axios';

export const authService = {
    login: (email, password) =>
        api.post('/api/auth/login', { email, password }),

    // C2/register fix: /register (was /signup)
    signup: (userData) =>
        api.post('/api/auth/register', userData),

    sendOtp: (email) =>
        api.post('/api/auth/send-otp', { email }),

    // C2 fix: verify OTP server-side → receives resetToken
    verifyOtp: (email, otp) =>
        api.post('/api/auth/verify-otp', { email, otp }),

    // C2 fix: changePassword now requires resetToken
    changePassword: (email, newPassword, resetToken) =>
        api.post('/api/auth/change-password', { email, newPassword, resetToken }),
};
