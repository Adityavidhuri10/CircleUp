const express = require("express");
const {
  createCommunity,
  joinCommunity,
  leaveCommunity,
  getCommunityMessages,
} = require("../controllers/communityController");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/create", authMiddleware, createCommunity);
router.post("/join/:id", authMiddleware, joinCommunity);
router.post("/leave/:id", authMiddleware, leaveCommunity);
router.get("/:id/messages", authMiddleware, getCommunityMessages);

module.exports = router;
