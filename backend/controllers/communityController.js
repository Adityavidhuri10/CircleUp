const Community = require("../models/Community");
const CommunityMessage = require("../models/CommunityMessage");

// Create new community
const createCommunity = async (req, res) => {
  try {
    const { name, description } = req.body;
    const adminId = req.user.id;

    if (!name) return res.status(400).json({ message: "Community name is required" });

    const community = await Community.create({
      name,
      description,
      admin: adminId,
      members: [adminId],
    });

    res.status(201).json({ message: "Community created", community });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Join community
const joinCommunity = async (req, res) => {
  try {
    const userId = req.user.id;
    const communityId = req.params.id;

    const community = await Community.findById(communityId);
    if (!community) return res.status(404).json({ message: "Community not found" });

    if (community.members.includes(userId))
      return res.status(400).json({ message: "Already a member" });

    community.members.push(userId);
    await community.save();

    res.status(200).json({ message: "Joined community successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Leave community
const leaveCommunity = async (req, res) => {
  try {
    const userId = req.user.id;
    const communityId = req.params.id;

    const community = await Community.findById(communityId);
    if (!community) return res.status(404).json({ message: "Community not found" });

    community.members = community.members.filter((id) => id.toString() !== userId);
    await community.save();

    res.status(200).json({ message: "Left community successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get all messages in a community
const getCommunityMessages = async (req, res) => {
  try {
    const communityId = req.params.id;
    const messages = await CommunityMessage.find({ community: communityId })
      .populate("sender", "name email")
      .sort({ createdAt: 1 });

    res.status(200).json({ messages });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  createCommunity,
  joinCommunity,
  leaveCommunity,
  getCommunityMessages,
};
