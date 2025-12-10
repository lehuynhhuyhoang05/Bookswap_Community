import api from './config';

/**
 * Admin Users Service - Quản lý người dùng
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
 * GET /admin/users - Lấy danh sách người dùng
 * @param {Object} params - Query parameters
 * @param {number} params.page - Trang hiện tại (default: 1)
 * @param {number} params.limit - Số lượng mỗi trang (default: 20)
 * @param {string} params.role - Lọc role (MEMBER, ADMIN, etc.)
 * @param {string} params.status - Lọc trạng thái (ACTIVE, LOCKED, etc.)
 * @param {string} params.search - Tìm kiếm theo email/tên
 * @param {string} params.sortBy - Sắp xếp theo trường (created_at, email, etc.)
 * @param {string} params.sortOrder - Thứ tự sắp xếp (ASC, DESC)
 * @returns {Promise<Array>} Danh sách users
 */
export const getAdminUsers = async (params = {}) => {
  try {
    const cleanedParams = cleanParams(params);
    console.log('[Admin Users] Fetching users with params:', cleanedParams);
    const response = await api.get('/admin/users', { params: cleanedParams });
    console.log('[Admin Users] Response:', response.data);
    return response.data;
  } catch (error) {
    console.error('[Admin Users] Error:', error);
    console.error('[Admin Users] Error response:', error.response?.data);
    console.error('[Admin Users] Error status:', error.response?.status);
    throw error;
  }
};

/**
 * GET /admin/users/{userId} - Xem chi tiết user
 * @param {string} userId - ID user
 * @returns {Promise<Object>} Chi tiết user
 */
