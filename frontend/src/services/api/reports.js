
// src/services/api/reports.js
// API service cho Reports (Violation Reports)
import api from './config';

export const reportsService = {
  /**
   * 📌 1. POST /reports — Tạo report vi phạm (Member Only)
   *
   * @param {Object} reportData - Dữ liệu report
   * @param {string} reportData.report_type - Loại báo cáo (SPAM, INAPPROPRIATE, HARASSMENT, etc.)
   * @param {string} reportData.reported_member_id - ID của thành viên bị report
   * @param {string} [reportData.reported_item_type] - Loại nội dung bị report (BOOK, COMMENT, etc.)
   * @param {string} [reportData.reported_item_id] - ID của nội dung bị report
   * @param {string} [reportData.description] - Mô tả chi tiết lý do report
   *
   * @returns {Promise<Object>} Response data
   * @throws {Object} Error với message
   *
   * Example:
   * ```js
   * const reportData = {
   *   report_type: "SPAM",
   *   reported_member_id: "test-member-bob",
   *   reported_item_type: "BOOK",
   *   reported_item_id: "seed-book-diego-pp",
   *   description: "Người này đăng sách với nội dung spam quảng cáo không liên quan"
   * };
   * const result = await reportsService.createReport(reportData);
   * // Result: { report_id, status: "PENDING", message, created_at }
   * ```
   */
  async createReport(reportData) {
    try {
      const response = await api.post('/reports', reportData);
      return response.data;
    } catch (error) {
      if (error.response?.status === 400) {
        throw {
          message:
            error.response?.data?.message ||
            'Invalid data or cannot report yourself',
        };
      } else if (error.response?.status === 404) {
        throw {
          message:
            error.response?.data?.message ||
            'Reporter or reported member not found',
        };
      }
      throw error.response?.data || { message: 'Failed to create report' };
    }
  },

  /**
   * 📌 2. GET /reports — Lấy danh sách reports của mình
   *
   * @param {Object} params - Query parameters
   * @param {number} [params.page=1] - Trang hiện tại
   * @param {number} [params.limit=20] - Số lượng reports mỗi trang
   *
   * @returns {Promise<Object>} Response với page, limit, total, reports[]
   *
   * Example:
   * ```js
   * const data = await reportsService.getMyReports({ page: 1, limit: 20 });
   * // Result: { page: 1, limit: 20, total: 35, reports: [...] }
   * ```
   */
  async getMyReports(params = {}) {
    try {
      const response = await api.get('/reports', {
        params: {
          page: 1,
          limit: 20,
          ...params,
        },
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch reports' };
    }
  },

  /**
   * 📌 3. GET /reports/{reportId} — Xem chi tiết một report
   *
   * @param {string} reportId - ID của report muốn xem
   *
   * @returns {Promise<Object>} Report detail
   * @throws {Object} Error với message
   *
   * Example:
   * ```js
   * const report = await reportsService.getReportById('report-uuid-123');
   * // Result: { report_id, report_type, reported_member_id, status, ... }
   * ```
   */
  async getReportById(reportId) {
    try {
      const response = await api.get(`/reports/${reportId}`);
      return response.data;
    } catch (error) {
      if (error.response?.status === 404) {
        throw {
          message: 'Report not found or you do not have permission to view it',
        };
      }
      throw (
        error.response?.data || { message: 'Failed to fetch report details' }
      );
    }
  },

  /**
   * 🛠️ Helper: Lấy text mô tả cho report_type
   *
   * @param {string} reportType - Loại report
   * @returns {string} Mô tả tiếng Việt
   */
  getReportTypeLabel(reportType) {
    const labels = {
      SPAM: 'Spam / Quảng cáo',
      INAPPROPRIATE: 'Nội dung không phù hợp',
      HARASSMENT: 'Quấy rối / Đe dọa',
      FRAUD: 'Lừa đảo / Gian lận',
      INAPPROPRIATE_CONTENT: 'Nội dung không phù hợp',
      FAKE_PROFILE: 'Hồ sơ giả mạo',
      OTHER: 'Khác',
    };
    return labels[reportType] || reportType;
  },

  /**
   * 🛠️ Helper: Lấy text mô tả cho status
   *
   * @param {string} status - Trạng thái report
   * @returns {string} Mô tả tiếng Việt
   */
  getStatusLabel(status) {
    const labels = {
      PENDING: 'Đang chờ xử lý',
      IN_REVIEW: 'Đang xem xét',
      RESOLVED: 'Đã xử lý',
      DISMISSED: 'Đã từ chối',
    };
    return labels[status] || status;
  },

  /**
   * 🛠️ Helper: Validate report data trước khi submit
   *
   * @param {Object} reportData - Dữ liệu report cần validate
   * @returns {Object} { isValid: boolean, errors: Object }
   */
  validateReportData(reportData) {
    const errors = {};

    if (!reportData.report_type) {
      errors.report_type = 'Vui lòng chọn loại vi phạm';
    }

    if (!reportData.reported_member_id) {
      errors.reported_member_id = 'Thiếu thông tin thành viên bị báo cáo';
    }

    // Description không bắt buộc nhưng nếu có thì phải >= 10 ký tự
    if (reportData.description && reportData.description.trim().length < 10) {
      errors.description = 'Mô tả phải có ít nhất 10 ký tự';
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors,
    };
  },
};

export default reportsService;
