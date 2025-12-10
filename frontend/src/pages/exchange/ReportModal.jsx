// src/pages/exchange/ReportModal.jsx
import { X } from 'lucide-react';
import { useState } from 'react';
import { Button } from '../../components/ui';
import { useReports } from '../../hooks/useReports';

const ReportModal = ({
  isOpen,
  onClose,
  reportedMemberId,
  reportedMemberName,
}) => {
  const { createReport, validateReportData, loading } = useReports();
  const [formData, setFormData] = useState({
    report_type: '',
    description: '',
  });
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState('');

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
    setErrors({});
    setSubmitError('');

    // Validate
    const reportData = {
      report_type: formData.report_type,
      reported_member_id: reportedMemberId,
      description: formData.description,
    };

    const { isValid, errors: validationErrors } =
      validateReportData(reportData);
    if (!isValid) {
      setErrors(validationErrors);
      return;
    }

    try {
      await createReport(reportData);
      alert('Báo cáo đã được gửi thành công. Chúng tôi sẽ xem xét sớm nhất.');
      handleClose();
    } catch (err) {
      setSubmitError(err.message || 'Gửi báo cáo thất bại. Vui lòng thử lại.');
    }
  };

  const handleClose = () => {
    setFormData({ report_type: '', description: '' });
    setErrors({});
    setSubmitError('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-bold text-gray-900">Báo cáo vi phạm</h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6">
          <div className="mb-4">
            <p className="text-sm text-gray-600 mb-4">
              Bạn đang báo cáo:{' '}
              <span className="font-semibold">{reportedMemberName}</span>
            </p>
          </div>

          {submitError && (
            <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg text-sm">
              {submitError}
            </div>
          )}

          {/* Report Type */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Loại vi phạm <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.report_type}
              onChange={(e) =>
                setFormData({ ...formData, report_type: e.target.value })
              }
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                errors.report_type ? 'border-red-500' : 'border-gray-300'
              }`}
            >
              <option value="">-- Chọn loại vi phạm --</option>
              {reportTypes.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
            {errors.report_type && (
              <p className="text-red-500 text-sm mt-1">{errors.report_type}</p>
            )}
          </div>

          {/* Description */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Mô tả chi tiết
              <span className="text-gray-500 font-normal ml-1">
                (Tối thiểu 10 ký tự)
              </span>
            </label>
            <textarea
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              rows={4}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none ${
                errors.description ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Mô tả chi tiết về vi phạm..."
            />
            {errors.description && (
              <p className="text-red-500 text-sm mt-1">{errors.description}</p>
            )}
            <p className="text-xs text-gray-500 mt-1">
              {formData.description.length} ký tự
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              className="flex-1"
              disabled={loading}
            >
              Hủy
            </Button>
            <Button
              type="submit"
              variant="primary"
              className="flex-1 bg-red-600 hover:bg-red-700"
              loading={loading}
              disabled={loading}
            >
              {loading ? 'Đang gửi...' : 'Gửi báo cáo'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReportModal;
