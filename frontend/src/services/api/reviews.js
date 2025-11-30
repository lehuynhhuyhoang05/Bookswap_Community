// =========================
//   UI HELPER
// =========================
/**
 * Chuyển average_rating thành chuỗi phần trăm hợp lý cho UI
 * @param {number} average_rating
 * @returns {string}
 */
export function getRatingPercentText(average_rating) {
  const avg = Number(average_rating);
  if (!avg || avg <= 0) return 'Chưa có đánh giá';
  return `${((avg / 5) * 100).toFixed(1)}%`;
}
import api from './config';

/* =========================
        CONSTANTS
========================= */
const REVIEW_CONSTRAINTS = {
  RATING: { MIN: 1, MAX: 5 },
  COMMENT: { MAX_LENGTH: 500 },
  PAGINATION: { DEFAULT_PAGE: 1, DEFAULT_PAGE_SIZE: 20, MAX_PAGE_SIZE: 100 },
};

const ERROR_MESSAGES = {
  REQUIRED_FIELDS: 'Thiếu các trường bắt buộc',
  INVALID_RATING: 'Rating phải là số nguyên từ 1 đến 5',
  COMMENT_TOO_LONG: `Comment không được vượt quá ${REVIEW_CONSTRAINTS.COMMENT.MAX_LENGTH} ký tự`,
  INVALID_REVIEW_ID: 'Review ID không hợp lệ',
  INVALID_EXCHANGE_ID: 'Exchange ID không hợp lệ',
  INVALID_MEMBER_ID: 'Member ID không hợp lệ',
  NO_FIELDS_TO_UPDATE: 'Không có trường nào để cập nhật',
  INVALID_PAGINATION: 'Tham số phân trang không hợp lệ',
};

/* =========================
        VALIDATION UTILS
========================= */
const validationUtils = {
  isUUID: (id) =>
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id),

  isValidRating: (rating) => {
    const r = Number(rating);
    return (
      Number.isInteger(r) &&
      r >= REVIEW_CONSTRAINTS.RATING.MIN &&
      r <= REVIEW_CONSTRAINTS.RATING.MAX
    );
  },

  isValidComment: (comment) => {
    return (
      typeof comment === 'string' &&
      comment.length <= REVIEW_CONSTRAINTS.COMMENT.MAX_LENGTH
    );
  },

  isValidPagination: (page, pageSize) => {
    const p = Number(page);
    const ps = Number(pageSize);
    return (
      Number.isInteger(p) &&
      p > 0 &&
      Number.isInteger(ps) &&
      ps > 0 &&
      ps <= REVIEW_CONSTRAINTS.PAGINATION.MAX_PAGE_SIZE
    );
  },

  validateIds: (...ids) => {
    for (const id of ids) {
      if (!id || typeof id !== 'string') return false;
      if (!validationUtils.isUUID(id)) return false;
    }
    return true;
  },
};

/* =========================
        ERROR HANDLER
========================= */
class ReviewError extends Error {
  constructor(message, code = 'REVIEW_ERROR', details = null) {
    super(message);
    this.name = 'ReviewError';
    this.code = code;
    this.details = details;
    this.timestamp = new Date().toISOString();
  }
}

const errorHandler = {
  handleApiError: (error, context) => {
    console.error(`Error in ${context}:`, error);

    if (!error.response) {
      throw new ReviewError('Lỗi kết nối mạng', 'NETWORK_ERROR');
    }

    const status = error.response?.status;
    const message = error.response?.data?.message || error.message;

    switch (status) {
      case 400:
        throw new ReviewError(
          message || 'Dữ liệu không hợp lệ',
          'VALIDATION_ERROR',
          error.response.data,
        );
      case 401:
        throw new ReviewError('Không có quyền truy cập', 'UNAUTHORIZED');
      case 403:
        throw new ReviewError(
          'Không được phép thực hiện hành động này',
          'FORBIDDEN',
        );
      case 404:
        throw new ReviewError('Không tìm thấy dữ liệu', 'NOT_FOUND');
      case 409:
        throw new ReviewError(
          'Xung đột dữ liệu',
          'CONFLICT',
          error.response.data,
        );
      case 422:
        throw new ReviewError(
          'Dữ liệu không thể xử lý',
          'UNPROCESSABLE_ENTITY',
          error.response.data,
        );
      case 429:
        throw new ReviewError('Quá nhiều yêu cầu', 'RATE_LIMIT_EXCEEDED');
      case 500:
        throw new ReviewError('Lỗi máy chủ', 'SERVER_ERROR');
      default:
        throw new ReviewError(message || 'Lỗi không xác định', 'UNKNOWN_ERROR');
    }
  },
};

