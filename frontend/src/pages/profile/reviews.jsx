import { useEffect, useState } from 'react';
import Layout from '../../components/layout/Layout';
import {
  Avatar,
  Button,
  Card,
  LoadingSpinner,
  Pagination,
  RatingStars,
} from '../../components/ui';
import { useAuth } from '../../hooks/useAuth';
import { useReviews } from '../../hooks/useReviews';
import { getRatingPercentText } from '../../services/api/reviews';

const ProfileReviews = () => {
  const { user } = useAuth();
  const memberId = user?.member?.member_id || user?.user_id;

  const {
    stats,
    reviews,
    pagination: hookPagination,
    loadingStats,
    loadingReviews,
    error,
    loadReviews,
    loadStats,
  } = useReviews(memberId);

  const [localPagination, setLocalPagination] = useState({
    page: 1,
    pageSize: 10,
  });

  useEffect(() => {
    if (memberId) {
      loadReviews(localPagination.page, localPagination.pageSize);
    }
  }, [memberId, localPagination.page, localPagination.pageSize, loadReviews]);

  useEffect(() => {
    if (memberId) loadStats();
  }, [memberId, loadStats]);

  const handlePageChange = (page) => {
    setLocalPagination((prev) => ({ ...prev, page }));
  };

  const handleRetry = () => {
    loadStats();
    loadReviews(localPagination.page, localPagination.pageSize);
  };

  const safeToFixed = (num, decimals = 1) => {
    if (num === null || num === undefined || num === '' || isNaN(num))
      return '0.0';
    return Number(num).toFixed(decimals);
  };

  if (!memberId) {
    return (
      <Layout>
        <div className="min-h-screen flex flex-col items-center justify-center">
          <LoadingSpinner size="lg" />
          <p className="text-gray-500 mt-4">Đang tải thông tin người dùng...</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-6xl mx-auto px-4">
          {/* Header */}
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Đánh giá</h1>
              <p className="text-gray-600 mt-2">
                Xem đánh giá bạn nhận được từ các thành viên khác
              </p>
            </div>
            <Button variant="outline" onClick={() => window.history.back()}>
              Quay lại
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Stats */}
            <div className="lg:col-span-1">
              <Card className="p-6 sticky top-6">
                {loadingStats ? (
                  <div className="text-center py-4">
                    <LoadingSpinner size="sm" />
                    <p className="text-gray-500 text-sm mt-2">
                      Đang tải thống kê...
                    </p>
                  </div>
                ) : stats ? (
                  <StatsCard stats={stats} safeToFixed={safeToFixed} />
                ) : (
                  <div className="text-center py-4">
                    <p className="text-gray-500 text-sm">
                      Không thể tải thống kê
                    </p>
                    <Button variant="link" size="sm" onClick={handleRetry}>
                      Thử lại
                    </Button>
                  </div>
                )}
              </Card>
            </div>

            {/* Reviews */}
            <div className="lg:col-span-3">
              <Card className="p-6">
                {loadingReviews ? (
                  <div className="flex justify-center py-12">
                    <LoadingSpinner size="lg" text="Đang tải đánh giá..." />
                  </div>
                ) : error ? (
                  <ErrorState message={error} onRetry={handleRetry} />
                ) : reviews.length === 0 ? (
                  <EmptyReviewsState />
                ) : (
                  <>
                    <div className="mb-4 px-2 text-sm text-gray-600">
                      Hiển thị {reviews.length} đánh giá
                    </div>
                    <div className="space-y-4">
                      {reviews.map((review) => (
                        <ReviewCard key={review.review_id} review={review} />
                      ))}
                    </div>
                    {hookPagination.totalPages > 1 && (
                      <div className="mt-8 flex justify-center">
                        <Pagination
                          currentPage={hookPagination.page}
                          totalPages={hookPagination.totalPages || 1}
                          onPageChange={handlePageChange}
                          showInfo
                        />
                      </div>
                    )}
                  </>
                )}
              </Card>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

/* ===================== Components ===================== */
const StatsCard = ({ stats, safeToFixed }) => {
  // Hiển thị phần trăm điểm đánh giá đúng chuẩn
  const displayRatingPercentage = getRatingPercentText(stats?.average_rating);

  // Sử dụng distribution hoặc ratings_count để hiển thị phân bố rating
  const ratingDistribution = stats?.distribution ||
    stats?.ratings_count || { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };

  return (
    <>
      <div className="text-center mb-6">
        <h3 className="font-semibold text-lg text-gray-900">Tổng quan</h3>
        <div className="flex justify-center items-center mt-3 space-x-2">
          <RatingStars
            rating={stats?.average_rating || 0}
            size="lg"
            showValue
          />
          <span className="text-2xl font-bold text-gray-900">
            {safeToFixed(stats?.average_rating)}
          </span>
        </div>
        <p className="text-gray-500 text-sm mt-1">
          {stats?.total_reviews || 0} đánh giá
        </p>
        <p className="text-gray-500 text-sm mt-1">
          Điểm đánh giá: {displayRatingPercentage}
        </p>
      </div>
      <div className="border-t border-gray-200 pt-4">
        <h4 className="font-medium text-sm text-gray-900 mb-3">
          Phân bố đánh giá
        </h4>
        <div className="space-y-2">
          {[5, 4, 3, 2, 1].map((rating) => {
            const count = ratingDistribution[rating] || 0;
            const percentage =
              stats?.total_reviews > 0
                ? (count / stats.total_reviews) * 100
                : 0;
            return (
              <div key={rating} className="flex items-center gap-2">
                <div className="w-10 text-sm text-gray-600 flex items-center">
                  {rating} <span className="text-yellow-500 ml-1">★</span>
                </div>
                <div className="flex-1 bg-gray-200 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-yellow-400 h-2 rounded-full"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <div className="w-8 text-right text-sm text-gray-600 font-medium">
                  {count}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
};

const ReviewCard = ({ review }) => {
  const [expanded, setExpanded] = useState(false);
  const comment = review.comment || '';
  const truncated = comment.length > 200;
  const displayComment =
    !expanded && truncated ? comment.substring(0, 200) + '...' : comment;

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    try {
      return new Date(dateStr).toLocaleDateString('vi-VN');
    } catch {
      return dateStr.slice(0, 10);
    }
  };

  return (
    <Card className="p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start gap-4">
        <Avatar
          src={review.reviewer_avatar}
          alt={review.reviewer_name}
          size="md"
        />
        <div className="flex-1">
          <div className="flex justify-between items-start mb-2">
            <div>
              <h5 className="font-medium text-gray-900">
                {review.reviewer_name || 'Người dùng'}
              </h5>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-gray-500 text-xs">
                  {formatDate(review.created_at)}
                </span>
                {review.is_edited && (
                  <span className="text-gray-400 text-xs italic">
                    (đã chỉnh sửa)
                  </span>
                )}
              </div>
            </div>
            <RatingStars rating={review.rating} size="sm" />
          </div>
          {comment && (
            <>
              <p className="text-gray-700 text-sm leading-relaxed">
                {displayComment}
              </p>
              {truncated && (
                <Button
                  variant="link"
                  size="sm"
                  onClick={() => setExpanded(!expanded)}
                  className="mt-1"
                >
                  {expanded ? 'Thu gọn' : 'Xem thêm'}
                </Button>
              )}
            </>
          )}
        </div>
      </div>
    </Card>
  );
};

const EmptyReviewsState = () => (
  <div className="text-center py-12">
    <h4 className="font-semibold text-xl text-gray-900 mb-2">
      Chưa có đánh giá nào
    </h4>
    <p className="text-gray-500 mb-6 max-w-sm mx-auto">
      Bạn chưa nhận được đánh giá nào từ các thành viên khác.
    </p>
  </div>
);

const ErrorState = ({ message, onRetry }) => (
  <div className="text-center py-12">
    <h4 className="font-semibold text-xl text-gray-900 mb-2">
      Lỗi tải dữ liệu
    </h4>
    <p className="text-gray-500 mb-6">{message}</p>
    <Button onClick={onRetry}>Thử lại</Button>
  </div>
);

export default ProfileReviews; // ok
