import { useState } from 'react';
import { Bell } from 'lucide-react';
import useNotifications from '../hooks/useNotifications';
import NotificationDropdown from './NotificationDropdown';
import './NotificationBell.css';

/**
 * NotificationBell Component
 * Displays a bell icon with unread notification count badge
 * Shows dropdown menu with notifications on click
 */
function NotificationBell() {
  const { unreadCount } = useNotifications();
  const [isOpen, setIsOpen] = useState(false);

  const handleToggle = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className="notification-bell-container">
      <button
        className="notification-bell-button"
        onClick={handleToggle}
        aria-label={`Notifications (${unreadCount} unread)`}
        title={`${unreadCount} unread notifications`}
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="notification-badge">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <NotificationDropdown
          onClose={() => setIsOpen(false)}
        />
      )}
    </div>
  );
}

export default NotificationBell;
