// src/hooks/useReports.js
import { useCallback, useState } from 'react';
import { reportsService } from '../services/api/reports';

/**
 * Custom hook để quản lý Reports API
 *
 * @returns {Object} Hook state và methods
 *
 * Example Usage:
 * ```jsx
 * const { createReport, getMyReports, getReportById, loading, error } = useReports();
 *
 * // Tạo report mới
 * const handleSubmitReport = async () => {
 *   try {
 *     const result = await createReport({
 *       report_type: 'SPAM',
 *       reported_member_id: 'member-123',
 *       description: 'Spam content...'
 *     });
 *     console.log('Report created:', result);
 *   } catch (err) {
 *     console.error('Error:', err);
 *   }
 * };
 *
 * // Lấy danh sách reports
 * const loadReports = async () => {
 *   const data = await getMyReports({ page: 1, limit: 20 });
 *   setReports(data.reports);
 * };
 * ```
 */
export const useReports = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Helper function để gọi API với error handling
   */
  const apiCall = useCallback(async (apiFunction, ...args) => {
    setLoading(true);
    setError(null);
    try {
      console.log(
        `🔄 [USEREPORTS] Calling ${apiFunction?.name || 'anonymous'} with:`,
        args,
      );
      const result = await apiFunction(...args);
      console.log(`✅ [USEREPORTS] ${apiFunction.name} success:`, result);
      return result;
    } catch (err) {
      console.error(
        `❌ [USEREPORTS] ${apiFunction?.name || 'anonymous'} error:`,
        err,
      );
      const errorMessage =
        err.message || `Failed to call ${apiFunction?.name || 'anonymous'}`;
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * 📌 1. Tạo report vi phạm mới
   *
   * @param {Object} reportData - Dữ liệu report
   * @param {string} reportData.report_type - Loại vi phạm
   * @param {string} reportData.reported_member_id - ID thành viên bị báo cáo
   * @param {string} [reportData.reported_item_type] - Loại nội dung
   * @param {string} [reportData.reported_item_id] - ID nội dung
   * @param {string} [reportData.description] - Mô tả chi tiết
   * @returns {Promise<Object>} Response { report_id, status, message, created_at }
   */
  const createReport = useCallback(
    (reportData) => apiCall(reportsService.createReport, reportData),
    [apiCall],
  );

  /**
   * 📌 2. Lấy danh sách reports của mình
   *
   * @param {Object} params - Query parameters
   * @param {number} [params.page=1] - Trang hiện tại
   * @param {number} [params.limit=20] - Số lượng mỗi trang
   * @returns {Promise<Object>} Response { page, limit, total, reports[] }
   */
  const getMyReports = useCallback(
    (params = {}) => apiCall(reportsService.getMyReports, params),
    [apiCall],
  );

  /**
   * 📌 3. Xem chi tiết một report
   *
   * @param {string} reportId - ID của report
   * @returns {Promise<Object>} Report detail
   */
  const getReportById = useCallback(
    (reportId) => apiCall(reportsService.getReportById, reportId),
    [apiCall],
  );

  /**
   * 📌 4. Upload evidence files
   *
   * @param {File[]} files - Array of files to upload
   * @returns {Promise<Object>} { urls: string[], message: string }
   */
  const uploadEvidence = useCallback(
    (files) => apiCall(reportsService.uploadEvidence, files),
    [apiCall],
  );

  /**
   * 🛠️ Helper: Validate report data
   *
   * @param {Object} reportData - Dữ liệu cần validate
   * @returns {Object} { isValid, errors }
   */
  const validateReportData = useCallback((reportData) => {
    return reportsService.validateReportData(reportData);
  }, []);

  /**
   * 🛠️ Helper: Lấy label cho report type
   *
   * @param {string} reportType - Loại report
   * @returns {string} Label tiếng Việt
   */
  const getReportTypeLabel = useCallback((reportType) => {
    return reportsService.getReportTypeLabel(reportType);
  }, []);

  /**
   * 🛠️ Helper: Lấy label cho status
   *
   * @param {string} status - Trạng thái report
   * @returns {string} Label tiếng Việt
   */
  const getStatusLabel = useCallback((status) => {
    return reportsService.getStatusLabel(status);
  }, []);

  return {
    // API Methods
    createReport,
    getMyReports,
    getReportById,
    uploadEvidence,

    // Helper Methods
    validateReportData,
    getReportTypeLabel,
    getStatusLabel,

    // State
    loading,
    error,
  };
};

export default useReports;
