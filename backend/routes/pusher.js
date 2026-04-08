import express from 'express';
import { authMiddleware } from '../middleware/auth.js';
import { pusherAuthMiddleware } from '../middleware/pusherAuth.js';

const router = express.Router();

/**
 * POST /api/pusher/auth
 * Authenticate user for Pusher channel subscription
 * Body: socket_id, channel_name
 */
router.post('/auth', authMiddleware, pusherAuthMiddleware);

export default router;
