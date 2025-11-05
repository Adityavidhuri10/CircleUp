const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");


// Register new user(with hashing + token)
const registerUser = async (req, res) => {
  try {
    const { name, email, password, picture } = req.body;

    // Basic validation
    if (!name || !email || !password)
      return res.status(400).json({ message: "All fields are required" });

    // Check existing user
    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res.status(400).json({ message: "User already exists" });
    
    // Hash password
     const hashedPassword = await bcrypt.hash(password, 10);

    // Create and save user
    const user = await User.create({ name, email, password : hashedPassword, picture });
   
    // Generate token
    const token = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "2h" }
    );

    res.status(201).json({ 
      success: true,
      message: "User registered successfully",
      token,
      user: { id: user._id, name: user.name, email: user.email},
      });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// Login user (verify password + return token)
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user)
      return res.status(400).json({ message: "User not found" });

    // Verify password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(400).json({ message: "Invalid credentials" });
    

    const token = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "2h" }
    );

    res.status(200).json({
      success: true,
       message: "Login successful",
      token,
      user: { id: user._id, name: user.name, email: user.email },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// Fetch all users except passwords
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({}, "-password"); // exclude password field
    res.status(200).json({ users });
  } catch (err) {
    console.error("Error fetching users:", err.message);
    res.status(500).json({ message: "Server error while fetching users" });
  }
};

// Fetch a single user
const getSingleUser = async (req, res) => {
  try {
    const { id } = req.body;
    const user = await User.findById(id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// Add a goal
const addGoal = async (req, res) => {
  try {
    const { userId, goal } = req.body;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.goals.push(goal);
    await user.save();
    res.json({ success: true, goals: user.goals });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to add goal" });
  }
};

// Delete a goal
const deleteGoal = async (req, res) => {
  try {
    const { userId, goal } = req.body;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.goals = user.goals.filter((g) => g !== goal);
    await user.save();
    res.json({ success: true, goals: user.goals });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to delete goal" });
  }
};

// Update profile picture
const updateProfilePicture = async (req, res) => {
  try {
    const { userId, profilePicture } = req.body;
    await User.findByIdAndUpdate(userId, { picture: profilePicture });
    res.json({ success: true, message: "Profile picture updated" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to update picture" });
  }
};

// Change location
const changeLocation = async (req, res) => {
  try {
    const { id, location } = req.body;
    await User.findByIdAndUpdate(id, { location });
    res.json({ success: true, message: "Location updated" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to update location" });
  }
};

// Delete account
const deleteAccount = async (req, res) => {
  try {
    const { userId } = req.body;
    await User.findByIdAndDelete(userId);
    res.json({ success: true, message: "Account deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to delete account" });
  }
};


module.exports = {
  registerUser,
  loginUser,
  getAllUsers,
  getSingleUser,
  addGoal,
  deleteGoal,
  updateProfilePicture,
  changeLocation,
  deleteAccount,
};

