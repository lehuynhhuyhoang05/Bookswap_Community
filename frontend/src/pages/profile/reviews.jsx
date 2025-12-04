import { useState, useEffect, useMemo, useCallback } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useReviews } from '../../hooks/useReviews';
import { reviewsService } from '../../services/api/reviews';
import { Card, Button, RatingStars, Avatar, Pagination, LoadingSpinner, Tabs, Badge, Modal } from '../../components/ui';
import Layout from '../../components/layout/Layout';
import EditReviewModal from '../exchange/EditReviewModal';

const ProfileReviews = () => {
  const { user } = useAuth();
  // member_id is nested in user.member object from /auth/me API
  const memberId = user?.member?.member_id || user?.member_id || user?.user_id;
  
  // Tab state: 'received' | 'given'
  const [activeTab, setActiveTab] = useState('received');
  
  // Given reviews (reviews written by current user)
  const [givenReviews, setGivenReviews] = useState([]);
  const [givenPagination, setGivenPagination] = useState({
    page: 1,
    pageSize: 10,
    totalPages: 1,
    total: 0,
  });
  const [loadingGiven, setLoadingGiven] = useState(false);
  
  // Edit/Delete modal state
  const [editingReview, setEditingReview] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [deleting, setDeleting] = useState(false);
  
  // Use hook for received reviews
  const { 
    stats, 
    reviews: receivedReviews, 
    pagination: receivedPagination, 
    loadingReviews: loadingReceived, 
    loadReviews: loadReceivedReviews,
    loadStats,
    refresh,
    error 
  } = useReviews(memberId);

  // Tabs configuration
  const tabs = [
    { id: 'received', name: 'Đánh giá nhận được', count: stats?.total_reviews || 0 },
    { id: 'given', name: 'Đánh giá đã viết', count: givenPagination.total || 0 },
  ];

  // Load reviews written by current user
  const loadGivenReviews = useCallback(async (page = 1) => {
    if (!memberId) return;
    setLoadingGiven(true);
    try {
      const response = await reviewsService.getReviewsByReviewer(memberId, { page, pageSize: 10 });
      const data = response.data;
      setGivenReviews(data.items || []);
      setGivenPagination({
        page: data.pagination?.page || page,
        pageSize: data.pagination?.pageSize || 10,
        totalPages: data.pagination?.totalPages || 1,
        total: data.pagination?.total || data.items?.length || 0,
      });
    } catch (err) {
      console.error('Error loading given reviews:', err);
      setGivenReviews([]);
    } finally {
      setLoadingGiven(false);
    }
  }, [memberId]);

  // Initial load
  useEffect(() => {
    if (memberId) {
      loadGivenReviews(1);
    }
  }, [memberId, loadGivenReviews]);

  // Calculate rating distribution for sidebar
  const getRatingDistribution = () => {
    const totalReviews = stats?.total_reviews || 0;
    const ratingsCount = stats?.ratings_count || stats?.distribution || { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    
    return [5, 4, 3, 2, 1].map((rating) => {
      const count = ratingsCount[rating] || 0;
      const percentage = totalReviews > 0 ? (count / totalReviews) * 100 : 0;
      return { rating, count, percentage };
    });
  };

  // Handle page change
  const handlePageChange = (newPage) => {
    if (activeTab === 'received') {
      loadReceivedReviews(newPage);
    } else {
      loadGivenReviews(newPage);
    }
  };

  // Handle delete review
  const handleDeleteReview = async () => {
    if (!deleteConfirm) return;
    
    setDeleting(true);
    try {
      await reviewsService.deleteReview(deleteConfirm.review_id);
      setDeleteConfirm(null);
      // Refresh data
      await loadGivenReviews(givenPagination.page);
      await loadStats();
      alert('Đã xóa đánh giá thành công!');
    } catch (err) {
      console.error('Error deleting review:', err);
      alert('Lỗi khi xóa đánh giá: ' + (err?.message || 'Vui lòng thử lại'));
    } finally {
      setDeleting(false);
    }
  };

  // Handle review updated (from EditReviewModal)
  const handleReviewUpdated = async () => {
    await loadGivenReviews(givenPagination.page);
    await loadStats();
  };

  // Get current tab data
  const currentReviews = activeTab === 'received' ? receivedReviews : givenReviews;
  const currentPagination = activeTab === 'received' ? receivedPagination : givenPagination;
  const loading = activeTab === 'received' ? loadingReceived : loadingGiven;

  if (!user) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <LoadingSpinner size="lg" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Đánh giá</h1>
            <p className="text-gray-600 mt-2">Quản lý và xem đánh giá từ các thành viên</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Sidebar - Review Stats */}
            <div className="lg:col-span-1">
              <Card className="p-6">
                <div className="text-center mb-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Điểm đánh giá</h3>
                  <div className="flex items-center justify-center space-x-2 mb-2">
                    <RatingStars rating={stats?.average_rating || 0} size="lg" />
                    <span className="text-2xl font-bold text-gray-900">
                      {stats?.average_rating?.toFixed(1) || '0.0'}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500">
                    {stats?.total_reviews || 0} đánh giá
                  </p>
                </div>

                {/* Rating Distribution */}
                <div className="space-y-3">
                  <h4 className="text-sm font-medium text-gray-900">Phân bố đánh giá</h4>
                  {getRatingDistribution().map((item) => (
                    <div key={item.rating} className="flex items-center space-x-2">
                      <div className="flex items-center space-x-1 w-16">
                        <span className="text-sm text-gray-600">{item.rating}</span>
                        <RatingStars rating={1} size="sm" />
                      </div>
                      <div className="flex-1">
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-yellow-400 h-2 rounded-full"
                            style={{ width: `${item.percentage}%` }}
                          />
                        </div>
                      </div>
                      <span className="text-sm text-gray-600 w-8 text-right">
                        {item.count}
                      </span>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Quick Stats */}
              <Card className="p-6 mt-6">
                <h4 className="text-sm font-medium text-gray-900 mb-4">Thống kê nhanh</h4>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Đánh giá nhận được</span>
                    <Badge variant="primary">{stats?.total_reviews || 0}</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Đánh giá đã viết</span>
                    <Badge variant="secondary">{givenPagination.total || 0}</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Điểm trung bình</span>
                    <Badge variant="success">{stats?.average_rating?.toFixed(1) || '0.0'}</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">5 sao</span>
                    <Badge>{stats?.ratings_count?.[5] || stats?.distribution?.[5] || 0}</Badge>
                  </div>
                </div>
              </Card>
            </div>

            {/* Main Content */}
            <div className="lg:col-span-3">
              <Card className="p-6">
                <Tabs 
                  tabs={tabs} 
                  activeTab={activeTab} 
                  onTabChange={(tabId) => setActiveTab(tabId)}
                />

                <div className="mt-6">
                  {loading ? (
                    <div className="flex justify-center py-8">
                      <LoadingSpinner />
                    </div>
                  ) : currentReviews.length === 0 ? (
                    <div className="text-center py-12">
                      <div className="text-gray-400 mb-4">
                        <svg className="mx-auto h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                        </svg>
                      </div>
                      <h4 className="text-lg font-medium text-gray-900 mb-2">
                        {activeTab === 'received' ? 'Chưa có đánh giá' : 'Chưa đánh giá ai'}
                      </h4>
                      <p className="text-gray-500 mb-4">
                        {activeTab === 'received' 
                          ? 'Bạn chưa có đánh giá nào từ các thành viên khác.' 
                          : 'Bạn chưa viết đánh giá nào cho thành viên khác.'
                        }
                      </p>
                    </div>
                  ) : (
                    <>
                      <div className="space-y-4">
                        {currentReviews.map((review) => (
                          <ReviewCard 
                            key={review.review_id} 
                            review={review} 
                            isGiven={activeTab === 'given'}
                            onEdit={() => setEditingReview(review)}
                            onDelete={() => setDeleteConfirm(review)}
                          />
                        ))}
                      </div>

                      {currentPagination.totalPages > 1 && (
                        <div className="mt-6">
                          <Pagination
                            currentPage={currentPagination.page}
                            totalPages={currentPagination.totalPages}
                            onPageChange={handlePageChange}
                          />
                        </div>
                      )}
                    </>
                  )}
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Review Modal */}
      {editingReview && (
        <EditReviewModal
          review={editingReview}
          onClose={() => setEditingReview(null)}
          onUpdated={handleReviewUpdated}
        />
      )}

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!deleteConfirm}
        onClose={() => !deleting && setDeleteConfirm(null)}
        title="Xác nhận xóa đánh giá"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-gray-600">
            Bạn có chắc chắn muốn xóa đánh giá này? Hành động này không thể hoàn tác.
          </p>
          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={() => setDeleteConfirm(null)}
              disabled={deleting}
            >
              Hủy
            </Button>
            <Button
              variant="danger"
              onClick={handleDeleteReview}
              disabled={deleting}
              loading={deleting}
            >
              {deleting ? 'Đang xóa...' : 'Xóa đánh giá'}
            </Button>
          </div>
        </div>
      </Modal>
    </Layout>
);
}

