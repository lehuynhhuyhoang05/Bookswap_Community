// src/components/common/TrustScoreBadge.jsx
// Component hiển thị badge Trust Score
// Accepts score in DB format (0-1) and converts to display format (0-100)

import { Shield, ShieldCheck, ShieldAlert, ShieldX, Star } from 'lucide-react';
import { toDisplayScore, getTrustBadgeConfig } from '../../utils/trustScore';

const TrustScoreBadge = ({ score, showLabel = true, size = 'md' }) => {
  // Convert from DB scale (0-1) to display scale (0-100)
  const displayScore = toDisplayScore(score);
  const config = getTrustBadgeConfig(displayScore);

  // Get icon based on level
  const getIcon = () => {
    switch (config.level) {
      case 'excellent': return Star;
      case 'good': return ShieldCheck;
      case 'normal': return Shield;
      case 'warning': return ShieldAlert;
      case 'low': return ShieldAlert;
      case 'blocked': return ShieldX;
      default: return Shield;
    }
  };

  const Icon = getIcon();

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
      title={`Điểm uy tín: ${displayScore}/100 - ${config.label}`}
    >
      <Icon className={`${config.iconColor} ${sizes.icon}`} />
      {showLabel && <span className="font-medium">{config.label}</span>}
      <span className="font-bold">{displayScore}</span>
    </div>
  );
};

export default TrustScoreBadge;
