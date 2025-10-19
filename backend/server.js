const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const http = require("http");
const { Server } = require("socket.io");
const connectDB = require("./config/db");
const userRoutes = require("./routes/userRoutes");
const friendRoutes = require("./routes/friendRoutes");
const messageRoutes = require("./routes/messageRoutes");
const Message = require("./models/Message");
const communityRoutes = require("./routes/communityRoutes");
const passwordRoutes = require("./routes/passwordRoutes");


dotenv.config();          // Load environment variables
connectDB();               // Connect MongoDB

const app = express();
app.use(express.json());

app.use(
  cors({
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
  })
);

app.use("/api/user", userRoutes);
app.use("/api/friends", friendRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/communities", communityRoutes);
app.use("/api/auth", passwordRoutes);


// Simple test route
app.get("/", (req, res) => {
  res.send("Backend server is running ");
});

// Create HTTP + Socket.IO server
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
  },
});

//Store connected users: userId → socketId
const onlineUsers = new Map();

// Socket.IO events
io.on("connection", (socket) => {
  console.log(" Socket connected:", socket.id);

// Register a user when they log in
  socket.on("registerUser", (userId) => {
    onlineUsers.set(userId, socket.id);
    console.log(`User ${userId} connected with socket ${socket.id}`);
  });


// Listen for private messages
  socket.on("sendPrivateMessage", async ({ sender, receiver, content }) => {
    try {
      // Save message in MongoDB
      const newMessage = await Message.create({ sender, receiver, content });

      // Find receiver's socket ID
      const receiverSocketId = onlineUsers.get(receiver);

      // If receiver is online, send the message instantly
      if (receiverSocketId) {
        io.to(receiverSocketId).emit("receivePrivateMessage", newMessage);
      }

      // (Optional) echo to sender as confirmation
      socket.emit("messageSent", newMessage);
    } catch (err) {
      console.error("Error sending message:", err.message);
    }
  });

// Join community room  
    socket.on("joinCommunity", (communityId) => {
    socket.join(communityId);
    console.log(`User joined community room: ${communityId}`);
  });
  
// Leave community room
 socket.on("leaveCommunity", (communityId) => {
    socket.leave(communityId);
    console.log(`User left community room: ${communityId}`);
  });


// Send a message in a community
  socket.on("sendCommunityMessage", async ({ communityId, sender, content }) => {
    try {
      const newMsg = await CommunityMessage.create({
        community: communityId,
        sender,
        content,
      });

// Emit message to all members in that community room
      io.to(communityId).emit("receiveCommunityMessage", newMsg);
      console.log(`Message sent in community ${communityId}`);
    } catch (err) {
      console.error(" Error sending community message:", err.message);
    }
  });


// Handle disconnection
  socket.on("disconnect", () => {
    for (let [userId, socketId] of onlineUsers.entries()) {
      if (socketId === socket.id) onlineUsers.delete(userId);
    }
    console.log(" Socket disconnected:", socket.id);
  });
});
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(` Server running on port ${PORT}`));
