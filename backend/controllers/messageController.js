const Message = require("../models/Message");
const User = require("../models/User");

// Send a new message
const sendMessage = async (req, res) => {
  try {
    const senderId = req.user.id;
    const receiverId = req.params.receiverId;
    const { content } = req.body;

    if (!content) return res.status(400).json({ message: "Message cannot be empty" });

    const newMessage = await Message.create({ sender: senderId, receiver: receiverId, content });
    res.status(201).json({ message: "Message sent successfully", data: newMessage });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// Get all messages between two users
const getMessages = async (req, res) => {
  try {
    const userId = req.user.id;
    const friendId = req.params.friendId;

    const messages = await Message.find({
      $or: [
        { sender: userId, receiver: friendId },
        { sender: friendId, receiver: userId },
      ],
    }).sort({ createdAt: 1 });

    res.status(200).json({ messages });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = { sendMessage, getMessages };
