const express = require("express");
const {
  registerUser,
  loginUser,
  getAllUsers,
  getSingleUser,
  addGoal,
  deleteGoal,
  updateProfilePicture,
  changeLocation,
  deleteAccount,
} = require("../controllers/userController");
const asyncHandler = require("../utils/asyncHandler");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");


router.post("/signup", asyncHandler(registerUser));
router.post("/login", asyncHandler(loginUser));
router.get("/all", authMiddleware, asyncHandler(getAllUsers));
router.post("/singleUser", asyncHandler(getSingleUser));
router.post("/goal/add", asyncHandler(addGoal));
router.post("/goal/delete", asyncHandler(deleteGoal));
router.put("/update", asyncHandler(updateProfilePicture));
router.post("/changeLocation", asyncHandler(changeLocation));
router.post("/delete-account", asyncHandler(deleteAccount));

module.exports = router;


