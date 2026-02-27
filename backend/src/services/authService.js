const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const AppError = require('../utils/AppError');

const signToken = (id) => {
    return jwt.sign({ id, role: 'User' }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRE,
    });
};

// C1 Fix: hash password on signup
const signup = async (userData) => {
    const { email, password } = userData;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
        throw new AppError('Email already registered', 400);
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const newUser = await User.create({ ...userData, password: hashedPassword });

    const token = signToken(newUser._id);
    newUser.password = undefined;

    return { user: newUser, token };
};

// C1 Fix: compare hashed password on login
const login = async (email, password) => {
    if (!email || !password) {
        throw new AppError('Please provide email and password', 400);
    }

    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await bcrypt.compare(password, user.password))) {
        throw new AppError('Invalid email or password', 401);
    }

    const token = signToken(user._id);
    user.password = undefined;

    return { user, token };
};

// C1 Fix: hash new password on reset
const resetPassword = async (email, newPassword) => {
    const user = await User.findOne({ email });
    if (!user) throw new AppError('User not found', 404);

    user.password = await bcrypt.hash(newPassword, 12);
    user.otpHash = undefined;
    user.otpExpiry = undefined;
    return await user.save();
};

module.exports = { signup, login, resetPassword };
