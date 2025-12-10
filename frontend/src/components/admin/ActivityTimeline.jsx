import {
  AlertCircle,
  Book,
  CheckCircle,
  LogIn,
  Mail,
  MessageSquare,
  RefreshCw,
  Star,
  UserPlus,
  XCircle,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import {
  getAdminUserActivities,
  getAdminUserActivityStats,
} from '../../services/api/adminUsers';

const ActivityTimeline = ({ userId, userName }) => {
  const [activities, setActivities] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    page: 1,
    limit: 20,
    action: '',
  });

  useEffect(() => {
    if (userId) {
      loadData();
    }
  }, [userId, filters.page, filters.action]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [activitiesData, statsData] = await Promise.all([
        getAdminUserActivities(userId, {
          page: filters.page,
          limit: filters.limit,
          action: filters.action,
        }),
        getAdminUserActivityStats(userId, { days: 30 }),
      ]);

      // Handle different response formats
      if (activitiesData.items) {
        setActivities(activitiesData.items);
      } else if (Array.isArray(activitiesData)) {
        setActivities(activitiesData);
      } else {
        setActivities([]);
      }

      setStats(statsData);
    } catch (err) {
      console.error('Failed to load activities:', err);
      setError(err.message || 'Không thể tải lịch sử hoạt động');
      setActivities([]);
    } finally {
      setLoading(false);
    }
  };

  const getActionIcon = (action) => {
    const icons = {
      LOGIN: <LogIn className="h-4 w-4" />,
      LOGOUT: <LogIn className="h-4 w-4 rotate-180" />,
      CREATE_BOOK: <Book className="h-4 w-4" />,
      UPDATE_BOOK: <Book className="h-4 w-4" />,
      DELETE_BOOK: <XCircle className="h-4 w-4" />,
      CREATE_EXCHANGE_REQUEST: <RefreshCw className="h-4 w-4" />,
      ACCEPT_EXCHANGE: <CheckCircle className="h-4 w-4" />,
      REJECT_EXCHANGE: <XCircle className="h-4 w-4" />,
      CANCEL_EXCHANGE: <XCircle className="h-4 w-4" />,
      SEND_MESSAGE: <MessageSquare className="h-4 w-4" />,
      CREATE_REVIEW: <Star className="h-4 w-4" />,
      UPDATE_PROFILE: <UserPlus className="h-4 w-4" />,
      SEND_EMAIL: <Mail className="h-4 w-4" />,
    };
    return icons[action] || <AlertCircle className="h-4 w-4" />;
  };

  const getActionColor = (action) => {
    if (action?.includes('DELETE') || action?.includes('CANCEL')) {
      return 'bg-red-100 text-red-600 border-red-200';
    }
    if (action?.includes('CREATE') || action?.includes('ACCEPT')) {
      return 'bg-green-100 text-green-600 border-green-200';
    }
    if (action?.includes('UPDATE')) {
      return 'bg-blue-100 text-blue-600 border-blue-200';
    }
    if (action?.includes('LOGIN')) {
      return 'bg-purple-100 text-purple-600 border-purple-200';
    }
    return 'bg-gray-100 text-gray-600 border-gray-200';
  };

  const getActionLabel = (action) => {
    const labels = {
      LOGIN: 'Đăng nhập',
      LOGOUT: 'Đăng xuất',
      CREATE_BOOK: 'Tạo sách',
      UPDATE_BOOK: 'Cập nhật sách',
      DELETE_BOOK: 'Xóa sách',
      CREATE_EXCHANGE_REQUEST: 'Tạo yêu cầu trao đổi',
      ACCEPT_EXCHANGE: 'Chấp nhận trao đổi',
      REJECT_EXCHANGE: 'Từ chối trao đổi',
      CANCEL_EXCHANGE: 'Hủy trao đổi',
      SEND_MESSAGE: 'Gửi tin nhắn',
      CREATE_REVIEW: 'Tạo đánh giá',
      UPDATE_PROFILE: 'Cập nhật hồ sơ',
      SEND_EMAIL: 'Gửi email',
    };
    return labels[action] || action;
  };

  const formatMetadata = (metadata) => {
    if (!metadata) return null;
    
    try {
      const data = typeof metadata === 'string' ? JSON.parse(metadata) : metadata;
      
      // Format different types of metadata
      const formatted = [];
      
      if (data.method) formatted.push(`Phương thức: ${data.method}`);
      if (data.receiver) formatted.push(`Người nhận: ${data.receiver}`);
      if (data.book_id) formatted.push(`Sách: ${data.book_id}`);
      if (data.exchange_id) formatted.push(`Trao đổi: ${data.exchange_id}`);
      if (data.conversation_id) formatted.push(`Cuộc trò chuyện: ${data.conversation_id}`);
      if (data.rating) formatted.push(`Đánh giá: ${data.rating} ⭐`);
      
      // Show other fields
      Object.keys(data).forEach(key => {
        if (!['method', 'receiver', 'book_id', 'exchange_id', 'conversation_id', 'rating'].includes(key)) {
          formatted.push(`${key}: ${JSON.stringify(data[key])}`);
        }
      });
      
      return formatted.length > 0 ? formatted.join(' • ') : null;
    } catch (e) {
      return typeof metadata === 'string' ? metadata : JSON.stringify(metadata);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-500 border-t-transparent"></div>
        <p className="mt-2 text-gray-600">Đang tải lịch sử...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
        <p className="font-medium">Lỗi khi tải dữ liệu</p>
        <p className="text-sm mt-1">{error}</p>
        <button
          onClick={loadData}
          className="mt-3 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
        >
          Thử lại
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Activity Stats Summary */}
      {stats && stats.action_counts && stats.action_counts.length > 0 && (
        <div>
          <h4 className="font-semibold text-gray-900 mb-3">
            Thống kê 30 ngày gần đây
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {stats.action_counts.slice(0, 8).map((item, index) => (
              <div
                key={index}
                className="bg-gray-50 border border-gray-200 rounded-lg p-3"
              >
                <div className="flex items-center gap-2 mb-1">
                  <div
                    className={`p-1 rounded ${getActionColor(item.action)}`}
                  >
                    {getActionIcon(item.action)}
                  </div>
                  <span className="text-xs text-gray-600">
                    {getActionLabel(item.action)}
                  </span>
                </div>
                <p className="text-2xl font-bold text-gray-900">
                  {item.count}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filter */}
      <div className="flex items-center gap-3">
        <label className="text-sm font-medium text-gray-700">
          Lọc theo hành động:
        </label>
        <select
          value={filters.action}
          onChange={(e) =>
            setFilters({ ...filters, action: e.target.value, page: 1 })
          }
          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
        >
          <option value="">Tất cả</option>
          <option value="LOGIN">Đăng nhập</option>
          <option value="CREATE_BOOK">Tạo sách</option>
          <option value="CREATE_EXCHANGE_REQUEST">Tạo trao đổi</option>
          <option value="SEND_MESSAGE">Gửi tin nhắn</option>
          <option value="CREATE_REVIEW">Tạo đánh giá</option>
        </select>
      </div>

      {/* Timeline */}
      <div>
        <h4 className="font-semibold text-gray-900 mb-4">Lịch sử hoạt động</h4>

        {activities.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <AlertCircle className="h-12 w-12 mx-auto mb-3 text-gray-400" />
            <p>Không có hoạt động nào</p>
          </div>
        ) : (
          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gray-200"></div>

            {/* Timeline items */}
            <div className="space-y-4">
              {activities.map((activity, index) => (
                <div key={activity.log_id || index} className="relative pl-14">
                  {/* Icon */}
                  <div
                    className={`absolute left-0 w-12 h-12 rounded-full border-2 flex items-center justify-center ${getActionColor(activity.action)}`}
                  >
                    {getActionIcon(activity.action)}
                  </div>

                  {/* Content */}
                  <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium ${getActionColor(activity.action)}`}
                        >
                          {getActionLabel(activity.action)}
                        </span>
                      </div>
                      <span className="text-xs text-gray-500">
                        {new Date(activity.created_at).toLocaleString('vi-VN')}
                      </span>
                    </div>

                    {/* Metadata - formatted */}
                    {activity.metadata && (
                      <div className="text-sm text-gray-600">
                        {formatMetadata(activity.metadata)}
                      </div>
                    )}

                    {/* IP & User Agent */}
                    {activity.ip_address && (
                      <div className="mt-2 text-xs text-gray-500">
                        <span>IP: {activity.ip_address}</span>
                        {activity.user_agent && (
                          <span className="ml-3 truncate inline-block max-w-md">
                            UA: {activity.user_agent}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Pagination */}
        {activities.length >= filters.limit && (
          <div className="mt-6 flex justify-center gap-3">
            <button
              onClick={() =>
                setFilters({ ...filters, page: Math.max(1, filters.page - 1) })
              }
              disabled={filters.page === 1}
              className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              Trước
            </button>
            <span className="px-4 py-2 text-gray-700">
              Trang {filters.page}
            </span>
            <button
              onClick={() => setFilters({ ...filters, page: filters.page + 1 })}
              disabled={activities.length < filters.limit}
              className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              Sau
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ActivityTimeline;
