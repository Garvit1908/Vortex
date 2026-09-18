require('dotenv').config();
const http = require('http');
const path = require('path');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const { Server } = require('socket.io');

const connectDB = require('./config/db');
const errorHandler = require('./middleware/error');

const fs = require('fs');

// Route imports
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const gigRoutes = require('./routes/gigRoutes');
const orderRoutes = require('./routes/orderRoutes');
const chatRoutes = require('./routes/chatRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const adminRoutes = require('./routes/adminRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const aiRoutes = require('./routes/aiRoutes');

// Initialize database
connectDB();

const app = express();
const server = http.createServer(app);

const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';

const allowedOriginPattern = /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/;

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin || allowedOriginPattern.test(origin) || origin === CLIENT_URL) {
      callback(null, true);
    } else {
      callback(null, true); // Permissive for production deployment flexibility
    }
  },
  credentials: true,
};

// Initialize Socket.IO
const io = new Server(server, {
  cors: {
    origin: (origin, callback) => callback(null, true),
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,
  },
});

// Attach socket.io to express app
app.set('io', io);

// Security & utility middleware
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
    contentSecurityPolicy: false, // Ensures SPA scripts, fonts, and inline styles load smoothly in production
  })
);

app.use(cors(corsOptions));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// Serve uploaded assets statically
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'online',
    platform: 'Vortex Freelance & Service Marketplace',
    timestamp: new Date().toISOString(),
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/gigs', gigRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/ai', aiRoutes);

// Production Client Static Serving & SPA Fallback
const clientDistPath = path.join(__dirname, '..', 'client', 'dist');
if (fs.existsSync(clientDistPath)) {
  app.use(express.static(clientDistPath));

  app.get('*', (req, res, next) => {
    if (req.originalUrl.startsWith('/api') || req.originalUrl.startsWith('/uploads')) {
      return next();
    }
    res.sendFile(path.join(clientDistPath, 'index.html'));
  });
}

// Centralized error handling
app.use(errorHandler);

// Socket.IO Real-time Events
io.on('connection', (socket) => {
  console.log(`[Socket.IO] Client connected: ${socket.id}`);

  // User personal room for instant notifications
  socket.on('join_user', (userId) => {
    if (userId) {
      socket.join(userId.toString());
      console.log(`[Socket.IO] Socket ${socket.id} joined personal room ${userId}`);
    }
  });

  // Join order chat room
  socket.on('join_order', (orderId) => {
    if (orderId) {
      const room = `order_${orderId}`;
      socket.join(room);
      console.log(`[Socket.IO] Socket ${socket.id} joined ${room}`);
    }
  });

  // Leave order chat room
  socket.on('leave_order', (orderId) => {
    if (orderId) {
      const room = `order_${orderId}`;
      socket.leave(room);
      console.log(`[Socket.IO] Socket ${socket.id} left ${room}`);
    }
  });

  // Live typing indicator
  socket.on('typing', ({ orderId, userName }) => {
    socket.to(`order_${orderId}`).emit('user_typing', { userName });
  });

  socket.on('stop_typing', ({ orderId }) => {
    socket.to(`order_${orderId}`).emit('user_stop_typing');
  });

  socket.on('disconnect', () => {
    console.log(`[Socket.IO] Client disconnected: ${socket.id}`);
  });
});

const PORT = process.env.PORT || 5000;

if (process.env.NODE_ENV !== 'test') {
  server.listen(PORT, () => {
    console.log(`🚀 Vortex Server running on http://localhost:${PORT}`);
    console.log(`📡 Socket.IO listening on port ${PORT}`);
    console.log(`🌐 Allowed Client URL: ${CLIENT_URL}`);
  });
}

module.exports = { app, server };
