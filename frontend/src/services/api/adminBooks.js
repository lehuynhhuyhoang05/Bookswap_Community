import api from './config';

/**
 * Admin Books Service - Quản lý sách
 */

// Helper function để remove empty params
const cleanParams = (params) => {
  const cleaned = {};
  Object.keys(params).forEach((key) => {
    const value = params[key];
    // Skip empty strings, null, undefined, and false boolean values
    if (value !== '' && value !== null && value !== undefined && value !== false) {
      cleaned[key] = value;
    }
  });
  return cleaned;
};

/**
 * GET /admin/books - Lấy danh sách sách
 * @param {Object} params - Query parameters
 * @param {number} params.page - Trang hiện tại (default: 1)
 * @param {number} params.limit - Số lượng sách mỗi trang (default: 20)
 * @param {string} params.status - Lọc theo trạng thái sách (AVAILABLE, BORROWED, etc.)
 * @param {boolean} params.reported - Chỉ hiện sách bị báo cáo
 * @param {string} params.search - Tìm kiếm theo tên sách
 * @returns {Promise<Array>} Danh sách sách
 */
export const getAdminBooks = async (params = {}) => {
  try {
    const cleanedParams = cleanParams(params);
    console.log('[Admin Books] Fetching books with params:', cleanedParams);
    const response = await api.get('/admin/books', { params: cleanedParams });
    console.log('[Admin Books] Response:', response.data);
    return response.data;
  } catch (error) {
    console.error('[Admin Books] Error:', error);
    console.error('[Admin Books] Error response:', error.response?.data);
    console.error('[Admin Books] Error status:', error.response?.status);
    throw error;
  }
};

/**
 * DELETE /admin/books/{bookId} - Xóa sách vi phạm (soft delete)
 * @param {string} bookId - ID sách cần xóa
 * @param {Object} data - Request body
 * @param {string} data.reason - Lý do xóa sách
 * @returns {Promise<Object>} Kết quả xóa sách
 */
export const deleteAdminBook = async (bookId, data) => {
  try {
    console.log('[Admin Books] Deleting book:', bookId, 'with data:', data);
    const response = await api.delete(`/admin/books/${bookId}`, { data });
    console.log('[Admin Books] Delete response:', response.data);
    return response.data;
  } catch (error) {
    console.error('[Admin Books] Error deleting book:', error);
    console.error('[Admin Books] Error response:', error.response?.data);
    console.error('[Admin Books] Error status:', error.response?.status);
    const errorMessage =
      error.response?.data?.message || error.message || 'Lỗi khi xóa sách';
    throw new Error(errorMessage);
  }
};

/**
 * Permanently delete book (hard delete)
 */
export const permanentDeleteAdminBook = async (bookId, data) => {
  try {
    console.log(
      '[Admin Books] Permanently deleting book:',
      bookId,
      'with data:',
      data,
    );
    const response = await api.delete(`/admin/books/${bookId}/permanent`, {
      data,
    });
    console.log('[Admin Books] Permanent delete response:', response.data);
    return response.data;
  } catch (error) {
    console.error('[Admin Books] Error permanently deleting book:', error);
    console.error('[Admin Books] Error response:', error.response?.data);
    console.error('[Admin Books] Error status:', error.response?.status);
    const errorMessage =
      error.response?.data?.message ||
      error.message ||
      'Lỗi khi xóa vĩnh viễn sách';
    throw new Error(errorMessage);
  }
};

/**
 * PUT /admin/books/{bookId}/restore - Khôi phục sách đã xóa
 * @param {string} bookId - ID sách cần khôi phục
 * @param {Object} data - Request body
 * @param {string} data.reason - Lý do khôi phục sách
 * @returns {Promise<Object>} Kết quả khôi phục sách
 */
export const restoreAdminBook = async (bookId, data) => {
  try {
    console.log('[Admin Books] Restoring book:', bookId, 'with data:', data);
    const response = await api.put(`/admin/books/${bookId}/restore`, data);
    console.log('[Admin Books] Restore response:', response.data);
    return response.data;
  } catch (error) {
    console.error('[Admin Books] Error restoring book:', error);
    console.error('[Admin Books] Error response:', error.response?.data);
    const errorMessage =
      error.response?.data?.message || error.message || 'Lỗi khi khôi phục sách';
    throw new Error(errorMessage);
  }
};

/**
 * POST /admin/books/batch-remove - Xóa hàng loạt sách
 * @param {Object} data - Request body
 * @param {Array<string>} data.bookIds - Danh sách ID sách cần xóa (max 50)
 * @param {string} data.reason - Lý do xóa
 * @returns {Promise<Object>} Kết quả batch remove
 */
export const batchRemoveAdminBooks = async (data) => {
  try {
    console.log('[Admin Books] Batch removing books:', data);
    const response = await api.post('/admin/books/batch-remove', data);
    console.log('[Admin Books] Batch remove response:', response.data);
    return response.data;
  } catch (error) {
    console.error('[Admin Books] Error batch removing books:', error);
    console.error('[Admin Books] Error response:', error.response?.data);
    const errorMessage =
      error.response?.data?.message || error.message || 'Lỗi khi xóa hàng loạt sách';
    throw new Error(errorMessage);
  }
};

/**
 * GET /admin/books/{bookId} - Xem chi tiết sách
 * @param {string} bookId - ID sách
 * @returns {Promise<Object>} Chi tiết sách với reports và exchange history
 */
export const getAdminBookDetail = async (bookId) => {
  try {
    console.log('[Admin Books] Fetching book detail:', bookId);
    const response = await api.get(`/admin/books/${bookId}`);
    console.log('[Admin Books] Book detail response:', response.data);
    return response.data;
  } catch (error) {
    console.error('[Admin Books] Error fetching book detail:', error);
    console.error('[Admin Books] Error response:', error.response?.data);
    const errorMessage =
      error.response?.data?.message || error.message || 'Lỗi khi lấy chi tiết sách';
    throw new Error(errorMessage);
  }
};

export default {
  getAdminBooks,
  deleteAdminBook,
  permanentDeleteAdminBook,
  restoreAdminBook,
  batchRemoveAdminBooks,
  getAdminBookDetail,
};
