import { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { reviewsService } from '../../services/api/reviews';
import { Card, Button, RatingStars, Avatar, Pagination, LoadingSpinner, Tabs, Badge } from '../../components/ui';
import Layout from '../../components/layout/Layout';

const ProfileReviews = () => {
  const { user } = useAuth();
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
                  <>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Tổng đánh giá</span>
                      <Badge variant="primary">{stats?.total_reviews || 0}</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Điểm trung bình</span>
                      <Badge variant="success">{stats?.average_rating?.toFixed(1) || '0.0'}</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">5 sao</span>
                      <Badge>{stats?.rating_breakdown?.[5] || 0}</Badge>
                    </div>
                  </>
                </div>
              </Card>
            </div>

            {/* Main Content */}
            <div className="lg:col-span-3">
              <Card className="p-6">
                <Tabs 
                  tabs={tabs} 
                  activeTab={activeTab} 
                  onTabChange={setActiveTab}
                />

                <div className="mt-6">
                  {loading ? (
                    <div className="flex justify-center py-8">
                      <LoadingSpinner />
                    </div>
                  ) : reviews.length === 0 ? (
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
                      {activeTab === 'given' && (
                        <Button>
                          Viết đánh giá đầu tiên
                        </Button>
                      )}
                    </div>
                  ) : (
                    <>
                      <div className="space-y-4">
                        {reviews.map((review) => (
                          <ReviewCard key={review.review_id} review={review} />
                        ))}
                      </div>

                      {pagination.totalPages > 1 && (
                        <div className="mt-6">
                          <Pagination
                            currentPage={pagination.page}
                            totalPages={pagination.totalPages}
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
    </Layout>
);
}

// Component Review Card
const ReviewCard = ({ review }) => {
  const displayDate = new Date(review.created_at).toLocaleDateString('vi-VN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <Card className="p-4">
      <div className="flex items-start space-x-4">
        <Avatar 
          src={review.reviewer_avatar} 
          alt={review.reviewer_name}
          size="lg"
        />
        
        <div className="flex-1">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h4 className="font-medium text-gray-900">
                {review.reviewer_name}
              </h4>
              <div className="flex items-center space-x-2 mt-1">
                <RatingStars rating={review.rating} size="sm" />
                <span className="text-sm text-gray-500">{displayDate}</span>
              </div>
            </div>
            
            {review.exchange_id && (
              <Badge variant="outline" className="text-xs">
                Từ trao đổi
              </Badge>
            )}
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