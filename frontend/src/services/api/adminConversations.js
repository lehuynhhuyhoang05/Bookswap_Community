import api from './config';

/**
 * Admin Conversations & Messages Service - Quản lý cuộc trò chuyện và tin nhắn
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
 * GET /admin/conversations/{conversationId} - Xem chi tiết cuộc trò chuyện
 * @param {string} conversationId - ID conversation
 * @returns {Promise<Object>} Chi tiết conversation với tất cả messages (bao gồm đã xóa)
 */
export const getAdminConversation = async (conversationId) => {
  try {
    const response = await api.get(`/admin/conversations/${conversationId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching admin conversation:', error);
    throw error;
  }
};

/**
 * GET /admin/messages - Lấy danh sách tin nhắn
 * @param {Object} params - Query parameters
 * @param {number} params.page - Trang hiện tại (default: 1)
 * @param {number} params.limit - Số lượng messages mỗi trang (default: 20)
 * @param {string} params.conversationId - Lọc theo conversation
 * @param {string} params.senderId - Lọc theo người gửi
 * @param {boolean} params.deletedOnly - Chỉ hiển thị messages đã xóa
 * @param {string} params.search - Tìm kiếm trong content
 * @returns {Promise<Array>} Danh sách messages
 */
export const getAdminMessages = async (params = {}) => {
  try {
    const cleanedParams = cleanParams(params);
    const response = await api.get('/admin/messages', {
      params: cleanedParams,
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching admin messages:', error);
    throw error;
  }
};

/**
 * DELETE /admin/messages/{messageId} - Xóa tin nhắn vi phạm
 * @param {string} messageId - ID message cần xóa
 * @param {Object} data - Request body
 * @param {string} data.reason - Lý do xóa tin nhắn (ví dụ: "Message chứa nội dung vi phạm, spam quảng cáo")
 * @returns {Promise<Object>} Kết quả xóa message
 */
export const deleteAdminMessage = async (messageId, data) => {
  try {
    console.log(
      '[Admin Messages] Deleting message:',
      messageId,
      'with data:',
      data,
    );
    const response = await api.delete(`/admin/messages/${messageId}`, { data });
    console.log('[Admin Messages] Delete response:', response.data);
    return response.data;
  } catch (error) {
    console.error('[Admin Messages] Error deleting message:', error);
    console.error('[Admin Messages] Error response:', error.response?.data);
    console.error('[Admin Messages] Error status:', error.response?.status);
    const errorMessage =
      error.response?.data?.message || error.message || 'Lỗi khi xóa tin nhắn';
    throw new Error(errorMessage);
  }
};

export default {
  getAdminConversation,
  getAdminMessages,
  deleteAdminMessage,
};
