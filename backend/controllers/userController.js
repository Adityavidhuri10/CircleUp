const User = require("../models/User");

// Register new user
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

    // Create and save user
    const user = await User.create({ name, email, password, picture });
    res.status(201).json({ message: "User registered successfully", user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// Login user
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user)
      return res.status(400).json({ message: "User not found" });

    // Simple comparison (hashed version will come later)
    if (user.password !== password)
      return res.status(400).json({ message: "Invalid credentials" });

    res.status(200).json({ message: "Login successful", user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = { registerUser, loginUser };
