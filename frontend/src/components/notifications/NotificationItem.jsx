// src/components/notifications/NotificationItem.jsx
import { Clock, Trash2, X } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const NotificationItem = ({
  notification,
  onMarkAsRead,
  onDelete,
  getNotificationIcon,
  getNotificationTypeLabel,
  formatNotificationTime,
  getNotificationRoute,
}) => {
  const navigate = useNavigate();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleClick = async () => {
    // Đánh dấu là đã đọc nếu chưa đọc
    if (!notification.is_read && onMarkAsRead) {
      await onMarkAsRead(notification.notification_id);
    }

    // Navigate đến route tương ứng
    const route = getNotificationRoute(notification);
    if (route) {
      navigate(route);
    }
  };

  const handleDelete = async (e) => {
    e.stopPropagation();
    if (window.confirm('Bạn có chắc muốn xóa thông báo này?')) {
      setIsDeleting(true);
      try {
        await onDelete(notification.notification_id);
      } catch (error) {
        console.error('Failed to delete notification:', error);
        setIsDeleting(false);
      }
    }
  };

  const renderPayload = () => {
    const { payload } = notification;
    if (!payload) return null;

    // Customize message dựa vào type
    switch (notification.notification_type) {
      case 'EXCHANGE_REQUEST':
        return (
          <p className="text-sm text-gray-700">
            <span className="font-medium">
              {payload.from_member?.name || 'Người dùng'}
            </span>{' '}
            đã gửi yêu cầu trao đổi sách với bạn
          </p>
        );

      case 'EXCHANGE_ACCEPTED':
        return (
          <p className="text-sm text-gray-700">
            Yêu cầu trao đổi của bạn đã được{' '}
            <span className="font-medium">
              {payload.from_member?.name || 'người dùng'}
            </span>{' '}
            chấp nhận
          </p>
        );

      case 'EXCHANGE_REJECTED':
        return (
          <p className="text-sm text-gray-700">
            Yêu cầu trao đổi của bạn đã bị từ chối
          </p>
        );

      case 'EXCHANGE_COMPLETED':
        return (
          <p className="text-sm text-gray-700">
            Trao đổi đã hoàn tất thành công
          </p>
        );

      case 'MESSAGE_RECEIVED':
        return (
          <p className="text-sm text-gray-700">
            <span className="font-medium">
              {payload.from_member?.name || 'Người dùng'}
            </span>{' '}
            đã gửi tin nhắn cho bạn
          </p>
        );

      case 'REVIEW_RECEIVED':
        return (
          <p className="text-sm text-gray-700">Bạn đã nhận được đánh giá mới</p>
        );

      case 'BOOK_MATCHED':
        return (
          <p className="text-sm text-gray-700">
            Có sách mới phù hợp với sách bạn muốn tìm
          </p>
        );

      case 'REPORT_RESOLVED':
        return (
          <p className="text-sm text-gray-700">
            {payload.message || 'Báo cáo của bạn đã được xem xét và xử lý.'}
            {payload.resolution && (
              <span className="block mt-1 text-xs text-gray-500">
                Kết quả: {payload.resolution}
              </span>
            )}
          </p>
        );

      case 'REPORT_DISMISSED':
        return (
          <p className="text-sm text-gray-700">
            {payload.message || 'Báo cáo của bạn đã được xem xét nhưng không phát hiện vi phạm.'}
            {payload.reason && (
              <span className="block mt-1 text-xs text-gray-500">
                Lý do: {payload.reason}
              </span>
            )}
          </p>
        );

      case 'REPORT_ACTION_TAKEN':
        return (
          <p className="text-sm text-orange-700">
            <span className="font-medium">⚠️ Cảnh báo:</span>{' '}
            {payload.message || 'Nội dung của bạn đã bị báo cáo và admin đã xem xét.'}
          </p>
        );

      default:
        return (
          <p className="text-sm text-gray-700">
            {payload.message || 'Bạn có thông báo mới'}
          </p>
        );
    }
  };

  return (
    <div
      onClick={handleClick}
      className={`group relative p-4 border-b border-gray-200 hover:bg-gray-50 cursor-pointer transition ${
        !notification.is_read ? 'bg-blue-50' : 'bg-white'
      }`}
    >
      <div className="flex items-start gap-3">
        {/* Icon */}
        <div className="flex-shrink-0">
          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-xl">
            {getNotificationIcon(notification.notification_type)}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-1">
            <h4 className="text-sm font-semibold text-gray-900">
              {getNotificationTypeLabel(notification.notification_type)}
            </h4>
            {!notification.is_read && (
              <span className="flex-shrink-0 w-2 h-2 bg-blue-600 rounded-full"></span>
            )}
          </div>

          {/* Message from payload */}
          {renderPayload()}

          {/* Timestamp */}
          <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
            <Clock className="w-3 h-3" />
            <span>{formatNotificationTime(notification.created_at)}</span>
          </div>
        </div>

        {/* Delete button */}
        <button
          onClick={handleDelete}
          disabled={isDeleting}
          className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-red-100 rounded"
          title="Xóa thông báo"
        >
          {isDeleting ? (
            <X className="w-4 h-4 text-gray-400 animate-spin" />
          ) : (
            <Trash2 className="w-4 h-4 text-red-500" />
          )}
        </button>
      </div>
    </div>
  );
};

export default NotificationItem;
