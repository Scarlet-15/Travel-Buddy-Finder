const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const dotenv = require('dotenv');
const http = require('http');
const { Server } = require('socket.io');
const connectDB = require('./config/db');
const jwt = require('jsonwebtoken');
const User = require('./models/User');
const ChatMessage = require('./models/ChatMessage');

dotenv.config();

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173', credentials: true }));
app.use(express.json());
app.use(morgan('dev'));

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/trips', require('./routes/tripRoutes'));
app.use('/api/join-requests', require('./routes/joinRequestRoutes'));
app.use('/api/users', require('./routes/userRoutes'));

// Health check
app.get('/api/health', (req, res) => res.json({ status: 'OK', message: 'Travel Buddy API running' }));

// 404 handler
app.use((req, res) => res.status(404).json({ message: 'Route not found' }));

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    message: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
});

// ─── Socket.io Chat ───────────────────────────────────────────────────────────
// roomMembers: { [chatRoomId]: Set of socket ids }
const roomMembers = {};

io.use(async (socket, next) => {
  try {
    const token = socket.handshake.auth?.token;
    if (!token) return next(new Error('Authentication error'));
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');
    if (!user) return next(new Error('User not found'));
    socket.user = user;
    next();
  } catch (err) {
    next(new Error('Authentication error'));
  }
});

io.on('connection', (socket) => {
  console.log(`Socket connected: ${socket.user.name} (${socket.id})`);

  // Join a trip chat room
  socket.on('join_room', async ({ chatRoomId }) => {
    socket.join(chatRoomId);
    if (!roomMembers[chatRoomId]) roomMembers[chatRoomId] = new Set();
    roomMembers[chatRoomId].add(socket.id);

    // Send chat history to the joining user
    try {
      const history = await ChatMessage.find({ chatRoomId })
        .sort({ createdAt: 1 })
        .limit(200)
        .lean();
      socket.emit('chat_history', history.map(m => ({
        userId: m.userId,
        name: m.name,
        message: m.message,
        timestamp: m.createdAt.toISOString(),
        type: 'message',
      })));
    } catch (err) {
      console.error('Error loading chat history:', err);
    }

    // Notify others
    socket.to(chatRoomId).emit('user_joined', {
      userId: socket.user._id,
      name: socket.user.name,
      message: `${socket.user.name} joined the chat`,
      timestamp: new Date().toISOString(),
    });

    io.to(chatRoomId).emit('room_info', {
      onlineCount: roomMembers[chatRoomId].size,
    });

    console.log(`${socket.user.name} joined room ${chatRoomId}`);
  });

  // Send a message in a room
  socket.on('send_message', async ({ chatRoomId, message }) => {
    if (!message?.trim()) return;
    const payload = {
      userId: socket.user._id,
      name: socket.user.name,
      message: message.trim(),
      timestamp: new Date().toISOString(),
    };

    // Persist to DB
    try {
      await ChatMessage.create({
        chatRoomId,
        userId: socket.user._id,
        name: socket.user.name,
        message: message.trim(),
      });
    } catch (err) {
      console.error('Error saving message:', err);
    }

    io.to(chatRoomId).emit('receive_message', payload);
  });

  // Typing indicator
  socket.on('typing', ({ chatRoomId }) => {
    socket.to(chatRoomId).emit('user_typing', { name: socket.user.name });
  });

  socket.on('stop_typing', ({ chatRoomId }) => {
    socket.to(chatRoomId).emit('user_stop_typing', { name: socket.user.name });
  });

  // Leave room
  socket.on('leave_room', ({ chatRoomId }) => {
    socket.leave(chatRoomId);
    if (roomMembers[chatRoomId]) {
      roomMembers[chatRoomId].delete(socket.id);
      io.to(chatRoomId).emit('room_info', { onlineCount: roomMembers[chatRoomId].size });
    }
    socket.to(chatRoomId).emit('user_left', { name: socket.user.name });
  });

  socket.on('disconnect', () => {
    // Clean up all rooms
    Object.keys(roomMembers).forEach((roomId) => {
      if (roomMembers[roomId].has(socket.id)) {
        roomMembers[roomId].delete(socket.id);
        io.to(roomId).emit('room_info', { onlineCount: roomMembers[roomId].size });
        socket.to(roomId).emit('user_left', { name: socket.user.name });
      }
    });
    console.log(`Socket disconnected: ${socket.user.name}`);
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT} with Socket.io`));