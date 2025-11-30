// src/components/notifications/NotificationList.jsx
import { AlertCircle } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNotifications } from '../../hooks/useNotifications';
import { Button, LoadingSpinner } from '../ui';
import NotificationItem from './NotificationItem';

const NotificationList = ({ maxHeight = '400px', onClose }) => {
  const {
    notifications,
    loading,
    error,
    getNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    getNotificationIcon,
    getNotificationTypeLabel,
    formatNotificationTime,
    getNotificationRoute,
    pagination,
  } = useNotifications();

  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    loadNotifications();
  }, [currentPage]);

  const loadNotifications = () => {
    getNotifications({ page: currentPage, pageSize: 10 });
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead();
      loadNotifications();
    } catch (err) {
      console.error('Failed to mark all as read:', err);
    }
  };

  const handleDelete = async (notificationId) => {
    try {
      await deleteNotification(notificationId);
    } catch (err) {
      console.error('Failed to delete notification:', err);
    }
  };

  const handleMarkAsRead = async (notificationId) => {
    try {
      await markAsRead(notificationId);
    } catch (err) {
      console.error('Failed to mark as read:', err);
    }
  };

  const hasUnread = notifications.some((n) => !n.is_read);

  return (
    <div className="flex flex-col bg-white rounded-lg shadow-lg border border-gray-200">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Thông báo</h3>
          {hasUnread && (
            <Button
              variant="text"
              size="sm"
              onClick={handleMarkAllAsRead}
              className="text-blue-600 hover:text-blue-700"
            >
              Đánh dấu tất cả đã đọc
            </Button>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="overflow-y-auto" style={{ maxHeight }}>
        {loading && notifications.length === 0 ? (
          <div className="flex justify-center items-center py-12">
            <LoadingSpinner size="lg" />
          </div>
        ) : error ? (
          <div className="p-6 text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
            <p className="text-red-600">{error}</p>
            <Button
              variant="outline"
              size="sm"
              onClick={loadNotifications}
              className="mt-3"
            >
              Thử lại
            </Button>
          </div>
        ) : notifications.length === 0 ? (
          <div className="p-12 text-center">
            <div className="text-6xl mb-3">🔔</div>
            <p className="text-gray-500">Chưa có thông báo nào</p>
          </div>
        ) : (
          <>
            {notifications.map((notification) => (
              <NotificationItem
                key={notification.notification_id}
                notification={notification}
                onMarkAsRead={handleMarkAsRead}
                onDelete={handleDelete}
                getNotificationIcon={getNotificationIcon}
                getNotificationTypeLabel={getNotificationTypeLabel}
                formatNotificationTime={formatNotificationTime}
                getNotificationRoute={getNotificationRoute}
              />
            ))}
          </>
        )}
      </div>

      {/* Footer with pagination */}
      {pagination.total > pagination.pageSize && (
        <div className="p-3 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">
              Trang {pagination.page} /{' '}
              {Math.ceil(pagination.total / pagination.pageSize)}
            </span>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => p - 1)}
              >
                Trước
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={
                  currentPage >=
                  Math.ceil(pagination.total / pagination.pageSize)
                }
                onClick={() => setCurrentPage((p) => p + 1)}
              >
                Sau
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* View all button */}
      {notifications.length > 0 && (
        <div className="p-3 border-t border-gray-200">
          <Button
            variant="outline"
            className="w-full"
            onClick={() => {
              if (onClose) onClose();
              window.location.href = '/notifications';
            }}
          >
            Xem tất cả thông báo
          </Button>
        </div>
      )}
    </div>
  );
};

export default NotificationList;