// Component Review Card
const ReviewCard = ({ review, isGiven = false, onEdit, onDelete }) => {
  const displayDate = new Date(review.created_at).toLocaleDateString('vi-VN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  // Determine which user info to show
  const displayUser = isGiven 
    ? { 
        name: review.reviewee_name || review.reviewee?.full_name || 'Người được đánh giá', 
        avatar: review.reviewee_avatar || review.reviewee?.avatar 
      }
    : { 
        name: review.reviewer_name || review.reviewer?.full_name || 'Người đánh giá', 
        avatar: review.reviewer_avatar || review.reviewer?.avatar 
      };

  return (
    <Card className="p-4">
      <div className="flex items-start space-x-4">
        <Avatar 
          src={displayUser.avatar} 
          alt={displayUser.name}
          size="lg"
        />
        
        <div className="flex-1">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h4 className="font-medium text-gray-900">
                {isGiven ? `Đánh giá cho: ${displayUser.name}` : displayUser.name}
              </h4>
              <div className="flex items-center space-x-2 mt-1">
                <RatingStars rating={review.rating} size="sm" />
                <span className="text-sm text-gray-500">{displayDate}</span>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              {review.exchange_id && (
                <Badge variant="outline" className="text-xs">
                  Từ trao đổi
                </Badge>
              )}
              
              {/* Edit/Delete buttons for given reviews */}
              {isGiven && (
                <div className="flex items-center space-x-1">
                  <button
                    onClick={onEdit}
                    className="p-1 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                    title="Sửa đánh giá"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  <button
                    onClick={onDelete}
                    className="p-1 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                    title="Xóa đánh giá"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              )}
            </div>
          </div>
          
          {review.comment && (
            <p className="text-gray-700 mt-2 whitespace-pre-wrap">
              {review.comment}
            </p>
          )}
          
          {review.exchange_book_title && (
            <div className="mt-3 p-3 bg-gray-50 rounded-md">
              <p className="text-sm text-gray-600">
                <span className="font-medium">Sách trao đổi:</span> {review.exchange_book_title}
              </p>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};

export default ProfileReviews;