/* =========================
        REVIEWS SERVICE
========================= */
const reviewsService = {
  async createReview({ exchange_id, reviewee_id, rating, comment = '' }) {
    if (!exchange_id || !reviewee_id || rating === undefined) {
      throw new ReviewError(
        ERROR_MESSAGES.REQUIRED_FIELDS,
        'MISSING_REQUIRED_FIELDS',
        {
          missing: [
            !exchange_id && 'exchange_id',
            !reviewee_id && 'reviewee_id',
            rating === undefined && 'rating',
          ].filter(Boolean),
        },
      );
    }

    if (!validationUtils.validateIds(exchange_id, reviewee_id)) {
      throw new ReviewError('ID không hợp lệ', 'INVALID_ID_FORMAT');
    }

    if (!validationUtils.isValidRating(rating)) {
      throw new ReviewError(ERROR_MESSAGES.INVALID_RATING, 'INVALID_RATING', {
        received: rating,
        expected: `${REVIEW_CONSTRAINTS.RATING.MIN}-${REVIEW_CONSTRAINTS.RATING.MAX}`,
      });
    }

    if (comment && !validationUtils.isValidComment(comment)) {
      throw new ReviewError(
        ERROR_MESSAGES.COMMENT_TOO_LONG,
        'COMMENT_TOO_LONG',
        {
          maxLength: REVIEW_CONSTRAINTS.COMMENT.MAX_LENGTH,
          currentLength: comment.length,
        },
      );
    }

    try {
      const response = await api.post('/api/v1/reviews', {
        exchange_id,
        reviewee_id,
        rating: Number(rating),
        comment: comment.trim(),
      });

      return {
        success: true,
        data: response.data,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      return errorHandler.handleApiError(error, 'createReview');
    }
  },

  async updateReview(reviewId, { rating, comment } = {}) {
    if (!reviewId || !validationUtils.isUUID(reviewId)) {
      throw new ReviewError(
        ERROR_MESSAGES.INVALID_REVIEW_ID,
        'INVALID_REVIEW_ID',
      );
    }

    const updates = {};
    const errors = [];

    if (rating !== undefined) {
      if (!validationUtils.isValidRating(rating)) {
        errors.push({
          field: 'rating',
          message: ERROR_MESSAGES.INVALID_RATING,
          received: rating,
        });
      } else updates.rating = Number(rating);
    }

    if (comment !== undefined) {
      if (!validationUtils.isValidComment(comment)) {
        errors.push({
          field: 'comment',
          message: ERROR_MESSAGES.COMMENT_TOO_LONG,
          receivedLength: comment.length,
          maxLength: REVIEW_CONSTRAINTS.COMMENT.MAX_LENGTH,
        });
      } else updates.comment = comment.trim();
    }

    if (errors.length > 0) {
      throw new ReviewError(
        'Dữ liệu cập nhật không hợp lệ',
        'UPDATE_VALIDATION_ERROR',
        { errors },
      );
    }

    if (Object.keys(updates).length === 0) {
      throw new ReviewError(
        ERROR_MESSAGES.NO_FIELDS_TO_UPDATE,
        'NO_UPDATES_PROVIDED',
      );
    }

    try {
      const response = await api.patch(`/api/v1/reviews/${reviewId}`, updates);
      return {
        success: true,
        data: response.data,
        timestamp: new Date().toISOString(),
        updatedFields: Object.keys(updates),
      };
    } catch (error) {
      return errorHandler.handleApiError(error, 'updateReview');
    }
  },

  async deleteReview(reviewId) {
    if (!reviewId || !validationUtils.isUUID(reviewId)) {
      throw new ReviewError(
        ERROR_MESSAGES.INVALID_REVIEW_ID,
        'INVALID_REVIEW_ID',
      );
    }

    try {
      const response = await api.delete(`/api/v1/reviews/${reviewId}`);
      return {
        success: true,
        data: response.data,
        timestamp: new Date().toISOString(),
        deletedReviewId: reviewId,
      };
    } catch (error) {
      return errorHandler.handleApiError(error, 'deleteReview');
    }
  },

  async getReviewsByExchange(exchangeId) {
    if (!exchangeId || !validationUtils.isUUID(exchangeId)) {
      throw new ReviewError(
        ERROR_MESSAGES.INVALID_EXCHANGE_ID,
        'INVALID_EXCHANGE_ID',
      );
    }
    try {
      const response = await api.get(`/api/v1/reviews/exchange/${exchangeId}`);
      // Đảm bảo trả về đúng cấu trúc backend
      return { success: true, data: response.data };
    } catch (error) {
      if (error?.response?.status === 404) {
        return {
          success: true,
          data: {
            items: [],
            total: 0,
            note: 'Chưa có đánh giá cho giao dịch này',
          },
        };
      }
      return errorHandler.handleApiError(error, 'getReviewsByExchange');
    }
  },

  async getReviewsByMember(memberId, params = {}) {
    if (!memberId || !validationUtils.isUUID(memberId)) {
      throw new ReviewError(
        ERROR_MESSAGES.INVALID_MEMBER_ID,
        'INVALID_MEMBER_ID',
      );
    }
    const page = Math.max(
      1,
      Number(params.page) || REVIEW_CONSTRAINTS.PAGINATION.DEFAULT_PAGE,
    );
    const pageSize = Math.min(
      Math.max(
        1,
        Number(params.pageSize) ||
          REVIEW_CONSTRAINTS.PAGINATION.DEFAULT_PAGE_SIZE,
      ),
      REVIEW_CONSTRAINTS.PAGINATION.MAX_PAGE_SIZE,
    );
    if (!validationUtils.isValidPagination(page, pageSize)) {
      throw new ReviewError(
        ERROR_MESSAGES.INVALID_PAGINATION,
        'INVALID_PAGINATION',
        {
          page,
          pageSize,
          maxPageSize: REVIEW_CONSTRAINTS.PAGINATION.MAX_PAGE_SIZE,
        },
      );
    }
    try {
      const response = await api.get(`/api/v1/reviews/member/${memberId}`, {
        params: { page, pageSize },
      });
      return { success: true, data: response.data };
    } catch (error) {
      if (error?.response?.status === 404) {
        return {
          success: true,
          data: {
            items: [],
            total: 0,
            note: 'Thành viên chưa nhận được đánh giá nào',
          },
        };
      }
      return errorHandler.handleApiError(error, 'getReviewsByMember');
    }
  },

  async getReviewStatsByMember(memberId) {
    if (!memberId || !validationUtils.isUUID(memberId)) {
      throw new ReviewError(
        ERROR_MESSAGES.INVALID_MEMBER_ID,
        'INVALID_MEMBER_ID',
      );
    }
    try {
      const response = await api.get(
        `/api/v1/reviews/member/${memberId}/stats`,
      );
      return { success: true, data: response.data };
    } catch (error) {
      if (error?.response?.status === 404) {
        return {
          success: true,
          data: {
            total_reviews: 0,
            average_rating: 0,
            trust_score: 0,
            note: 'Chưa có thống kê đánh giá cho thành viên này',
          },
        };
      }
      return errorHandler.handleApiError(error, 'getReviewStatsByMember');
    }
  },
  // Alias giữ lại cho code cũ
  getExchangeReviews(...args) {
    return this.getReviewsByExchange(...args);
  },
  getMemberReviews(...args) {
    return this.getReviewsByMember(...args);
  },
  getMemberStats(...args) {
    return this.getReviewStatsByMember(...args);
  },

  calculateRatingDistribution(ratingsCount, totalReviews) {
    if (totalReviews === 0) return { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    return {
      5: Math.round((ratingsCount[5] / totalReviews) * 100),
      4: Math.round((ratingsCount[4] / totalReviews) * 100),
      3: Math.round((ratingsCount[3] / totalReviews) * 100),
      2: Math.round((ratingsCount[2] / totalReviews) * 100),
      1: Math.round((ratingsCount[1] / totalReviews) * 100),
    };
  },

  async checkUserReviewForExchange(exchangeId, userId) {
    if (!exchangeId || !userId)
      throw new ReviewError('Thiếu exchangeId hoặc userId', 'MISSING_PARAMS');
    try {
      const result = await this.getExchangeReviews(exchangeId);
      const userReview = result.data.reviews.find(
        (r) => r.reviewer_id && String(r.reviewer_id) === String(userId),
      );
      return {
        success: true,
        data: { has_reviewed: !!userReview, review: userReview || null },
      };
    } catch (error) {
      return errorHandler.handleApiError(error, 'checkUserReviewForExchange');
    }
  },

  async fetchAllMemberReviews(memberId) {
    if (!memberId || !validationUtils.isUUID(memberId))
      throw new ReviewError(
        ERROR_MESSAGES.INVALID_MEMBER_ID,
        'INVALID_MEMBER_ID',
      );

    const allReviews = [];
    let page = 1;
    const pageSize = 100;
    const maxPages = 10;

    try {
      while (page <= maxPages) {
        const result = await this.getMemberReviews(memberId, {
          page,
          pageSize,
        });
        if (!result.success) break;
        const { items, pagination } = result.data;
        if (!items || items.length === 0) break;
        allReviews.push(...items);
        if (allReviews.length >= pagination.total || !pagination.hasNext) break;
        page++;
      }
      return {
        success: true,
        data: {
          member_id: memberId,
          items: allReviews,
          total: allReviews.length,
          retrieved_at: new Date().toISOString(),
        },
      };
    } catch (error) {
      return errorHandler.handleApiError(error, 'fetchAllMemberReviews');
    }
  },

  async getReceivedReviews(memberId, params = {}) {
    return this.getMemberReviews(memberId, params);
  },
  async getGivenReviews(memberId, params = {}) {
    return {
      success: true,
      data: {
        member_id: memberId,
        items: [],
        pagination: {
          page: params.page || 1,
          pageSize: params.pageSize || 20,
          total: 0,
          totalPages: 0,
          hasNext: false,
          hasPrev: false,
        },
        note: 'API endpoint cho reviews đã viết chưa được hỗ trợ',
      },
    };
  },
};

/* =========================
        NORMALIZE DATA
========================= */
export const normalizeReviewData = (review) => {
  if (!review || typeof review !== 'object') return null;
  const rating = Math.max(1, Math.min(5, Number(review.rating || 0)));
  const createdAt = review.created_at || review.createdAt || null;
  const updatedAt = review.updated_at || review.updatedAt || createdAt;

  return {
    id: review.id || review.review_id || null,
    exchange_id: review.exchange_id || review.exchangeId || null,
    reviewee_id: review.reviewee_id || review.revieweeId || null,
    reviewer_id: review.reviewer_id || review.reviewerId || null,
    rating,
    comment: review.comment || review.text || '',
    created_at: createdAt,
    updated_at: updatedAt,
    is_edited: !!(createdAt && updatedAt && createdAt !== updatedAt),
    rating_percentage: (rating / 5) * 100,
    rating_stars: '★'.repeat(rating) + '☆'.repeat(5 - rating),
    reviewer_name: review.reviewer_name || review.reviewerName || null,
    reviewer_avatar: review.reviewer_avatar || review.reviewerAvatar || null,
    reviewee_name: review.reviewee_name || review.revieweeName || null,
    reviewee_avatar: review.reviewee_avatar || review.revieweeAvatar || null,
    _normalized: true,
    _normalized_at: new Date().toISOString(),
  };
};

export const normalizeReviewsList = (reviews) => {
  if (!Array.isArray(reviews)) return [];
  return reviews
    .map(normalizeReviewData)
    .filter((r) => r !== null)
    .sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));
};

/* =========================
        EXPORT UTILS
========================= */
export {
  ERROR_MESSAGES,
  REVIEW_CONSTRAINTS,
  ReviewError,
  validationUtils as reviewValidationUtils,
};
export default reviewsService;
