import { AlertCircle, CheckCircle, Eye, Search, XCircle } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useAdminReports } from '../../hooks/useAdmin';

const ReportsManagement = () => {
  const {
    reports,
    currentReport,
    loading,
    error,
    fetchReports,
    fetchReport,
    dismissReport,
    resolveReport,
  } = useAdminReports();

  const [filters, setFilters] = useState({
    page: 1,
    limit: 20,
    status: '',
    priority: '',
    type: '',
    reportedBy: '',
  });

  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showDismissModal, setShowDismissModal] = useState(false);
  const [showResolveModal, setShowResolveModal] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);
  const [dismissReason, setDismissReason] = useState('');
  const [resolution, setResolution] = useState('');
  const [penalty, setPenalty] = useState('WARNING');
  const [trustScorePenalty, setTrustScorePenalty] = useState(5);

  useEffect(() => {
    loadReports();
  }, [
    filters.page,
    filters.limit,
    filters.status,
    filters.priority,
    filters.type,
  ]);

  const loadReports = async () => {
    try {
      await fetchReports(filters);
    } catch (err) {
      console.error('Failed to load reports:', err);
    }
  };

  const handleViewDetail = async (report) => {
    try {
      await fetchReport(report.report_id);
      setSelectedReport(report);
      setShowDetailModal(true);
    } catch (err) {
      console.error('Failed to load report detail:', err);
    }
  };

  const handleDismiss = async () => {
    if (!dismissReason.trim()) {
      alert('Vui lòng nhập lý do bác bỏ');
      return;
    }

    try {
      console.log(
        '[ReportsManagement] Dismissing report:',
        selectedReport.report_id,
        'Reason:',
        dismissReason,
      );
      // API expects { reason } object format
      await dismissReport(selectedReport.report_id, { reason: dismissReason });
      console.log(
        '[ReportsManagement] Dismiss successful, reloading reports...',
      );
      setShowDismissModal(false);
      setDismissReason('');
      setSelectedReport(null);
      await loadReports();
      alert('Đã bác bỏ báo cáo thành công');
    } catch (err) {
      console.error('[ReportsManagement] Dismiss failed:', err);
      alert('Lỗi khi bác bỏ báo cáo: ' + err.message);
    }
  };

  const handleResolve = async () => {
    if (!resolution.trim()) {
      alert('Vui lòng nhập hành động đã thực hiện');
      return;
    }

    try {
      console.log(
        '[ReportsManagement] Resolving report:',
        selectedReport.report_id,
        'Resolution:',
        resolution,
        'Penalty:',
        penalty,
        'Trust Score Penalty:',
        trustScorePenalty,
      );
      // Gửi đầy đủ thông tin xử phạt
      await resolveReport(selectedReport.report_id, {
        resolution,
        penalty,
        trust_score_penalty: trustScorePenalty,
      });
      console.log(
        '[ReportsManagement] Resolve successful, reloading reports...',
      );
      setShowResolveModal(false);
      setResolution('');
      setPenalty('WARNING');
      setTrustScorePenalty(5);
      setSelectedReport(null);
      await loadReports();
      alert('Đã xử lý báo cáo thành công');
    } catch (err) {
      console.error('[ReportsManagement] Resolve failed:', err);
      alert('Lỗi khi xử lý báo cáo: ' + err.message);
    }
  };

  const getPriorityBadge = (priority) => {
    const config = {
      CRITICAL: {
        bg: 'bg-red-100',
        text: 'text-red-800',
        label: 'Nghiêm trọng',
      },
      HIGH: { bg: 'bg-orange-100', text: 'text-orange-800', label: 'Cao' },
      MEDIUM: {
        bg: 'bg-yellow-100',
        text: 'text-yellow-800',
        label: 'Trung bình',
      },
      LOW: { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Thấp' },
    };
    const c = config[priority] || config.MEDIUM;
    return (
      <span
        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${c.bg} ${c.text}`}
      >
        {c.label}
      </span>
    );
  };

  const getStatusBadge = (status) => {
    const config = {
      PENDING: {
        bg: 'bg-yellow-100',
        text: 'text-yellow-800',
        label: 'Chờ xử lý',
      },
      IN_REVIEW: {
        bg: 'bg-blue-100',
        text: 'text-blue-800',
        label: 'Đang xem xét',
      },
      RESOLVED: {
        bg: 'bg-green-100',
        text: 'text-green-800',
        label: 'Đã xử lý',
      },
      DISMISSED: {
        bg: 'bg-gray-100',
        text: 'text-gray-800',
        label: 'Đã bác bỏ',
      },
    };
    const c = config[status] || config.PENDING;
    return (
      <span
        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${c.bg} ${c.text}`}
      >
        {c.label}
      </span>
    );
  };

  const getReportTypeLabel = (type) => {
    const labels = {
      SPAM: 'Spam',
      INAPPROPRIATE_CONTENT: 'Nội dung không phù hợp',
      FRAUD: 'Lừa đảo',
      HARASSMENT: 'Quấy rối',
      FAKE_PROFILE: 'Hồ sơ giả mạo',
      OTHER: 'Khác',
    };
    return labels[type] || type;
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">
          Quản lý báo cáo vi phạm
        </h2>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              value={filters.reportedBy}
              onChange={(e) =>
                setFilters({ ...filters, reportedBy: e.target.value, page: 1 })
              }
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="Tìm theo người báo cáo..."
            />
          </div>

          <select
            value={filters.status}
            onChange={(e) =>
              setFilters({ ...filters, status: e.target.value, page: 1 })
            }
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Tất cả trạng thái</option>
            <option value="PENDING">Chờ xử lý</option>
            <option value="IN_REVIEW">Đang xem xét</option>
            <option value="RESOLVED">Đã xử lý</option>
            <option value="DISMISSED">Đã bác bỏ</option>
          </select>

          <select
            value={filters.priority}
            onChange={(e) =>
              setFilters({ ...filters, priority: e.target.value, page: 1 })
            }
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Tất cả mức độ</option>
            <option value="CRITICAL">Nghiêm trọng</option>
            <option value="HIGH">Cao</option>
            <option value="MEDIUM">Trung bình</option>
            <option value="LOW">Thấp</option>
          </select>

          <select
            value={filters.type}
            onChange={(e) =>
              setFilters({ ...filters, type: e.target.value, page: 1 })
            }
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Tất cả loại</option>
            <option value="SPAM">Spam</option>
            <option value="INAPPROPRIATE_CONTENT">
              Nội dung không phù hợp
            </option>
            <option value="FRAUD">Lừa đảo</option>
            <option value="HARASSMENT">Quấy rối</option>
            <option value="FAKE_PROFILE">Hồ sơ giả mạo</option>
            <option value="OTHER">Khác</option>
          </select>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center text-red-700">
          <AlertCircle className="h-5 w-5 mr-2" />
          <span>{error}</span>
        </div>
      )}

      {/* Reports Table */}
      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-500 border-t-transparent"></div>
          <p className="mt-2 text-gray-600">Đang tải...</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Loại vi phạm
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Người báo cáo
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Đối tượng
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Mức độ
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Trạng thái
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ngày tạo
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {!Array.isArray(reports) || reports.length === 0 ? (
                <tr>
                  <td
                    colSpan="7"
                    className="px-6 py-4 text-center text-gray-500"
                  >
                    Không tìm thấy báo cáo nào
                  </td>
                </tr>
              ) : (
                reports.map((report) => (
                  <tr key={report.report_id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {getReportTypeLabel(report.report_type) || 'N/A'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {report.reporter?.user?.full_name ||
                          report.reporter?.user?.email ||
                          'Không rõ'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 font-medium">
                        {report.reportedMember?.user?.full_name ||
                          report.reportedMember?.user?.email ||
                          `Member ${report.reported_member_id?.substring(0, 8)}`}
                      </div>
                      <div className="text-xs text-gray-500">
                        {report.reported_item_type || 'MEMBER'} •{' '}
                        {(
                          report.reported_item_id || report.reported_member_id
                        )?.substring(0, 8)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getPriorityBadge(report.priority)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(report.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(report.created_at).toLocaleDateString('vi-VN')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleViewDetail(report)}
                          className="text-blue-600 hover:text-blue-900"
                          title="Xem chi tiết"
                        >
                          <Eye className="h-5 w-5" />
                        </button>
                        {report.status === 'PENDING' && (
                          <>
                            <button
                              onClick={() => {
                                setSelectedReport(report);
                                setShowResolveModal(true);
                              }}
                              className="text-green-600 hover:text-green-900"
                              title="Xử lý"
                            >
                              <CheckCircle className="h-5 w-5" />
                            </button>
                            <button
                              onClick={() => {
                                setSelectedReport(report);
                                setShowDismissModal(true);
                              }}
                              className="text-red-600 hover:text-red-900"
                              title="Bác bỏ"
                            >
                              <XCircle className="h-5 w-5" />
                            </button>
                          </>
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
          Hiển thị trang {filters.page}
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setFilters({ ...filters, page: filters.page - 1 })}
            disabled={filters.page === 1}
            className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
          >
            Trước
          </button>
          <button
            onClick={() => setFilters({ ...filters, page: filters.page + 1 })}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Sau
          </button>
        </div>
      </div>

      {/* Detail Modal */}
      {showDetailModal && currentReport && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold mb-4">Chi tiết báo cáo</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Loại vi phạm
                </label>
                <p className="text-gray-900">
                  {getReportTypeLabel(currentReport.report_type)}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Người báo cáo
                </label>
                <p className="text-gray-900">
                  {currentReport.reporter?.user?.full_name ||
                    currentReport.reporter?.user?.email ||
                    'N/A'}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Đối tượng bị báo cáo
                </label>
                <p className="text-gray-900 font-medium">
                  {currentReport.reportedMember?.user?.full_name ||
                    currentReport.reportedMember?.user?.email ||
                    'Không rõ'}
                </p>
                <p className="text-sm text-gray-500">
                  {currentReport.reported_item_type || 'MEMBER'} •{' '}
                  {currentReport.reported_item_id ||
                    currentReport.reported_member_id}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Mô tả
                </label>
                <p className="text-gray-900">{currentReport.description}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Mức độ
                  </label>
                  {getPriorityBadge(currentReport.priority)}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Trạng thái
                  </label>
                  {getStatusBadge(currentReport.status)}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Ngày tạo
                </label>
                <p className="text-gray-900">
                  {new Date(currentReport.created_at).toLocaleString('vi-VN')}
                </p>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-2">
              <button
                onClick={() => setShowDetailModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Dismiss Modal */}
      {showDismissModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-xl font-bold mb-4 flex items-center text-red-600">
              <XCircle className="h-6 w-6 mr-2" />
              Bác bỏ báo cáo
            </h3>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Lý do bác bỏ *
              </label>
              <textarea
                value={dismissReason}
                onChange={(e) => setDismissReason(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                rows="4"
                placeholder="Nhập lý do bác bỏ báo cáo này..."
              />
            </div>

            <div className="flex justify-end gap-2">
              <button
                onClick={() => {
                  setShowDismissModal(false);
                  setDismissReason('');
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Hủy
              </button>
              <button
                onClick={handleDismiss}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Xác nhận bác bỏ
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Resolve Modal */}
      {showResolveModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold mb-4 flex items-center text-green-600">
              <CheckCircle className="h-6 w-6 mr-2" />
              Xử lý báo cáo vi phạm
            </h3>

            {/* Penalty Selection */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Hình thức xử phạt *
              </label>
              <select
                value={penalty}
                onChange={(e) => setPenalty(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="NONE">Không xử phạt (chỉ ghi nhận)</option>
                <option value="WARNING">⚠️ Cảnh cáo</option>
                <option value="CONTENT_REMOVAL">🗑️ Xóa nội dung vi phạm</option>
                <option value="TEMP_BAN">🔒 Khóa tài khoản 7 ngày</option>
                <option value="PERMANENT_BAN">🚫 Khóa vĩnh viễn</option>
              </select>
              <p className="text-xs text-gray-500 mt-1">
                {penalty === 'WARNING' && 'Gửi cảnh cáo đến người dùng vi phạm'}
                {penalty === 'CONTENT_REMOVAL' && 'Xóa/ẩn nội dung vi phạm (sách, bài đăng...)'}
                {penalty === 'TEMP_BAN' && 'Khóa tài khoản trong 7 ngày, người dùng không thể đăng nhập'}
                {penalty === 'PERMANENT_BAN' && 'Khóa tài khoản vĩnh viễn, không thể khôi phục'}
                {penalty === 'NONE' && 'Chỉ ghi nhận báo cáo, không áp dụng hình phạt'}
              </p>
            </div>

            {/* Trust Score Penalty */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Trừ điểm uy tín (Trust Score)
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min="0"
                  max="20"
                  value={trustScorePenalty}
                  onChange={(e) => setTrustScorePenalty(Number(e.target.value))}
                  className="flex-1"
                />
                <span className="text-lg font-bold text-red-600 min-w-[60px]">
                  -{trustScorePenalty} điểm
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Điểm uy tín hiện tại sẽ bị trừ đi {trustScorePenalty} điểm
              </p>
            </div>

            {/* Resolution Text */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ghi chú xử lý *
              </label>
              <textarea
                value={resolution}
                onChange={(e) => setResolution(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                rows="3"
                placeholder="Mô tả chi tiết hành động đã thực hiện..."
              />
            </div>

            {/* Warning for severe penalties */}
            {(penalty === 'TEMP_BAN' || penalty === 'PERMANENT_BAN') && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-700 font-medium">
                  ⚠️ Cảnh báo: Hành động này sẽ khóa tài khoản người dùng
                  {penalty === 'PERMANENT_BAN' && ' VĨNH VIỄN'}!
                </p>
              </div>
            )}

            <div className="flex justify-end gap-2">
              <button
                onClick={() => {
                  setShowResolveModal(false);
                  setResolution('');
                  setPenalty('WARNING');
                  setTrustScorePenalty(5);
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Hủy
              </button>
              <button
                onClick={handleResolve}
                className={`px-4 py-2 text-white rounded-lg ${
                  penalty === 'PERMANENT_BAN' 
                    ? 'bg-red-600 hover:bg-red-700' 
                    : 'bg-green-600 hover:bg-green-700'
                }`}
              >
                {penalty === 'PERMANENT_BAN' ? '🚫 Khóa vĩnh viễn' : 'Xác nhận xử lý'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportsManagement;
