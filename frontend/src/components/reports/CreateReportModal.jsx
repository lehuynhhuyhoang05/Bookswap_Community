// src/components/reports/CreateReportModal.jsx
import { AlertTriangle, X } from 'lucide-react';
import { useState } from 'react';
import { useReports } from '../../hooks/useReports';
import { Button, Card } from '../ui';
import ReportSeverityBadge from './ReportSeverityBadge';
import EvidenceUpload from './EvidenceUpload';

const CreateReportModal = ({ isOpen, onClose, reportedMember, reportedItem = null }) => {
  const { createReport, loading } = useReports();
  const [formData, setFormData] = useState({
    report_type: 'SPAM',
    severity: 'MEDIUM',
    description: '',
  });
  const [evidenceFiles, setEvidenceFiles] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const reportTypes = [
    { value: 'SPAM', label: 'Spam / Quảng cáo' },
    { value: 'INAPPROPRIATE', label: 'Nội dung không phù hợp' },
    { value: 'HARASSMENT', label: 'Quấy rối / Bắt nạt' },
    { value: 'FRAUD', label: 'Lừa đảo / Gian lận' },
    { value: 'FAKE_PROFILE', label: 'Tài khoản giả mạo' },
    { value: 'OTHER', label: 'Khác' },
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.description.trim()) {
      setError('Vui lòng mô tả lý do báo cáo');
      return;
    }

    try {
      const reportData = {
        report_type: formData.report_type,
        reported_member_id: reportedMember.member_id || reportedMember.id,
        description: formData.description,
        // TODO: Uncomment when backend supports severity field
        // severity: formData.severity,
      };

      // Add optional item info if provided
      if (reportedItem) {
        reportData.reported_item_type = reportedItem.type; // 'BOOK', 'REVIEW', etc.
        reportData.reported_item_id = reportedItem.id;
      }

      // TODO: Upload evidence files when backend supports
      // For now, we'll need to either:
      // 1. Upload files first, get URLs, then include in reportData.evidence_urls
      // 2. Use FormData to send everything together (multipart/form-data)
      // Example:
      // if (evidenceFiles.length > 0) {
      //   const uploadedUrls = await uploadReportEvidence(evidenceFiles);
      //   reportData.evidence_urls = uploadedUrls;
      // }

      await createReport(reportData);
      setSuccess(true);
      
      // Auto close after 2 seconds
      setTimeout(() => {
        onClose();
        setSuccess(false);
        setFormData({ report_type: 'SPAM', description: '' });
      }, 2000);
    } catch (err) {
      setError(err.message || 'Không thể gửi báo cáo. Vui lòng thử lại.');
    }
  };

  if (!isOpen) return null;

  if (success) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <Card className="max-w-md w-full p-6 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-4xl">✅</span>
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">Đã gửi báo cáo</h3>
          <p className="text-gray-600">
            Cảm ơn bạn đã báo cáo. Chúng tôi sẽ xem xét và xử lý trong thời gian sớm nhất.
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="max-w-lg w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Báo cáo vi phạm</h2>
              <p className="text-sm text-gray-500">
                Báo cáo: {reportedMember?.full_name || reportedMember?.name || 'Người dùng'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-2">
              <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {/* Report Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Loại vi phạm <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.report_type}
              onChange={(e) => setFormData({ ...formData, report_type: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              required
            >
              {reportTypes.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>

          {/* Severity Level */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Mức độ nghiêm trọng <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-3 gap-3">
              {['LOW', 'MEDIUM', 'HIGH'].map((severity) => (
                <button
                  key={severity}
                  type="button"
                  onClick={() => setFormData({ ...formData, severity })}
                  className={`p-3 rounded-lg border-2 transition-all ${
                    formData.severity === severity
                      ? 'border-red-500 bg-red-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <ReportSeverityBadge severity={severity} />
                </button>
              ))}
            </div>
            <p className="text-xs text-gray-500 mt-2">
              <strong>Cao:</strong> Vi phạm nghiêm trọng (lừa đảo, quấy rối) |{' '}
              <strong>Trung bình:</strong> Vi phạm vừa phải |{' '}
              <strong>Thấp:</strong> Vi phạm nhỏ (spam nhẹ)
            </p>
          </div>

          {/* Evidence Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Bằng chứng (tùy chọn)
            </label>
            <EvidenceUpload
              onFilesChange={setEvidenceFiles}
              maxFiles={5}
              maxSize={10 * 1024 * 1024}
            />
            <p className="text-xs text-gray-500 mt-2">
              Cung cấp screenshots, ảnh chụp màn hình hoặc tài liệu chứng minh vi phạm để tăng độ tin cậy
            </p>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Mô tả chi tiết <span className="text-red-500">*</span>
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Vui lòng mô tả rõ lý do báo cáo để chúng tôi có thể xử lý nhanh hơn..."
              rows={5}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
              required
              minLength={10}
            />
            <p className="text-xs text-gray-500 mt-1">
              Tối thiểu 10 ký tự. Hãy cung cấp thông tin cụ thể để chúng tôi xử lý chính xác.
            </p>
          </div>

          {/* Warning */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <p className="text-sm text-yellow-800">
              ⚠️ <strong>Lưu ý:</strong> Báo cáo sai sự thật có thể dẫn đến việc tài khoản của bạn bị xử lý.
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1"
              disabled={loading}
            >
              Hủy
            </Button>
            <Button
              type="submit"
              variant="danger"
              className="flex-1 bg-red-600 hover:bg-red-700 text-white"
              disabled={loading}
            >
              {loading ? 'Đang gửi...' : 'Gửi báo cáo'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default CreateReportModal;
