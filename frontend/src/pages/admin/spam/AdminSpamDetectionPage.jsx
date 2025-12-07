import {
  AlertTriangle,
  Eye,
  Filter,
  Lock,
  RefreshCw,
  Search,
  Shield,
  TrendingDown,
  User,
  XCircle,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { getSuspiciousActivities } from '../../../services/api/adminSpam';
import { lockAdminUser } from '../../../services/api/adminUsers';
import UserDetailModal from '../../../components/admin/UserDetailModal';

const AdminSpamDetectionPage = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    type: '',
    hours: 24,
    page: 1,
    limit: 20,
  });
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [lockModal, setLockModal] = useState({ open: false, user: null });

  useEffect(() => {
    loadSuspiciousActivities();
  }, [filters.type, filters.hours, filters.page]);

  const loadSuspiciousActivities = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await getSuspiciousActivities(filters);
      setData(result);
    } catch (err) {
      console.error('Failed to load suspicious activities:', err);
      setError(err.response?.data?.message || err.message || 'Lỗi khi tải dữ liệu');
    } finally {
      setLoading(false);
    }
  };

  const handleLockUser = async () => {
    if (!lockModal.reason?.trim()) {
      alert('Vui lòng nhập lý do khóa tài khoản');
      return;
    }

    try {
      await lockAdminUser(lockModal.user.user_id, {
        reason: lockModal.reason,
        duration: lockModal.duration || 7,
      });
      alert('Khóa tài khoản thành công!');
      setLockModal({ open: false, user: null, reason: '', duration: 7 });
      loadSuspiciousActivities();
    } catch (err) {
      alert('Lỗi khi khóa tài khoản: ' + err.message);
    }
  };

  const getSeverityBadge = (severity) => {
    const badges = {
      HIGH: 'bg-red-100 text-red-800 border-red-300',
      MEDIUM: 'bg-orange-100 text-orange-800 border-orange-300',
      LOW: 'bg-yellow-100 text-yellow-800 border-yellow-300',
    };
    return badges[severity] || 'bg-gray-100 text-gray-800 border-gray-300';
  };

  const getSeverityIcon = (severity) => {
    if (severity === 'HIGH') return <AlertTriangle className="h-4 w-4" />;
    if (severity === 'MEDIUM') return <Shield className="h-4 w-4" />;
    return <XCircle className="h-4 w-4" />;
  };

  const getTypeLabel = (type) => {
    const labels = {
      HIGH_BOOK_CREATION: '🔥 Spam tạo sách',
      HIGH_MESSAGE_VOLUME: '💬 Spam tin nhắn',
      NEW_ACCOUNT_HIGH_ACTIVITY: '🆕 Account mới - hoạt động cao',
      TRUST_SCORE_DROP: '📉 Trust score thấp',
      MULTIPLE_REPORTS: '🚨 Nhiều báo cáo',
    };
    return labels[type] || type;
  };

  const getTrustScoreColor = (score) => {
    if (score >= 60) return 'text-green-600';
    if (score >= 40) return 'text-yellow-600';
    if (score >= 20) return 'text-orange-600';
    return 'text-red-600';
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
              <AlertTriangle className="h-6 w-6 text-red-600" />
              Phát hiện Spam & Gian lận
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Hệ thống tự động phát hiện các hoạt động đáng ngờ
            </p>
          </div>
          <button
            onClick={loadSuspiciousActivities}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Làm mới
          </button>
        </div>

        {/* Summary Cards */}
        {data?.summary && (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="text-sm text-gray-600 mb-1">Tổng cộng</div>
              <div className="text-3xl font-bold text-red-600">
                {data.summary.total_suspicious_users}
              </div>
            </div>
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
              <div className="text-sm text-gray-600 mb-1">Mức độ cao</div>
              <div className="text-3xl font-bold text-orange-600">
                {data.summary.high_severity}
              </div>
            </div>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="text-sm text-gray-600 mb-1">Mức độ TB</div>
              <div className="text-3xl font-bold text-yellow-600">
                {data.summary.medium_severity}
              </div>
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="text-sm text-gray-600 mb-1">Spam sách</div>
              <div className="text-3xl font-bold text-blue-600">
                {data.summary.by_type.high_book_creation}
              </div>
            </div>
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <div className="text-sm text-gray-600 mb-1">Spam tin nhắn</div>
              <div className="text-3xl font-bold text-purple-600">
                {data.summary.by_type.high_message_volume}
              </div>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Filter className="inline h-4 w-4 mr-1" />
              Loại hoạt động
            </label>
            <select
              value={filters.type}
              onChange={(e) =>
                setFilters({ ...filters, type: e.target.value, page: 1 })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Tất cả</option>
              <option value="HIGH_BOOK_CREATION">Spam tạo sách</option>
              <option value="HIGH_MESSAGE_VOLUME">Spam tin nhắn</option>
              <option value="NEW_ACCOUNT_HIGH_ACTIVITY">
                Account mới - hoạt động cao
              </option>
              <option value="TRUST_SCORE_DROP">Trust score thấp</option>
              <option value="MULTIPLE_REPORTS">Nhiều báo cáo</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Thời gian gần đây
            </label>
            <select
              value={filters.hours}
              onChange={(e) =>
                setFilters({
                  ...filters,
                  hours: parseInt(e.target.value),
                  page: 1,
                })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value={1}>1 giờ</option>
              <option value={6}>6 giờ</option>
              <option value={24}>24 giờ</option>
              <option value={72}>3 ngày</option>
              <option value={168}>7 ngày</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Số lượng mỗi trang
            </label>
            <select
              value={filters.limit}
              onChange={(e) =>
                setFilters({
                  ...filters,
                  limit: parseInt(e.target.value),
                  page: 1,
                })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
          </div>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          <p className="font-medium">Lỗi</p>
          <p className="text-sm">{error}</p>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
          <p className="mt-4 text-gray-600">Đang phát hiện hoạt động đáng ngờ...</p>
        </div>
      )}

      {/* Table */}
      {!loading && data && (
        <>
          {data.items.length === 0 ? (
            <div className="text-center py-12">
              <Shield className="h-16 w-16 text-green-500 mx-auto mb-4" />
              <p className="text-xl font-medium text-gray-700">
                Không phát hiện hoạt động đáng ngờ nào! 🎉
              </p>
              <p className="text-gray-600 mt-2">
                Hệ thống đang hoạt động bình thường.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Mức độ
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Người dùng
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Loại vi phạm
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Trust Score
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Chi tiết
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                      Thao tác
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {data.items.map((item) => (
                    <tr
                      key={item.user_id}
                      className={
                        item.severity === 'HIGH'
                          ? 'bg-red-50'
                          : item.severity === 'MEDIUM'
                            ? 'bg-orange-50'
                            : ''
                      }
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold border ${getSeverityBadge(item.severity)}`}
                        >
                          {getSeverityIcon(item.severity)}
                          {item.severity}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">
                          {item.full_name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {item.email}
                        </div>
                        <div className="text-xs text-gray-400 mt-1">
                          {item.account_status}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm font-medium text-gray-900">
                          {getTypeLabel(item.suspicious_type)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`text-lg font-bold ${getTrustScoreColor(item.trust_score)}`}
                        >
                          {typeof item.trust_score === 'number' ? item.trust_score.toFixed(1) : parseFloat(item.trust_score || 0).toFixed(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-600 space-y-1">
                          {item.details.book_count && (
                            <div>📚 {item.details.book_count} sách</div>
                          )}
                          {item.details.message_count && (
                            <div>💬 {item.details.message_count} tin nhắn</div>
                          )}
                          {item.details.exchange_count && (
                            <div>🔄 {item.details.exchange_count} giao dịch</div>
                          )}
                          {item.details.account_age_days && (
                            <div>
                              🆕 {item.details.account_age_days} ngày tuổi
                            </div>
                          )}
                          {item.details.pending_report_count && (
                            <div>
                              🚨 {item.details.pending_report_count} báo cáo
                            </div>
                          )}
                          {item.details.time_span_hours && (
                            <div>
                              ⏱️ Trong {item.details.time_span_hours} giờ
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <div className="flex gap-2 justify-end">
                          <button
                            onClick={() => setSelectedUserId(item.user_id)}
                            className="text-blue-600 hover:text-blue-900"
                            title="Xem chi tiết"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          {item.account_status === 'ACTIVE' && (
                            <button
                              onClick={() =>
                                setLockModal({
                                  open: true,
                                  user: item,
                                  reason: `Hoạt động đáng ngờ: ${getTypeLabel(item.suspicious_type)}`,
                                  duration: 7,
                                })
                              }
                              className="text-red-600 hover:text-red-900"
                              title="Khóa tài khoản"
                            >
                              <Lock className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {data.items.length > 0 && (
            <div className="mt-4 flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Trang {data.page} / {data.totalPages} - Tổng {data.total} users
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() =>
                    setFilters({ ...filters, page: Math.max(1, filters.page - 1) })
                  }
                  disabled={filters.page === 1}
                  className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  Trước
                </button>
                <button
                  onClick={() =>
                    setFilters({ ...filters, page: filters.page + 1 })
                  }
                  disabled={filters.page >= data.totalPages}
                  className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  Sau
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Lock User Modal */}
      {lockModal.open && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-bold text-gray-900 mb-4">
              Khóa tài khoản
            </h3>

            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-2">
                User: <strong>{lockModal.user?.full_name}</strong>
              </p>
              <p className="text-sm text-gray-600">
                Email: <strong>{lockModal.user?.email}</strong>
              </p>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Số ngày khóa
              </label>
              <input
                type="number"
                value={lockModal.duration}
                onChange={(e) =>
                  setLockModal({
                    ...lockModal,
                    duration: parseInt(e.target.value),
                  })
                }
                min="1"
                max="365"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Lý do <span className="text-red-500">*</span>
              </label>
              <textarea
                value={lockModal.reason}
                onChange={(e) =>
                  setLockModal({ ...lockModal, reason: e.target.value })
                }
                placeholder="Nhập lý do khóa tài khoản..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                rows="3"
              />
            </div>

            <div className="flex gap-3 justify-end">
              <button
                onClick={() =>
                  setLockModal({ open: false, user: null, reason: '', duration: 7 })
                }
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Hủy
              </button>
              <button
                onClick={handleLockUser}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Khóa tài khoản
              </button>
            </div>
          </div>
        </div>
      )}

      {/* User Detail Modal */}
      {selectedUserId && (
        <UserDetailModal
          userId={selectedUserId}
          onClose={() => setSelectedUserId(null)}
          onRefresh={loadSuspiciousActivities}
        />
      )}
    </div>
  );
};

export default AdminSpamDetectionPage;
