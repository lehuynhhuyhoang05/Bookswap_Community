import api from './config';

/**
 * Admin Books Service - Quản lý sách
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

export default {
  getAdminBooks,
  deleteAdminBook,
  permanentDeleteAdminBook,
};
