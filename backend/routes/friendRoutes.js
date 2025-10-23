const express = require("express");

const {sendFriendRequest,acceptFriendRequest,rejectFriendRequest} = require("../controllers/friendController");
const authMiddleware = require("../middleware/authMiddleware");
const asyncHandler = require("../utils/asyncHandler");

const router = express.Router();

router.post("/send-request/:id", authMiddleware, asyncHandler(sendFriendRequest));
router.post("/accept-request/:id", authMiddleware, asyncHandler(acceptFriendRequest));
router.post("/reject-request/:id", authMiddleware, asyncHandler(rejectFriendRequest));

module.exports = router;
