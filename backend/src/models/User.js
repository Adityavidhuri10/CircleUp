const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'Please provide a name'],
            trim: true,
        },
        email: {
            type: String,
            required: [true, 'Please provide an email'],
            unique: true,
            lowercase: true,
            match: [
                /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
                'Please provide a valid email',
            ],
        },
        password: {
            type: String,
            required: [true, 'Please provide a password'],
            minlength: 6,
            select: false,
        },
        anonymousName: {
            type: String,
            trim: true,
        },
        primaryGoal: {
            type: String,
            enum: ['Gym Buddy', 'Coding Buddy', 'Travel Partner', 'Flatmate', 'Relationship', 'Friendship', 'Networking'],
            default: 'Friendship',
            trim: true,
        },
        secondaryGoals: [
            {
                type: String,
                trim: true,
            },
        ],
        picture: {
            type: String,
            default: 'default.jpg',
        },
        friends: [
            {
                friend: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'User',
                },
                showName: {
                    type: Boolean,
                    default: false,
                },
                showButton: {
                    type: Boolean,
                    default: true,
                },
                wantsToShowName: {
                    type: Boolean,
                    default: false,
                },
                accepted: {
                    type: Boolean,
                    default: false,
                },
            },
        ],
        friendRequests: [
            {
                from: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'User',
                },
                status: {
                    type: String,
                    enum: ['pending', 'accepted', 'rejected'],
                    default: 'pending',
                },
                createdAt: {
                    type: Date,
                    default: Date.now,
                },
            },
        ],
        location: {
            type: String,
            trim: true,
        },
        role: {
            type: String,
            trim: true,
            default: 'Member',
        },
        // OTP fields for server-side password reset (C2 fix)
        otpHash: {
            type: String,
            select: false,
        },
        otpExpiry: {
            type: Date,
            select: false,
        },
    },
    {
        timestamps: true,
    }
);

const User = mongoose.model('User', userSchema);
module.exports = User;
