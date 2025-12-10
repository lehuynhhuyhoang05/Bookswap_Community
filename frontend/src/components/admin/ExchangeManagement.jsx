import {
  AlertCircle,
  CheckCircle,
  Clock,
  Eye,
  TrendingUp,
  XCircle,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { useAdminExchanges } from '../../hooks/useAdmin';

const ExchangeManagement = () => {
  const {
    exchanges,
    currentExchange,
    statistics,
    loading,
    error,
    fetchExchanges,
    fetchExchange,
    cancelExchange,
    fetchStatistics,
  } = useAdminExchanges();

  const [filters, setFilters] = useState({
    page: 1,
    limit: 20,
    status: '',
    memberAId: '',
    memberBId: '',
    startDate: '',
    endDate: '',
    sortBy: 'created_at',
    sortOrder: 'DESC',
  });

  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedExchange, setSelectedExchange] = useState(null);
  const [cancelReason, setCancelReason] = useState('');
  const [showStats, setShowStats] = useState(true);

  useEffect(() => {
    loadExchanges();
    loadStatistics();
  }, [
    filters.page,
    filters.limit,
    filters.status,
    filters.sortBy,
    filters.sortOrder,
  ]);

  const loadExchanges = async () => {
    try {
      const result = await fetchExchanges(filters);
      console.log('[ExchangeManagement] Loaded exchanges:', result);
    } catch (err) {
      console.error('Failed to load exchanges:', err);
    }
  };

  const loadStatistics = async () => {
    try {
      await fetchStatistics();
    } catch (err) {
      console.error('Failed to load statistics:', err);
    }
  };

  const handleCancelExchange = async () => {
    if (!cancelReason.trim()) {
      alert('Vui lòng nhập lý do hủy giao dịch');
      return;
    }

    try {
      console.log(
        '[ExchangeManagement] Cancelling exchange:',
        selectedExchange.exchange_id,
        'Reason:',
        cancelReason,
      );
      await cancelExchange(selectedExchange.exchange_id, cancelReason);
      console.log(
        '[ExchangeManagement] Cancel successful, reloading exchanges...',
      );
      setShowCancelModal(false);
      setCancelReason('');
      setSelectedExchange(null);
      await loadExchanges();
      await loadStatistics();
      alert('Hủy giao dịch thành công!');
    } catch (err) {
      console.error('[ExchangeManagement] Cancel failed:', err);
      alert('Lỗi khi hủy giao dịch: ' + err.message);
    }
  };

  const handleViewDetail = async (exchange) => {
    try {
      setSelectedExchange(exchange);
      await fetchExchange(exchange.exchange_id);
      setShowDetailModal(true);
    } catch (err) {
      alert('Lỗi khi tải chi tiết: ' + err.message);
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      PENDING: {
        bg: 'bg-yellow-100',
        text: 'text-yellow-800',
        label: 'Chờ xác nhận',
      },
      ACCEPTED: {
        bg: 'bg-blue-100',
        text: 'text-blue-800',
        label: 'Đã chấp nhận',
      },
      MEETING_SCHEDULED: {
        bg: 'bg-purple-100',
        text: 'text-purple-800',
        label: 'Đã hẹn gặp',
      },
      IN_PROGRESS: {
        bg: 'bg-indigo-100',
        text: 'text-indigo-800',
        label: 'Đang tiến hành',
      },
      COMPLETED: {
        bg: 'bg-green-100',
        text: 'text-green-800',
        label: 'Hoàn thành',
      },
      CANCELLED: { bg: 'bg-red-100', text: 'text-red-800', label: 'Đã hủy' },
    };

    const config = statusConfig[status] || statusConfig.PENDING;
    return (
      <span
        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${config.bg} ${config.text}`}
      >
        {config.label}
      </span>
    );
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">
          Quản lý giao dịch
        </h2>

        {/* Statistics Overview */}
        {showStats && statistics && statistics.overview && (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm opacity-90">Tổng giao dịch</p>
                  <p className="text-2xl font-bold">
                    {statistics.overview.total || 0}
                  </p>
                </div>
                <TrendingUp className="h-8 w-8 opacity-75" />
              </div>
            </div>

            <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm opacity-90">Hoàn thành</p>
                  <p className="text-2xl font-bold">
                    {statistics.overview.completed || 0}
                  </p>
                </div>
                <CheckCircle className="h-8 w-8 opacity-75" />
              </div>
            </div>

            <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm opacity-90">Đang xử lý</p>
                  <p className="text-2xl font-bold">
                    {statistics.overview.processing || 0}
                  </p>
                  <p className="text-xs opacity-75">
                    (Chờ: {statistics.overview.pending || 0}, Chấp nhận: {statistics.overview.accepted || 0})
                  </p>
                </div>
                <Clock className="h-8 w-8 opacity-75" />
              </div>
            </div>

            <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm opacity-90">Tỷ lệ thành công</p>
                  <p className="text-2xl font-bold">
                    {statistics.overview.success_rate?.toFixed(1) || 0}%
                  </p>
                </div>
                <TrendingUp className="h-8 w-8 opacity-75" />
              </div>
            </div>

            <div className="bg-gradient-to-r from-red-500 to-red-600 text-white p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm opacity-90">Đã hủy</p>
                  <p className="text-2xl font-bold">
                    {statistics.overview.cancelled || 0}
                  </p>
                </div>
                <XCircle className="h-8 w-8 opacity-75" />
              </div>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
          <select
            value={filters.status}
            onChange={(e) =>
              setFilters({ ...filters, status: e.target.value, page: 1 })
            }
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Tất cả trạng thái</option>
            <option value="PENDING">Chờ xác nhận</option>
            <option value="ACCEPTED">Đã chấp nhận</option>
            <option value="MEETING_SCHEDULED">Đã hẹn gặp</option>
            <option value="IN_PROGRESS">Đang tiến hành</option>
            <option value="COMPLETED">Hoàn thành</option>
            <option value="CANCELLED">Đã hủy</option>
          </select>

          <div className="flex gap-2">
            <input
              type="date"
              value={filters.startDate}
              onChange={(e) =>
                setFilters({ ...filters, startDate: e.target.value })
              }
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="Từ ngày"
            />
            <input
              type="date"
              value={filters.endDate}
              onChange={(e) =>
                setFilters({ ...filters, endDate: e.target.value })
              }
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="Đến ngày"
            />
            <button
              onClick={loadExchanges}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Lọc
            </button>
          </div>

          <div className="flex gap-2">
            <select
              value={filters.sortBy}
              onChange={(e) =>
                setFilters({ ...filters, sortBy: e.target.value })
              }
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="created_at">Ngày tạo</option>
              <option value="completed_at">Ngày hoàn thành</option>
              <option value="status">Trạng thái</option>
            </select>
            <select
              value={filters.sortOrder}
              onChange={(e) =>
                setFilters({ ...filters, sortOrder: e.target.value })
              }
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="ASC">Tăng dần</option>
              <option value="DESC">Giảm dần</option>
            </select>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center text-red-700">
          <AlertCircle className="h-5 w-5 mr-2" />
          <span>{error}</span>
        </div>
      )}

      {/* Exchanges Table */}
      {loading ? (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-500 border-t-transparent"></div>
          <p className="mt-2 text-gray-600">Đang tải...</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Member A
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Member B
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Trạng thái
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ngày tạo
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {!Array.isArray(exchanges) || exchanges.length === 0 ? (
                <tr>
                  <td
                    colSpan="6"
                    className="px-6 py-4 text-center text-gray-500"
                  >
                    Không tìm thấy giao dịch nào
                  </td>
                </tr>
              ) : (
                exchanges.map((exchange) => (
                  <tr key={exchange.exchange_id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-mono text-gray-900">
                        {exchange.exchange_id.substring(0, 8)}...
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {exchange.memberA_name ||
                          exchange.member_a?.user?.full_name ||
                          exchange.member_a?.user?.email ||
                          'N/A'}
                      </div>
                      <div className="text-xs text-gray-500">
                        {exchange.memberA_email ||
                          exchange.member_a?.user?.email ||
                          ''}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {exchange.memberB_name ||
                          exchange.member_b?.user?.full_name ||
                          exchange.member_b?.user?.email ||
                          'N/A'}
                      </div>
                      <div className="text-xs text-gray-500">
                        {exchange.memberB_email ||
                          exchange.member_b?.user?.email ||
                          ''}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(exchange.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(exchange.created_at).toLocaleDateString(
                        'vi-VN',
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex gap-2 justify-end">
                        <button
                          onClick={() => handleViewDetail(exchange)}
                          className="text-blue-600 hover:text-blue-900 inline-flex items-center"
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          Xem
                        </button>
                        {exchange.status !== 'CANCELLED' &&
                          exchange.status !== 'COMPLETED' && (
                            <button
                              onClick={() => {
                                setSelectedExchange(exchange);
                                setShowCancelModal(true);
                              }}
                              className="text-red-600 hover:text-red-900 inline-flex items-center"
                            >
                              <XCircle className="h-4 w-4 mr-1" />
                              Hủy
                            </button>
                          )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      <div className="mt-4 flex items-center justify-between">
        <div className="text-sm text-gray-700">
          Hiển thị trang {filters.page} - {filters.limit} giao dịch mỗi trang
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
            onClick={() => setFilters({ ...filters, page: filters.page + 1 })}
            disabled={exchanges.length < filters.limit}
            className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
          >
            Sau
          </button>
        </div>
      </div>

      {/* Cancel Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-bold text-gray-900 mb-4">
              Hủy giao dịch
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Bạn có chắc muốn hủy giao dịch này không?
            </p>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Lý do hủy <span className="text-red-500">*</span>
              </label>
              <textarea
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder="Nhập lý do hủy giao dịch (ví dụ: Exchange bị report vi phạm)"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows="3"
              />
            </div>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => {
                  setShowCancelModal(false);
                  setCancelReason('');
                  setSelectedExchange(null);
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Đóng
              </button>
              <button
                onClick={handleCancelExchange}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Hủy giao dịch
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {showDetailModal && currentExchange && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-3xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-bold text-gray-900 mb-4">
              Chi tiết giao dịch
            </h3>

            <div className="space-y-4">
              {/* Basic Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Exchange ID</p>
                  <p className="font-medium font-mono text-sm">{currentExchange.exchange_id}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Trạng thái</p>
                  <div className="mt-1">
                    {getStatusBadge(currentExchange.status)}
                  </div>
                </div>
              </div>

              {/* Members Info */}
              <div className="border-t pt-4">
                <h4 className="font-medium text-gray-900 mb-2">
                  👥 Thông tin người tham gia
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-blue-50 p-3 rounded border border-blue-100">
                    <p className="text-sm text-blue-600 font-medium">Member A (Người yêu cầu)</p>
                    <p className="font-medium mt-1">
                      {currentExchange.member_a?.user?.full_name || 'N/A'}
                    </p>
                    <p className="text-sm text-gray-500">
                      {currentExchange.member_a?.user?.email}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      Trust Score: {currentExchange.member_a?.trust_score || 'N/A'}
                    </p>
                  </div>
                  <div className="bg-green-50 p-3 rounded border border-green-100">
                    <p className="text-sm text-green-600 font-medium">Member B (Người nhận)</p>
                    <p className="font-medium mt-1">
                      {currentExchange.member_b?.user?.full_name || 'N/A'}
                    </p>
                    <p className="text-sm text-gray-500">
                      {currentExchange.member_b?.user?.email}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      Trust Score: {currentExchange.member_b?.trust_score || 'N/A'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Books Info */}
              {currentExchange.exchange_books && currentExchange.exchange_books.length > 0 && (
                <div className="border-t pt-4">
                  <h4 className="font-medium text-gray-900 mb-2">
                    📚 Sách trao đổi ({currentExchange.exchange_books.length} cuốn)
                  </h4>
                  <div className="space-y-2">
                    {currentExchange.exchange_books.map((eb, index) => (
                      <div key={index} className="bg-gray-50 p-3 rounded flex items-center gap-3">
                        {eb.book?.cover_image && (
                          <img
                            src={eb.book.cover_image}
                            alt={eb.book?.title}
                            className="w-12 h-16 object-cover rounded"
                          />
                        )}
                        <div className="flex-1">
                          <p className="font-medium">{eb.book?.title || 'Không xác định'}</p>
                          <p className="text-sm text-gray-500">
                            {eb.book?.author} • {eb.book?.category}
                          </p>
                          <p className="text-xs text-gray-400">
                            Từ: {eb.from_member_id === currentExchange.member_a_id ? 'Member A' : 'Member B'}
                          </p>
                        </div>
                        <span className={`px-2 py-1 text-xs rounded ${
                          eb.book?.status === 'AVAILABLE' ? 'bg-green-100 text-green-700' :
                          eb.book?.status === 'EXCHANGING' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                          {eb.book?.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Meeting Info */}
              {(currentExchange.meeting_location || currentExchange.meeting_time) && (
                <div className="border-t pt-4">
                  <h4 className="font-medium text-gray-900 mb-2">
                    📍 Thông tin hẹn gặp
                  </h4>
                  <div className="bg-purple-50 p-3 rounded border border-purple-100">
                    {currentExchange.meeting_location && (
                      <div className="mb-2">
                        <p className="text-sm text-gray-600">Địa điểm:</p>
                        <p className="font-medium">{currentExchange.meeting_location}</p>
                      </div>
                    )}
                    {currentExchange.meeting_time && (
                      <div className="mb-2">
                        <p className="text-sm text-gray-600">Thời gian:</p>
                        <p className="font-medium">
                          {new Date(currentExchange.meeting_time).toLocaleString('vi-VN')}
                        </p>
                      </div>
                    )}
                    {currentExchange.meeting_notes && (
                      <div>
                        <p className="text-sm text-gray-600">Ghi chú:</p>
                        <p className="text-sm">{currentExchange.meeting_notes}</p>
                      </div>
                    )}
                    <div className="mt-2 flex gap-4 text-xs">
                      <span className={currentExchange.meeting_confirmed_by_a ? 'text-green-600' : 'text-gray-400'}>
                        {currentExchange.meeting_confirmed_by_a ? '✓' : '○'} Member A xác nhận
                      </span>
                      <span className={currentExchange.meeting_confirmed_by_b ? 'text-green-600' : 'text-gray-400'}>
                        {currentExchange.meeting_confirmed_by_b ? '✓' : '○'} Member B xác nhận
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Timeline */}
              <div className="border-t pt-4">
                <h4 className="font-medium text-gray-900 mb-2">
                  🕐 Timeline
                </h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600">Ngày tạo</p>
                    <p>{new Date(currentExchange.created_at).toLocaleString('vi-VN')}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Cập nhật cuối</p>
                    <p>{new Date(currentExchange.updated_at).toLocaleString('vi-VN')}</p>
                  </div>
                  {currentExchange.confirmed_by_a_at && (
                    <div>
                      <p className="text-gray-600">Member A xác nhận</p>
                      <p>{new Date(currentExchange.confirmed_by_a_at).toLocaleString('vi-VN')}</p>
                    </div>
                  )}
                  {currentExchange.confirmed_by_b_at && (
                    <div>
                      <p className="text-gray-600">Member B xác nhận</p>
                      <p>{new Date(currentExchange.confirmed_by_b_at).toLocaleString('vi-VN')}</p>
                    </div>
                  )}
                  {currentExchange.completed_at && (
                    <div className="col-span-2">
                      <p className="text-gray-600">Hoàn thành</p>
                      <p className="text-green-600 font-medium">
                        {new Date(currentExchange.completed_at).toLocaleString('vi-VN')}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Confirmation Status */}
              <div className="border-t pt-4">
                <h4 className="font-medium text-gray-900 mb-2">
                  ✅ Trạng thái xác nhận
                </h4>
                <div className="flex gap-4">
                  <div className={`flex-1 p-3 rounded ${currentExchange.member_a_confirmed ? 'bg-green-50 border border-green-200' : 'bg-gray-50 border border-gray-200'}`}>
                    <p className="text-sm font-medium">Member A</p>
                    <p className={currentExchange.member_a_confirmed ? 'text-green-600' : 'text-gray-400'}>
                      {currentExchange.member_a_confirmed ? '✓ Đã xác nhận' : '○ Chưa xác nhận'}
                    </p>
                  </div>
                  <div className={`flex-1 p-3 rounded ${currentExchange.member_b_confirmed ? 'bg-green-50 border border-green-200' : 'bg-gray-50 border border-gray-200'}`}>
                    <p className="text-sm font-medium">Member B</p>
                    <p className={currentExchange.member_b_confirmed ? 'text-green-600' : 'text-gray-400'}>
                      {currentExchange.member_b_confirmed ? '✓ Đã xác nhận' : '○ Chưa xác nhận'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-between">
              {currentExchange.status !== 'CANCELLED' && currentExchange.status !== 'COMPLETED' && (
                <button
                  onClick={() => {
                    setShowDetailModal(false);
                    setSelectedExchange(currentExchange);
                    setShowCancelModal(true);
                  }}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                >
                  Hủy giao dịch
                </button>
              )}
              <button
                onClick={() => setShowDetailModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 ml-auto"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExchangeManagement;
