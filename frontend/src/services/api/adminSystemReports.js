import api from './config';

/**
 * Admin System Reports Service - Báo cáo tổng thể hệ thống
 * Không phải báo cáo vi phạm, mà là báo cáo thống kê hệ thống cho admin
 */

/**
 * GET /admin/reports/system/overview - Báo cáo tổng quan hệ thống
 * @returns {Promise<Object>} System overview statistics
 */
export const getSystemOverview = async () => {
  try {
    console.log('[System Reports] Fetching system overview...');
    const response = await api.get('/admin/reports/system/overview');
    console.log('[System Reports] Overview response:', response.data);
    return response.data;
  } catch (error) {
    console.error('[System Reports] Error fetching overview:', error);
    throw error;
  }
};

/**
 * GET /admin/reports/system/trends - Báo cáo xu hướng theo thời gian
 * @param {number} days - Số ngày thống kê (7, 30, 90)
 * @returns {Promise<Object>} System trends data
 */
export const getSystemTrends = async (days = 30) => {
  try {
    console.log('[System Reports] Fetching system trends for', days, 'days...');
    const response = await api.get('/admin/reports/system/trends', { params: { days } });
    console.log('[System Reports] Trends response:', response.data);
    return response.data;
  } catch (error) {
    console.error('[System Reports] Error fetching trends:', error);
    throw error;
  }
};

/**
 * GET /admin/reports/system/regions - Báo cáo theo vùng địa lý
 * @returns {Promise<Object>} Region report data
 */
export const getRegionReport = async () => {
  try {
    console.log('[System Reports] Fetching region report...');
    const response = await api.get('/admin/reports/system/regions');
    console.log('[System Reports] Region response:', response.data);
    return response.data;
  } catch (error) {
    console.error('[System Reports] Error fetching regions:', error);
    throw error;
  }
};

/**
 * GET /admin/reports/system/categories - Báo cáo sách theo thể loại
 * @returns {Promise<Object>} Book category report
 */
export const getBookCategoryReport = async () => {
  try {
    console.log('[System Reports] Fetching book categories...');
    const response = await api.get('/admin/reports/system/categories');
    console.log('[System Reports] Categories response:', response.data);
    return response.data;
  } catch (error) {
    console.error('[System Reports] Error fetching categories:', error);
    throw error;
  }
};

/**
 * GET /admin/reports/system/top-performers - Top performers report
 * @returns {Promise<Object>} Top performers data
 */
export const getTopPerformersReport = async () => {
  try {
    console.log('[System Reports] Fetching top performers...');
    const response = await api.get('/admin/reports/system/top-performers');
    console.log('[System Reports] Top performers response:', response.data);
    return response.data;
  } catch (error) {
    console.error('[System Reports] Error fetching top performers:', error);
    throw error;
  }
};

/**
 * GET /admin/reports/system/alerts - System alerts
 * @returns {Promise<Object>} System alerts
 */
export const getSystemAlerts = async () => {
  try {
    console.log('[System Reports] Fetching system alerts...');
    const response = await api.get('/admin/reports/system/alerts');
    console.log('[System Reports] Alerts response:', response.data);
    return response.data;
  } catch (error) {
    console.error('[System Reports] Error fetching alerts:', error);
    throw error;
  }
};

/**
 * GET /admin/reports/system/full - Full system report
 * @returns {Promise<Object>} Full system report
 */
export const getFullSystemReport = async () => {
  try {
    console.log('[System Reports] Fetching full system report...');
    const response = await api.get('/admin/reports/system/full');
    console.log('[System Reports] Full report response:', response.data);
    return response.data;
  } catch (error) {
    console.error('[System Reports] Error fetching full report:', error);
    throw error;
  }
};

export default {
  getSystemOverview,
  getSystemTrends,
  getRegionReport,
  getBookCategoryReport,
  getTopPerformersReport,
  getSystemAlerts,
  getFullSystemReport,
};
