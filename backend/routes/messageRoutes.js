const express = require("express");
const { sendMessage, getMessages } = require("../controllers/messageController");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/:receiverId", authMiddleware, sendMessage);
router.get("/:friendId", authMiddleware, getMessages);

module.exports = router;
