import { useNavigate } from 'react-router-dom';
import { X, Trash2, CheckCircle } from 'lucide-react';
import useNotifications from '../hooks/useNotifications';
import notificationService from '../services/notificationService';
import './NotificationDropdown.css';

/**
 * NotificationDropdown Component
 * Displays a dropdown menu with all notifications
 * Allows user to read, delete, and navigate to notification targets
 */
function NotificationDropdown({ onClose }) {
  const navigate = useNavigate();
  const {
    notifications,
    loading,
    markAsRead,
    markAllAsRead,
    deleteNotification,
  } = useNotifications();

  const handleNotificationClick = async (notification) => {
    // Mark as read
    if (!notification.read) {
      await markAsRead(notification.id);
    }

    // Navigate to appropriate page
    const route = notificationService.getNotificationRoute(notification);
    navigate(route);
    onClose();
  };

  const handleDelete = (e, notificationId) => {
    e.stopPropagation();
    deleteNotification(notificationId);
  };

  const handleMarkAsRead = (e, notificationId) => {
    e.stopPropagation();
    markAsRead(notificationId);
  };

  const handleMarkAllAsRead = async () => {
    await markAllAsRead();
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'follow':
        return '👤';
      case 'message':
        return '💬';
      case 'group_invite':
        return '👥';
      default:
        return '🔔';
    }
  };

  const getNotificationStyle = (type) => {
    switch (type) {
      case 'follow':
        return 'follow-notification';
      case 'message':
        return 'message-notification';
      case 'group_invite':
        return 'group-notification';
      default:
        return '';
    }
  };

  return (
    <div className="notification-dropdown">
      <div className="notification-dropdown-header">
        <h3>Notifications</h3>
        <div className="header-actions">
          {notifications.length > 0 && (
            <button
              className="mark-all-read-btn"
              onClick={handleMarkAllAsRead}
              title="Mark all as read"
            >
              Mark all as read
            </button>
          )}
          <button
            className="close-btn"
            onClick={onClose}
            aria-label="Close notifications"
          >
            <X size={18} />
          </button>
        </div>
      </div>

      <div className="notification-dropdown-content">
        {loading ? (
          <div className="notification-empty">Loading notifications...</div>
        ) : notifications.length === 0 ? (
          <div className="notification-empty">
            <p>No notifications yet</p>
            <p className="empty-subtext">
              You're all caught up! Check back later for updates.
            </p>
          </div>
        ) : (
          <div className="notification-list">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={`notification-item ${getNotificationStyle(notification.type)} ${
                  !notification.read ? 'unread' : ''
                }`}
                onClick={() => handleNotificationClick(notification)}
              >
                <div className="notification-icon">
                  {getNotificationIcon(notification.type)}
                </div>

                <div className="notification-content">
                  <div className="notification-message">
                    <strong>{notification.actor?.username || 'Someone'}</strong>
                    {notification.type === 'follow' && ' followed you'}
                    {notification.type === 'message' && ' sent you a message'}
                    {notification.type === 'group_invite' &&
                      ` added you to "${notification.group?.name}"`}
                  </div>

                  <div className="notification-time">
                    {formatTime(notification.created_at)}
                  </div>
                </div>

                {!notification.read && (
                  <div className="notification-unread-indicator" />
                )}

                <div className="notification-actions">
                  {!notification.read && (
                    <button
                      className="action-btn read-btn"
                      onClick={(e) => handleMarkAsRead(e, notification.id)}
                      title="Mark as read"
                    >
                      <CheckCircle size={16} />
                    </button>
                  )}
                  <button
                    className="action-btn delete-btn"
                    onClick={(e) => handleDelete(e, notification.id)}
                    title="Delete notification"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Format timestamp for display
 */
function formatTime(timestamp) {
  const date = new Date(timestamp);
  const now = new Date();
  const diffInSeconds = Math.floor((now - date) / 1000);

  if (diffInSeconds < 60) {
    return 'Just now';
  }

  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `${diffInMinutes}m ago`;
  }

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `${diffInHours}h ago`;
  }

  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) {
    return `${diffInDays}d ago`;
  }

  // Return formatted date
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
}

export default NotificationDropdown;
