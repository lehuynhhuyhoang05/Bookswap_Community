import api from './config';

export const reviewsService = {
  /**
   * Lấy thống kê review của member
   */
  async getMemberReviewStats(memberId) {
    try {
      const response = await api.get(`/reviews/member/${memberId}/stats`);
      return response.data;
    } catch (error) {
      // Trả về data mẫu nếu API chưa có
      return {
        member_id: memberId,
        average_rating: 0,
        total_reviews: 0,
        rating_breakdown: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
      };
    }
  },

  /**
   * Lấy danh sách review của member
   */
  async getMemberReviews(memberId, params = {}) {
    try {
      const response = await api.get(`/reviews/member/${memberId}`, { params });
      return response.data;
    } catch (error) {
      // Trả về data mẫu nếu API chưa có
      return {
        data: [],
        meta: {
          page: 1,
          pageSize: 10,
          total: 0,
          totalPages: 0
        }
      };
    }
  },

  /**
   * Tạo review mới
   */
  async createReview(reviewData) {
    try {
      const response = await api.post('/reviews', reviewData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to create review' };
    }
  },

  /**
   * Cập nhật review
   */
  async updateReview(reviewId, updateData) {
    try {
      const response = await api.patch(`/reviews/${reviewId}`, updateData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to update review' };
    }
  },

  /**
   * Xóa review
   */
  async deleteReview(reviewId) {
    try {
      const response = await api.delete(`/reviews/${reviewId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to delete review' };
    }
  }
};