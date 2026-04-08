import Pusher from 'pusher-js';

const pusherKey = import.meta.env.VITE_PUSHER_KEY;
const pusherCluster = import.meta.env.VITE_PUSHER_CLUSTER;

if (!pusherKey || !pusherCluster) {
  console.warn('Pusher environment variables not set');
}

// Initialize Pusher
export const pusher = new Pusher(pusherKey, {
  cluster: pusherCluster,
  encrypted: true,
});

// Messaging Service
export const messagingService = {
  /**
   * Subscribe to direct message channel
   * @param {string} userId - Current user ID
   * @param {string} otherUserId - Other user ID
   * @param {function} onMessage - Callback for new messages
   */
  subscribeDirectMessages(userId, otherUserId, onMessage) {
    const channelName = this.getDirectMessageChannelName(userId, otherUserId);
    const channel = pusher.subscribe(channelName);

    channel.bind('message', (data) => {
      onMessage(data);
    });

    channel.bind('typing', (data) => {
      onMessage({ type: 'typing', ...data });
    });

    return () => {
      pusher.unsubscribe(channelName);
    };
  },

  /**
   * Subscribe to cohort (group) messages
   * @param {string} cohortId - Cohort ID
   * @param {function} onMessage - Callback for new messages
   */
  subscribeCohortMessages(cohortId, onMessage) {
    const channelName = `private-cohort-${cohortId}`;
    const channel = pusher.subscribe(channelName);

    channel.bind('message', (data) => {
      onMessage(data);
    });

    channel.bind('read-receipt', (data) => {
      onMessage({ type: 'read-receipt', ...data });
    });

    channel.bind('typing', (data) => {
      onMessage({ type: 'typing', ...data });
    });

    return () => {
      pusher.unsubscribe(channelName);
    };
  },

  /**
   * Emit typing indicator
   * @param {string} channelName - Channel name
   * @param {string} userId - Typing user ID
   * @param {string} username - Typing user name
   */
  emitTyping(channelName, userId, username) {
    const channel = pusher.channel(channelName);
    if (channel) {
      channel.trigger('client-typing', {
        userId,
        username,
        timestamp: Date.now(),
      });
    }
  },

  /**
   * Generate direct message channel name
   */
  getDirectMessageChannelName(userId1, userId2) {
    const sortedIds = [userId1, userId2].sort();
    return `private-dm-${sortedIds[0]}-${sortedIds[1]}`;
  },

  /**
   * Get presence channel for online status
   */
  getPresenceChannel(userId) {
    const channel = pusher.subscribe(`presence-user-${userId}`);
    return channel;
  },
};

export default pusher;
