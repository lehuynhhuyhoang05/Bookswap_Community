import React, { useState, useEffect } from 'react';
import Button from '../ui/Button';
import RatingStars from '../ui/RatingStars';
import Modal from '../ui/Modal';

const ReviewForm = ({ 
  exchange,
  reviewee,
  onSubmit,
  onCancel,
  initialData = null,
  loading = false
}) => {
  const [rating, setRating] = useState(initialData?.rating || 0);
  const [comment, setComment] = useState(initialData?.comment || '');
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (initialData) {
      setRating(initialData.rating);
      setComment(initialData.comment);
    }
  }, [initialData]);

  const validateForm = () => {
    const newErrors = {};
    
    if (rating < 1 || rating > 5) {
      newErrors.rating = 'Please select a rating between 1 and 5';
    }
    
    if (!comment.trim()) {
      newErrors.comment = 'Comment is required';
    } else if (comment.trim().length < 10) {
      newErrors.comment = 'Comment must be at least 10 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    const reviewData = {
      exchange_id: exchange?.exchange_id,
      reviewee_id: reviewee?.user_id,
      rating,
      comment: comment.trim()
    };

    onSubmit(reviewData);
  };

  const handleRatingChange = (newRating) => {
    setRating(newRating);
    if (errors.rating) {
      setErrors(prev => ({ ...prev, rating: '' }));
    }
  };

  const handleCommentChange = (e) => {
    setComment(e.target.value);
    if (errors.comment) {
      setErrors(prev => ({ ...prev, comment: '' }));
    }
  };

  return (
    <Modal isOpen={true} onClose={onCancel} title={initialData ? 'Edit Review' : 'Write Review'}>
      <form onSubmit={handleSubmit} className="space-y-4">
        {exchange && (
          <div className="bg-gray-50 p-3 rounded-lg">
            <p className="text-sm text-gray-600">
              Reviewing exchange for: <strong>{exchange.book_title}</strong>
            </p>
            <p className="text-sm text-gray-600">
              With: <strong>{reviewee?.username || reviewee?.email}</strong>
            </p>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Rating *
          </label>
          <RatingStars 
            rating={rating} 
            onRatingChange={handleRatingChange}
            editable 
          />
          {errors.rating && (
            <p className="text-red-500 text-sm mt-1">{errors.rating}</p>
          )}
        </div>

        <div>
          <label htmlFor="comment" className="block text-sm font-medium text-gray-700 mb-2">
            Comment *
          </label>
          <textarea
            id="comment"
            rows={4}
            className={`w-full border rounded-md p-2 ${
              errors.comment ? 'border-red-500' : 'border-gray-300'
            }`}
            value={comment}
            onChange={handleCommentChange}
            placeholder="Share your experience with this exchange..."
            maxLength={500}
          />
          {errors.comment && (
            <p className="text-red-500 text-sm mt-1">{errors.comment}</p>
          )}
          <p className="text-xs text-gray-500 mt-1">
            {comment.length}/500 characters
          </p>
        </div>

        <div className="flex justify-end space-x-3 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={loading || rating === 0 || !comment.trim()}
          >
            {loading ? 'Submitting...' : (initialData ? 'Update Review' : 'Submit Review')}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default ReviewForm;