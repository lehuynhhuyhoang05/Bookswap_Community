// src/components/reports/ReportSeverityBadge.jsx
import React from 'react';
import { AlertTriangle, AlertCircle, Info } from 'lucide-react';

const ReportSeverityBadge = ({ severity = 'MEDIUM' }) => {
  const config = {
    HIGH: {
      icon: AlertTriangle,
      label: 'Cao',
      className: 'bg-red-100 text-red-800 border-red-300',
      iconColor: 'text-red-600'
    },
    MEDIUM: {
      icon: AlertCircle,
      label: 'Trung bình',
      className: 'bg-yellow-100 text-yellow-800 border-yellow-300',
      iconColor: 'text-yellow-600'
    },
    LOW: {
      icon: Info,
      label: 'Thấp',
      className: 'bg-blue-100 text-blue-800 border-blue-300',
      iconColor: 'text-blue-600'
    }
  };

  const current = config[severity] || config.MEDIUM;
  const Icon = current.icon;

  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium border ${current.className}`}>
      <Icon className={`w-4 h-4 ${current.iconColor}`} />
      {current.label}
    </span>
  );
};

export default ReportSeverityBadge;
