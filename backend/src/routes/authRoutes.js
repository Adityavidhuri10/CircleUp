const express = require('express');
const rateLimit = require('express-rate-limit');
const authController = require('../controllers/authController');

const router = express.Router();

// Rate limiter: 10 attempts per 15 minutes per IP (m7 fix)
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10,
    message: { status: 'error', message: 'Too many attempts. Please try again in 15 minutes.' },
    standardHeaders: true,
    legacyHeaders: false,
});

// Tighter limiter for OTP send: 5 per hour
const otpLimiter = rateLimit({
    windowMs: 60 * 60 * 1000,
    max: 5,
    message: { status: 'error', message: 'Too many OTP requests. Please try again in 1 hour.' },
    standardHeaders: true,
    legacyHeaders: false,
});

router.post('/register', authLimiter, authController.signup);
router.post('/login', authLimiter, authController.login);
router.post('/send-otp', otpLimiter, authController.sendOtp);
router.post('/verify-otp', otpLimiter, authController.verifyOtp);
router.post('/change-password', authController.changePassword);

module.exports = router;
