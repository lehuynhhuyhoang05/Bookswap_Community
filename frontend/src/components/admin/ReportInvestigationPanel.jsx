// src/components/admin/ReportInvestigationPanel.jsx
import { useState, useEffect } from 'react';
import { 
  AlertTriangle, Eye, History, Ban, AlertCircle, 
  CheckCircle, FileText, User, Calendar, MessageSquare,
  Shield, X, Clock
} from 'lucide-react';
import { Card, Button, Badge, LoadingSpinner } from '../ui';
import ReportSeverityBadge from '../reports/ReportSeverityBadge';

const ReportInvestigationPanel = ({ report, onUpdateStatus, onTakeAction, loading }) => {
  const [showActions, setShowActions] = useState(false);
  const [actionForm, setActionForm] = useState({
    action_type: 'WARN_USER',
    notes: '',
    resolution_notes: ''
  });
  const [memberHistory, setMemberHistory] = useState(null);
  const [relatedReports, setRelatedReports] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  useEffect(() => {
    if (report?.reported_member_id) {
      loadMemberHistory();
    }
  }, [report?.reported_member_id]);

  const loadMemberHistory = async () => {
    setLoadingHistory(true);
    try {
      // TODO: Call API to get member's report history
      // const history = await reportsService.getMemberHistory(report.reported_member_id);
      // setMemberHistory(history);
      
      // Mock data for now
      setMemberHistory({
        total_reports: 3,
        total_warnings: 1,
        trust_score: 75,
        account_status: 'ACTIVE',
        member_since: '2024-01-15',
        total_exchanges: 12,
        completed_exchanges: 10
      });
      
      setRelatedReports([
        {
          report_id: 'R001',
          report_type: 'SCAM',
          status: 'RESOLVED',
          created_at: '2024-12-01',
          resolution: 'Warning issued'
        },
        {
          report_id: 'R002',
          report_type: 'NO_SHOW',
          status: 'CLOSED',
          created_at: '2024-11-15',
          resolution: 'No action needed'
        }
      ]);
    } catch (error) {
      console.error('Failed to load member history:', error);
    } finally {
      setLoadingHistory(false);
    }
  };

  const workflowStates = [
    { value: 'NEW', label: 'Mới', color: 'bg-blue-100 text-blue-700', icon: <AlertCircle className="w-4 h-4" /> },
    { value: 'INVESTIGATING', label: 'Đang xử lý', color: 'bg-yellow-100 text-yellow-700', icon: <Eye className="w-4 h-4" /> },
    { value: 'ACTION_TAKEN', label: 'Đã xử lý', color: 'bg-purple-100 text-purple-700', icon: <Shield className="w-4 h-4" /> },
    { value: 'CLOSED', label: 'Đã đóng', color: 'bg-gray-100 text-gray-700', icon: <CheckCircle className="w-4 h-4" /> }
  ];

  const actionTypes = [
    { value: 'WARN_USER', label: '⚠️ Cảnh cáo thành viên', severity: 'LOW' },
    { value: 'TEMPORARY_BAN', label: '🚫 Khóa tài khoản tạm thời (7 ngày)', severity: 'MEDIUM' },
    { value: 'PERMANENT_BAN', label: '❌ Khóa vĩnh viễn', severity: 'HIGH' },
    { value: 'REQUIRE_MORE_EVIDENCE', label: '📋 Yêu cầu bằng chứng thêm', severity: 'LOW' },
    { value: 'NO_ACTION', label: '✓ Không vi phạm', severity: 'LOW' }
  ];

  const handleStatusChange = async (newStatus) => {
    if (onUpdateStatus) {
      await onUpdateStatus(report.report_id, newStatus);
    }
  };

  const handleTakeAction = async () => {
    if (!actionForm.resolution_notes.trim()) {
      alert('Vui lòng nhập ghi chú xử lý');
      return;
    }
    
    if (onTakeAction) {
      await onTakeAction(report.report_id, actionForm);
      setShowActions(false);
    }
  };

  const currentState = workflowStates.find(s => s.value === report?.status) || workflowStates[0];

  return (
    <div className="space-y-6">
      {/* Workflow Status */}
      <Card className="p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
          <FileText className="w-5 h-5 text-blue-600" />
          Trạng thái xử lý
        </h3>
        
        <div className="flex items-center gap-4 mb-6">
          {workflowStates.map((state, index) => (
            <div key={state.value} className="flex items-center gap-2">
              <button
                onClick={() => handleStatusChange(state.value)}
                disabled={loading}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  currentState.value === state.value
                    ? state.color + ' border-2 border-current'
                    : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                } flex items-center gap-2`}
              >
                {state.icon}
                {state.label}
              </button>
              {index < workflowStates.length - 1 && (
                <div className="w-8 h-0.5 bg-gray-300"></div>
              )}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-600">Mức độ nghiêm trọng</p>
            <ReportSeverityBadge severity={report?.severity || 'MEDIUM'} />
          </div>
          <div>
            <p className="text-sm text-gray-600">Thời gian tạo</p>
            <p className="font-medium">{new Date(report?.created_at).toLocaleString('vi-VN')}</p>
          </div>
        </div>
      </Card>

      {/* Member History */}
      <Card className="p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
          <History className="w-5 h-5 text-purple-600" />
          Lịch sử thành viên bị báo cáo
        </h3>

        {loadingHistory ? (
          <div className="flex justify-center py-8">
            <LoadingSpinner />
          </div>
        ) : memberHistory ? (
          <div className="space-y-4">
            {/* Stats Grid */}
            <div className="grid grid-cols-4 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-xs text-blue-600 font-medium">Tổng báo cáo</p>
                <p className="text-2xl font-bold text-blue-900">{memberHistory.total_reports}</p>
              </div>
              <div className="bg-yellow-50 p-4 rounded-lg">
                <p className="text-xs text-yellow-600 font-medium">Cảnh cáo</p>
                <p className="text-2xl font-bold text-yellow-900">{memberHistory.total_warnings}</p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <p className="text-xs text-green-600 font-medium">Trust Score</p>
                <p className="text-2xl font-bold text-green-900">{memberHistory.trust_score}</p>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg">
                <p className="text-xs text-purple-600 font-medium">Giao dịch thành công</p>
                <p className="text-2xl font-bold text-purple-900">
                  {memberHistory.completed_exchanges}/{memberHistory.total_exchanges}
                </p>
              </div>
            </div>

            {/* Account Status */}
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <User className="w-5 h-5 text-gray-600" />
                <div>
                  <p className="text-sm text-gray-600">Trạng thái tài khoản</p>
                  <p className="font-bold text-gray-900">{memberHistory.account_status}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-gray-600" />
                <div>
                  <p className="text-sm text-gray-600">Thành viên từ</p>
                  <p className="font-medium text-gray-900">
                    {new Date(memberHistory.member_since).toLocaleDateString('vi-VN')}
                  </p>
                </div>
              </div>
            </div>

            {/* Related Reports */}
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Báo cáo liên quan ({relatedReports.length})</h4>
              <div className="space-y-2">
                {relatedReports.map((r) => (
                  <div key={r.report_id} className="p-3 bg-gray-50 rounded-lg flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">{r.report_type}</p>
                      <p className="text-xs text-gray-600">{new Date(r.created_at).toLocaleDateString('vi-VN')}</p>
                    </div>
                    <div className="text-right">
                      <Badge variant={r.status === 'RESOLVED' ? 'success' : 'default'} size="sm">
                        {r.status}
                      </Badge>
                      <p className="text-xs text-gray-600 mt-1">{r.resolution}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <p className="text-gray-500 text-center py-4">Không có dữ liệu lịch sử</p>
        )}
      </Card>

      {/* Admin Actions */}
      <Card className="p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Shield className="w-5 h-5 text-red-600" />
          Hành động xử lý
        </h3>

        {!showActions ? (
          <Button
            variant="primary"
            onClick={() => setShowActions(true)}
            className="w-full"
          >
            Thực hiện hành động
          </Button>
        ) : (
          <div className="space-y-4">
            {/* Action Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Loại hành động <span className="text-red-500">*</span>
              </label>
              <select
                value={actionForm.action_type}
                onChange={(e) => setActionForm({ ...actionForm, action_type: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                {actionTypes.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Resolution Notes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ghi chú xử lý <span className="text-red-500">*</span>
              </label>
              <textarea
                value={actionForm.resolution_notes}
                onChange={(e) => setActionForm({ ...actionForm, resolution_notes: e.target.value })}
                placeholder="Mô tả chi tiết lý do và kết quả xử lý..."
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 resize-none"
                required
              />
            </div>

            {/* Internal Notes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ghi chú nội bộ (không hiển thị với user)
              </label>
              <textarea
                value={actionForm.notes}
                onChange={(e) => setActionForm({ ...actionForm, notes: e.target.value })}
                placeholder="Ghi chú cho admin khác..."
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 resize-none"
              />
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-2">
              <Button
                variant="outline"
                onClick={() => setShowActions(false)}
                className="flex-1"
                disabled={loading}
              >
                Hủy
              </Button>
              <Button
                variant="primary"
                onClick={handleTakeAction}
                className="flex-1 bg-blue-600 hover:bg-blue-700"
                disabled={loading}
              >
                {loading ? 'Đang xử lý...' : 'Xác nhận'}
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* Evidence Section */}
      {report?.evidence_urls && report.evidence_urls.length > 0 && (
        <Card className="p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <FileText className="w-5 h-5 text-green-600" />
            Bằng chứng đính kèm ({report.evidence_urls.length})
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {report.evidence_urls.map((url, index) => (
              <a
                key={index}
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="block border border-gray-300 rounded-lg overflow-hidden hover:border-blue-500 transition"
              >
                <img
                  src={url}
                  alt={`Evidence ${index + 1}`}
                  className="w-full h-32 object-cover"
                  onError={(e) => {
                    e.target.src = '/placeholder-document.png';
                  }}
                />
              </a>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
};

export default ReportInvestigationPanel;
