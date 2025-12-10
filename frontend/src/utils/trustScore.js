// src/utils/trustScore.js
// Utility functions for Trust Score handling
// Database stores trust_score as 0-100 scale (60.00 = 60%)
// Frontend displays as 0-100 scale (60 = 60%)

/**
 * Convert trust score from DB scale (0-100) to display scale (0-100)
 * @param {number|string} dbScore - Score from database (0-100 scale)
 * @returns {number} Display score (0-100 scale)
 */
export const toDisplayScore = (dbScore) => {
  const score = Number(dbScore) || 0;
  // DB already stores 0-100, just round it
  return Math.min(100, Math.max(0, Math.round(score)));
};

/**
 * Convert trust score from display scale (0-100) to DB scale (0-100)
 * @param {number} displayScore - Display score (0-100 scale)
 * @returns {number} DB score (0-100 scale)
 */
export const toDbScore = (displayScore) => {
  const score = Number(displayScore) || 0;
  // DB uses same 0-100 scale, just clamp it
  return Math.max(0, Math.min(100, score));
};

/**
 * Get trust score badge configuration
 * @param {number} displayScore - Score in display format (0-100)
 * @returns {Object} Badge configuration
 */
export const getTrustBadgeConfig = (displayScore) => {
  const score = Number(displayScore) || 0;
  
  if (score >= 80) {
    return {
      level: 'excellent',
      label: 'Rất đáng tin cậy',
      shortLabel: 'Xuất sắc',
      bgColor: 'bg-green-100',
      textColor: 'text-green-800',
      iconColor: 'text-green-600',
      borderColor: 'border-green-200',
      badgeColor: 'bg-green-500',
    };
  }
  if (score >= 60) {
    return {
      level: 'good',
      label: 'Đáng tin cậy',
      shortLabel: 'Tốt',
      bgColor: 'bg-blue-100',
      textColor: 'text-blue-800',
      iconColor: 'text-blue-600',
      borderColor: 'border-blue-200',
      badgeColor: 'bg-blue-500',
    };
  }
  if (score >= 40) {
    return {
      level: 'normal',
      label: 'Bình thường',
      shortLabel: 'Bình thường',
      bgColor: 'bg-gray-100',
      textColor: 'text-gray-700',
      iconColor: 'text-gray-500',
      borderColor: 'border-gray-200',
      badgeColor: 'bg-gray-500',
    };
  }
  if (score >= 20) {
    return {
      level: 'warning',
      label: 'Cần cải thiện',
      shortLabel: 'Thấp',
      bgColor: 'bg-yellow-100',
      textColor: 'text-yellow-800',
      iconColor: 'text-yellow-600',
      borderColor: 'border-yellow-200',
      badgeColor: 'bg-yellow-500',
    };
  }
  if (score > 0) {
    return {
      level: 'low',
      label: 'Độ tin cậy thấp',
      shortLabel: 'Rất thấp',
      bgColor: 'bg-orange-100',
      textColor: 'text-orange-800',
      iconColor: 'text-orange-600',
      borderColor: 'border-orange-200',
      badgeColor: 'bg-orange-500',
    };
  }
  return {
    level: 'blocked',
    label: 'Bị hạn chế',
    shortLabel: 'Bị khóa',
    bgColor: 'bg-red-100',
    textColor: 'text-red-800',
    iconColor: 'text-red-600',
    borderColor: 'border-red-200',
    badgeColor: 'bg-red-500',
  };
};

/**
 * Format trust score for display
 * @param {number|string} dbScore - Score from database
 * @param {boolean} showPercent - Whether to show % symbol
 * @returns {string} Formatted score string
 */
export const formatTrustScore = (dbScore, showPercent = false) => {
  const displayScore = toDisplayScore(dbScore);
  return showPercent ? `${displayScore}%` : `${displayScore}`;
};
