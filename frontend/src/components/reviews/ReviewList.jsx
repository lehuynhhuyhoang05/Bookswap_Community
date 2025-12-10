import React from 'react';
import ReviewCard from './ReviewCard';
import Pagination from '../ui/Pagination';
import LoadingSpinner from '../ui/LoadingSpinner';

const ReviewList = ({ 
  reviews = [],
  currentUserId,
  onEdit,
  onDelete,
  pagination,
  onPageChange,
  loading = false,
  emptyMessage = "No reviews yet."
}) => {
  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!reviews || reviews.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {reviews.map((review) => (
        <ReviewCard
          key={review.review_id}
          review={review}
          currentUserId={currentUserId}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
      
      {pagination && pagination.totalPages > 1 && (
        <div className="flex justify-center mt-6">
          <Pagination
            currentPage={pagination.currentPage}
            totalPages={pagination.totalPages}
            onPageChange={onPageChange}
          />
        </div>
      )}
    </div>
  );
};

export default ReviewList;