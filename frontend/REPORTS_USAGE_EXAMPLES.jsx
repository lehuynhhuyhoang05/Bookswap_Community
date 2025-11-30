// Example Usage: Components sử dụng Reports API
// File này để demo cách sử dụng, không cần import vào project

import { useEffect, useState } from 'react';
import { useReports } from '../hooks/useReports';

/**
 * ========================================
 * EXAMPLE 1: Form tạo report vi phạm
 * ========================================
 */
export const CreateReportForm = ({
  reportedMemberId,
  reportedItemType,
  reportedItemId,
}) => {
  const { createReport, validateReportData, loading, error } = useReports();
  const [formData, setFormData] = useState({
    report_type: '',
    reported_member_id: reportedMemberId || '',
    reported_item_type: reportedItemType || '',
    reported_item_id: reportedItemId || '',
    description: '',
  });
  const [validationErrors, setValidationErrors] = useState({});
  const [success, setSuccess] = useState(false);

  const reportTypes = [
    { value: 'SPAM', label: 'Spam / Quảng cáo' },
    { value: 'INAPPROPRIATE_CONTENT', label: 'Nội dung không phù hợp' },
    { value: 'HARASSMENT', label: 'Quấy rối / Đe dọa' },
    { value: 'FRAUD', label: 'Lừa đảo / Gian lận' },
    { value: 'FAKE_PROFILE', label: 'Hồ sơ giả mạo' },
    { value: 'OTHER', label: 'Khác' },
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccess(false);
    setValidationErrors({});

    // Validate
    const { isValid, errors } = validateReportData(formData);
    if (!isValid) {
      setValidationErrors(errors);
      return;
    }

    try {
      const result = await createReport(formData);
      console.log('Report created successfully:', result);
      setSuccess(true);
      // Reset form
      setFormData({
        report_type: '',
        reported_member_id: reportedMemberId || '',
        reported_item_type: reportedItemType || '',
        reported_item_id: reportedItemId || '',
        description: '',
      });
    } catch (err) {
      console.error('Failed to create report:', err);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4">Báo cáo vi phạm</h2>

      {success && (
        <div className="mb-4 p-4 bg-green-100 text-green-700 rounded">
          Báo cáo đã được gửi thành công. Chúng tôi sẽ xem xét sớm nhất.
        </div>
      )}

      {error && (
        <div className="mb-4 p-4 bg-red-100 text-red-700 rounded">{error}</div>
      )}

      <form onSubmit={handleSubmit}>
        {/* Report Type */}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">
            Loại vi phạm <span className="text-red-500">*</span>
          </label>
          <select
            value={formData.report_type}
            onChange={(e) =>
              setFormData({ ...formData, report_type: e.target.value })
            }
            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="">-- Chọn loại vi phạm --</option>
            {reportTypes.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
          {validationErrors.report_type && (
            <p className="text-red-500 text-sm mt-1">
              {validationErrors.report_type}
            </p>
          )}
        </div>

        {/* Description */}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">
            Mô tả chi tiết (tối thiểu 10 ký tự)
          </label>
          <textarea
            value={formData.description}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
            rows={4}
            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            placeholder="Mô tả chi tiết về vi phạm..."
          />
          {validationErrors.description && (
            <p className="text-red-500 text-sm mt-1">
              {validationErrors.description}
            </p>
          )}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
        >
          {loading ? 'Đang gửi...' : 'Gửi báo cáo'}
        </button>
      </form>
    </div>
  );
};

/**
 * ========================================
 * EXAMPLE 2: Danh sách reports của mình
 * ========================================
 */
export const MyReportsList = () => {
  const { getMyReports, getReportTypeLabel, getStatusLabel, loading, error } =
    useReports();
  const [reports, setReports] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
  });

  useEffect(() => {
    loadReports();
  }, [pagination.page]);

  const loadReports = async () => {
    try {
      const data = await getMyReports({
        page: pagination.page,
        limit: pagination.limit,
      });
      setReports(data.reports || data.items || []);
      setPagination((prev) => ({
        ...prev,
        total: data.total || 0,
      }));
    } catch (err) {
      console.error('Failed to load reports:', err);
    }
  };

  const totalPages = Math.ceil(pagination.total / pagination.limit);

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-4">Báo cáo của tôi</h2>

      {loading && <div className="text-center py-8">Đang tải...</div>}

      {error && (
        <div className="mb-4 p-4 bg-red-100 text-red-700 rounded">{error}</div>
      )}

      {!loading && reports.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          Bạn chưa có báo cáo nào
        </div>
      )}

      {!loading && reports.length > 0 && (
        <>
          <div className="space-y-4">
            {reports.map((report) => (
              <div
                key={report.report_id}
                className="p-4 border rounded-lg hover:shadow-md transition"
              >
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <span className="font-semibold">
                      {getReportTypeLabel(report.report_type)}
                    </span>
                    <p className="text-sm text-gray-600">
                      Thành viên: {report.reported_member_id}
                    </p>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-sm ${
                      report.status === 'PENDING'
                        ? 'bg-yellow-100 text-yellow-800'
                        : report.status === 'RESOLVED'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {getStatusLabel(report.status)}
                  </span>
                </div>
                <p className="text-sm text-gray-500">
                  Ngày tạo:{' '}
                  {new Date(report.created_at).toLocaleString('vi-VN')}
                </p>
              </div>
            ))}
          </div>

          {/* Pagination */}
          <div className="mt-6 flex justify-center gap-2">
            <button
              onClick={() =>
                setPagination((prev) => ({ ...prev, page: prev.page - 1 }))
              }
              disabled={pagination.page === 1}
              className="px-4 py-2 border rounded disabled:opacity-50"
            >
              Trước
            </button>
            <span className="px-4 py-2">
              Trang {pagination.page} / {totalPages}
            </span>
            <button
              onClick={() =>
                setPagination((prev) => ({ ...prev, page: prev.page + 1 }))
              }
              disabled={pagination.page >= totalPages}
              className="px-4 py-2 border rounded disabled:opacity-50"
            >
              Sau
            </button>
          </div>
        </>
      )}
    </div>
  );
};

