import api from './config';

/**
 * Admin Reports Service - Quản lý báo cáo vi phạm
 */

// Helper function để remove empty params
const cleanParams = (params) => {
  const cleaned = {};
  Object.keys(params).forEach((key) => {
    const value = params[key];
    if (value !== '' && value !== null && value !== undefined) {
      cleaned[key] = value;
    }
  });
  return cleaned;
};

/**
 * GET /admin/reports - Lấy danh sách báo cáo vi phạm
 * @param {Object} params - Query parameters
 * @param {number} params.page - Trang hiện tại (default: 1)
 * @param {number} params.limit - Số lượng mỗi trang (default: 20)
 * @param {string} params.status - Lọc trạng thái (PENDING, IN_REVIEW, RESOLVED, DISMISSED)
 * @param {string} params.priority - Lọc độ ưu tiên (LOW, MEDIUM, HIGH, CRITICAL)
 * @param {string} params.type - Lọc loại vi phạm (SPAM, etc.)
 * @param {string} params.reportedBy - Lọc theo người báo cáo
 * @returns {Promise<Object>} Danh sách reports với pagination
 */
export const getAdminReports = async (params = {}) => {
  try {
    const cleanedParams = cleanParams(params);
    console.log('[Admin Reports] Fetching reports with params:', cleanedParams);
    const response = await api.get('/admin/reports', { params: cleanedParams });
    console.log('[Admin Reports] Response:', response.data);
    return response.data;
  } catch (error) {
    console.error('[Admin Reports] Error:', error);
    console.error('[Admin Reports] Error response:', error.response?.data);
    console.error('[Admin Reports] Error status:', error.response?.status);
    throw error;
  }
};

/**
 * GET /admin/reports/{reportId} - Xem chi tiết báo cáo
 * @param {string} reportId - ID report
 * @returns {Promise<Object>} Chi tiết report
 */
export const getAdminReport = async (reportId) => {
  try {
    console.log('[Admin Reports] Fetching report detail:', reportId);
    const response = await api.get(`/admin/reports/${reportId}`);
    console.log('[Admin Reports] Report detail:', response.data);
    return response.data;
  } catch (error) {
    console.error('[Admin Reports] Error fetching report:', error);
    throw error;
  }
};

/**
 * POST /admin/reports/{reportId}/dismiss - Bác bỏ báo cáo
 * @param {string} reportId - ID report cần dismiss
 * @param {Object} data - Request body
 * @param {string} data.reason - Lý do dismiss
 * @returns {Promise<Object>} Kết quả dismiss
 */
export const dismissAdminReport = async (reportId, data) => {
  try {
    console.log('[Admin Reports] Dismissing report:', reportId, data);
    const response = await api.post(`/admin/reports/${reportId}/dismiss`, data);
    console.log('[Admin Reports] Dismiss result:', response.data);
    return response.data;
  } catch (error) {
    console.error('[Admin Reports] Error dismissing report:', error);
    console.error('[Admin Reports] Error response:', error.response?.data);
    console.error('[Admin Reports] Error status:', error.response?.status);
    const errorMessage =
      error.response?.data?.message ||
      error.message ||
      'Lỗi khi bác bỏ báo cáo';
    throw new Error(errorMessage);
  }
};

/**
 * POST /admin/reports/{reportId}/resolve - Xử lý báo cáo
 * @param {string} reportId - ID report cần resolve
 * @param {Object} data - Request body
 * @param {string} data.resolution - Hành động đã thực hiện
 * @returns {Promise<Object>} Kết quả resolve
 */
export const resolveAdminReport = async (reportId, data) => {
  try {
    console.log('[Admin Reports] Resolving report:', reportId, data);
    const response = await api.post(`/admin/reports/${reportId}/resolve`, data);
    console.log('[Admin Reports] Resolve result:', response.data);
    return response.data;
  } catch (error) {
    console.error('[Admin Reports] Error resolving report:', error);
    console.error('[Admin Reports] Error response:', error.response?.data);
    console.error('[Admin Reports] Error status:', error.response?.status);
    const errorMessage =
      error.response?.data?.message || error.message || 'Lỗi khi xử lý báo cáo';
    throw new Error(errorMessage);
  }
};

export default {
  getAdminReports,
  getAdminReport,
  dismissAdminReport,
  resolveAdminReport,
};
