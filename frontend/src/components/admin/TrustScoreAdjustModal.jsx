import { AlertCircle, TrendingDown, TrendingUp, X } from 'lucide-react';
import { useState } from 'react';
import { adjustTrustScore } from '../../services/api/adminTrustScore';

const TrustScoreAdjustModal = ({ member, onClose, onSuccess }) => {
  const [adjustment, setAdjustment] = useState(0);
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const currentScore = parseFloat(member.trust_score) || 50;
  const newScore = Math.max(0, Math.min(100, currentScore + adjustment));

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!reason.trim()) {
      setError('Vui lòng nhập lý do điều chỉnh');
      return;
    }

    if (adjustment === 0) {
      setError('Vui lòng chọn mức điều chỉnh');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      await adjustTrustScore(member.member_id, {
        adjustment,
        reason: reason.trim(),
      });

      onSuccess?.();
      onClose();
    } catch (err) {
      console.error('Failed to adjust trust score:', err);
      setError(err.response?.data?.message || 'Không thể điều chỉnh điểm uy tín');
    } finally {
      setLoading(false);
    }
  };

  const quickReasons = [
    { value: 10, label: 'Thưởng user tích cực', icon: TrendingUp, color: 'green' },
    { value: 5, label: 'Phản hồi tốt từ cộng đồng', icon: TrendingUp, color: 'green' },
    { value: -5, label: 'Vi phạm quy định nhẹ', icon: TrendingDown, color: 'orange' },
    { value: -10, label: 'Vi phạm quy định nghiêm trọng', icon: TrendingDown, color: 'red' },
    { value: -20, label: 'Phát hiện gian lận', icon: TrendingDown, color: 'red' },
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-gray-900">
            Điều chỉnh Trust Score
          </h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Member Info */}
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <div className="flex items-center gap-4">
            <img
              src={member.avatar_url || '/default-avatar.png'}
              alt={member.full_name}
              className="h-12 w-12 rounded-full"
            />
            <div>
              <h4 className="font-semibold text-gray-900">{member.full_name}</h4>
              <p className="text-sm text-gray-600">{member.email}</p>
            </div>
          </div>
          <div className="mt-3 flex items-center gap-2">
            <span className="text-sm text-gray-600">Trust Score hiện tại:</span>
            <span className="text-lg font-bold text-blue-600">
              {currentScore.toFixed(1)}
            </span>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Quick Actions */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Điều chỉnh nhanh
            </label>
            <div className="grid grid-cols-2 gap-2">
              {quickReasons.map((quick) => {
                const Icon = quick.icon;
                return (
                  <button
                    key={quick.value}
                    type="button"
                    onClick={() => {
                      setAdjustment(quick.value);
                      setReason(quick.label);
                    }}
                    className={`p-3 border-2 rounded-lg text-left hover:shadow-md transition ${
                      adjustment === quick.value
                        ? `border-${quick.color}-500 bg-${quick.color}-50`
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <Icon
                        className={`h-4 w-4 text-${quick.color}-600`}
                      />
                      <span
                        className={`font-semibold ${
                          quick.value > 0 ? 'text-green-600' : 'text-red-600'
                        }`}
                      >
                        {quick.value > 0 ? '+' : ''}
                        {quick.value}
                      </span>
                    </div>
                    <p className="text-xs text-gray-600">{quick.label}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Custom Adjustment */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Điều chỉnh tùy chỉnh (-50 đến +50)
            </label>
            <input
              type="number"
              value={adjustment}
              onChange={(e) => setAdjustment(parseInt(e.target.value) || 0)}
              min="-50"
              max="50"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Preview */}
          <div className="mb-4 p-4 bg-blue-50 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-sm text-gray-600">Điểm hiện tại:</span>
                <span className="ml-2 text-lg font-bold text-gray-900">
                  {currentScore.toFixed(1)}
                </span>
              </div>
              <div className="text-2xl font-bold text-gray-400">→</div>
              <div>
                <span className="text-sm text-gray-600">Điểm mới:</span>
                <span
                  className={`ml-2 text-lg font-bold ${
                    adjustment > 0
                      ? 'text-green-600'
                      : adjustment < 0
                      ? 'text-red-600'
                      : 'text-gray-900'
                  }`}
                >
                  {newScore.toFixed(1)}
                </span>
              </div>
            </div>
          </div>

          {/* Reason */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Lý do điều chỉnh *
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="Nhập lý do chi tiết cho việc điều chỉnh này..."
              required
            />
          </div>

          {/* Error */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0" />
              <span className="text-sm text-red-600">{error}</span>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              disabled={loading}
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={loading || adjustment === 0 || !reason.trim()}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Đang xử lý...' : 'Xác nhận điều chỉnh'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TrustScoreAdjustModal;
