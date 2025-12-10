// src/hooks/useNotifications.js
import { useCallback, useEffect, useState, useRef } from 'react';
import { io } from 'socket.io-client';
import toast from 'react-hot-toast';
import { notificationsService } from '../services/api/notifications';

const SOCKET_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

/**
 * Custom hook để quản lý Notifications với Real-time WebSocket
 *
 * @returns {Object} Hook state và methods
 *
 * Example Usage:
 * ```jsx
 * const {
 *   notifications,
 *   unreadCount,
 *   loading,
 *   isConnected,
 *   getNotifications,
 *   markAsRead,
 *   markAllAsRead,
 *   deleteNotification,
 *   refreshUnreadCount
 * } = useNotifications();
 * ```
 */
export const useNotifications = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isConnected, setIsConnected] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 20,
    total: 0,
  });

  const socketRef = useRef(null);

  /**
   * Helper function để gọi API với error handling
   */
  const apiCall = useCallback(async (apiFunction, ...args) => {
    setLoading(true);
    setError(null);
    try {
      const result = await apiFunction(...args);
      return result;
    } catch (err) {
      const errorMessage =
        err.message || `Failed to call ${apiFunction?.name || 'anonymous'}`;
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * 📌 1. Lấy danh sách thông báo
   *
   * @param {Object} params - Query parameters
   * @returns {Promise<Object>} Response data
   */
  const getNotifications = useCallback(
    async (params = {}) => {
      const data = await apiCall(notificationsService.getNotifications, params);
      setNotifications(data.items || []);
      setPagination({
        page: data.page || 1,
        pageSize: data.pageSize || 20,
        total: data.total || 0,
      });
      return data;
    },
    [apiCall],
  );

  /**
   * 📌 2. Đánh dấu thông báo là đã đọc
   *
   * @param {string} notificationId - ID thông báo
   * @returns {Promise<Object>} Updated notification
   */
  const markAsRead = useCallback(
    async (notificationId) => {
      const result = await apiCall(
        notificationsService.markAsRead,
        notificationId,
      );

      // Cập nhật local state
      setNotifications((prev) =>
        prev.map((notif) =>
          notif.notification_id === notificationId
            ? { ...notif, is_read: true, read_at: new Date().toISOString() }
            : notif,
        ),
      );

      // Giảm unread count
      setUnreadCount((prev) => Math.max(0, prev - 1));

      return result;
    },
    [apiCall],
  );

  /**
   * 📌 3. Đánh dấu tất cả là đã đọc
   *
   * @returns {Promise<void>}
   */
  const markAllAsRead = useCallback(async () => {
    await apiCall(notificationsService.markAllAsRead);

    // Cập nhật local state
    setNotifications((prev) =>
      prev.map((notif) => ({
        ...notif,
        is_read: true,
        read_at: new Date().toISOString(),
      })),
    );

    setUnreadCount(0);
  }, [apiCall]);

  /**
   * 📌 4. Xóa thông báo
   *
   * @param {string} notificationId - ID thông báo
   * @returns {Promise<void>}
   */
  const deleteNotification = useCallback(
    async (notificationId) => {
      await apiCall(notificationsService.deleteNotification, notificationId);

      // Xóa khỏi local state
      setNotifications((prev) =>
        prev.filter((notif) => notif.notification_id !== notificationId),
      );

      // Cập nhật pagination total
      setPagination((prev) => ({
        ...prev,
        total: Math.max(0, prev.total - 1),
      }));
    },
    [apiCall],
  );

  /**
   * 📌 5. Tạo thông báo test (dev only)
   *
   * @param {Object} data - Test notification data
   * @returns {Promise<void>}
   */
  const createTestNotification = useCallback(
    async (data) => {
      return apiCall(notificationsService.createTestNotification, data);
    },
    [apiCall],
  );

  /**
   * 📌 6. Lấy số lượng thông báo chưa đọc
   *
   * @returns {Promise<number>} Unread count
   */
  const getUnreadCount = useCallback(async () => {
    try {
      const data = await notificationsService.getUnreadCount();
      setUnreadCount(data.unread || 0);
      return data.unread || 0;
    } catch (err) {
      console.error('Failed to get unread count:', err);
      return 0;
    }
  }, []);

  /**
   * 🔄 Refresh unread count (không set loading state)
   */
  const refreshUnreadCount = useCallback(async () => {
    try {
      const data = await notificationsService.getUnreadCount();
      setUnreadCount(data.unread || 0);
    } catch (err) {
      console.error('Failed to refresh unread count:', err);
    }
  }, []);

  /**
   * 🛠️ Helper: Lấy label cho notification type
   */
  const getNotificationTypeLabel = useCallback((type) => {
    return notificationsService.getNotificationTypeLabel(type);
  }, []);

  /**
   * 🛠️ Helper: Lấy icon cho notification type
   */
  const getNotificationIcon = useCallback((type) => {
    return notificationsService.getNotificationIcon(type);
  }, []);

  /**
   * 🛠️ Helper: Format thời gian
   */
  const formatNotificationTime = useCallback((dateString) => {
    return notificationsService.formatNotificationTime(dateString);
  }, []);

  /**
   * 🛠️ Helper: Lấy route từ notification
   */
  const getNotificationRoute = useCallback((notification) => {
    return notificationsService.getNotificationRoute(notification);
  }, []);

  // Auto-refresh unread count khi component mount
  useEffect(() => {
    refreshUnreadCount();

    // Setup WebSocket connection for real-time notifications
    const userStr = localStorage.getItem('user');
    const token = localStorage.getItem('accessToken'); // Changed from 'token' to 'accessToken'

    if (!userStr || !token) {
      console.warn('⚠️ [NOTIFICATIONS] No user/token found, skipping WebSocket');
      return;
    }

    const user = JSON.parse(userStr);
    console.log('🔌 [NOTIFICATIONS] Connecting WebSocket for user:', user.user_id);

    // Connect to notifications namespace
    socketRef.current = io(`${SOCKET_URL}/notifications`, {
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 10,
    });

    const socket = socketRef.current;

    // Connection events
    socket.on('connect', () => {
      console.log('✅ [NOTIFICATIONS] WebSocket connected:', socket.id);
      setIsConnected(true);
    });

    socket.on('disconnect', (reason) => {
      console.log('❌ [NOTIFICATIONS] WebSocket disconnected:', reason);
      setIsConnected(false);
    });

    socket.on('connect_error', (error) => {
      console.error('❌ [NOTIFICATIONS] Connection error:', error.message);
      setIsConnected(false);
    });

    socket.on('connected', (data) => {
      console.log('🎉 [NOTIFICATIONS] Server confirmed connection:', data);
    });

    // Listen for new notifications
    socket.on('new_notification', (notification) => {
      console.log('🔔 [NOTIFICATIONS] New notification received:', notification);

      // Add to notifications list if currently viewing
      setNotifications((prev) => [notification, ...prev]);

      // Increment unread count
      setUnreadCount((prev) => prev + 1);

      // Show toast notification
      const notifTypeLabel = notificationsService.getNotificationTypeLabel(notification.type);
      const title = notification.payload?.title || '';
      const message = title ? `${notifTypeLabel} - ${title}` : notifTypeLabel;
      
      toast.success(message, {
        duration: 4000,
        icon: '🔔',
      });
    });

    // Listen for notification read events
    socket.on('notification_read', ({ notificationId }) => {
      setNotifications((prev) =>
        prev.map((n) =>
          n.notification_id === notificationId ? { ...n, is_read: true } : n
        )
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    });

    // Listen for notification deleted events
    socket.on('notification_deleted', ({ notificationId }) => {
      setNotifications((prev) =>
        prev.filter((n) => n.notification_id !== notificationId)
      );
    });

    // Listen for unread count updates
    socket.on('unread_count_update', ({ count }) => {
      setUnreadCount(count);
    });

    // Cleanup on unmount
    return () => {
      console.log('🔌 [NOTIFICATIONS] Disconnecting WebSocket');
      socket.disconnect();
      socketRef.current = null;
    };
  }, [refreshUnreadCount]);

  return {
    // API Methods
    getNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    createTestNotification,
    getUnreadCount,
    refreshUnreadCount,

    // Helper Methods
    getNotificationTypeLabel,
    getNotificationIcon,
    formatNotificationTime,
    getNotificationRoute,

    // State
    notifications,
    unreadCount,
    pagination,
    loading,
    error,
    isConnected, // WebSocket connection status
  };
};

export default useNotifications;
