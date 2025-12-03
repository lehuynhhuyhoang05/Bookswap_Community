import { useState } from 'react';
import { Card, Button, RatingStars, Textarea } from '../ui';
import { X, Star } from 'lucide-react';

/**
 * Modal để tạo hoặc sửa đánh giá
 * @param {boolean} isOpen - Modal có đang mở không
 * @param {function} onClose - Callback khi đóng modal
 * @param {function} onSubmit - Callback khi submit review (reviewData)
 * @param {object} exchange - Thông tin exchange (để hiển thị context)
 * @param {object} reviewee - Thông tin người được đánh giá
 * @param {object} initialData - Dữ liệu review ban đầu (nếu là edit)
 * @param {boolean} loading - Đang submit hay không
 */
const ReviewModal = ({ 
  isOpen, 
  onClose, 
  onSubmit, 
  exchange, 
  reviewee,
  initialData = null,
  loading = false 
}) => {
  const [rating, setRating] = useState(initialData?.rating || 0);
  const [comment, setComment] = useState(initialData?.comment || '');
  const [error, setError] = useState('');

  const isEdit = !!initialData;

  const handleSubmit = () => {
    // Validation
    if (rating === 0) {
      setError('Vui lòng chọn số sao đánh giá');
      return;
    }

    if (comment.trim().length > 2000) {
      setError('Nhận xét không được vượt quá 2000 ký tự');
      return;
    }

    setError('');
    
    const reviewData = {
      exchange_id: exchange.exchange_id,
      reviewee_id: reviewee.member_id,
      rating,
      comment: comment.trim() || undefined
    };

    onSubmit(reviewData);
  };

  const handleClose = () => {
    if (!loading) {
      setRating(0);
      setComment('');
      setError('');
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <Star className="w-6 h-6 text-yellow-400" />
            <h3 className="text-xl font-bold text-gray-900">
              {isEdit ? 'Chỉnh sửa đánh giá' : 'Viết đánh giá'}
            </h3>
          </div>
          <button
            onClick={handleClose}
            disabled={loading}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Exchange Context */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Thông tin giao dịch</h4>
            <div className="space-y-1 text-sm">
              <p className="text-gray-600">
                <span className="font-medium">Người trao đổi:</span> {reviewee.full_name || reviewee.username}
              </p>
              {exchange.requester_book_title && (
                <p className="text-gray-600">
                  <span className="font-medium">Sách của bạn:</span> {exchange.requester_book_title}
                </p>
              )}
              {exchange.owner_book_title && (
                <p className="text-gray-600">
                  <span className="font-medium">Sách nhận được:</span> {exchange.owner_book_title}
                </p>
              )}
            </div>
          </div>

          {/* Rating */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Đánh giá của bạn <span className="text-red-500">*</span>
            </label>
            <div className="flex items-center gap-4">
              <RatingStars 
                rating={rating} 
                size="lg" 
                interactive={!loading}
                onRatingChange={setRating}
              />
              <div className="text-sm text-gray-600">
                {rating === 0 && 'Chưa chọn'}
                {rating === 1 && '⭐ Rất tệ'}
                {rating === 2 && '⭐⭐ Tệ'}
                {rating === 3 && '⭐⭐⭐ Bình thường'}
                {rating === 4 && '⭐⭐⭐⭐ Tốt'}
                {rating === 5 && '⭐⭐⭐⭐⭐ Rất tốt'}
              </div>
            </div>
          </div>

          {/* Comment */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nhận xét (tùy chọn)
            </label>
            <Textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Chia sẻ trải nghiệm trao đổi sách của bạn với thành viên này..."
              rows={5}
              disabled={loading}
              maxLength={2000}
            />
            <div className="flex justify-between items-center mt-1">
              <p className="text-xs text-gray-500">
                Nhận xét của bạn sẽ giúp cộng đồng đánh giá độ tin cậy của thành viên
              </p>
              <span className="text-xs text-gray-500">
                {comment.length}/2000
              </span>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {/* Trust Score Impact */}
          {rating > 0 && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h5 className="text-sm font-medium text-blue-900 mb-2">
                Tác động đến điểm tin cậy
              </h5>
              <div className="text-sm text-blue-700">
                {rating === 5 && '✅ +0.1 điểm (Đánh giá xuất sắc)'}
                {rating === 4 && '✅ +0.05 điểm (Đánh giá tốt)'}
                {rating === 3 && '➖ Không thay đổi (Đánh giá trung bình)'}
                {rating === 2 && '⚠️ -0.05 điểm (Đánh giá kém)'}
                {rating === 1 && '❌ -0.1 điểm (Đánh giá rất kém)'}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex gap-3 p-6 border-t border-gray-200">
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={loading}
            className="flex-1"
          >
            Hủy
          </Button>
          <Button
            variant="primary"
            onClick={handleSubmit}
            disabled={loading || rating === 0}
            className="flex-1"
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Đang gửi...
              </span>
            ) : (
              <span>{isEdit ? 'Cập nhật' : 'Gửi đánh giá'}</span>
            )}
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default ReviewModal;
