// src/pages/notifications/index.jsx
import { AlertCircle, CheckCheck, Filter, TestTube } from 'lucide-react';
import { useEffect, useState } from 'react';
import Layout from '../../components/layout/Layout';
import NotificationItem from '../../components/notifications/NotificationItem';
import { Badge, Button, Card, LoadingSpinner, Tabs } from '../../components/ui';
import { useNotifications } from '../../hooks/useNotifications';

const NotificationsPage = () => {
  const {
    notifications,
    loading,
    error,
    pagination,
    getNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    createTestNotification,
    getNotificationIcon,
    getNotificationTypeLabel,
    formatNotificationTime,
    getNotificationRoute,
    unreadCount,
  } = useNotifications();

  const [currentPage, setCurrentPage] = useState(1);
  const [filter, setFilter] = useState('all'); // 'all', 'unread', 'read'
  const [typeFilter, setTypeFilter] = useState(''); // Lọc theo type

  useEffect(() => {
    loadNotifications();
  }, [currentPage, filter, typeFilter]);

  const loadNotifications = () => {
    const params = {
      page: currentPage,
      pageSize: 20,
    };

    if (filter === 'unread') {
      params.onlyUnread = true;
    }

    if (typeFilter) {
      params.type = typeFilter;
    }

    getNotifications(params);
  };

  const handleMarkAllAsRead = async () => {
    if (!window.confirm('Đánh dấu tất cả thông báo là đã đọc?')) return;
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

  const handleCreateTestNotification = async () => {
    const testTypes = [
      {
        type: 'EXCHANGE_REQUEST',
        payload: {
          exchange_id: 'test-exchange-123',
          requester_name: 'Nguyễn Văn A',
          book_title: 'Clean Code',
        },
      },
      {
        type: 'EXCHANGE_ACCEPTED',
        payload: {
          exchange_id: 'test-exchange-456',
          accepter_name: 'Trần Thị B',
        },
      },
      {
        type: 'MESSAGE_RECEIVED',
        payload: {
          conversation_id: 'test-conv-789',
          sender_name: 'Lê Văn C',
          message_preview: 'Xin chào, sách còn không?',
        },
      },
      {
        type: 'REVIEW_RECEIVED',
        payload: {
          reviewer_name: 'Phạm Thị D',
          rating: 5,
          exchange_id: 'test-exchange-999',
        },
      },
      {
        type: 'BOOK_MATCHED',
        payload: {
          book_title: 'Design Patterns',
          match_count: 3,
        },
      },
    ];

    const randomTest = testTypes[Math.floor(Math.random() * testTypes.length)];

    try {
      await createTestNotification(randomTest);
      alert(`✅ Tạo thông báo test thành công!\nType: ${randomTest.type}`);
      loadNotifications();
    } catch (err) {
      console.error('Failed to create test notification:', err);
      alert(`❌ Lỗi: ${err.message || 'Không thể tạo thông báo test'}`);
    }
  };

  const tabs = [
    { id: 'all', name: 'Tất cả' },
    { id: 'unread', name: `Chưa đọc (${unreadCount})` },
    { id: 'read', name: 'Đã đọc' },
  ];

  const notificationTypes = [
    { value: '', label: 'Tất cả loại' },
    { value: 'EXCHANGE_REQUEST', label: 'Yêu cầu trao đổi' },
    { value: 'EXCHANGE_ACCEPTED', label: 'Trao đổi được chấp nhận' },
    { value: 'MESSAGE_RECEIVED', label: 'Tin nhắn mới' },
    { value: 'REVIEW_RECEIVED', label: 'Đánh giá mới' },
    { value: 'BOOK_MATCHED', label: 'Sách phù hợp' },
  ];

  const totalPages = Math.ceil(pagination.total / pagination.pageSize);

  return (
    <Layout>
      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Thông báo
              </h1>
              <p className="text-gray-600">
                Theo dõi các hoạt động và cập nhật mới nhất
              </p>
            </div>
            <Badge variant="info" className="text-lg px-4 py-2">
              {unreadCount} chưa đọc
            </Badge>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3 mb-4">
            {/* Test Notification Button (Development) */}
            <Button
              variant="outline"
              size="sm"
              onClick={handleCreateTestNotification}
              className="flex items-center gap-2 border-dashed border-2 border-purple-300 text-purple-700 hover:bg-purple-50"
            >
              <TestTube className="w-4 h-4" />
              Test Notification
            </Button>

            {unreadCount > 0 && (
              <Button
                variant="primary"
                size="sm"
                onClick={handleMarkAllAsRead}
                className="flex items-center gap-2"
              >
                <CheckCheck className="w-4 h-4" />
                Đánh dấu tất cả đã đọc
              </Button>
            )}

            {/* Type Filter Dropdown */}
            <div className="relative">
              <select
                value={typeFilter}
                onChange={(e) => {
                  setTypeFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none pr-8 bg-white"
              >
                {notificationTypes.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
              <Filter className="w-4 h-4 text-gray-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          {/* Tabs */}
          <Tabs
            tabs={tabs}
            activeTab={filter}
            onTabChange={(newFilter) => {
              setFilter(newFilter);
              setCurrentPage(1);
            }}
          />
        </div>

        {/* Content */}
        {loading && notifications.length === 0 ? (
          <div className="flex justify-center py-16">
            <LoadingSpinner size="lg" />
          </div>
        ) : error ? (
          <Card className="p-12 text-center">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Không thể tải thông báo
            </h3>
            <p className="text-gray-600 mb-6">{error}</p>
            <Button variant="primary" onClick={loadNotifications}>
              Thử lại
            </Button>
          </Card>
        ) : notifications.length === 0 ? (
          <Card className="p-12 text-center">
            <div className="text-6xl mb-4">🔔</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {filter === 'unread'
                ? 'Không có thông báo chưa đọc'
                : 'Chưa có thông báo nào'}
            </h3>
            <p className="text-gray-600">
              {filter === 'unread'
                ? 'Tất cả thông báo của bạn đã được đọc'
                : 'Bạn chưa có thông báo nào'}
            </p>
          </Card>
        ) : (
          <>
            {/* Notifications List */}
            <Card className="divide-y divide-gray-200">
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
            </Card>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center gap-2 mt-6">
                <Button
                  variant="outline"
                  disabled={currentPage === 1 || loading}
                  onClick={() => setCurrentPage((p) => p - 1)}
                >
                  Trước
                </Button>
                <span className="py-2 px-4 text-gray-700">
                  Trang {currentPage} / {totalPages}
                </span>
                <Button
                  variant="outline"
                  disabled={currentPage >= totalPages || loading}
                  onClick={() => setCurrentPage((p) => p + 1)}
                >
                  Sau
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </Layout>
  );
};

export default NotificationsPage;
