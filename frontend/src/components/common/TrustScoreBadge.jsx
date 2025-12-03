// src/components/common/TrustScoreBadge.jsx
// Component hiển thị badge Trust Score

import { Shield, ShieldCheck, ShieldAlert, ShieldX, Star } from 'lucide-react';

const TrustScoreBadge = ({ score, showLabel = true, size = 'md' }) => {
  const trustScore = Number(score) || 0;

  const getBadgeConfig = () => {
    if (trustScore >= 80) {
      return {
        icon: Star,
        label: 'Rất đáng tin cậy',
        bgColor: 'bg-green-100',
        textColor: 'text-green-800',
        iconColor: 'text-green-600',
        borderColor: 'border-green-200',
      };
    }
    if (trustScore >= 60) {
      return {
        icon: ShieldCheck,
        label: 'Đáng tin cậy',
        bgColor: 'bg-blue-100',
        textColor: 'text-blue-800',
        iconColor: 'text-blue-600',
        borderColor: 'border-blue-200',
      };
    }
    if (trustScore >= 40) {
      return {
        icon: Shield,
        label: 'Bình thường',
        bgColor: 'bg-gray-100',
        textColor: 'text-gray-700',
        iconColor: 'text-gray-500',
        borderColor: 'border-gray-200',
      };
    }
    if (trustScore >= 20) {
      return {
        icon: ShieldAlert,
        label: 'Cần cải thiện',
        bgColor: 'bg-yellow-100',
        textColor: 'text-yellow-800',
        iconColor: 'text-yellow-600',
        borderColor: 'border-yellow-200',
      };
    }
    if (trustScore > 0) {
      return {
        icon: ShieldAlert,
        label: 'Độ tin cậy thấp',
        bgColor: 'bg-orange-100',
        textColor: 'text-orange-800',
        iconColor: 'text-orange-600',
        borderColor: 'border-orange-200',
      };
    }
    return {
      icon: ShieldX,
      label: 'Bị hạn chế',
      bgColor: 'bg-red-100',
      textColor: 'text-red-800',
      iconColor: 'text-red-600',
      borderColor: 'border-red-200',
    };
  };

  const config = getBadgeConfig();
  const Icon = config.icon;

  const sizeClasses = {
    sm: {
      container: 'px-2 py-0.5 text-xs',
      icon: 'w-3 h-3',
    },
    md: {
      container: 'px-2.5 py-1 text-sm',
      icon: 'w-4 h-4',
    },
    lg: {
      container: 'px-3 py-1.5 text-base',
      icon: 'w-5 h-5',
    },
  };

  const sizes = sizeClasses[size] || sizeClasses.md;

  return (
    <div
      className={`inline-flex items-center gap-1.5 rounded-full border ${config.bgColor} ${config.borderColor} ${config.textColor} ${sizes.container}`}
      title={`Điểm uy tín: ${trustScore}/100`}
    >
      <Icon className={`${config.iconColor} ${sizes.icon}`} />
      {showLabel && <span className="font-medium">{config.label}</span>}
      <span className="font-bold">{trustScore}</span>
    </div>
  );
};

export default TrustScoreBadge;
