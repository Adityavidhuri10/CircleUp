const express = require("express");
const { sendMessage, getMessages } = require("../controllers/messageController");
const authMiddleware = require("../middleware/authMiddleware");
const asyncHandler = require("../utils/asyncHandler");
const router = express.Router();

router.post("/:receiverId", authMiddleware, asyncHandler(sendMessage));
router.get("/:friendId", authMiddleware, asyncHandler(getMessages));

module.exports = router;
