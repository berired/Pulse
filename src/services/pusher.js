import Pusher from 'pusher-js';
import { authService } from './supabase';

const pusherKey = import.meta.env.VITE_PUSHER_KEY;
const pusherCluster = import.meta.env.VITE_PUSHER_CLUSTER;
const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';

if (!pusherKey || !pusherCluster) {
  console.warn('Pusher environment variables not set');
}

// Initialize Pusher with auth endpoint pointing to backend
export const pusher = new Pusher(pusherKey, {
  cluster: pusherCluster,
  encrypted: true,
  authorizer: (channel) => {
    return {
      authorize: async (socketId, callback) => {
        try {
          const session = await authService.getSession();
          const headers = {
            'Content-Type': 'application/json',
            ...(session?.access_token && { 'Authorization': `Bearer ${session.access_token}` }),
          };

          const response = await fetch(`${apiUrl}/api/pusher/auth`, {
            method: 'POST',
            headers,
            body: JSON.stringify({
              socket_id: socketId,
              channel_name: channel.name,
            }),
          });

          if (!response.ok) {
            throw new Error(`Pusher auth failed: ${response.status}`);
          }
          
          const data = await response.json();
          callback(false, data);
        } catch (error) {
          console.error('Pusher auth error:', error);
          callback(true, error);
        }
      },
    };
  },
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
    console.log('[Pusher] Subscribing to direct messages channel:', channelName);
    const channel = pusher.subscribe(channelName);

    channel.bind('message', (data) => {
      console.log('[Pusher] Message event received on channel:', channelName, data);
      onMessage(data);
    });

    channel.bind('typing', (data) => {
      console.log('[Pusher] Typing event received on channel:', channelName, data);
      onMessage({ type: 'typing', ...data });
    });

    return () => {
      console.log('[Pusher] Unsubscribing from channel:', channelName);
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
   * Subscribe to message requests for a user
   * @param {string} userId - User ID receiving requests
   * @param {function} onRequest - Callback for new requests
   */
  subscribeMessageRequests(userId, onRequest) {
    const channelName = `private-requests-${userId}`;
    const channel = pusher.subscribe(channelName);

    channel.bind('new-request', (data) => {
      onRequest(data);
    });

    return () => {
      pusher.unsubscribe(channelName);
    };
  },

  /**
   * Subscribe to group invites for a user
   * @param {string} userId - User ID receiving invites
   * @param {function} onInvite - Callback for new invites
   */
  subscribeGroupInvites(userId, onInvite) {
    const channelName = `private-invites-${userId}`;
    const channel = pusher.subscribe(channelName);

    channel.bind('new-invite', (data) => {
      onInvite(data);
    });

    return () => {
      pusher.unsubscribe(channelName);
    };
  },

  /**
   * Subscribe to conversation updates for a user
   * @param {string} userId - User ID
   * @param {function} onUpdate - Callback when conversations change
   */
  subscribeToConversations(userId, onUpdate) {
    const channelName = `private-conversations-${userId}`;
    const channel = pusher.subscribe(channelName);

    channel.bind('message-sent', onUpdate);
    channel.bind('message-received', onUpdate);

    return () => {
      pusher.unsubscribe(channelName);
    };
  },
};

export default pusher;
