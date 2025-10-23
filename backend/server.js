const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const http = require("http");
const { Server } = require("socket.io");
const helmet = require("helmet");
const compression = require("compression");

const connectDB = require("./config/db");

// Route Imports
const userRoutes = require("./routes/userRoutes");
const friendRoutes = require("./routes/friendRoutes");
const messageRoutes = require("./routes/messageRoutes");
const communityRoutes = require("./routes/communityRoutes");
const passwordRoutes = require("./routes/passwordRoutes");

// Model Imports
const Message = require("./models/Message");
const CommunityMessage = require("./models/CommunityMessage");

// Middleware
const errorHandler = require("./middleware/errorMiddleware");


//  Config & Initialization

dotenv.config();
const app = express();
connectDB();

const ENV = process.env.NODE_ENV || "development";
const PORT = process.env.PORT || 5000;

console.log(`Environment: ${ENV}`);


//  Middlewares
app.use(express.json());
app.use(helmet()); // adds security headers
app.use(compression()); // compresses responses
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);


//  API Routes

app.use("/api/user", userRoutes);
app.use("/api/friends", friendRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/communities", communityRoutes);
app.use("/api/auth", passwordRoutes);

//Check Route
app.get("/", (req, res) => {
  res.send(" CircleUP Backend server is running...");
});


//  Socket.IO Setup
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    methods: ["GET", "POST"],
  },
});

const onlineUsers = new Map();

io.on("connection", (socket) => {
  console.log("Socket connected:", socket.id);

  // Register User
  socket.on("registerUser", (userId) => {
    onlineUsers.set(userId, socket.id);
    console.log(` User ${userId} registered with socket ${socket.id}`);
  });

  // Private Message
  socket.on("sendPrivateMessage", async ({ sender, receiver, content }) => {
    try {
      const newMessage = await Message.create({ sender, receiver, content });

      const receiverSocketId = onlineUsers.get(receiver);
      if (receiverSocketId) {
        io.to(receiverSocketId).emit("receivePrivateMessage", newMessage);
      }

      socket.emit("messageSent", newMessage);
    } catch (err) {
      console.error(" Error sending private message:", err.message);
    }
  });

  // Community Rooms
  socket.on("joinCommunity", (communityId) => {
    socket.join(communityId);
    console.log(` Joined community room: ${communityId}`);
  });

  socket.on("leaveCommunity", (communityId) => {
    socket.leave(communityId);
    console.log(` Left community room: ${communityId}`);
  });

  socket.on("sendCommunityMessage", async ({ communityId, sender, content }) => {
    try {
      const newMsg = await CommunityMessage.create({
        community: communityId,
        sender,
        content,
      });

      io.to(communityId).emit("receiveCommunityMessage", newMsg);
      console.log(` Message sent in community ${communityId}`);
    } catch (err) {
      console.error(" Error sending community message:", err.message);
    }
  });

  // Disconnect
  socket.on("disconnect", () => {
    for (let [userId, socketId] of onlineUsers.entries()) {
      if (socketId === socket.id) onlineUsers.delete(userId);
    }
    console.log(" Socket disconnected:", socket.id);
  });
});


//  Error Handling

// Not found handler
app.use((req, res, next) => {
  res.status(404);
  const error = new Error(`Route not found - ${req.originalUrl}`);
  next(error);
});

// Global error middleware
app.use(errorHandler);

//  Start Server

server.listen(PORT, () =>
  console.log(` Server running on port ${PORT}`)
);
