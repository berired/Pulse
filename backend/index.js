import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import 'express-async-errors';
import dotenv from 'dotenv';

import { errorHandler, asyncHandler } from './middleware/errorHandler.js';
import { authMiddleware } from './middleware/auth.js';
import { rateLimitMiddleware } from './middleware/rateLimit.js';

import notesRouter from './routes/notes.js';
import postsRouter from './routes/posts.js';
import messagesRouter from './routes/messages.js';
import schedulesRouter from './routes/schedules.js';
import rotationsRouter from './routes/rotations.js';
import careplansRouter from './routes/careplans.js';
import wikipagesRouter from './routes/wikipages.js';
import healthRouter from './routes/health.js';
import filesRouter from './routes/files.js';
import groupsRouter from './routes/groups.js';
import followersRouter from './routes/followers.js';
import searchRouter from './routes/search.js';
import notificationsRouter from './routes/notifications.js';
import pusherRouter from './routes/pusher.js';
import reportsRouter from './routes/reports.js';
import adminRouter from './routes/admin.js';
import profileRouter from './routes/profile.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const NODE_ENV = process.env.NODE_ENV || 'development';

// Security & Performance Middleware
app.use(helmet());
app.use(compression());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
}));

// Body Parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Rate Limiting
app.use(rateLimitMiddleware);

// Request Logging (Development Only)
if (NODE_ENV === 'development') {
  app.use((req, res, next) => {
    const start = Date.now();
    res.on('finish', () => {
      const duration = Date.now() - start;
      console.log(`${req.method} ${req.path} ${res.statusCode} ${duration}ms`);
    });
    next();
  });
}

// Health Check (No Auth Required)
app.use('/api/health', healthRouter);

// Pusher Authentication
app.use('/api/pusher', pusherRouter);

// Reports (No Auth Required - Public Submissions)
app.use('/api/reports', reportsRouter);

// Profile (Public create, Protected get)
app.use('/api/profile', profileRouter);

// Protected Routes (Require Auth)
app.use('/api/notes', authMiddleware, notesRouter);
app.use('/api/posts', authMiddleware, postsRouter);
app.use('/api/messages', authMiddleware, messagesRouter);
app.use('/api/schedules', authMiddleware, schedulesRouter);
app.use('/api/rotations', authMiddleware, rotationsRouter);
app.use('/api/careplans', authMiddleware, careplansRouter);
app.use('/api/wikipages', authMiddleware, wikipagesRouter);
app.use('/api/files', authMiddleware, filesRouter);
app.use('/api/groups', authMiddleware, groupsRouter);
app.use('/api/followers', authMiddleware, followersRouter);
app.use('/api/search', authMiddleware, searchRouter);
app.use('/api/notifications', authMiddleware, notificationsRouter);
app.use('/api/admin', adminRouter);

// 404 Handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Route ${req.method} ${req.path} not found`,
  });
});

// Global Error Handler
app.use(errorHandler);

// Start Server
app.listen(PORT, () => {
  console.log(`
╔══════════════════════════════════════════════════╗
║          Pulse Backend Server Started            ║
╠══════════════════════════════════════════════════╣
║ Environment: ${NODE_ENV.padEnd(35)} ║
║ Port: ${PORT.toString().padEnd(43)} ║
║ Frontend: ${(process.env.FRONTEND_URL || 'http://localhost:5173').padEnd(31)} ║
╚══════════════════════════════════════════════════╝
  `);
});

export default app;
