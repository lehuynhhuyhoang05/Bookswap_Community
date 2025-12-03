// src/services/api/reviews.js
import api from './config';

const API_PREFIX = '/api/v1';

export const reviewsService = {
  /**
   * Lấy thống kê review của member
   */
  async getMemberReviewStats(memberId) {
    try {
      const response = await api.get(
        `${API_PREFIX}/reviews/member/${memberId}/stats`
      );
      return response.data;
    } catch (error) {
      // Nếu chưa có review hoặc lỗi -> trả về thống kê rỗng
      return {
        member_id: memberId,
        average_rating: 0,
        total_reviews: 0,
        rating_breakdown: {
          5: 0,
          4: 0,
          3: 0,
          2: 0,
          1: 0,
        },
      };
    }
  },

  /**
   * Lấy danh sách review của member (được nhận / đã cho)
   * Backend trả: { items, total, page, pageSize }
   * FE sẽ nhận: { data, meta }
   */
  async getMemberReviews(memberId, params = {}) {
    try {
      const response = await api.get(
        `${API_PREFIX}/reviews/member/${memberId}`,
        { params }
      );

      const payload = response.data || {};
      const items = payload.items || [];
      const page = payload.page ?? params.page ?? 1;
      const pageSize = payload.pageSize ?? params.pageSize ?? 10;
      const total = payload.total ?? items.length;
      const totalPages = pageSize > 0 ? Math.ceil(total / pageSize) : 1;

      return {
        data: items,
        meta: {
          page,
          pageSize,
          total,
          totalPages,
        },
      };
    } catch (error) {
      // Fallback danh sách rỗng
      const page = params.page || 1;
      const pageSize = params.pageSize || 10;

      return {
        data: [],
        meta: {
          page,
          pageSize,
          total: 0,
          totalPages: 0,
        },
      };
    }
  },

  /**
   * Lấy danh sách review của một exchange
   * Nếu BE trả { items: [...] } thì cũng normalize, nếu trả [] thì vẫn ok
   */
  async getExchangeReviews(exchangeId, params = {}) {
    try {
      const response = await api.get(
        `${API_PREFIX}/reviews/exchange/${exchangeId}`,
        { params }
      );

      const payload = response.data;
      if (Array.isArray(payload)) {
        return { data: payload };
      }

      return {
        data: payload?.items || [],
      };
    } catch (error) {
      return {
        data: [],
      };
    }
  },

  /**
   * Tạo review mới
   */
  async createReview(reviewData) {
    try {
      const response = await api.post(
        `${API_PREFIX}/reviews`,
        reviewData
      );
      return response.data;
    } catch (error) {
      // Ném error body cho UI xử lý
      throw error.response?.data || { message: 'Failed to create review' };
    }
  },

  /**
   * Cập nhật review
   */
  async updateReview(reviewId, updateData) {
    try {
      const response = await api.patch(
        `${API_PREFIX}/reviews/${reviewId}`,
        updateData
      );
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
      const response = await api.delete(
        `${API_PREFIX}/reviews/${reviewId}`
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to delete review' };
    }
  },
};
