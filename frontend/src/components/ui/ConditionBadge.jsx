import React from 'react';

const ConditionBadge = ({ condition }) => {
  // Hàm format condition thành tiếng Việt
  const formatBookCondition = (cond) => {
    const conditionMap = {
      'LIKE_NEW': 'Như mới',
      'VERY_GOOD': 'Rất tốt',
      'GOOD': 'Tốt',
      'FAIR': 'Khá',
      'POOR': 'Cũ',
      'like_new': 'Như mới',
      'very_good': 'Rất tốt',
      'good': 'Tốt',
      'fair': 'Khá',
      'poor': 'Cũ'
    };
    
    // Xử lý cả UPPERCASE và lowercase
    const normalizedCondition = cond?.toUpperCase();
    return conditionMap[cond] || conditionMap[normalizedCondition] || cond || 'Không xác định';
  };

  // Hàm lấy màu sắc cho condition
  const getConditionColor = (cond) => {
    const normalizedCondition = cond?.toUpperCase();
    
    switch (normalizedCondition) {
      case 'LIKE_NEW':
        return 'bg-green-100 text-green-800 border border-green-200';
      case 'VERY_GOOD':
        return 'bg-blue-100 text-blue-800 border border-blue-200';
      case 'GOOD':
        return 'bg-emerald-100 text-emerald-800 border border-emerald-200';
      case 'FAIR':
        return 'bg-yellow-100 text-yellow-800 border border-yellow-200';
      case 'POOR':
        return 'bg-red-100 text-red-800 border border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border border-gray-200';
    }
  };

  const displayCondition = formatBookCondition(condition);
  const colorClasses = getConditionColor(condition);

  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${colorClasses}`}>
      {displayCondition}
    </span>
  );
};

export default ConditionBadge;