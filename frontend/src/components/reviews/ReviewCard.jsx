import React, { useState } from 'react';
import Card from '../ui/Card';
import RatingStars from '../ui/RatingStars';
import Avatar from '../ui/Avatar';
import Badge from '../ui/Badge';
import { formatDate, formatRelativeTime } from '../../utils/formatters';

const ReviewCard = ({ 
  review, 
  currentUserId, 
  onEdit, 
  onDelete,
  showExchangeInfo = false,
  showActions = true,
  compact = false,
  className = ''
}) => {
  const [expanded, setExpanded] = useState(false);
  const isOwner = currentUserId && (currentUserId === review.reviewer_id);
  
  // Xác định xem có cần hiển thị nút "Xem thêm" không
  const shouldTruncate = review.comment && review.comment.length > 150;
  const displayComment = shouldTruncate && !expanded 
    ? `${review.comment.substring(0, 150)}...` 
    : review.comment;

  // Hàm lấy màu badge dựa trên rating
  const getRatingBadgeVariant = (rating) => {
    if (rating >= 4.5) return 'success';
    if (rating >= 3.5) return 'primary';
    if (rating >= 2.5) return 'warning';
    return 'error';
  };

  // Hàm lấy nhãn cho rating
  const getRatingLabel = (rating) => {
    const labels = {
      5: 'Xuất sắc',
      4: 'Tốt',
      3: 'Trung bình',
      2: 'Kém',
      1: 'Rất kém'
    };
    return labels[Math.round(rating)] || 'Chưa đánh giá';
  };

  if (compact) {
    return (
      <Card className={`p-3 hover:shadow-md transition-shadow ${className}`}>
        <div className="flex items-start space-x-3">
          <Avatar 
            src={review.reviewer_avatar} 
            alt={review.reviewer_name} 
            size="sm"
          />
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2 mb-1">
              <span className="font-medium text-sm text-gray-900 truncate">
                {review.reviewer_name}
              </span>
              <Badge variant={getRatingBadgeVariant(review.rating)} size="sm">
                {review.rating}/5
              </Badge>
            </div>
            <RatingStars rating={review.rating} size="xs" />
            {review.comment && (
              <p className="text-gray-600 text-sm mt-1 line-clamp-2">
                {review.comment}
              </p>
            )}
            <div className="text-xs text-gray-500 mt-1">
              {formatRelativeTime(review.created_at)}
            </div>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className={`p-6 hover:shadow-lg transition-all duration-200 ${className}`}>
      {/* Header với thông tin người đánh giá và rating */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-start space-x-4 flex-1">
          <Avatar 
            src={review.reviewer_avatar} 
            alt={review.reviewer_name} 
            size="md"
            className="flex-shrink-0"
          />
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-3 mb-2">
              <h4 className="font-semibold text-gray-900 truncate">
                {review.reviewer_name}
              </h4>
              
              {/* Badge chủ sở hữu */}
              {isOwner && (
                <Badge variant="outline" size="sm">
                  Đánh giá của bạn
                </Badge>
              )}
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <RatingStars rating={review.rating} size="md" />
                <span className="text-lg font-bold text-gray-900">
                  {review.rating.toFixed(1)}
                </span>
                <Badge variant={getRatingBadgeVariant(review.rating)}>
                  {getRatingLabel(review.rating)}
                </Badge>
              </div>
            </div>
          </div>
        </div>

        {/* Actions và thời gian */}
        <div className="flex flex-col items-end space-y-2 flex-shrink-0">
          <div className="text-sm text-gray-500 text-right">
            <div>{formatDate(review.created_at)}</div>
            <div className="text-xs">{formatRelativeTime(review.created_at)}</div>
          </div>
          
          {showActions && isOwner && (
            <div className="flex space-x-2">
              <button
                onClick={() => onEdit?.(review)}
                className="text-blue-600 hover:text-blue-800 text-sm font-medium px-2 py-1 rounded hover:bg-blue-50 transition-colors"
                title="Chỉnh sửa đánh giá"
              >
                Sửa
              </button>
              <button
                onClick={() => onDelete?.(review.review_id)}
                className="text-red-600 hover:text-red-800 text-sm font-medium px-2 py-1 rounded hover:bg-red-50 transition-colors"
                title="Xóa đánh giá"
              >
                Xóa
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Nội dung đánh giá */}
      {review.comment && (
        <div className="mb-4">
          <p className="text-gray-700 leading-relaxed whitespace-pre-line">
            {displayComment}
          </p>
          {shouldTruncate && (
            <button
              onClick={() => setExpanded(!expanded)}
              className="text-blue-600 hover:text-blue-800 text-sm font-medium mt-2 transition-colors"
            >
              {expanded ? 'Thu gọn' : 'Xem thêm'}
            </button>
          )}
        </div>
      )}

      {/* Thông tin trao đổi (nếu có) */}
      {showExchangeInfo && review.exchange_info && (
        <div className="border-t pt-4">
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <span>📚</span>
            <span>Trao đổi:</span>
            <span className="font-medium text-gray-900">
              {review.exchange_info.book_title}
            </span>
            {review.exchange_info.exchange_id && (
              <Badge variant="outline" size="sm">
                ID: {review.exchange_info.exchange_id}
              </Badge>
            )}
          </div>
        </div>
      )}

      {/* Metadata bổ sung */}
      <div className="border-t pt-3 flex justify-between items-center">
        <div className="text-xs text-gray-500">
          Review ID: {review.review_id}
        </div>
        
        {/* Hiển thị thông tin cập nhật nếu có */}
        {review.updated_at && review.updated_at !== review.created_at && (
          <div className="text-xs text-gray-500">
            Đã chỉnh sửa {formatRelativeTime(review.updated_at)}
          </div>
        )}
      </div>
    </Card>
  );
};

export default ReviewCard;