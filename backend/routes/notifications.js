import express from 'express';
import { authMiddleware } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import {
  getNotifications,
  getUnreadCount,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
} from '../controllers/notificationsController.js';

const router = express.Router();

/**
 * GET /api/notifications/unread/count
 * Get unread notification count
 */
router.get('/unread/count', authMiddleware, asyncHandler(getUnreadCount));

/**
 * PATCH /api/notifications/read-all
 * Mark all notifications as read
 */
router.patch('/read-all', authMiddleware, asyncHandler(markAllNotificationsAsRead));

/**
 * GET /api/notifications
 * Get all notifications for the current user
 */
router.get('/', authMiddleware, asyncHandler(getNotifications));

/**
 * PATCH /api/notifications/:notificationId/read
 * Mark a single notification as read
 */
router.patch('/:notificationId/read', authMiddleware, asyncHandler(markNotificationAsRead));

/**
 * DELETE /api/notifications/:notificationId
 * Delete a notification
 */
router.delete('/:notificationId', authMiddleware, asyncHandler(deleteNotification));

export default router;
