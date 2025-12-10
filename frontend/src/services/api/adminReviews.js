import api from './config';

/**
 * Admin Reviews Service - Quản lý đánh giá
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
 * GET /admin/reviews - Lấy danh sách reviews
 * @param {Object} params - Query parameters
 * @param {number} params.page - Trang hiện tại (default: 1)
 * @param {number} params.limit - Số lượng reviews mỗi trang (default: 20)
 * @param {boolean} params.reported - Chỉ hiện review bị báo cáo
 * @param {number} params.rating - Lọc theo rating (1-5)
 * @returns {Promise<Array>} Danh sách reviews
 */
export const getAdminReviews = async (params = {}) => {
  try {
    const cleanedParams = cleanParams(params);
    const response = await api.get('/admin/reviews', { params: cleanedParams });
    return response.data;
  } catch (error) {
    console.error('Error fetching admin reviews:', error);
    throw error;
  }
};

/**
 * DELETE /admin/reviews/{reviewId} - Xóa review vi phạm
 * @param {string} reviewId - ID review cần xóa
 * @param {Object} data - Request body
 * @param {string} data.reason - Lý do xóa review (ví dụ: "Review spam hoặc xúc phạm")
 * @returns {Promise<Object>} Kết quả xóa review
 */
export const deleteAdminReview = async (reviewId, data) => {
  try {
    console.log(
      '[Admin Reviews] Deleting review:',
      reviewId,
      'with data:',
      data,
    );
    const response = await api.delete(`/admin/reviews/${reviewId}`, { data });
    console.log('[Admin Reviews] Delete response:', response.data);
    return response.data;
  } catch (error) {
    console.error('[Admin Reviews] Error deleting review:', error);
    console.error('[Admin Reviews] Error response:', error.response?.data);
    console.error('[Admin Reviews] Error status:', error.response?.status);
    const errorMessage =
      error.response?.data?.message || error.message || 'Lỗi khi xóa đánh giá';
    throw new Error(errorMessage);
  }
};

export default {
  getAdminReviews,
  deleteAdminReview,
};
