import express from 'express';
import { getDirectMessages, sendDirectMessage, markAsRead } from '../controllers/messagesController.js';

const router = express.Router();

// GET /api/messages/:userId - Get conversation with specific user
router.get('/:userId', getDirectMessages);

// POST /api/messages/:userId - Send message to specific user
router.post('/:userId', sendDirectMessage);

// PATCH /api/messages/:messageId/read - Mark message as read
router.patch('/:messageId/read', markAsRead);

export default router;
