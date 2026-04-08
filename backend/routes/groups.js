import express from 'express';
import { authMiddleware } from '../middleware/auth.js';
import {
  getGroups,
  createGroup,
  updateGroup,
  getGroupMessages,
  sendGroupMessage,
  deleteGroupMessage,
  addGroupMember,
  removeGroupMember,
  getGroupMembers,
} from '../controllers/groupsController.js';

const router = express.Router();

/**
 * GET /api/groups
 * Get all groups for current user
 */
router.get('/', authMiddleware, async (req, res, next) => {
  try {
    await getGroups(req, res);
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/groups
 * Create a new group
 * Body: name, description (optional), memberIds[]
 */
router.post('/', authMiddleware, async (req, res, next) => {
  try {
    await createGroup(req, res);
  } catch (error) {
    next(error);
  }
});

/**
 * PATCH /api/groups/:groupId
 * Update group details
 */
router.patch('/:groupId', authMiddleware, async (req, res, next) => {
  try {
    await updateGroup(req, res);
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/groups/:groupId/messages
 * Get messages in a group
 * Query: limit, offset
 */
router.get('/:groupId/messages', authMiddleware, async (req, res, next) => {
  try {
    await getGroupMessages(req, res);
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/groups/:groupId/messages
 * Send message to group
 * Body: content
 */
router.post('/:groupId/messages', authMiddleware, async (req, res, next) => {
  try {
    await sendGroupMessage(req, res);
  } catch (error) {
    next(error);
  }
});

/**
 * DELETE /api/groups/:groupId/messages/:messageId
 * Delete a message from group
 */
router.delete('/:groupId/messages/:messageId', authMiddleware, async (req, res, next) => {
  try {
    await deleteGroupMessage(req, res);
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/groups/:groupId/members
 * Get group members
 */
router.get('/:groupId/members', authMiddleware, async (req, res, next) => {
  try {
    await getGroupMembers(req, res);
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/groups/:groupId/members
 * Add member to group
 * Body: userId
 */
router.post('/:groupId/members', authMiddleware, async (req, res, next) => {
  try {
    await addGroupMember(req, res);
  } catch (error) {
    next(error);
  }
});

/**
 * DELETE /api/groups/:groupId/members/:memberId
 * Remove member from group
 */
router.delete('/:groupId/members/:memberId', authMiddleware, async (req, res, next) => {
  try {
    await removeGroupMember(req, res);
  } catch (error) {
    next(error);
  }
});

export default router;
