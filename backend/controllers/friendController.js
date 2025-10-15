const User = require("../models/User");

// Send Friend Request
const sendFriendRequest = async (req, res) => {
  try {
    const senderId = req.user.id;
    const receiverId = req.params.id;

    if (senderId === receiverId)
      return res.status(400).json({ message: "You cannot add yourself" });

    const sender = await User.findById(senderId);
    const receiver = await User.findById(receiverId);

    if (!receiver) return res.status(404).json({ message: "User not found" });

    // Already friends?
    if (sender.friends.includes(receiverId))
      return res.status(400).json({ message: "Already friends" });

    // Already sent?
    if (sender.sentRequests.includes(receiverId))
      return res.status(400).json({ message: "Request already sent" });

    // Add to both users
    sender.sentRequests.push(receiverId);
    receiver.friendRequests.push(senderId);

    await sender.save();
    await receiver.save();

    res.status(200).json({ message: "Friend request sent" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// Accept Friend Request
const acceptFriendRequest = async (req, res) => {
  try {
    const receiverId = req.user.id;
    const senderId = req.params.id;

    const receiver = await User.findById(receiverId);
    const sender = await User.findById(senderId);

    if (!receiver || !sender)
      return res.status(404).json({ message: "User not found" });

    // Remove from pending lists
    receiver.friendRequests = receiver.friendRequests.filter(
      (id) => id.toString() !== senderId
    );
    sender.sentRequests = sender.sentRequests.filter(
      (id) => id.toString() !== receiverId
    );

    // Add to friends list
    receiver.friends.push(senderId);
    sender.friends.push(receiverId);

    await receiver.save();
    await sender.save();

    res.status(200).json({ message: "Friend request accepted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// Reject Friend Request
const rejectFriendRequest = async (req, res) => {
  try {
    const receiverId = req.user.id;
    const senderId = req.params.id;

    const receiver = await User.findById(receiverId);
    const sender = await User.findById(senderId);

    if (!receiver || !sender)
      return res.status(404).json({ message: "User not found" });

    // Remove pending requests
    receiver.friendRequests = receiver.friendRequests.filter(
      (id) => id.toString() !== senderId
    );
    sender.sentRequests = sender.sentRequests.filter(
      (id) => id.toString() !== receiverId
    );

    await receiver.save();
    await sender.save();

    res.status(200).json({ message: "Friend request rejected" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  sendFriendRequest,
  acceptFriendRequest,
  rejectFriendRequest,
};
