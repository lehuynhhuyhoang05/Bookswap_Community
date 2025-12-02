import api from './config';

/**
 * Admin Exchanges Service - Quản lý giao dịch
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
 * GET /admin/exchanges - Lấy danh sách giao dịch
 * @param {Object} params - Query parameters
 * @param {number} params.page - Trang hiện tại (default: 1)
 * @param {number} params.limit - Số lượng mỗi trang (default: 20)
 * @param {string} params.status - Trạng thái (PENDING, CONFIRMED, COMPLETED, CANCELLED, etc.)
 * @param {string} params.memberAId - Lọc theo member A
 * @param {string} params.memberBId - Lọc theo member B
 * @param {string} params.startDate - Từ ngày (ISO 8601)
 * @param {string} params.endDate - Đến ngày (ISO 8601)
 * @param {string} params.sortBy - Trường sắp xếp (created_at, updated_at, etc.)
 * @param {string} params.sortOrder - Thứ tự sắp xếp (ASC, DESC)
 * @returns {Promise<Array>} Danh sách exchanges
 */
export const getAdminExchanges = async (params = {}) => {
  try {
    const cleanedParams = cleanParams(params);
    console.log('[Admin Exchanges] Fetching with params:', cleanedParams);
    const response = await api.get('/admin/exchanges', {
      params: cleanedParams,
    });
    console.log('[Admin Exchanges] API response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching admin exchanges:', error);
    throw error;
  }
};

/**
 * GET /admin/exchanges/{exchangeId} - Xem chi tiết giao dịch
 * @param {string} exchangeId - ID exchange
 * @returns {Promise<Object>} Chi tiết exchange
 */
export const getAdminExchange = async (exchangeId) => {
  try {
    const response = await api.get(`/admin/exchanges/${exchangeId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching admin exchange:', error);
    throw error;
  }
};

/**
 * POST /admin/exchanges/{exchangeId}/cancel - Hủy giao dịch
 * @param {string} exchangeId - ID exchange cần hủy
 * @param {Object} data - Request body
 * @param {string} data.reason - Lý do hủy (ví dụ: "Exchange bị report vi phạm, hủy theo quyết định admin")
 * @returns {Promise<Object>} Kết quả hủy exchange
 */
export const cancelAdminExchange = async (exchangeId, data) => {
  try {
    console.log(
      '[Admin Exchanges] Cancelling exchange:',
      exchangeId,
      'with data:',
      data,
    );
    const response = await api.post(
      `/admin/exchanges/${exchangeId}/cancel`,
      data,
    );
    console.log('[Admin Exchanges] Cancel response:', response.data);
    return response.data;
  } catch (error) {
    console.error('[Admin Exchanges] Error cancelling exchange:', error);
    console.error('[Admin Exchanges] Error response:', error.response?.data);
    console.error('[Admin Exchanges] Error status:', error.response?.status);
    const errorMessage =
      error.response?.data?.message || error.message || 'Lỗi khi hủy giao dịch';
    throw new Error(errorMessage);
  }
};

/**
 * GET /admin/exchanges/statistics/overview - Thống kê giao dịch tổng quan
 * @returns {Promise<Object>} Thống kê số lượng exchanges theo trạng thái, tỷ lệ thành công, top 10 members
 */
export const getAdminExchangeStatistics = async () => {
  try {
    const response = await api.get('/admin/exchanges/statistics/overview');
    return response.data;
  } catch (error) {
    console.error('Error fetching admin exchange statistics:', error);
    throw error;
  }
};

export default {
  getAdminExchanges,
  getAdminExchange,
  cancelAdminExchange,
  getAdminExchangeStatistics,
};
