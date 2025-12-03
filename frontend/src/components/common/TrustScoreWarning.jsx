// src/components/common/TrustScoreWarning.jsx
// Component hiển thị cảnh báo khi Trust Score thấp

import { AlertTriangle, ShieldAlert, Ban, Info } from 'lucide-react';

const TrustScoreWarning = ({ restrictions, className = '' }) => {
  if (!restrictions || restrictions.warningLevel === 'none') {
    return null;
  }

  const getWarningConfig = () => {
    switch (restrictions.warningLevel) {
      case 'critical':
        return {
          icon: Ban,
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200',
          textColor: 'text-red-800',
          iconColor: 'text-red-600',
          title: '🚫 Tài khoản bị hạn chế',
        };
      case 'very_low':
        return {
          icon: ShieldAlert,
          bgColor: 'bg-orange-50',
          borderColor: 'border-orange-200',
          textColor: 'text-orange-800',
          iconColor: 'text-orange-600',
          title: '⚠️ Điểm uy tín rất thấp',
        };
      case 'low':
        return {
          icon: AlertTriangle,
          bgColor: 'bg-yellow-50',
          borderColor: 'border-yellow-200',
          textColor: 'text-yellow-800',
          iconColor: 'text-yellow-600',
          title: '⚠️ Điểm uy tín thấp',
        };
      default:
        return {
          icon: Info,
          bgColor: 'bg-blue-50',
          borderColor: 'border-blue-200',
          textColor: 'text-blue-800',
          iconColor: 'text-blue-600',
          title: 'Thông báo',
        };
    }
  };

  const config = getWarningConfig();
  const Icon = config.icon;

  return (
    <div
      className={`${config.bgColor} ${config.borderColor} border rounded-lg p-4 ${className}`}
    >
      <div className="flex items-start gap-3">
        <Icon className={`w-5 h-5 ${config.iconColor} mt-0.5 flex-shrink-0`} />
        <div className="flex-1">
          <h4 className={`font-semibold ${config.textColor}`}>{config.title}</h4>
          <p className={`text-sm ${config.textColor} mt-1`}>
            {restrictions.warningMessage}
          </p>
          
          {/* Show restrictions */}
          <div className="mt-3 space-y-1">
            <p className={`text-xs ${config.textColor}`}>
              Điểm uy tín hiện tại: <strong>{restrictions.score}</strong>/100
            </p>
            <div className="flex flex-wrap gap-2 mt-2">
              {!restrictions.canCreateExchange && (
                <span className="inline-flex items-center px-2 py-1 rounded text-xs bg-red-100 text-red-700">
                  ❌ Không thể tạo yêu cầu trao đổi
                </span>
              )}
              {!restrictions.canPostBooks && (
                <span className="inline-flex items-center px-2 py-1 rounded text-xs bg-red-100 text-red-700">
                  ❌ Không thể đăng sách mới
                </span>
              )}
              {!restrictions.canSendMessages && (
                <span className="inline-flex items-center px-2 py-1 rounded text-xs bg-red-100 text-red-700">
                  ❌ Không thể gửi tin nhắn
                </span>
              )}
            </div>
          </div>

          {/* How to improve */}
          {restrictions.warningLevel !== 'critical' && (
            <div className="mt-3 pt-3 border-t border-gray-200">
              <p className={`text-xs ${config.textColor}`}>
                💡 <strong>Cách cải thiện:</strong> Hoàn thành các giao dịch thành công và nhận đánh giá tốt từ người dùng khác.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TrustScoreWarning;
