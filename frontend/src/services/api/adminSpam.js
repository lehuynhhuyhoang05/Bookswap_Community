import api from './config';

/**
 * Admin Spam/Fraud Detection Service
 */

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
 * GET /admin/suspicious-activities - Phát hiện hoạt động đáng ngờ
 * @param {Object} params - Query parameters
 * @param {string} params.type - Loại hoạt động (HIGH_BOOK_CREATION, HIGH_MESSAGE_VOLUME, etc.)
 * @param {number} params.hours - Số giờ gần đây (default: 24)
 * @param {number} params.page - Trang hiện tại
 * @param {number} params.limit - Số items mỗi trang
 * @returns {Promise<Object>} Danh sách users đáng ngờ với severity và chi tiết
 */
export const getSuspiciousActivities = async (params = {}) => {
  try {
    const cleanedParams = cleanParams(params);
    console.log(
      '[Admin Spam Detection] Fetching suspicious activities:',
      cleanedParams,
    );
    const response = await api.get('/admin/suspicious-activities', {
      params: cleanedParams,
    });
    console.log('[Admin Spam Detection] Response:', response.data);
    return response.data;
  } catch (error) {
    console.error('[Admin Spam Detection] Error:', error);
    console.error(
      '[Admin Spam Detection] Error response:',
      error.response?.data,
    );
    throw error;
  }
};

export default {
  getSuspiciousActivities,
};
