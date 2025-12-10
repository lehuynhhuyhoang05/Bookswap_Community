// Helper functions cho reviews

// Format rating hiển thị
export const formatRating = (rating) => {
  return parseFloat(rating).toFixed(1);
};

// Lấy text mô tả cho rating
export const getRatingText = (rating) => {
  const numRating = parseInt(rating);
  switch (numRating) {
    case 5:
      return 'Tuyệt vời';
    case 4:
      return 'Tốt';
    case 3:
      return 'Bình thường';
    case 2:
      return 'Không hài lòng';
    case 1:
      return 'Rất tệ';
    default:
      return 'Chưa có đánh giá';
  }
};

// Lấy màu cho rating
export const getRatingColor = (rating) => {
  const numRating = parseInt(rating);
  switch (numRating) {
    case 5:
      return '#22c55e'; // green
    case 4:
      return '#84cc16'; // lime
    case 3:
      return '#eab308'; // yellow
    case 2:
      return '#f97316'; // orange
    case 1:
      return '#ef4444'; // red
    default:
      return '#6b7280'; // gray
  }
};

// Validate review data trước khi gửi
export const validateReviewData = (reviewData) => {
  const errors = [];

  if (!reviewData.exchange_id) {
    errors.push('Exchange ID là bắt buộc');
  }

  if (!reviewData.reviewee_id) {
    errors.push('Reviewee ID là bắt buộc');
  }

  if (!reviewData.rating) {
    errors.push('Rating là bắt buộc');
  } else if (reviewData.rating < 1 || reviewData.rating > 5) {
    errors.push('Rating phải từ 1 đến 5');
  }

  if (reviewData.comment && reviewData.comment.length > 500) {
    errors.push('Comment không được vượt quá 500 ký tự');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

// Tính điểm trust score từ rating
export const calculateTrustScoreFromRating = (rating) => {
  // Chuyển đổi rating 1-5 sang trust score 0-1
  // Có thể customize công thức theo nhu cầu
  const baseScore = (rating - 1) / 4; // Chuyển 1-5 thành 0-1
  return Math.min(1, Math.max(0, baseScore));
};

// Export tất cả utility functions
export default {
  formatRating,
  getRatingText,
  getRatingColor,
  validateReviewData,
  calculateTrustScoreFromRating
};