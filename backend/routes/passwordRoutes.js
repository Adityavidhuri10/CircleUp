const express = require("express");
const { forgotPassword, resetPassword } = require("../controllers/passwordController");
const asyncHandler = require("../utils/asyncHandler");
const router = express.Router();

router.post("/forgot-password", asyncHandler(forgotPassword));
router.post("/reset-password/:token", asyncHandler(resetPassword));

module.exports = router;
