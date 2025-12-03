import api from './config';

export const exchangeService = {
  // 📘 EXCHANGES - GIAO DỊCH TRAO ĐỔI SÁCH
  
  /**
   * ✅ GET /exchanges
   * Lấy danh sách giao dịch của người dùng hiện tại
   */
  async getExchanges(params = {}) {
    try {
      const response = await api.get('/exchanges', { params });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch exchanges' };
    }
  },

  /**
   * ✅ GET /exchanges/{id}
   * Lấy chi tiết giao dịch theo ID
   */
  async getExchangeDetail(id) {
    try {
      const response = await api.get(`/exchanges/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch exchange details' };
    }
  },

  /**
   * ✅ PATCH /exchanges/{id}/confirm
   * Xác nhận hoàn thành giao dịch
   */
  async confirmExchange(id) {
    try {
      const response = await api.patch(`/exchanges/${id}/confirm`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to confirm exchange' };
    }
  },

  /**
   * ✅ PATCH /exchanges/{id}/meeting
   * Cập nhật thông tin lịch hẹn gặp
   */
  async updateMeetingInfo(id, data) {
    try {
      const response = await api.patch(`/exchanges/${id}/meeting`, data);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to update meeting info' };
    }
  },

  /**
   * 🆕 POST /exchanges/{id}/meeting/schedule
   * Đặt lịch hẹn gặp mặt để trao đổi sách
   */
  async scheduleMeeting(id, data) {
    try {
      // Backend expects: meeting_location, meeting_time, meeting_notes, meeting_latitude, meeting_longitude
      const payload = {
        meeting_location: data.meeting_location,
        meeting_time: data.meeting_time,
        meeting_notes: data.meeting_notes || '',
        meeting_latitude: data.meeting_latitude || null,
        meeting_longitude: data.meeting_longitude || null
      };
      
      const response = await api.post(`/exchanges/${id}/meeting/schedule`, payload);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to schedule meeting' };
    }
  },

  /**
   * 🆕 PATCH /exchanges/{id}/meeting/confirm
   * Xác nhận lịch hẹn (member xác nhận tham gia)
   */
  async confirmMeeting(id) {
    try {
      const response = await api.patch(`/exchanges/${id}/meeting/confirm`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to confirm meeting' };
    }
  },

  /**
   * 🆕 PATCH /exchanges/{id}/start
   * Bắt đầu trao đổi (khi cả hai có mặt tại buổi gặp)
   */
  async startExchange(id) {
    try {
      const response = await api.patch(`/exchanges/${id}/start`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to start exchange' };
    }
  },

  /**
   * ✅ PATCH /exchanges/{id}/cancel
   * Hủy giao dịch trao đổi
   */
  async cancelExchange(id, data) {
    try {
      const response = await api.patch(`/exchanges/${id}/cancel`, data);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to cancel exchange' };
    }
  },

  // 📘 EXCHANGE REQUESTS - YÊU CẦU TRAO ĐỔI

  /**
   * 🟦 POST /exchanges/requests
   * Tạo yêu cầu trao đổi mới
   */
  async createExchangeRequest(requestData) {
    try {
      // Data should already be in correct format from form
      const response = await api.post('/exchanges/requests', requestData);
      return response.data;
    } catch (error) {
      console.error('[exchangeService] Create request failed:', error.response?.data || error);
      throw error.response?.data || { message: 'Failed to create exchange request' };
    }
  },

  /**
   * 🟦 GET /exchanges/requests
   * Lấy danh sách yêu cầu trao đổi
   */
  async getExchangeRequests(params = {}) {
    try {
      const response = await api.get('/exchanges/requests', { params });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch exchange requests' };
    }
  },

  /**
   * 🟦 GET /exchanges/requests/{id}
   * Lấy chi tiết yêu cầu trao đổi
   */
  async getExchangeRequestDetail(id) {
    try {
      const response = await api.get(`/exchanges/requests/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch request details' };
    }
  },

  /**
   * 🟦 DELETE /exchanges/requests/{id}
   * Hủy yêu cầu trao đổi
   */
  async cancelExchangeRequest(id) {
    try {
      const response = await api.delete(`/exchanges/requests/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to cancel exchange request' };
    }
  },

  /**
   * 🟦 PATCH /exchanges/requests/{id}/respond
   * Phản hồi yêu cầu trao đổi (chấp nhận/từ chối)
   * @param {string} id - Request ID
   * @param {object} data - { action: 'accept'|'reject', rejection_reason?: string }
   */
  async respondToExchangeRequest(id, data) {
    try {
      const response = await api.patch(`/exchanges/requests/${id}/respond`, data);
      return response.data;
    } catch (error) {
      console.error('[exchangeService] Respond to request failed:', error.response?.data || error);
      throw error.response?.data || { message: 'Failed to respond to exchange request' };
    }
  },

  // 📘 EXCHANGE STATS - THỐNG KÊ

  /**
   * 📊 GET /exchanges/stats/me
   * Lấy thống kê trao đổi của người dùng
   */
  async getExchangeStats() {
    try {
      const response = await api.get('/exchanges/stats/me');
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch exchange stats' };
    }
  },

  // 📘 EXCHANGE SUGGESTIONS - GỢI Ý TRAO ĐỔI

  /**
   * ⭐ GET /exchanges/suggestions
   * Lấy danh sách gợi ý trao đổi
   */
  async getExchangeSuggestions(limit = 20) {
    try {
      const response = await api.get('/exchanges/suggestions', {
        params: { limit }
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch exchange suggestions' };
    }
  },

  /**
   * ⭐ PATCH /exchanges/suggestions/{id}/view
   * Đánh dấu gợi ý đã xem
   */
  async markSuggestionAsViewed(id) {
    try {
      const response = await api.patch(`/exchanges/suggestions/${id}/view`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to mark suggestion as viewed' };
    }
  },

  /**
   * ⭐ POST /exchanges/suggestions/generate
   * Tạo gợi ý trao đổi mới
   */
  async generateExchangeSuggestions() {
    try {
      const response = await api.post('/exchanges/suggestions/generate');
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to generate exchange suggestions' };
    }
  },

  // ========== UTILITY METHODS ==========

  /**
   * Format data để phản hồi request
   * @param {string} action - 'accept' or 'reject'
   * @param {string} reason - Rejection reason (required if action is 'reject')
   */
  formatResponseData(action, reason = '') {
    return {
      action: action,
      rejection_reason: action === 'reject' ? reason : undefined
    };
  }
};