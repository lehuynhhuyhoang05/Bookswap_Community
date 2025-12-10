import api from './config';

/**
 * Admin Dashboard Service - Thống kê tổng quan hệ thống
 */

/**
 * GET /admin/dashboard/stats - Thống kê tổng quan
 * @returns {Promise<Object>} Thống kê tổng quan hệ thống
 * @returns {Object} data.totalUsers - Tổng số users
 * @returns {Object} data.totalBooks - Tổng số books
 * @returns {Object} data.totalExchanges - Tổng số exchanges
 * @returns {Object} data.totalReviews - Tổng số reviews
 * @returns {Array} data.topActiveUsers - Top active users
 * @returns {Array} data.recentActivities - Recent activities
 */
export const getAdminDashboardStats = async () => {
  try {
    console.log('[Admin Dashboard] Fetching stats from /admin/dashboard/stats');
    const response = await api.get('/admin/dashboard/stats');
    console.log('[Admin Dashboard] Response:', response.data);
    return response.data;
  } catch (error) {
    console.error('[Admin Dashboard] Error fetching stats:', error);
    console.error('[Admin Dashboard] Error response:', error.response?.data);
    console.error('[Admin Dashboard] Error status:', error.response?.status);
    throw error;
  }
};

export default {
  getAdminDashboardStats,
};
