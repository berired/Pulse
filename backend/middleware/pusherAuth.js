import pusher from '../config/pusher.js';
import { AppError } from './errorHandler.js';

/**
 * Middleware to authenticate Pusher channel subscriptions
 * Validates user has access to the requested channel
 */
export const pusherAuthMiddleware = async (req, res, next) => {
  try {
    const { socket_id, channel_name } = req.body;
    const userId = req.userId;

    if (!socket_id || !channel_name) {
      throw new AppError('Missing socket_id or channel_name', 400);
    }

    if (!userId) {
      throw new AppError('Authentication required', 401);
    }

    // Validate channel access based on channel type
    // Channel format: type-subtype-identifier
    // Examples: private-user-{uuid}, presence-conversation-{conversationId}
    
    if (channel_name.startsWith('private-user-')) {
      // Extract userId from channel name
      // Format: private-user-{uuid}
      const channelUserId = channel_name.substring('private-user-'.length);
      if (channelUserId !== userId) {
        console.error(`[Pusher Auth] Channel user mismatch: ${channelUserId} !== ${userId}`);
        throw new AppError('Unauthorized channel access', 403);
      }
    } else if (channel_name.startsWith('presence-')) {
      // Presence channels validation
      // Example: presence-conversation-123
      // Additional validation can be added here
    } else if (channel_name.startsWith('group-')) {
      // Group channels validation
      // Example: group-messages-{groupId}
      // Validate user is member of group
      // This would require checking group_members table
    }

    // Generate auth token
    const auth = pusher.authenticate(socket_id, channel_name);
    res.json(auth);
  } catch (error) {
    console.error('[Pusher Auth] Error:', error.message);
    res.status(error.statusCode || 500).json({
      error: error.name,
      message: error.message,
    });
  }
};

export default pusherAuthMiddleware;
