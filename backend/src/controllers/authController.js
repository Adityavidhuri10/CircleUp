const bcrypt = require('bcryptjs');
const authService = require('../services/authService');
const emailService = require('../services/emailService');
const userService = require('../services/userService');
const asyncHandler = require('../utils/asyncHandler');
const sendResponse = require('../utils/response');
const AppError = require('../utils/AppError');
const User = require('../models/User');

exports.signup = asyncHandler(async (req, res, next) => {
    const { user, token } = await authService.signup(req.body);
    sendResponse(res, 201, 'Signup successful', { user, token });
});

exports.login = asyncHandler(async (req, res, next) => {
    const { email, password } = req.body;
    const { user, token } = await authService.login(email, password);
    sendResponse(res, 200, 'Login successful', { user, token });
});

// C2 Fix: store hashed OTP in DB, do NOT return OTP in response
exports.sendOtp = asyncHandler(async (req, res, next) => {
    const { email } = req.body;
    if (!email) return next(new AppError('Email is required', 400));

    const user = await User.findOne({ email });
    if (!user) return next(new AppError('No account found with this email', 404));

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiry = new Date(Date.now() + 15 * 60 * 1000); // 15 min

    // Hash and store OTP in DB — never send to client
    user.otpHash = await bcrypt.hash(otp, 10);
    user.otpExpiry = otpExpiry;
    await user.save({ validateBeforeSave: false });

    const htmlContent = emailService.getOTPContent(otp);
    await emailService.sendEmail({
        email,
        subject: 'Your Circle Up Verification Code',
        html: htmlContent,
    });

    // C2 Fix: only return success — NO otp field
    sendResponse(res, 200, 'OTP sent to your email. It expires in 15 minutes.');
});

// C2 Fix: server-side OTP verification
exports.verifyOtp = asyncHandler(async (req, res, next) => {
    const { email, otp } = req.body;
    if (!email || !otp) return next(new AppError('Email and OTP are required', 400));

    const user = await User.findOne({ email }).select('+otpHash +otpExpiry');
    if (!user || !user.otpHash) return next(new AppError('No OTP requested for this email', 400));

    if (user.otpExpiry < Date.now()) {
        user.otpHash = undefined;
        user.otpExpiry = undefined;
        await user.save({ validateBeforeSave: false });
        return next(new AppError('OTP has expired. Please request a new one.', 400));
    }

    const isValid = await bcrypt.compare(otp, user.otpHash);
    if (!isValid) return next(new AppError('Invalid OTP', 400));

    // OTP is valid — issue a short-lived reset token (reuse JWT)
    const resetToken = require('jsonwebtoken').sign(
        { id: user._id, purpose: 'password-reset' },
        process.env.JWT_SECRET,
        { expiresIn: '15m' }
    );

    sendResponse(res, 200, 'OTP verified successfully', { resetToken });
});

// C1 Fix: use authService.resetPassword which bcrypt-hashes the new password
exports.changePassword = asyncHandler(async (req, res, next) => {
    const { email, newPassword, resetToken } = req.body;
    if (!email || !newPassword || !resetToken) {
        return next(new AppError('Email, new password, and reset token are required', 400));
    }

    // Verify reset token
    let decoded;
    try {
        decoded = require('jsonwebtoken').verify(resetToken, process.env.JWT_SECRET);
    } catch {
        return next(new AppError('Reset token is invalid or has expired', 400));
    }
    if (decoded.purpose !== 'password-reset') {
        return next(new AppError('Invalid token purpose', 400));
    }

    await authService.resetPassword(email, newPassword);
    sendResponse(res, 200, 'Password updated successfully');
});
