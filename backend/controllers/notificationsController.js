import supabase from '../config/supabase.js';
import { AppError } from '../middleware/errorHandler.js';
import Pusher from 'pusher';

const pusher = new Pusher({
  appId: process.env.PUSHER_APP_ID,
  key: process.env.PUSHER_KEY,
  secret: process.env.PUSHER_SECRET,
  cluster: process.env.PUSHER_CLUSTER,
});

/**
 * Get all notifications for the current user
 */
export const getNotifications = async (req, res) => {
  try {
    const userId = req.userId;
    const { limit = 20, offset = 0 } = req.query;

    if (!userId) {
      throw new AppError('User ID is required', 401);
    }

    console.log('[GetNotifications] Fetching notifications for user:', userId, 'limit:', limit, 'offset:', offset);

    const { data, error, count } = await supabase
      .from('notifications')
      .select(
        `*,
        actor:actor_id(id, username, avatar_url),
        target_user:target_user_id(id, username, avatar_url),
        group:group_id(id, name)`,
        { count: 'exact' }
      )
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('[GetNotifications] Supabase error:', error);
      throw new AppError(error.message || 'Failed to fetch notifications', 400);
    }

    console.log('[GetNotifications] Found', data?.length, 'notifications');

    res.json({
      success: true,
      data: data || [],
      total: count,
      limit,
      offset,
    });
  } catch (error) {
    console.error('[GetNotifications] Error:', error);
    throw error;
  }
};

/**
 * Get unread notification count
 */
export const getUnreadCount = async (req, res) => {
  try {
    const userId = req.userId;

    if (!userId) {
      throw new AppError('User ID is required', 401);
    }

    console.log('[GetUnreadCount] Fetching unread count for user:', userId);

    // Try a simpler query approach
    const { data, error } = await supabase
      .from('notifications')
      .select('id')
      .eq('user_id', userId)
      .eq('read', false);

    if (error) {
      console.error('[GetUnreadCount] Supabase error:', error);
      throw new AppError(error.message || 'Failed to fetch unread count', 400);
    }

    const count = data?.length || 0;
    console.log('[GetUnreadCount] Unread count:', count);

    res.json({
      success: true,
      unreadCount: count,
    });
  } catch (error) {
    console.error('[GetUnreadCount] Error:', error);
    throw error;
  }
};

/**
 * Mark notification as read
 */
export const markNotificationAsRead = async (req, res) => {
  try {
    const { notificationId } = req.params;
    const userId = req.userId;

    // First verify the notification belongs to the user
    const { data: notification, error: fetchError } = await supabase
      .from('notifications')
      .select('user_id')
      .eq('id', notificationId)
      .single();

    if (fetchError || !notification) {
      throw new AppError('Notification not found', 404);
    }

    if (notification.user_id !== userId) {
      throw new AppError('Unauthorized', 403);
    }

    const { data, error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('id', notificationId)
      .select()
      .single();

    if (error) throw new AppError(error.message, 400);

    res.json({
      success: true,
      message: 'Notification marked as read',
      data,
    });
  } catch (error) {
    throw error;
  }
};

/**
 * Mark all notifications as read
 */
export const markAllNotificationsAsRead = async (req, res) => {
  try {
    const userId = req.userId;

    const { data, error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('user_id', userId)
      .eq('read', false)
      .select();

    if (error) throw new AppError(error.message, 400);

    res.json({
      success: true,
      message: 'All notifications marked as read',
      updatedCount: data?.length || 0,
    });
  } catch (error) {
    throw error;
  }
};

/**
 * Delete a notification
 */
export const deleteNotification = async (req, res) => {
  try {
    const { notificationId } = req.params;
    const userId = req.userId;

    // First verify the notification belongs to the user
    const { data: notification, error: fetchError } = await supabase
      .from('notifications')
      .select('user_id')
      .eq('id', notificationId)
      .single();

    if (fetchError || !notification) {
      throw new AppError('Notification not found', 404);
    }

    if (notification.user_id !== userId) {
      throw new AppError('Unauthorized', 403);
    }

    const { error } = await supabase
      .from('notifications')
      .delete()
      .eq('id', notificationId);

    if (error) throw new AppError(error.message, 400);

    res.json({
      success: true,
      message: 'Notification deleted',
    });
  } catch (error) {
    throw error;
  }
};

/**
 * Internal: Create a notification (called from other controllers)
 * Should NOT be exposed as a public API endpoint
 */
export const createNotificationInternal = async (
  userId,
  type,
  actorId,
  targetUserId = null,
  groupId = null,
  messageId = null
) => {
  try {
    const { data, error } = await supabase
      .from('notifications')
      .insert({
        user_id: userId,
        type,
        actor_id: actorId,
        target_user_id: targetUserId,
        group_id: groupId,
        message_id: messageId,
      })
      .select(
        `*,
        actor:actor_id(id, username, avatar_url),
        target_user:target_user_id(id, username, avatar_url),
        group:group_id(id, name)`
      )
      .single();

    if (error) {
      console.error('Error creating notification:', error);
      return null;
    }

    // Send notification via Pusher for real-time delivery
    try {
      await pusher.trigger(`private-user-${userId}`, 'notification', {
        notification: data,
        timestamp: Date.now(),
      });
    } catch (pusherError) {
      console.error('Error sending Pusher notification:', pusherError);
    }

    return data;
  } catch (error) {
    console.error('Error creating notification:', error);
    return null;
  }
};

/**
 * Check if notification exists before creating duplicate
 */
export const checkNotificationExists = async (userId, type, actorId, targetUserId = null) => {
  try {
    const { data, error } = await supabase
      .from('notifications')
      .select('id, read')
      .eq('user_id', userId)
      .eq('type', type)
      .eq('actor_id', actorId)
      .eq('target_user_id', targetUserId)
      .eq('read', false)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error && error.code === 'PGRST116') {
      // No rows found
      return null;
    }

    if (error) {
      console.error('Error checking notification:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error checking notification:', error);
    return null;
  }
};
