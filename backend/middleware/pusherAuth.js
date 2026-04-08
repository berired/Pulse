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
    const channelParts = channel_name.split('-');
    const channelType = channelParts[0];

    // Private channels validation
    if (channelType === 'private') {
      // Example: private-user-123
      const channelUserId = channelParts[2];
      if (channelUserId !== userId) {
        throw new AppError('Unauthorized channel access', 403);
      }
    }

    // Presence channels validation
    if (channelType === 'presence') {
      // Example: presence-conversation-123
      // Additional validation can be added here
    }

    // Group channels validation
    if (channelType === 'group') {
      // Example: group-messages-groupId
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
