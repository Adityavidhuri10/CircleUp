const socketIo = require('socket.io');
const jwt = require('jsonwebtoken');
const chatService = require('./chatService');
const logger = require('../utils/logger');

const onlineUsers = new Set();
let io;

const initSocket = (server) => {
    io = socketIo(server, {
        cors: {
            origin: process.env.CLIENT_URL || 'http://localhost:5173',
            methods: ['GET', 'POST'],
            credentials: true,
        },
    });

    // P2 Fix: JWT authentication middleware — rejects unauthenticated connections
    io.use((socket, next) => {
        const token = socket.handshake.auth?.token;
        if (!token) {
            return next(new Error('Authentication required: no token provided'));
        }
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            socket.userId = decoded.id; // attach user id to every socket event
            next();
        } catch (err) {
            logger.warn(`Socket auth failed: ${err.message}`);
            next(new Error('Authentication required: invalid token'));
        }
    });

    io.on('connection', (socket) => {
        logger.info(`Socket connected: ${socket.id} (user: ${socket.userId})`);

        // Automatically join the user to their own room for private notifications
        socket.join(socket.userId);

        // ── Private Chat Events ────────────────────────────────────────────────

        socket.on('join', (userId) => {
            // P2 Fix: ignore room joins for other users — can only join own room
            if (userId !== socket.userId) {
                logger.warn(`User ${socket.userId} tried to join room of ${userId}`);
                return;
            }
            socket.join(userId);
            onlineUsers.add(userId);
            // S2 Fix: track userId on socket for disconnect cleanup
            socket.userId = userId;
            io.emit('online-users', Array.from(onlineUsers));
            logger.info(`User ${userId} joined private room`);
        });

        socket.on('send-message', async ({ sender, receiver, message }) => {
            // P2 Fix: enforce sender === authenticated user
            if (sender !== socket.userId) {
                logger.warn(`User ${socket.userId} tried to send as ${sender}`);
                return socket.emit('message-error', { error: 'Unauthorized: sender mismatch' });
            }
            try {
                const newMessage = await chatService.savePrivateMessage(sender, receiver, message);
                io.to(receiver).emit('receive-message', {
                    sender,
                    message,
                    timestamp: newMessage.timestamp || newMessage.createdAt,
                });
                logger.info(`Private message: ${sender} → ${receiver}`);
            } catch (error) {
                logger.error(`Error saving private message: ${error.message}`);
                socket.emit('message-error', { error: 'Failed to send message' });
            }
        });

        socket.on('typing', ({ receiver }) => {
            socket.to(receiver).emit('typing', { from: socket.userId });
        });

        socket.on('stop-typing', ({ receiver }) => {
            socket.to(receiver).emit('stop-typing', { from: socket.userId });
        });

        // ── Community Chat Events ──────────────────────────────────────────────

        socket.on('join-community', (communityId) => {
            socket.join(communityId);
            logger.info(`Socket ${socket.id} joined community ${communityId}`);
        });

        socket.on('leave-community', (communityId) => {
            socket.leave(communityId);
            logger.info(`Socket ${socket.id} left community ${communityId}`);
        });

        socket.on('community-message', async ({ communityId, sender, message }) => {
            // P2 Fix: enforce sender === authenticated user
            if (sender !== socket.userId) {
                logger.warn(`User ${socket.userId} tried to send community msg as ${sender}`);
                return socket.emit('message-error', { error: 'Unauthorized: sender mismatch' });
            }
            try {
                const populatedMessage = await chatService.saveCommunityMessage(
                    communityId,
                    sender,
                    message
                );
                logger.info(`Community ${communityId} message from ${sender}`);
                io.to(communityId).emit('community-message', populatedMessage);
            } catch (error) {
                logger.error(`Error saving community message: ${error.message}`);
                socket.emit('message-error', { error: 'Failed to send message' });
            }
        });

        socket.on('community-typing', ({ communityId, from }) => {
            socket.to(communityId).emit('community-typing', { from, communityId });
        });

        socket.on('community-stop-typing', ({ communityId }) => {
            socket.to(communityId).emit('community-stop-typing', { communityId });
        });

        // ── Disconnect — S2 Fix: clean up onlineUsers ─────────────────────────

        socket.on('disconnect', () => {
            logger.info(`Socket disconnected: ${socket.id} (user: ${socket.userId})`);
            if (socket.userId) {
                onlineUsers.delete(socket.userId);
                io.emit('online-users', Array.from(onlineUsers));
            }
        });
    });

    return io;
};

const getIO = () => {
    if (!io) {
        throw new Error('Socket.io not initialized!');
    }
    return io;
};

module.exports = { initSocket, getIO };
