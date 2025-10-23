const express = require("express");
const {
  createCommunity,
  joinCommunity,
  leaveCommunity,
  getCommunityMessages,
} = require("../controllers/communityController");
const authMiddleware = require("../middleware/authMiddleware");
const asyncHandler = require("../utils/asyncHandler");
const router = express.Router();

router.post("/create", authMiddleware, asyncHandler(createCommunity));
router.post("/join/:id", authMiddleware, asyncHandler(joinCommunity));
router.post("/leave/:id", authMiddleware, asyncHandler(leaveCommunity));
router.get("/:id/messages", authMiddleware, asyncHandler(getCommunityMessages));

module.exports = router;
