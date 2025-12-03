import { useEffect, useState } from 'react';
import {
  Avatar,
  Button,
  Card,
  Input,
  LoadingSpinner,
  RatingStars,
  Tabs,
} from '../../components/ui';
import { useAuth } from '../../hooks/useAuth';
import { authService } from '../../services/api/auth';
import { reviewsService } from '../../services/api/reviews';

const ProfilePage = () => {
  const { user, setUser } = useAuth(); 
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(true);
  const [reviewStats, setReviewStats] = useState(null);

  const refreshUser = async () => {
    setLoading(true);
    try {
      const updated = await authService.getMe(); // Lấy toàn bộ dữ liệu user
      setUser(updated);
    } catch (err) {
      console.error('Refresh user failed:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadReviewStats = async () => {
    if (!user) return;
    try {
      const stats = await reviewsService.getMemberReviewStats(user.user_id);
      setReviewStats(stats);
    } catch (error) {
      console.error('Failed to load review stats:', error);
    }
  };

  useEffect(() => {
    refreshUser();
  }, []);

  useEffect(() => {
    if (user) {
      loadReviewStats();
    }
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Hồ sơ cá nhân</h1>
          <p className="text-gray-600 mt-2">Quản lý thông tin tài khoản của bạn</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <Card className="p-6">
              <div className="text-center">
                <Avatar
                  src={user?.avatar_url}
                  alt={user?.full_name}
                  size="xl"
                  className="mx-auto mb-4"
                />

                <h2 className="text-xl font-semibold text-gray-900">
                  {user?.full_name || 'Người dùng'}
                </h2>
                <p className="text-gray-500 text-sm mt-1">{user?.email}</p>

                {reviewStats && (
                  <div className="mt-4 space-y-2">
                    <div className="flex items-center justify-center space-x-2">
                      <RatingStars
                        rating={parseFloat(reviewStats.average_rating)}
                        size="sm"
                      />
                      <span className="text-sm font-medium text-gray-900">
                        {parseFloat(reviewStats.average_rating).toFixed(1) || '0.0'}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500">
                      {reviewStats.total_reviews || 0} đánh giá
                    </p>
                  </div>
                )}

                <div className="mt-4 text-xs text-gray-500">
                  Tham gia từ{' '}
                  {user?.created_at
                    ? new Date(user.created_at).toLocaleDateString('vi-VN')
                    : '...'}
                </div>
              </div>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <Card className="p-6">
              <Tabs
                tabs={[
                  { id: 'profile', name: 'Thông tin cá nhân' },
                  { id: 'reviews', name: 'Đánh giá' },
                  { id: 'security', name: 'Bảo mật' },
                ]}
                activeTab={activeTab}
                onTabChange={setActiveTab}
              />

              <div className="mt-6">
                {activeTab === 'profile' && (
                  <ProfileTab user={user} refreshUser={refreshUser} />
                )}
                {activeTab === 'reviews' && <ReviewsTab user={user} />}
                {activeTab === 'security' && (
                  <SecurityTab refreshUser={refreshUser} />
                )}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

// PROFILE TAB
const ProfileTab = ({ user, refreshUser }) => {
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    await refreshUser();
    setRefreshing(false);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-medium text-gray-900">Thông tin cá nhân</h3>
        <Button variant="outline" onClick={handleRefresh} loading={refreshing}>
          Làm mới thông tin
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Input disabled label="Họ và tên" value={user?.full_name || 'Chưa cập nhật'} />
        <Input disabled label="Email" value={user?.email || ''} />
        <Input disabled label="User ID" value={user?.user_id} />
        <Input disabled label="Vai trò" value={user?.role || 'MEMBER'} />
        <Input disabled label="Lần đăng nhập cuối cùng" value={user?.last_login_at || '-'} />
        <Input disabled label="Trạng thái tài khoản" value={user?.account_status || '-'} />
        <Input disabled label="Avatar URL" value={user?.avatar_url || 'Chưa có avatar'} />
      </div>
    </div>
  );
};

// REVIEWS TAB
const ReviewsTab = ({ user }) => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadReviews = async () => {
      if (!user) return;
      try {
        const res = await reviewsService.getMemberReviews(user.user_id, {
          page: 1,
          pageSize: 10,
        });
        setReviews(res.data || []);
      } catch (err) {
        console.error('Failed load reviews:', err);
      }
      setLoading(false);
    };
    loadReviews();
  }, [user]);

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-medium text-gray-900">Đánh giá của tôi</h3>
      </div>

      {reviews.length === 0 ? (
        <div className="text-center py-12 text-gray-500">Chưa có đánh giá.</div>
      ) : (
        <div className="space-y-4">
          {reviews.map((rev) => (
            <Card key={rev.review_id} className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <Avatar src={rev.reviewer_avatar} size="sm" />
                    <div>
                      <h4 className="font-medium">{rev.reviewer_name}</h4>
                      <div className="flex items-center space-x-2">
                        <RatingStars rating={rev.rating} size="sm" />
                        <span className="text-sm text-gray-500">
                          {new Date(rev.created_at).toLocaleDateString('vi-VN')}
                        </span>
                      </div>
                    </div>
                  </div>
                  {rev.comment && <p className="text-gray-700 mt-2">{rev.comment}</p>}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

// SECURITY TAB
const SecurityTab = ({ refreshUser }) => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [changing, setChanging] = useState(false);
  const [message, setMessage] = useState('');

  const handleChangePassword = async () => {
    if (newPassword !== confirmPassword) {
      setMessage('Mật khẩu xác nhận không khớp');
      return;
    }

    setChanging(true);
    setMessage('');

    try {
      await authService.changePassword({
        current_password: currentPassword,
        new_password: newPassword,
        confirm_password: confirmPassword,
      });

      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setMessage('Đổi mật khẩu thành công!');

      setTimeout(refreshUser, 1000);
    } catch (err) {
      setMessage('Đổi mật khẩu thất bại');
    }

    setChanging(false);
  };

  return (
    <div>
      <h3 className="text-lg font-medium text-gray-900 mb-6">Bảo mật tài khoản</h3>

      {message && (
        <div
          className={`p-3 mb-4 rounded text-sm ${
            message.includes('thành công')
              ? 'bg-green-100 text-green-700'
              : 'bg-red-100 text-red-700'
          }`}
        >
          {message}
        </div>
      )}

      <div className="max-w-md space-y-4">
        <Input
          type="password"
          placeholder="Mật khẩu hiện tại"
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
        />
        <Input
          type="password"
          placeholder="Mật khẩu mới"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
        />
        <Input
          type="password"
          placeholder="Xác nhận mật khẩu"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
        />
      </div>

      <Button onClick={handleChangePassword} loading={changing} className="mt-4">
        Đổi mật khẩu
      </Button>
    </div>
  );
};

export default ProfilePage;
