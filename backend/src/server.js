import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';

import authRoutes from './routes/authRoutes.js';
import createBoardRoutes from './routes/boardRoutes.js';
import createListRoutes from './routes/listRoutes.js';
import createTaskRoutes from './routes/taskRoutes.js';
import activityRoutes from './routes/activityRoutes.js';

dotenv.config();

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true
  }
});

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/boards', createBoardRoutes(io));
app.use('/api/lists', createListRoutes(io));
app.use('/api/tasks', createTaskRoutes(io));
app.use('/api/activities', activityRoutes);

io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  if (!token) {
    return next(new Error('Authentication error'));
  }
  
  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return next(new Error('Authentication error'));
    }
    socket.userId = decoded.userId;
    next();
  });
});

io.on('connection', (socket) => {
  console.log('User connected:', socket.userId);

  socket.on('join:board', (boardId) => {
    socket.join(`board-${boardId}`);
    console.log(`User ${socket.userId} joined board ${boardId}`);
  });

  socket.on('leave:board', (boardId) => {
    socket.leave(`board-${boardId}`);
    console.log(`User ${socket.userId} left board ${boardId}`);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.userId);
  });
});

const PORT = process.env.PORT || 5000;

httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export { io };
