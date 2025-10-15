const express = require("express");

const {sendFriendRequest,acceptFriendRequest,rejectFriendRequest} = require("../controllers/friendController");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/send-request/:id", authMiddleware, sendFriendRequest);
router.post("/accept-request/:id", authMiddleware, acceptFriendRequest);
router.post("/reject-request/:id", authMiddleware, rejectFriendRequest);

module.exports = router;