/**
 * ========================================
 * EXAMPLE 3: Chi tiết một report
 * ========================================
 */
export const ReportDetail = ({ reportId }) => {
  const { getReportById, getReportTypeLabel, getStatusLabel, loading, error } =
    useReports();
  const [report, setReport] = useState(null);

  useEffect(() => {
    loadReport();
  }, [reportId]);

  const loadReport = async () => {
    try {
      const data = await getReportById(reportId);
      setReport(data);
    } catch (err) {
      console.error('Failed to load report:', err);
    }
  };

  if (loading) {
    return <div className="text-center py-8">Đang tải...</div>;
  }

  if (error) {
    return <div className="p-4 bg-red-100 text-red-700 rounded">{error}</div>;
  }

  if (!report) {
    return null;
  }

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4">Chi tiết báo cáo</h2>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-600">ID</label>
          <p className="text-sm">{report.report_id}</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-600">
            Loại vi phạm
          </label>
          <p className="font-semibold">
            {getReportTypeLabel(report.report_type)}
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-600">
            Thành viên bị báo cáo
          </label>
          <p>{report.reported_member_id}</p>
        </div>

        {report.reported_item_type && (
          <div>
            <label className="block text-sm font-medium text-gray-600">
              Loại nội dung
            </label>
            <p>{report.reported_item_type}</p>
          </div>
        )}

        {report.reported_item_id && (
          <div>
            <label className="block text-sm font-medium text-gray-600">
              ID nội dung
            </label>
            <p>{report.reported_item_id}</p>
          </div>
        )}

        {report.description && (
          <div>
            <label className="block text-sm font-medium text-gray-600">
              Mô tả
            </label>
            <p className="whitespace-pre-wrap">{report.description}</p>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-600">
            Trạng thái
          </label>
          <p className="font-semibold">{getStatusLabel(report.status)}</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-600">
            Ngày tạo
          </label>
          <p>{new Date(report.created_at).toLocaleString('vi-VN')}</p>
        </div>

        {report.reviewed_at && (
          <div>
            <label className="block text-sm font-medium text-gray-600">
              Ngày xem xét
            </label>
            <p>{new Date(report.reviewed_at).toLocaleString('vi-VN')}</p>
          </div>
        )}

        {report.review_result && (
          <div>
            <label className="block text-sm font-medium text-gray-600">
              Kết quả xem xét
            </label>
            <p className="whitespace-pre-wrap">{report.review_result}</p>
          </div>
        )}
      </div>
    </div>
  );
};

/**
 * ========================================
 * EXAMPLE 4: Quick Usage trong component
 * ========================================
 */
export const QuickUsageExample = () => {
  const { createReport, getMyReports, loading } = useReports();

  // Ví dụ 1: Tạo report đơn giản
  const handleQuickReport = async () => {
    try {
      const result = await createReport({
        report_type: 'SPAM',
        reported_member_id: 'member-123',
        description: 'Người này đăng spam quảng cáo',
      });
      alert('Báo cáo đã được gửi: ' + result.report_id);
    } catch (err) {
      alert('Lỗi: ' + err.message);
    }
  };

  // Ví dụ 2: Lấy danh sách reports
  const handleLoadReports = async () => {
    try {
      const data = await getMyReports({ page: 1, limit: 10 });
      console.log('Total reports:', data.total);
      console.log('Reports:', data.reports || data.items);
    } catch (err) {
      console.error('Error:', err);
    }
  };

  return (
    <div className="p-6">
      <h3 className="text-xl font-bold mb-4">Quick Usage Examples</h3>
      <div className="space-x-4">
        <button
          onClick={handleQuickReport}
          disabled={loading}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Tạo Report
        </button>
        <button
          onClick={handleLoadReports}
          disabled={loading}
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
        >
          Load Reports
        </button>
      </div>
    </div>
  );
};
