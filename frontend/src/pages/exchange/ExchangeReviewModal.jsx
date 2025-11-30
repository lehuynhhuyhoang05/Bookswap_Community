import { useEffect, useState } from 'react';
import { Button, Modal, Textarea } from '../../components/ui';
import reviewsService from '../../services/api/reviews';

const ExchangeReviewModal = ({
  isOpen,
  onClose,
  exchangeId,
  revieweeId,
  revieweeName,
  onReviewSubmitted,
}) => {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [hoverRating, setHoverRating] = useState(0); // hover stars effect

  // Reset form khi modal mở/đóng
  useEffect(() => {
    if (isOpen) {
      setRating(5);
      setComment('');
      setHoverRating(0);
    }
  }, [isOpen]);

  const handleSubmit = async () => {
    // Validate inputs
    if (!exchangeId || !revieweeId) {
      alert('Thông tin trao đổi hoặc người được đánh giá không hợp lệ.');
      return;
    }

    if (!rating || rating < 1 || rating > 5) {
      alert('Vui lòng chọn số sao hợp lệ (1–5).');
      return;
    }

    // Lấy user hiện tại
    const currentUser = JSON.parse(localStorage.getItem('user'));
    if (!currentUser) {
      alert('Người dùng chưa đăng nhập.');
      return;
    }

    const reviewerId = currentUser.member_id || currentUser.user_id;
    if (!reviewerId) {
      alert('Không tìm thấy ID người đánh giá.');
      return;
    }

    setLoading(true);

    try {
      const payload = {
        exchange_id: exchangeId,
        reviewer_id: reviewerId,
        reviewee_id: revieweeId,
        rating,
        comment: comment.trim() || null,
      };

      console.log('[ReviewModal] Sending payload to API:', payload);

      // Tạo review
      const result = await reviewsService.createReview(payload);
      console.log('[ReviewModal] Review created successfully:', result);

      // Tải lại stats (safe)
      try {
        await reviewsService.getMemberStats(reviewerId);
      } catch (statsError) {
        console.warn(
          '[ReviewModal] Failed to reload stats, ignoring:',
          statsError,
        );
      }

      alert('Đánh giá đã gửi thành công!');

      // Đóng modal trước
      onClose();

      // Delay 1 giây để đảm bảo backend commit transaction
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Reload exchanges list
      if (onReviewSubmitted) {
        await onReviewSubmitted();
      }
    } catch (error) {
      console.error('[ReviewModal] Error creating review:', error);

      // Bắt lỗi an toàn
      const safeMessage =
        error?.response?.data?.message ||
        error?.message ||
        error?.toString() ||
        'Gửi đánh giá thất bại, vui lòng thử lại.';

      alert(`Lỗi: ${safeMessage}`);
    } finally {
      setLoading(false);
    }
  };

  // Render stars với hover effect
  const renderStarRating = () => (
    <div className="flex flex-col items-center space-y-4">
      {revieweeName && (
        <div className="text-center">
          <p className="text-sm text-gray-600">Bạn đang đánh giá</p>
          <p className="font-medium text-gray-900">{revieweeName}</p>
        </div>
      )}

      <div className="text-center">
        <div className="text-4xl font-bold text-yellow-500 mb-2">
          {rating}.0
        </div>
        <p className="text-sm text-gray-600">{getRatingText(rating)}</p>
      </div>

      <div className="flex space-x-2" onMouseLeave={() => setHoverRating(0)}>
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
  );

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
      isOpen={isOpen}
      onClose={loading ? undefined : onClose}
      title="Đánh giá trao đổi sách"
      size="md"
    >
      <div className="space-y-6">
        {renderStarRating()}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Nhận xét chi tiết (tuỳ chọn)
          </label>
          <Textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Chia sẻ trải nghiệm của bạn về cuộc trao đổi này..."
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

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <p className="text-sm text-blue-800">
            <strong>Lưu ý:</strong> Đánh giá này sẽ được hiển thị công khai trên
            hồ sơ của người được đánh giá và không thể chỉnh sửa sau khi gửi.
          </p>
        </div>

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
            {loading ? 'Đang gửi...' : 'Gửi đánh giá'}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default ExchangeReviewModal;
