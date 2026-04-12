import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { pusher, messagingService } from '../services/pusher';
import { authService } from '../services/supabase';
import notificationService from '../services/notificationService';

const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';

/**
 * Helper function to get auth headers with JWT token
 */
const getAuthHeaders = async () => {
  try {
    const session = await authService.getSession();
    if (session?.access_token) {
      return {
        'Authorization': `Bearer ${session.access_token}`,
        'Content-Type': 'application/json',
      };
    }
  } catch (err) {
    console.error('Error getting auth token:', err);
  }
  return {
    'Content-Type': 'application/json',
  };
};

/**
 * Custom hook for managing user notifications
 * Handles fetching, real-time updates, and notification actions
 */
export const useNotifications = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const unsubscribeRef = useRef(null);

  // Fetch all notifications
  const fetchNotifications = useCallback(async () => {
    if (!user?.id) return;

    try {
      setLoading(true);
      const headers = await getAuthHeaders();
      const response = await fetch(`${apiUrl}/api/notifications?limit=50`, {
        headers,
      });

      if (!response.ok) throw new Error('Failed to fetch notifications');

      const data = await response.json();
      setNotifications(data.data || []);
      setError(null);
    } catch (err) {
      // Silently log errors but don't show them to user
      console.error('Error fetching notifications:', err);
      // Don't set error state to avoid breaking UI during background refresh
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  // Fetch unread count
  const fetchUnreadCount = useCallback(async () => {
    if (!user?.id) return;

    try {
      const headers = await getAuthHeaders();
      const response = await fetch(`${apiUrl}/api/notifications/unread/count`, {
        headers,
      });

      if (!response.ok) throw new Error('Failed to fetch unread count');

      const data = await response.json();
      setUnreadCount(data.unreadCount || 0);
    } catch (err) {
      console.error('Error fetching unread count:', err);
    }
  }, [user?.id]);

  // Subscribe to real-time notifications via Pusher
  const subscribeToNotifications = useCallback(() => {
    if (!user?.id) return;

    try {
      // Subscribe to user's private notification channel
      const channelName = `private-user-${user.id}`;
      const channel = pusher.subscribe(channelName);

      // Listen for new notifications
      channel.bind('notification', (data) => {
        const newNotification = data.notification;

        // Play sound and show browser notification
        notificationService.playNotificationSound();

        const message = notificationService.getNotificationMessage(newNotification);
        notificationService.showBrowserNotification(message, {
          body: `Tap to view ${newNotification.type} notification`,
        });

        // Add to notifications list
        setNotifications((prev) => [newNotification, ...prev]);

        // Update unread count
        setUnreadCount((prev) => prev + 1);
      });

      // Listen for follow events
      channel.bind('follow', (data) => {
        const notification = {
          id: `follow-${Date.now()}`,
          type: 'follow',
          actor: data.follower,
          read: false,
          created_at: new Date().toISOString(),
        };

        notificationService.playNotificationSound();
        const message = `${data.follower.username} followed you`;
        notificationService.showBrowserNotification(message);

        setNotifications((prev) => [notification, ...prev]);
        setUnreadCount((prev) => prev + 1);
      });

      // Store unsubscribe function for cleanup
      unsubscribeRef.current = () => {
        pusher.unsubscribe(channelName);
      };
    } catch (err) {
      console.error('Error subscribing to notifications:', err);
    }
  }, [user?.id]);

  // Mark notification as read
  const markAsRead = useCallback(
    async (notificationId) => {
      try {
        const headers = await getAuthHeaders();
        const response = await fetch(`${apiUrl}/api/notifications/${notificationId}/read`, {
          method: 'PATCH',
          headers,
        });

        if (!response.ok) throw new Error('Failed to mark notification as read');

        // Update local state
        setNotifications((prev) =>
          prev.map((n) => (n.id === notificationId ? { ...n, read: true } : n))
        );

        // Update unread count
        setUnreadCount((prev) => Math.max(0, prev - 1));
      } catch (err) {
        console.error('Error marking notification as read:', err);
      }
    },
    []
  );

  // Mark all notifications as read
  const markAllAsRead = useCallback(async () => {
    try {
      const headers = await getAuthHeaders();
      const response = await fetch(`${apiUrl}/api/notifications/read-all`, {
        method: 'PATCH',
        headers,
      });

      if (!response.ok) throw new Error('Failed to mark all as read');

      // Update local state
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error('Error marking all as read:', err);
    }
  }, []);

  // Delete notification
  const deleteNotification = useCallback(async (notificationId) => {
    try {
      const headers = await getAuthHeaders();
      const response = await fetch(`${apiUrl}/api/notifications/${notificationId}`, {
        method: 'DELETE',
        headers,
      });

      if (!response.ok) throw new Error('Failed to delete notification');

      // Update local state
      setNotifications((prev) => prev.filter((n) => n.id !== notificationId));

      // Update unread count if the deleted notification was unread
      const wasUnread = notifications.some(
        (n) => n.id === notificationId && !n.read
      );
      if (wasUnread) {
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }
    } catch (err) {
      console.error('Error deleting notification:', err);
    }
  }, [notifications]);

  // Initialize on mount
  useEffect(() => {
    if (user?.id) {
      // Request notification permission from browser
      notificationService.requestNotificationPermission();

      // Initial fetch
      fetchNotifications();
      fetchUnreadCount();

      // Subscribe to real-time updates
      subscribeToNotifications();
    }

    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
      }
    };
  }, [user?.id, fetchNotifications, fetchUnreadCount, subscribeToNotifications]);

  // Refresh unread count every 30 seconds (silent background refresh)
  useEffect(() => {
    if (!user?.id) return;

    const interval = setInterval(() => {
      fetchUnreadCount();
    }, 30000);

    return () => clearInterval(interval);
  }, [user?.id, fetchUnreadCount]);

  // Refresh full notifications list every 60 seconds (silent background refresh)
  useEffect(() => {
    if (!user?.id) return;

    const interval = setInterval(() => {
      fetchNotifications();
    }, 60000);

    return () => clearInterval(interval);
  }, [user?.id, fetchNotifications]);

  return {
    notifications,
    unreadCount,
    loading,
    error,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    refreshNotifications: fetchNotifications,
    refreshUnreadCount: fetchUnreadCount,
  };
};

export default useNotifications;
