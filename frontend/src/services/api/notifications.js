// src/services/api/notifications.js
// API service cho Notifications
import api from './config';

export const notificationsService = {
  /**
   * 📌 1. GET /api/v1/notifications — Lấy danh sách thông báo
   *
   * @param {Object} params - Query parameters
   * @param {number} [params.page=1] - Trang hiện tại
   * @param {number} [params.pageSize=20] - Số lượng thông báo mỗi trang
   * @param {string} [params.type] - Lọc theo loại thông báo
   * @param {boolean} [params.onlyUnread=false] - Chỉ lấy thông báo chưa đọc
   *
   * @returns {Promise<Object>} Response { items, total, page, pageSize }
   *
   * Example:
   * ```js
   * const notifications = await notificationsService.getNotifications({
   *   page: 1,
   *   pageSize: 20,
   *   onlyUnread: true
   * });
   * // Result: { items: [...], total: 42, page: 1, pageSize: 20 }
   * ```
   */
  async getNotifications(params = {}) {
    try {
      const response = await api.get('/api/v1/notifications', {
        params: {
          page: 1,
          pageSize: 20,
          onlyUnread: false,
          ...params,
        },
      });
      return response.data;
    } catch (error) {
      throw (
        error.response?.data || { message: 'Failed to fetch notifications' }
      );
    }
  },

  /**
   * 📌 2. PATCH /api/v1/notifications/{id}/read — Đánh dấu thông báo là đã đọc
   *
   * @param {string} notificationId - ID thông báo
   * @returns {Promise<Object>} Thông báo đã được cập nhật
   *
   * Example:
   * ```js
   * await notificationsService.markAsRead('notification-id-123');
   * ```
   */
  async markAsRead(notificationId) {
    try {
      const response = await api.patch(
        `/api/v1/notifications/${notificationId}/read`,
      );
      return response.data;
    } catch (error) {
      if (error.response?.status === 404) {
        throw { message: 'Notification not found' };
      }
      throw (
        error.response?.data || {
          message: 'Failed to mark notification as read',
        }
      );
    }
  },

  /**
   * 📌 3. PATCH /api/v1/notifications/read-all — Đánh dấu tất cả là đã đọc
   *
   * @returns {Promise<void>}
   *
   * Example:
   * ```js
   * await notificationsService.markAllAsRead();
   * ```
   */
  async markAllAsRead() {
    try {
      await api.patch('/api/v1/notifications/read-all');
      return;
    } catch (error) {
      throw (
        error.response?.data || {
          message: 'Failed to mark all notifications as read',
        }
      );
    }
  },

  /**
   * 📌 4. DELETE /api/v1/notifications/{id} — Xóa thông báo (soft delete)
   *
   * @param {string} notificationId - ID thông báo
   * @returns {Promise<void>}
   *
   * Example:
   * ```js
   * await notificationsService.deleteNotification('notification-id-123');
   * ```
   */
  async deleteNotification(notificationId) {
    try {
      await api.delete(`/api/v1/notifications/${notificationId}`);
      return;
    } catch (error) {
      if (error.response?.status === 404) {
        throw { message: 'Notification not found' };
      }
      throw (
        error.response?.data || { message: 'Failed to delete notification' }
      );
    }
  },

  /**
   * 📌 5. POST /api/v1/notifications/test — Tạo thông báo thử nghiệm (dev only)
   *
   * @param {Object} data - Dữ liệu test
   * @param {string} data.type - Loại thông báo test
   * @param {Object} data.payload - Payload của thông báo
   * @returns {Promise<void>}
   *
   * Example:
   * ```js
   * await notificationsService.createTestNotification({
   *   type: 'TEST',
   *   payload: { message: 'Hello World' }
   * });
   * ```
   */
  async createTestNotification(data) {
    try {
      await api.post('/api/v1/notifications/test', data);
      return;
    } catch (error) {
      throw (
        error.response?.data || {
          message: 'Failed to create test notification',
        }
      );
    }
  },

  /**
   * 📌 6. GET /api/v1/notifications/unread/count — Lấy số lượng thông báo chưa đọc
   *
   * @returns {Promise<Object>} Response { unread: number }
   *
   * Example:
   * ```js
   * const { unread } = await notificationsService.getUnreadCount();
   * // Result: { unread: 5 }
   * ```
   */
  async getUnreadCount() {
    try {
      const response = await api.get('/api/v1/notifications/unread/count');
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch unread count' };
    }
  },

  /**
   * 🛠️ Helper: Lấy label cho notification type
   *
   * @param {string} type - Loại thông báo
   * @returns {string} Label tiếng Việt
   */
  getNotificationTypeLabel(type) {
    const labels = {
      EXCHANGE_REQUEST: 'Yêu cầu trao đổi',
      EXCHANGE_ACCEPTED: 'Trao đổi được chấp nhận',
      EXCHANGE_REJECTED: 'Trao đổi bị từ chối',
      EXCHANGE_COMPLETED: 'Trao đổi hoàn tất',
      EXCHANGE_CANCELLED: 'Trao đổi bị hủy',
      MESSAGE_RECEIVED: 'Tin nhắn mới',
      REVIEW_RECEIVED: 'Đánh giá mới',
      BOOK_MATCHED: 'Sách phù hợp',
      SYSTEM: 'Thông báo hệ thống',
      TEST: 'Thử nghiệm',
      OTHER: 'Khác',
    };
    return labels[type] || type;
  },

  /**
   * 🛠️ Helper: Lấy icon cho notification type
   *
   * @param {string} type - Loại thông báo
   * @returns {string} Icon emoji
   */
  getNotificationIcon(type) {
    const icons = {
      EXCHANGE_REQUEST: '🔄',
      EXCHANGE_ACCEPTED: '✅',
      EXCHANGE_REJECTED: '❌',
      EXCHANGE_COMPLETED: '🎉',
      EXCHANGE_CANCELLED: '⛔',
      MESSAGE_RECEIVED: '💬',
      REVIEW_RECEIVED: '⭐',
      BOOK_MATCHED: '📚',
      SYSTEM: '🔔',
      TEST: '🧪',
      OTHER: '📌',
    };
    return icons[type] || '🔔';
  },

  /**
   * 🛠️ Helper: Format thời gian hiển thị
   *
   * @param {string} dateString - ISO date string
   * @returns {string} Formatted time string
   */
  formatNotificationTime(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);

    if (diffInSeconds < 60) {
      return 'Vừa xong';
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return `${minutes} phút trước`;
    } else if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return `${hours} giờ trước`;
    } else if (diffInSeconds < 604800) {
      const days = Math.floor(diffInSeconds / 86400);
      return `${days} ngày trước`;
    } else {
      return date.toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      });
    }
  },

  /**
   * 🛠️ Helper: Lấy route navigation từ notification
   *
   * @param {Object} notification - Notification object
   * @returns {string|null} Route path
   */
  getNotificationRoute(notification) {
    const { notification_type, payload } = notification;

    switch (notification_type) {
      case 'EXCHANGE_REQUEST':
      case 'EXCHANGE_ACCEPTED':
      case 'EXCHANGE_REJECTED':
      case 'EXCHANGE_COMPLETED':
      case 'EXCHANGE_CANCELLED':
        return payload?.exchange_id
          ? `/exchange/${payload.exchange_id}`
          : '/exchange/list';

      case 'MESSAGE_RECEIVED':
        return payload?.conversation_id
          ? `/messages/conversation/${payload.conversation_id}`
          : '/messages';

      case 'REVIEW_RECEIVED':
        return '/profile/reviews';

      case 'BOOK_MATCHED':
        return payload?.book_id ? `/books/detail/${payload.book_id}` : '/books';

      default:
        return null;
    }
  },
};

export default notificationsService;