export const getAdminUser = async (userId) => {
  try {
    const response = await api.get(`/admin/users/${userId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching admin user:', error);
    throw error;
  }
};

/**
 * DELETE /admin/users/{userId} - Xóa user (soft delete)
 * @param {string} userId - ID user cần xóa
 * @param {Object} data - Request body
 * @param {string} data.reason - Lý do xóa (ví dụ: "Tài khoản giả mạo")
 * @returns {Promise<Object>} Kết quả xóa user
 */
export const deleteAdminUser = async (userId, data) => {
  try {
    console.log('[Admin Users] Deleting user:', userId, 'with data:', data);
    const response = await api.delete(`/admin/users/${userId}`, { data });
    console.log('[Admin Users] Delete response:', response.data);
    return response.data;
  } catch (error) {
    console.error('[Admin Users] Error deleting user:', error);
    console.error('[Admin Users] Error response:', error.response?.data);
    console.error('[Admin Users] Error status:', error.response?.status);
    const errorMessage =
      error.response?.data?.message ||
      error.message ||
      'Lỗi khi xóa người dùng';
    throw new Error(errorMessage);
  }
};

/**
 * POST /admin/users/{userId}/lock - Khóa tài khoản
 * @param {string} userId - ID user cần khóa
 * @param {Object} data - Request body
 * @param {string} data.reason - Lý do khóa (ví dụ: "Vi phạm quy định cộng đồng")
 * @param {number} data.duration - Số ngày khóa
 * @returns {Promise<Object>} Kết quả khóa user
 */
export const lockAdminUser = async (userId, data) => {
  try {
    console.log('[Admin Users] Locking user:', userId, 'with data:', data);
    const response = await api.post(`/admin/users/${userId}/lock`, data);
    console.log('[Admin Users] Lock response:', response.data);
    return response.data;
  } catch (error) {
    console.error('[Admin Users] Error locking user:', error);
    console.error('[Admin Users] Error response:', error.response?.data);
    console.error('[Admin Users] Error status:', error.response?.status);
    const errorMessage =
      error.response?.data?.message ||
      error.message ||
      'Lỗi khi khóa tài khoản';
    throw new Error(errorMessage);
  }
};

/**
 * POST /admin/users/{userId}/unlock - Mở khóa tài khoản
 * @param {string} userId - ID user cần mở khóa
 * @param {Object} data - Request body
 * @param {string} data.reason - Lý do mở khóa (ví dụ: "Người dùng đã khắc phục vi phạm")
 * @returns {Promise<Object>} Kết quả mở khóa user
 */
export const unlockAdminUser = async (userId, data) => {
  try {
    console.log('[Admin Users] Unlocking user:', userId, 'with data:', data);
    const response = await api.post(`/admin/users/${userId}/unlock`, data);
    console.log('[Admin Users] Unlock response:', response.data);
    return response.data;
  } catch (error) {
    console.error('[Admin Users] Error unlocking user:', error);
    console.error('[Admin Users] Error response:', error.response?.data);
    console.error('[Admin Users] Error status:', error.response?.status);
    const errorMessage =
      error.response?.data?.message ||
      error.message ||
      'Lỗi khi mở khóa tài khoản';
    throw new Error(errorMessage);
  }
};

/**
 * PUT /admin/users/{userId}/role - Thay đổi quyền user
 * @param {string} userId - ID user
 * @param {Object} data - Request body
 * @param {string} data.role - Quyền mới (ADMIN, MEMBER, etc.)
 * @param {string} data.reason - Lý do thay đổi (ví dụ: "Promote thành admin")
 * @returns {Promise<Object>} Kết quả thay đổi role
 */
export const updateAdminUserRole = async (userId, data) => {
  try {
    console.log(
      '[Admin Users] Updating user role:',
      userId,
      'with data:',
      data,
    );
    const response = await api.put(`/admin/users/${userId}/role`, data);
    console.log('[Admin Users] Update role response:', response.data);
    return response.data;
  } catch (error) {
    console.error('[Admin Users] Error updating user role:', error);
    console.error('[Admin Users] Error response:', error.response?.data);
    console.error('[Admin Users] Error status:', error.response?.status);
    const errorMessage =
      error.response?.data?.message ||
      error.message ||
      'Lỗi khi thay đổi quyền';
    throw new Error(errorMessage);
  }
};

/**
 * GET /admin/users/{userId}/activities - Xem lịch sử hoạt động
 * @param {string} userId - ID user
 * @param {Object} params - Query parameters
 * @param {number} params.page - Trang hiện tại
 * @param {number} params.limit - Số items
 * @param {string} params.action - Lọc theo loại hành động
 * @param {string} params.startDate - Từ ngày (ISO 8601)
 * @param {string} params.endDate - Đến ngày (ISO 8601)
 * @returns {Promise<Array>} Danh sách log user với pagination
 */
export const getAdminUserActivities = async (userId, params = {}) => {
  try {
    const response = await api.get(`/admin/users/${userId}/activities`, {
      params,
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching admin user activities:', error);
    throw error;
  }
};

/**
 * GET /admin/users/{userId}/activity-stats - Thống kê hoạt động người dùng
 * @param {string} userId - ID user
 * @param {Object} params - Query parameters
 * @param {number} params.days - Số ngày gần đây (1-365, default 30)
 * @returns {Promise<Object>} Số lượng actions theo loại, thống kê daily activity
 */
export const getAdminUserActivityStats = async (userId, params = {}) => {
  try {
    const response = await api.get(`/admin/users/${userId}/activity-stats`, {
      params,
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching admin user activity stats:', error);
    throw error;
  }
};

/**
 * PATCH /admin/users/{userId} - Cập nhật thông tin user (admin)
 * @param {string} userId - ID user cần cập nhật
 * @param {Object} data - Request body
 * @param {string} data.full_name - Tên đầy đủ
 * @param {string} data.email - Email
 * @param {string} data.phone - Số điện thoại
 * @param {string} data.region - Khu vực
 * @param {string} data.bio - Giới thiệu
 * @param {string} data.reason - Lý do cập nhật
 * @returns {Promise<Object>} Kết quả cập nhật
 */
export const updateAdminUserInfo = async (userId, data) => {
  try {
    console.log('[Admin Users] Updating user info:', userId, data);
    const response = await api.patch(`/admin/users/${userId}`, data);
    console.log('[Admin Users] Update response:', response.data);
    return response.data;
  } catch (error) {
    console.error('[Admin Users] Update user error:', error.response?.data || error);
    throw error;
  }
};

export default {
  getAdminUsers,
  getAdminUser,
  deleteAdminUser,
  lockAdminUser,
  unlockAdminUser,
  updateAdminUserRole,
  updateAdminUserInfo,
  getAdminUserActivities,
  getAdminUserActivityStats,
};
