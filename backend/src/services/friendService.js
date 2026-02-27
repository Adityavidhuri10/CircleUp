const User = require('../models/User');
const AppError = require('../utils/AppError');

const sendFriendRequest = async (senderId, receiverId) => {
    if (senderId === receiverId) {
        throw new AppError('You cannot send a friend request to yourself', 400);
    }

    const [sender, receiver] = await Promise.all([
        User.findById(senderId),
        User.findById(receiverId),
    ]);

    if (!sender || !receiver) {
        throw new AppError('One or both users not found', 404);
    }

    const existingRequest = receiver.friendRequests.find(
        (req) => req.from.equals(senderId) && req.status === 'pending'
    );

    if (existingRequest) {
        throw new AppError('Friend request already sent', 400);
    }

    const alreadyFriends = sender.friends.some((f) => f.friend.equals(receiverId));
    if (alreadyFriends) {
        throw new AppError('Users are already friends', 400);
    }

    receiver.friendRequests.push({
        from: senderId,
        status: 'pending',
    });

    await receiver.save();

    // Notify receiver
    const { createNotification } = require('./notificationService');
    await createNotification({
        recipient: receiverId,
        sender: senderId,
        type: 'FRIEND_REQUEST',
        message: `${sender.name} sent you a friend request`,
    });
};

const respondToFriendRequest = async (userId, requestId, status) => {
    const user = await User.findById(userId);
    if (!user) throw new AppError('User not found', 404);

    const request = user.friendRequests.id(requestId);
    if (!request) throw new AppError('Friend request not found', 404);

    if (request.status !== 'pending') {
        throw new AppError('Request is not pending', 400);
    }

    request.status = status;

    if (status === 'accepted') {
        const requester = await User.findById(request.from);
        if (!requester) throw new AppError('Requester not found', 404);

        user.friends.push({ friend: request.from, showName: false, accepted: true });
        requester.friends.push({ friend: userId, showName: false, accepted: true });

        await requester.save();

        // Notify requester that their request was accepted
        const { createNotification } = require('./notificationService');
        await createNotification({
            recipient: request.from,
            sender: userId,
            type: 'FRIEND_ACCEPTED',
            message: `${user.name} accepted your friend request`,
        });
    }

    await user.save();
};

const removeFriend = async (userId, friendId) => {
    const updatedUser = await User.findByIdAndUpdate(
        userId,
        { $pull: { friends: { friend: friendId } } },
        { new: true }
    );

    if (!updatedUser) throw new AppError('User not found', 404);

    await User.findByIdAndUpdate(friendId, {
        $pull: { friends: { friend: userId } },
    });

    return updatedUser;
};

const getFriendRequests = async (userId) => {
    const user = await User.findById(userId)
        .populate('friendRequests.from', 'name picture anonymousName')
        .select('friendRequests');

    if (!user) throw new AppError('User not found', 404);

    return user.friendRequests.filter((req) => req.status === 'pending');
};

const toggleNameVisibility = async (userId, friendId, value) => {
    const [currentUser, friendUser] = await Promise.all([
        User.findById(userId),
        User.findById(friendId),
    ]);

    if (!currentUser || !friendUser) throw new AppError('User not found', 404);

    const currentUserFriendEntry = currentUser.friends.find(
        (f) => f.friend.toString() === friendId
    );
    const friendUserEntry = friendUser.friends.find(
        (f) => f.friend.toString() === userId
    );

    if (!currentUserFriendEntry || !friendUserEntry) {
        throw new AppError('Friend relationship not found', 404);
    }

    currentUserFriendEntry.wantsToShowName = value;

    const bothAgreed =
        currentUserFriendEntry.wantsToShowName && friendUserEntry.wantsToShowName;

    if (bothAgreed) {
        currentUserFriendEntry.showName = true;
        friendUserEntry.showName = true;
        currentUserFriendEntry.showButton = false;
        friendUserEntry.showButton = false;
    }

    await Promise.all([currentUser.save(), friendUser.save()]);

    return { bothAgreed };
};

module.exports = {
    sendFriendRequest,
    respondToFriendRequest,
    removeFriend,
    getFriendRequests,
    toggleNameVisibility,
};
