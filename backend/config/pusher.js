import Pusher from 'pusher';
import dotenv from 'dotenv';

dotenv.config();

const pusher = new Pusher({
  appId: process.env.PUSHER_ID,
  key: process.env.PUSHER_KEY,
  secret: process.env.PUSHER_SECRET,
  cluster: process.env.PUSHER_CLUSTER,
  useTLS: process.env.PUSHER_ENCRYPTED === 'true',
});

/**
 * Emit real-time event to message channel
 * @param {string} channel - Channel name (e.g., 'direct-messages-userId-otherId')
 * @param {string} event - Event name (e.g., 'new-message', 'typing')
 * @param {object} data - Event data payload
 */
export const emitMessageEvent = async (channel, event, data) => {
  try {
    await pusher.trigger(channel, event, data);
    console.log(`[Pusher] Event "${event}" triggered on channel "${channel}"`);
  } catch (error) {
    console.error(`[Pusher] Error emitting event: ${error.message}`);
  }
};

/**
 * Emit typing indicator
 * @param {string} conversationId - Unique conversation identifier
 * @param {string} userId - User ID who is typing
 * @param {string} userName - User's display name
 */
export const emitTypingIndicator = async (conversationId, userId, userName) => {
  const channel = `presence-conversation-${conversationId}`;
  await emitMessageEvent(channel, 'user-typing', {
    userId,
    userName,
    timestamp: new Date().toISOString(),
  });
};

/**
 * Emit group message event
 * @param {string} groupId - Group ID
 * @param {string} event - Event type
 * @param {object} messageData - Message payload
 */
export const emitGroupMessageEvent = async (groupId, event, messageData) => {
  const channel = `group-messages-${groupId}`;
  await emitMessageEvent(channel, event, messageData);
};

/**
 * Broadcast to multiple channels
 * @param {array} channels - Array of channel names
 * @param {string} event - Event name
 * @param {object} data - Event data
 */
export const broadcastEvent = async (channels, event, data) => {
  try {
    await pusher.trigger(channels, event, data);
    console.log(`[Pusher] Event "${event}" broadcast to ${channels.length} channel(s)`);
  } catch (error) {
    console.error(`[Pusher] Error broadcasting event: ${error.message}`);
  }
};

export default pusher;
