// src/components/notifications/NotificationBell.jsx
import { Bell } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useNotifications } from '../../hooks/useNotifications';
import NotificationList from './NotificationList';

const NotificationBell = () => {
  const { unreadCount, refreshUnreadCount } = useNotifications();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Refresh unread count when dropdown opens
  useEffect(() => {
    if (isOpen) {
      refreshUnreadCount();
    }
  }, [isOpen, refreshUnreadCount]);

  const handleToggle = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Icon Button */}
      <button
        onClick={handleToggle}
        className="relative p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition focus:outline-none focus:ring-2 focus:ring-blue-500"
        aria-label="Thông báo"
      >
        <Bell className="w-6 h-6" />

        {/* Badge cho số lượng chưa đọc */}
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center font-semibold animate-pulse">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-96 z-50 shadow-xl">
          <NotificationList
            maxHeight="500px"
            onClose={() => setIsOpen(false)}
          />
        </div>
      )}

      {/* Overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
      )}
    </div>
  );
};

export default NotificationBell;
