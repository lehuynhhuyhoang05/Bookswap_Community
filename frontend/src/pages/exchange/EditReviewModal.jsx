import { useEffect, useState } from 'react';
import { Button, Modal, Textarea } from '../../components/ui';
import reviewsService from '../../services/api/reviews';

const EditReviewModal = ({ review, onClose, onUpdated }) => {
  const [rating, setRating] = useState(review?.rating || 5);
  const [comment, setComment] = useState(review?.comment || '');
  const [loading, setLoading] = useState(false);
  const [hoverRating, setHoverRating] = useState(0);

  useEffect(() => {
    if (review) {
      setRating(review.rating || 5);
      setComment(review.comment || '');
      setHoverRating(0);
    }
  }, [review]);

  const handleSubmit = async () => {
    if (!review?.review_id) {
      alert('ID đánh giá không hợp lệ');
      return;
    }

    if (!rating || rating < 1 || rating > 5) {
      alert('Vui lòng chọn số sao hợp lệ (1–5)');
      return;
    }

    setLoading(true);
    try {
      await reviewsService.updateReview(review.review_id, {
        rating: Number(rating),
        comment: comment.trim() || null,
      });

      alert('Cập nhật đánh giá thành công!');
      onUpdated?.();
      onClose?.();
    } catch (error) {
      console.error('[EditReviewModal] Error updating review:', error);
      const message = error?.message || 'Cập nhật thất bại, vui lòng thử lại';
      alert(`Lỗi: ${message}`);
    } finally {
      setLoading(false);
    }
  };

  const getRatingText = (ratingValue) => {
    const ratingTexts = {
      1: 'Rất không hài lòng',
      2: 'Không hài lòng',
      3: 'Bình thường',
      4: 'Hài lòng',
      5: 'Rất hài lòng',
    };
    return ratingTexts[ratingValue] || '';
  };

  const characterCount = comment.length;
  const maxCharacters = 500;

  return (
    <Modal
      isOpen={!!review}
      onClose={loading ? undefined : onClose}
      title="Chỉnh sửa đánh giá"
      size="md"
    >
      <div className="space-y-6">
        {/* Star Rating */}
        <div className="flex flex-col items-center space-y-4">
          <div className="text-center">
            <div className="text-4xl font-bold text-yellow-500 mb-2">
              {rating}.0
            </div>
            <p className="text-sm text-gray-600">{getRatingText(rating)}</p>
          </div>

          <div
            className="flex space-x-2"
            onMouseLeave={() => setHoverRating(0)}
          >
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                className={`text-4xl transition-transform duration-200 ${
                  star <= (hoverRating || rating)
                    ? 'text-yellow-500 scale-110'
                    : 'text-gray-300'
                } hover:text-yellow-400 hover:scale-110 focus:outline-none`}
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoverRating(star)}
                disabled={loading}
              >
                ★
              </button>
            ))}
          </div>

          <div className="flex justify-between w-full text-xs text-gray-500">
            <span>Rất tệ</span>
            <span>Tạm được</span>
            <span>Rất tốt</span>
          </div>
        </div>

        {/* Comment */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Nhận xét chi tiết (tuỳ chọn)
          </label>
          <Textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Chia sẻ trải nghiệm của bạn..."
            rows={4}
            maxLength={maxCharacters}
            disabled={loading}
            className="resize-none"
          />
          <div className="flex justify-between mt-2">
            <span className="text-xs text-gray-500">
              Gợi ý: Chất lượng sách, thái độ người trao đổi, tốc độ giao
              dịch...
            </span>
            <span
              className={`text-xs ${
                characterCount > maxCharacters - 50
                  ? 'text-orange-500'
                  : 'text-gray-500'
              }`}
            >
              {characterCount}/{maxCharacters}
            </span>
          </div>
        </div>

        {/* Warning */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <p className="text-sm text-blue-800">
            <strong>Lưu ý:</strong> Chỉnh sửa sẽ cập nhật đánh giá của bạn.
          </p>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={loading}
            className="min-w-24"
          >
            Hủy
          </Button>
          <Button
            variant="primary"
            onClick={handleSubmit}
            disabled={loading}
            loading={loading}
            className="min-w-24 bg-blue-600 hover:bg-blue-700"
          >
            {loading ? 'Đang cập nhật...' : 'Cập nhật'}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default EditReviewModal;
