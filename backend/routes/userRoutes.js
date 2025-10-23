const express = require("express");
const { registerUser, loginUser } = require("../controllers/userController");
const asyncHandler = require("../utils/asyncHandler");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");

router.post("/signup",asyncHandler( registerUser));
router.post("/login",  asyncHandler(loginUser));

router.get("/profile", authMiddleware, (req, res) => {
  res.json({
    message: "Welcome to your profile!",
    user: req.user,
  });
});


module.exports = router;
