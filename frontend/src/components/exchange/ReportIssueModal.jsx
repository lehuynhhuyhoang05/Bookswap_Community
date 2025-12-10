// src/components/exchange/ReportIssueModal.jsx
import { AlertTriangle, X } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useReports } from '../../hooks/useReports';
import { Button, Card } from '../ui';
import ReportSeverityBadge from '../reports/ReportSeverityBadge';
import EvidenceUpload from '../reports/EvidenceUpload';

const ReportIssueModal = ({ isOpen, onClose, exchange }) => {
  const { createReport, loading } = useReports();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    issue_type: 'NO_SHOW',
    severity: 'MEDIUM',
    description: '',
  });
  const [evidenceFiles, setEvidenceFiles] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const issueTypes = [
    { value: 'NO_SHOW', label: 'Không đến buổi hẹn' },
    { value: 'WRONG_BOOK', label: 'Sách không đúng mô tả' },
    { value: 'BAD_CONDITION', label: 'Tình trạng sách kém' },
    { value: 'UNSAFE_MEETING', label: 'Địa điểm gặp không an toàn' },
    { value: 'RUDE_BEHAVIOR', label: 'Thái độ thiếu tôn trọng' },
    { value: 'SCAM_ATTEMPT', label: 'Nghi ngờ lừa đảo' },
    { value: 'OTHER', label: 'Vấn đề khác' },
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.description.trim()) {
      setError('Vui lòng mô tả chi tiết vấn đề');
      return;
    }

    try {
      // Get other member ID
      const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
      const isRequester = exchange.requester?.user_id === currentUser.user_id;
      const otherMember = isRequester ? exchange.owner : exchange.requester;

      const reportData = {
        report_type: 'OTHER', // Mapped from issue_type
        reported_member_id: otherMember.member_id || otherMember.user_id,
        reported_item_type: 'EXCHANGE',
        reported_item_id: exchange.exchange_id,
        description: `[${issueTypes.find(t => t.value === formData.issue_type)?.label}]\n\n${formData.description}`,
        // TODO: Uncomment when backend supports severity
        // severity: formData.severity,
      };

      // TODO: Upload evidence files if backend supports
      // For now, just submit the report
      
      await createReport(reportData);
      setSuccess(true);
      
      // Auto redirect after 2 seconds
      setTimeout(() => {
        onClose();
        navigate('/reports');
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
          <p className="text-gray-600 mb-4">
            Chúng tôi sẽ xem xét và liên hệ với bạn sớm nhất có thể.
          </p>
          <p className="text-sm text-gray-500">
            Đang chuyển đến trang quản lý báo cáo...
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-red-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Báo cáo vấn đề</h2>
              <p className="text-sm text-gray-600">
                Trao đổi: {exchange.offered_book?.title || 'N/A'} ↔ {exchange.requested_book?.title || 'N/A'}
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
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-2">
              <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {/* Issue Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Loại vấn đề <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.issue_type}
              onChange={(e) => setFormData({ ...formData, issue_type: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              required
            >
              {issueTypes.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>

          {/* Severity */}
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
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Mô tả chi tiết <span className="text-red-500">*</span>
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Vui lòng mô tả cụ thể vấn đề bạn gặp phải trong quá trình trao đổi..."
              rows={6}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
              required
              minLength={20}
            />
            <p className="text-xs text-gray-500 mt-1">
              Tối thiểu 20 ký tự. Cung cấp thông tin chi tiết để chúng tôi hỗ trợ bạn tốt hơn.
            </p>
          </div>

          {/* Evidence Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Bằng chứng (ảnh chụp màn hình, tin nhắn...)
            </label>
            <EvidenceUpload
              onFilesChange={setEvidenceFiles}
              maxFiles={5}
              maxSize={10 * 1024 * 1024}
            />
          </div>

          {/* Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800">
              <strong>ℹ️ Lưu ý:</strong> Báo cáo của bạn sẽ được gửi đến admin để xem xét. 
              Chúng tôi sẽ liên hệ với cả hai bên để tìm hiểu và giải quyết vấn đề công bằng.
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
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

export default ReportIssueModal;
