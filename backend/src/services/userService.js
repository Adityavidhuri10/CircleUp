const User = require('../models/User');
const AppError = require('../utils/AppError');

const getDisplayName = (user, viewerId) => {
    if (!viewerId) return user.anonymousName;
    const friendEntry = user.friends.find((f) => f.friend.equals(viewerId));
    return friendEntry?.showName ? user.name : user.anonymousName;
};

const getAllUsers = async (requestingUserId) => {
    const requestingUser = await User.findById(requestingUserId).populate(
        'friends.friend'
    );

    const friendIds =
        requestingUser?.friends?.map((f) => f.friend._id.toString()) || [];

    const users = await User.find({
        _id: {
            $ne: requestingUserId,
            $nin: friendIds,
        },
    }).populate('friends.friend');

    // ── Layer 1: Goal-Priority Ordering ───────────────────────────────────────
    // Users who share the requesting user's primaryGoal get goalPriority = 1
    // and are sorted to the top of the discover feed.
    const requestingGoal = requestingUser?.primaryGoal;

    return users
        .map((user) => ({
            ...user.toObject(),
            displayName: getDisplayName(user, requestingUserId),
            password: undefined,
            // 1 if same goal, 0 otherwise — used for frontend feed ordering
            goalPriority: user.primaryGoal && requestingGoal && user.primaryGoal === requestingGoal ? 1 : 0,
        }))
        .sort((a, b) => b.goalPriority - a.goalPriority);
};

const getSingleUser = async (id) => {
    const user = await User.findById(id).populate('friends.friend');
    if (!user) {
        throw new AppError('User not found', 404);
    }
    return user;
};

const deleteAccount = async (userId) => {
    // First remove this user from all friends' lists
    await User.updateMany(
        { 'friends.friend': userId },
        { $pull: { friends: { friend: userId } } }
    );

    const deletedUser = await User.findByIdAndDelete(userId);
    if (!deletedUser) {
        throw new AppError('User not found', 404);
    }
    return deletedUser;
};

const updateGoals = async (userId, operation, goal, oldGoal, type = 'secondary') => {
    const user = await User.findById(userId);
    if (!user) throw new AppError('User not found', 404);

    if (type === 'primary') {
        // Primary goal is a single string, so 'add' or 'update' just sets it. 'remove' clears it.
        if (operation === 'add' || operation === 'update') {
            user.primaryGoal = goal;
        } else if (operation === 'remove') {
            user.primaryGoal = undefined;
        }
    } else {
        // Secondary goals - array operations
        if (operation === 'add') {
            // Avoid duplicates
            if (!user.secondaryGoals.includes(goal)) {
                user.secondaryGoals.push(goal);
            }
        } else if (operation === 'remove') {
            user.secondaryGoals = user.secondaryGoals.filter(g => g !== goal);
        } else if (operation === 'update') {
            const index = user.secondaryGoals.indexOf(oldGoal);
            if (index !== -1) {
                user.secondaryGoals[index] = goal;
            }
        }
    }

    return await user.save();
};

const updateLocation = async (userId, location) => {
    const user = await User.findById(userId);
    if (!user) throw new AppError('User not found', 404);

    user.location = location;
    return await user.save();
};

const forgotPassword = async (email, newPassword) => {
    const user = await User.findOne({ email });
    if (!user) throw new AppError('User not found', 404);

    user.password = newPassword;
    return await user.save();
};

module.exports = {
    getAllUsers,
    getSingleUser,
    updateUser: async (userId, updates) => {
        // Only allow safe fields to be updated via this route
        const allowed = ['name', 'anonymousName', 'picture', 'location', 'primaryGoal'];
        const filtered = {};
        allowed.forEach((f) => { if (updates[f] !== undefined) filtered[f] = updates[f]; });
        const user = await User.findByIdAndUpdate(userId, filtered, { new: true, runValidators: true });
        if (!user) throw new AppError('User not found', 404);
        return user;
    },
    deleteAccount,
    updateGoals,
    updateLocation,
    forgotPassword,
};
