import express from 'express';
import {
  getDirectMessages,
  sendDirectMessage,
  markAsRead,
  sendDirectMessageRequest,
  getPendingDirectMessageRequests,
  respondDirectMessageRequest,
  sendGroupInvite,
  getPendingGroupInvites,
  respondGroupInvite,
} from '../controllers/messagesController.js';


const router = express.Router();

// ⚠️ IMPORTANT: Specific routes must come BEFORE generic :userId routes!

// Message Requests (Specific routes)
// GET /api/messages/requests/pending - Get pending message requests
router.get('/requests/pending', getPendingDirectMessageRequests);

// PATCH /api/messages/requests/:requestId/respond - Respond to message request
router.patch('/requests/:requestId/respond', respondDirectMessageRequest);

// Group Invites (Specific routes)
// GET /api/messages/group-invites/pending - Get pending group invites
router.get('/group-invites/pending', getPendingGroupInvites);

// PATCH /api/messages/group-invites/:inviteId/respond - Respond to group invite
router.patch('/group-invites/:inviteId/respond', respondGroupInvite);

// Direct Messages (Generic routes - MUST be last)
// GET /api/messages/:userId - Get conversation with specific user
router.get('/:userId', getDirectMessages);

// POST /api/messages/:userId - Send message to specific user
router.post('/:userId', sendDirectMessage);

// POST /api/messages/:userId/request - Send message request
router.post('/:userId/request', sendDirectMessageRequest);

// POST /api/messages/:userId/group-invite - Send group invite
router.post('/:userId/group-invite', sendGroupInvite);

// PATCH /api/messages/:messageId/read - Mark message as read
router.patch('/:messageId/read', markAsRead);

export default router;
