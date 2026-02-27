const mongoose = require('mongoose');

const communitySchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'Community name is required'],
            trim: true,
            unique: true,
        },
        description: {
            type: String,
            trim: true,
        },
        members: [
            {
                user: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'User',
                    required: true,
                },
                role: {
                    type: String,
                    enum: ['admin', 'member'],
                    default: 'member',
                },
                joinedAt: {
                    type: Date,
                    default: Date.now,
                },
            },
        ],
        isPrivate: {
            type: Boolean,
            default: false,
        },
        mustApprove: {
            type: Boolean,
            default: false,
        },
        joinRequests: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User',
            },
        ],
        // Legacy fields for migration
        admin: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            select: false, // Hide from normal queries
        },
        users: {
            type: [mongoose.Schema.Types.ObjectId],
            ref: 'User',
            select: false,
        },
    },
    {
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
    }
);

// Index on members.user for fast membership lookups
communitySchema.index({ 'members.user': 1 });

// ── Migration Logic — Backward Compatibility ──────────────────────────────────
communitySchema.pre('save', function (next) {
    // If members is empty but legacy fields exist, migrate them
    if (this.members.length === 0 && (this.admin || (this.users && this.users.length > 0))) {
        const memberMap = new Map();

        // Admin becomes role: "admin"
        if (this.admin) {
            memberMap.set(this.admin.toString(), {
                user: this.admin,
                role: 'admin',
                joinedAt: this.createdAt || new Date(),
            });
        }

        // Users become role: "member" (unless they are already admin)
        if (this.users && this.users.length > 0) {
            this.users.forEach((userId) => {
                const uIdStr = userId.toString();
                if (!memberMap.has(uIdStr)) {
                    memberMap.set(uIdStr, {
                        user: userId,
                        role: 'member',
                        joinedAt: this.createdAt || new Date(),
                    });
                }
            });
        }

        this.members = Array.from(memberMap.values());

        // Clear legacy fields to complete migration
        this.admin = undefined;
        this.users = undefined;
    }
    next();
});

// ── Permission Helpers ────────────────────────────────────────────────────────
communitySchema.methods.isAdmin = function (userId) {
    if (!userId) return false;
    const userIdStr = userId.toString();
    return this.members.some(
        (m) => m.user.toString() === userIdStr && m.role === 'admin'
    );
};

communitySchema.methods.isMember = function (userId) {
    if (!userId) return false;
    const userIdStr = userId.toString();
    return this.members.some((m) => m.user.toString() === userIdStr);
};

const Community = mongoose.model('Community', communitySchema);
module.exports = Community;
