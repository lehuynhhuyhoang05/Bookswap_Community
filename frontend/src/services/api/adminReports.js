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
 * 1. Lấy danh sách báo cáo vi phạm
 *
 * Endpoint: GET /admin/reports
 * Mô tả: Xem tất cả báo cáo vi phạm trong hệ thống. Hỗ trợ lọc theo trạng thái, độ ưu tiên, loại vi phạm, người báo cáo, và phân trang.
 *
 * Query Parameters:
 * @param {Object} params - Query parameters
 * @param {number} params.page - Trang hiện tại (default: 1)
 * @param {number} params.limit - Số lượng report mỗi trang (default: 20)
 * @param {string} params.status - Lọc theo trạng thái report (PENDING, IN_REVIEW, RESOLVED, DISMISSED)
 * @param {string} params.priority - Lọc theo độ ưu tiên (LOW, MEDIUM, HIGH, CRITICAL)
 * @param {string} params.type - Lọc theo loại vi phạm (SPAM, ...)
 * @param {string} params.reportedBy - Lọc theo người báo cáo (test-member-alice)
 *
 * Responses:
 * @returns {Promise<Object>} 200 OK – Trả về danh sách reports
 */
export const getAdminReports = async (params = {}) => {
  try {
    const cleanedParams = cleanParams(params);
    const response = await api.get('/admin/reports', { params: cleanedParams });
    return response.data;
  } catch (error) {
    const errorMessage =
      error.response?.data?.message ||
      error.message ||
      'Lỗi khi lấy danh sách báo cáo';
    throw new Error(errorMessage);
  }
};

/**
 * 2. Xem chi tiết 1 báo cáo
 *
 * Endpoint: GET /admin/reports/{reportId}
 * Mô tả: Xem thông tin đầy đủ của 1 report, bao gồm: người báo cáo, đối tượng bị báo cáo, lý do, bằng chứng, và lịch sử trạng thái.
 *
 * Path Parameters:
 * @param {string} reportId - ID của report
 *
 * Responses:
 * @returns {Promise<Object>} 200 OK – Chi tiết report | 404 Not Found – Report không tồn tại
 */
export const getAdminReport = async (reportId) => {
  try {
    const response = await api.get(`/admin/reports/${reportId}`);
    return response.data;
  } catch (error) {
    const errorMessage =
      error.response?.data?.message ||
      error.message ||
      'Lỗi khi lấy chi tiết báo cáo';
    throw new Error(errorMessage);
  }
};

/**
 * 3. Bác bỏ báo cáo (không vi phạm)
 *
 * Endpoint: POST /admin/reports/{reportId}/dismiss
 * Mô tả: Xác nhận report không vi phạm hoặc báo cáo sai. Cần cung cấp lý do.
 *
 * Path Parameters:
 * @param {string} reportId - ID của report
 *
 * Request Body (JSON):
 * @param {Object} data - Request body
 * @param {string} data.reason - "Nội dung không vi phạm quy định"
 *
 * Responses:
 * @returns {Promise<Object>} 200 OK – Bác bỏ report thành công | 404 Not Found – Report không tồn tại
 */
export const dismissAdminReport = async (reportId, data) => {
  try {
    const response = await api.post(`/admin/reports/${reportId}/dismiss`, data);
    return response.data;
  } catch (error) {
    const errorMessage =
      error.response?.data?.message ||
      error.message ||
      'Lỗi khi bác bỏ báo cáo';
    throw new Error(errorMessage);
  }
};

/**
 * 4. Xử lý báo cáo (đã giải quyết)
 *
 * Endpoint: POST /admin/reports/{reportId}/resolve
 * Mô tả: Xác nhận report vi phạm và đã xử lý (ví dụ: khóa user, xóa nội dung...). Cần cung cấp hành động đã thực hiện.
 *
 * Path Parameters:
 * @param {string} reportId - ID của report
 *
 * Request Body (JSON):
 * @param {Object} data - Request body
 * @param {string} data.resolution - "Đã xử lý và xóa nội dung vi phạm. Removed inappropriate book and warned user."
 *
 * Responses:
 * @returns {Promise<Object>} 200 OK – Resolve report thành công | 404 Not Found – Report không tồn tại
 */
export const resolveAdminReport = async (reportId, data) => {
  try {
    const response = await api.post(`/admin/reports/${reportId}/resolve`, data);
    return response.data;
  } catch (error) {
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
