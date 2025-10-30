const jwt = require("jsonwebtoken");
const User = require("../models/User"); // ✅ make sure to import your User model

const authMiddleware = async (req, res, next) => {
  try {
    // 1️⃣ Extract token from Authorization header
    const header = req.header("Authorization") || "";
    const token = header.startsWith("Bearer ") ? header.split(" ")[1] : header;

    // 2️⃣ If no token → deny access
    if (!token) {
      return res.status(401).json({ message: "Access denied. No token provided." });
    }

    // 3️⃣ Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 4️⃣ Attach the full user (excluding password) to request
    req.user = await User.findById(decoded.id).select("-password");

    if (!req.user) {
      return res.status(404).json({ message: "User not found." });
    }

    // 5️⃣ Continue to next middleware or controller
    next();
  } catch (error) {
    console.error("Auth Middleware Error:", error.message);
    res.status(401).json({ message: "Invalid or expired token" });
  }
};

module.exports = authMiddleware;

