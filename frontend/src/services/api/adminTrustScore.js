import api from './config';

/**
 * Admin Trust Score Management Service
 */

/**
 * GET /admin/members/:memberId/trust-score-history
 * @param {string} memberId - Member ID
 * @returns {Promise<Object>} Trust score history with member info
 */
export const getTrustScoreHistory = async (memberId) => {
  const response = await api.get(`/admin/members/${memberId}/trust-score-history`);
  return response.data;
};

/**
 * POST /admin/members/:memberId/adjust-trust-score
 * @param {string} memberId - Member ID
 * @param {Object} data - { adjustment: number, reason: string }
 * @returns {Promise<Object>} Updated member with new trust score
 */
export const adjustTrustScore = async (memberId, data) => {
  const response = await api.post(`/admin/members/${memberId}/adjust-trust-score`, data);
  return response.data;
};

/**
 * GET /admin/trust-score-leaderboard
 * @param {number} limit - Number of top members (default: 50)
 * @returns {Promise<Object>} Top members by trust score
 */
export const getTrustScoreLeaderboard = async (limit = 50) => {
  const response = await api.get('/admin/trust-score-leaderboard', {
    params: { limit },
  });
  return response.data;
};
