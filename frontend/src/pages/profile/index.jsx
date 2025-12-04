import { useEffect, useState } from 'react';
import {
  Award,
  BadgeCheck,
  BookOpen,
  Calendar,
  Camera,
  CheckCircle,
  Edit3,
  Mail,
  MapPin,
  Phone,
  RefreshCw,
  Shield,
  Star,
  TrendingUp,
  User,
  XCircle,
} from 'lucide-react';
import {
  Avatar,
  Badge,
  Button,
  Card,
  Input,
  LoadingSpinner,
  RatingStars,
  Tabs,
} from '../../components/ui';
import Layout from '../../components/layout/Layout';
import { useAuth } from '../../hooks/useAuth';
import { authService } from '../../services/api/auth';
import { reviewsService } from '../../services/api/reviews';
import TrustScoreWarning from '../../components/common/TrustScoreWarning';
import { toDisplayScore, getTrustBadgeConfig } from '../../utils/trustScore';

const ProfilePage = () => {
  const { user, setUser, getTrustRestrictions } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(true);
  const [reviewStats, setReviewStats] = useState(null);

  const refreshUser = async () => {
    setLoading(true);
    try {
      const updated = await authService.getMe();
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
      // Use member_id from user.member object, not user_id
      const memberId = user.member?.member_id || user.member_id || user.user_id;
      const stats = await reviewsService.getMemberReviewStats(memberId);
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
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <LoadingSpinner size="lg" />
        </div>
      </Layout>
    );
  }

  const trustRestrictions = getTrustRestrictions ? getTrustRestrictions() : null;
  // Convert from DB scale (0-1) to display scale (0-100)
  const trustScore = toDisplayScore(user?.member?.trust_score);
  const averageRating = reviewStats?.average_rating || user?.member?.average_rating || 0;

  // Trust Score badge config using utility
  const trustBadge = getTrustBadgeConfig(trustScore);

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Trust Score Warning */}
          {trustRestrictions && trustRestrictions.warningLevel !== 'none' && (
            <div className="mb-6">
              <TrustScoreWarning restrictions={trustRestrictions} />
            </div>
          )}

          {/* Profile Header Card */}
          <Card className="mb-6 overflow-hidden">
            {/* Cover Image */}
            <div className="h-32 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 relative">
              <div className="absolute inset-0 bg-black/10"></div>
              <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-black/20 to-transparent"></div>
            </div>

            {/* Profile Info */}
            <div className="px-6 pb-6">
              <div className="flex flex-col md:flex-row md:items-end -mt-16 relative z-10">
                {/* Avatar */}
                <div className="relative">
                  <div className="w-32 h-32 rounded-full border-4 border-white shadow-xl overflow-hidden bg-white">
                    {user?.avatar_url ? (
                      <img
                        src={user.avatar_url}
                        alt={user.full_name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center">
                        <User className="w-12 h-12 text-white" />
                      </div>
                    )}
                  </div>
                  {user?.is_email_verified && (
                    <div className="absolute bottom-2 right-2 bg-green-500 rounded-full p-1.5 border-2 border-white">
                      <BadgeCheck className="w-4 h-4 text-white" />
                    </div>
                  )}
                </div>

                {/* User Info */}
                <div className="mt-4 md:mt-0 md:ml-6 flex-1">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                    <div>
                      <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                        {user?.full_name || 'Người dùng'}
                        {user?.member?.is_verified && (
                          <BadgeCheck className="w-6 h-6 text-blue-500" />
                        )}
                      </h1>
                      <p className="text-gray-500 flex items-center gap-2 mt-1">
                        <Mail className="w-4 h-4" />
                        {user?.email}
                      </p>
                    </div>

                    <div className="mt-4 md:mt-0 flex gap-2">
                      <Button variant="outline" size="sm">
                        <Edit3 className="w-4 h-4 mr-2" />
                        Chỉnh sửa
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Stats Row */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-gray-100">
                {/* Trust Score */}
                <div className="text-center p-4 bg-gray-50 rounded-xl">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Shield className="w-5 h-5 text-blue-600" />
                    <span className="text-sm font-medium text-gray-600">Điểm uy tín</span>
                  </div>
                  <div className="flex items-center justify-center gap-2">
                    <span className="text-2xl font-bold text-gray-900">{trustScore}</span>
                    <span className={`text-xs px-2 py-1 rounded-full text-white ${trustBadge.badgeColor}`}>
                      {trustBadge.shortLabel}
                    </span>
                  </div>
                </div>

                {/* Rating */}
                <div className="text-center p-4 bg-gray-50 rounded-xl">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Star className="w-5 h-5 text-yellow-500" />
                    <span className="text-sm font-medium text-gray-600">Đánh giá</span>
                  </div>
                  <div className="flex items-center justify-center gap-2">
                    <span className="text-2xl font-bold text-gray-900">
                      {parseFloat(averageRating).toFixed(1)}
                    </span>
                    <RatingStars rating={parseFloat(averageRating)} size="sm" />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {reviewStats?.total_reviews || 0} đánh giá
                  </p>
                </div>

                {/* Exchanges */}
                <div className="text-center p-4 bg-gray-50 rounded-xl">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <TrendingUp className="w-5 h-5 text-green-600" />
                    <span className="text-sm font-medium text-gray-600">Giao dịch</span>
                  </div>
                  <div className="flex items-center justify-center gap-2">
                    <span className="text-2xl font-bold text-gray-900">
                      {user?.member?.completed_exchanges || 0}
                    </span>
                    <span className="text-sm text-gray-500">
                      / {user?.member?.total_exchanges || 0}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">hoàn thành</p>
                </div>

                {/* Member Since */}
                <div className="text-center p-4 bg-gray-50 rounded-xl">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Calendar className="w-5 h-5 text-purple-600" />
                    <span className="text-sm font-medium text-gray-600">Thành viên</span>
                  </div>
                  <div className="text-2xl font-bold text-gray-900">
                    {user?.created_at
                      ? new Date(user.created_at).toLocaleDateString('vi-VN', {
                          month: 'short',
                          year: 'numeric',
                        })
                      : '-'}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">tham gia từ</p>
                </div>
              </div>
            </div>
          </Card>

          {/* Tabs Content */}
          <Card className="p-6">
            <Tabs
              tabs={[
                { id: 'profile', name: '📋 Thông tin cá nhân' },
                { id: 'member', name: '👤 Hồ sơ thành viên' },
                { id: 'reviews', name: '⭐ Đánh giá' },
                { id: 'security', name: '🔒 Bảo mật' },
              ]}
              activeTab={activeTab}
              onTabChange={setActiveTab}
            />

            <div className="mt-6">
              {activeTab === 'profile' && (
                <ProfileTab user={user} refreshUser={refreshUser} />
              )}
              {activeTab === 'member' && (
                <MemberTab user={user} trustBadge={trustBadge} trustScore={trustScore} />
              )}
              {activeTab === 'reviews' && <ReviewsTab user={user} />}
              {activeTab === 'security' && <SecurityTab refreshUser={refreshUser} />}
            </div>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

// PROFILE TAB - Account Info
const ProfileTab = ({ user, refreshUser }) => {
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    await refreshUser();
    setRefreshing(false);
  };

  const infoItems = [
    { label: 'Họ và tên', value: user?.full_name, icon: User },
    { label: 'Email', value: user?.email, icon: Mail },
    { label: 'Vai trò', value: user?.role === 'ADMIN' ? '👑 Quản trị viên' : '👤 Thành viên', icon: Shield },
    {
      label: 'Trạng thái',
      value: user?.account_status === 'ACTIVE' ? '✅ Hoạt động' : '⚠️ ' + user?.account_status,
      icon: user?.account_status === 'ACTIVE' ? CheckCircle : XCircle,
    },
    {
      label: 'Email đã xác thực',
      value: user?.is_email_verified ? '✅ Đã xác thực' : '❌ Chưa xác thực',
      icon: BadgeCheck,
    },
    {
      label: 'Đăng nhập lần cuối',
      value: user?.last_login_at
        ? new Date(user.last_login_at).toLocaleString('vi-VN')
        : 'Chưa có',
      icon: Calendar,
    },
  ];

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Thông tin tài khoản</h3>
          <p className="text-sm text-gray-500">Thông tin cơ bản về tài khoản của bạn</p>
        </div>
        <Button variant="outline" onClick={handleRefresh} loading={refreshing} size="sm">
          <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
          Làm mới
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {infoItems.map((item, idx) => (
          <div
            key={idx}
            className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl border border-gray-100 hover:border-blue-200 transition-colors"
          >
            <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
              <item.icon className="w-5 h-5 text-blue-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-gray-500 uppercase tracking-wide">{item.label}</p>
              <p className="text-sm font-medium text-gray-900 truncate">
                {item.value || 'Chưa cập nhật'}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// MEMBER TAB - Member Profile Info
const MemberTab = ({ user, trustBadge, trustScore }) => {
  const member = user?.member;

  if (!member) {
    return (
      <div className="text-center py-12">
        <User className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900">Chưa có hồ sơ thành viên</h3>
        <p className="text-gray-500 mt-2">
          Bạn cần tạo hồ sơ thành viên để tham gia trao đổi sách
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Hồ sơ thành viên</h3>
        <p className="text-sm text-gray-500">Thông tin hiển thị với các thành viên khác</p>
      </div>

      {/* Trust Score Detail */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-white shadow-sm flex items-center justify-center">
              <Shield className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h4 className="font-semibold text-gray-900">Điểm uy tín</h4>
              <p className="text-sm text-gray-500">Dựa trên hoạt động của bạn</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-gray-900">{trustScore}</div>
            <span className={`text-xs px-3 py-1 rounded-full text-white ${trustBadge.badgeColor}`}>
              {trustBadge.shortLabel}
            </span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-4">
          <div className="flex justify-between text-xs text-gray-500 mb-1">
            <span>0</span>
            <span>100</span>
          </div>
          <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
            <div
              className={`h-full ${trustBadge.badgeColor} transition-all duration-500`}
              style={{ width: `${Math.min(100, trustScore)}%` }}
            />
          </div>
        </div>

        {/* How to improve */}
        <div className="mt-4 pt-4 border-t border-gray-200">
          <p className="text-xs text-gray-600">
            💡 <strong>Cách tăng điểm:</strong> Hoàn thành giao dịch (+5), nhận đánh giá tốt (+3),
            xác thực email (+10), thêm avatar (+5)
          </p>
        </div>
      </div>

      {/* Member Info Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
          <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
            <MapPin className="w-5 h-5 text-purple-600" />
          </div>
          <div>
            <p className="text-xs text-gray-500">Khu vực</p>
            <p className="text-sm font-medium text-gray-900">{member.region || 'Chưa cập nhật'}</p>
          </div>
        </div>

        <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
          <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
            <Phone className="w-5 h-5 text-green-600" />
          </div>
          <div>
            <p className="text-xs text-gray-500">Số điện thoại</p>
            <p className="text-sm font-medium text-gray-900">{member.phone || 'Chưa cập nhật'}</p>
          </div>
        </div>

        <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
          <div className="w-10 h-10 rounded-lg bg-yellow-100 flex items-center justify-center">
            <Star className="w-5 h-5 text-yellow-600" />
          </div>
          <div>
            <p className="text-xs text-gray-500">Đánh giá trung bình</p>
            <p className="text-sm font-medium text-gray-900">
              {parseFloat(member.average_rating || 0).toFixed(1)} / 5.0
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
          <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
            <BookOpen className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <p className="text-xs text-gray-500">Giao dịch hoàn thành</p>
            <p className="text-sm font-medium text-gray-900">
              {member.completed_exchanges || 0} / {member.total_exchanges || 0}
            </p>
          </div>
        </div>
      </div>

      {/* Bio */}
      {member.bio && (
        <div className="mt-6">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Giới thiệu</h4>
          <div className="p-4 bg-gray-50 rounded-xl">
            <p className="text-gray-700 whitespace-pre-wrap">{member.bio}</p>
          </div>
        </div>
      )}
    </div>
  );
};

// REVIEWS TAB
const ReviewsTab = ({ user }) => {
  const [reviews, setReviews] = useState([]);
  const [givenReviews, setGivenReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [subTab, setSubTab] = useState('received'); // 'received' | 'given'

  useEffect(() => {
    const loadAllReviews = async () => {
      if (!user) return;
      try {
        const memberId = user.member?.member_id || user.member_id || user.user_id;
        
        // Load received reviews
        const receivedRes = await reviewsService.getMemberReviews(memberId, {
          page: 1,
          pageSize: 10,
        });
        setReviews(receivedRes.data || []);
        
        // Load given reviews
        const givenRes = await reviewsService.getReviewsByReviewer(memberId, {
          page: 1,
          pageSize: 10,
        });
        setGivenReviews(givenRes.data?.items || []);
      } catch (err) {
        console.error('Failed load reviews:', err);
      }
      setLoading(false);
    };
    loadAllReviews();
  }, [user]);

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <LoadingSpinner />
      </div>
    );
  }

  const currentReviews = subTab === 'received' ? reviews : givenReviews;

  return (
    <div>
      {/* Sub-tabs for received/given */}
      <div className="flex gap-4 mb-6 border-b border-gray-200">
        <button
          onClick={() => setSubTab('received')}
          className={`pb-3 px-1 text-sm font-medium border-b-2 transition-colors ${
            subTab === 'received'
              ? 'border-blue-500 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          Đánh giá nhận được ({reviews.length})
        </button>
        <button
          onClick={() => setSubTab('given')}
          className={`pb-3 px-1 text-sm font-medium border-b-2 transition-colors ${
            subTab === 'given'
              ? 'border-blue-500 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          Đánh giá đã viết ({givenReviews.length})
        </button>
      </div>

      <div className="mb-4">
        <p className="text-sm text-gray-500">
          {subTab === 'received' 
            ? 'Đánh giá từ các thành viên khác về bạn' 
            : 'Đánh giá bạn đã viết cho các thành viên khác'}
        </p>
      </div>

      {currentReviews.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-xl">
          <Star className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900">
            {subTab === 'received' ? 'Chưa có đánh giá' : 'Chưa viết đánh giá nào'}
          </h3>
          <p className="text-gray-500 mt-2">
            {subTab === 'received' 
              ? 'Hoàn thành các giao dịch để nhận đánh giá từ người khác'
              : 'Hãy đánh giá sau khi hoàn thành giao dịch'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {currentReviews.map((rev) => (
            <div
              key={rev.review_id}
              className="p-4 bg-gray-50 rounded-xl border border-gray-100 hover:border-blue-200 transition-colors"
            >
              <div className="flex items-start gap-4">
                <Avatar 
                  src={subTab === 'received' ? rev.reviewer_avatar : rev.reviewee_avatar} 
                  size="md" 
                />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-gray-900">
                      {subTab === 'received' 
                        ? (rev.reviewer_name || 'Người đánh giá')
                        : `Đánh giá cho: ${rev.reviewee_name || rev.reviewee?.full_name || 'Người dùng'}`
                      }
                    </h4>
                    <span className="text-xs text-gray-500">
                      {new Date(rev.created_at).toLocaleDateString('vi-VN')}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <RatingStars rating={rev.rating} size="sm" />
                    <span className="text-sm font-medium text-gray-700">{rev.rating}/5</span>
                  </div>
                  {rev.comment && (
                    <p className="text-gray-700 mt-2 text-sm">{rev.comment}</p>
                  )}
                </div>
              </div>
            </div>
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
  const [message, setMessage] = useState({ type: '', text: '' });

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      setMessage({ type: 'error', text: 'Vui lòng điền đầy đủ thông tin' });
      return;
    }

    if (newPassword !== confirmPassword) {
      setMessage({ type: 'error', text: 'Mật khẩu xác nhận không khớp' });
      return;
    }

    if (newPassword.length < 6) {
      setMessage({ type: 'error', text: 'Mật khẩu mới phải có ít nhất 6 ký tự' });
      return;
    }

    setChanging(true);
    setMessage({ type: '', text: '' });

    try {
      await authService.changePassword({
        current_password: currentPassword,
        new_password: newPassword,
        confirm_password: confirmPassword,
      });

      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setMessage({ type: 'success', text: '✅ Đổi mật khẩu thành công!' });

      setTimeout(refreshUser, 1000);
    } catch (err) {
      setMessage({
        type: 'error',
        text: err.message || 'Đổi mật khẩu thất bại. Vui lòng kiểm tra mật khẩu hiện tại.',
      });
    }

    setChanging(false);
  };

  return (
    <div>
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Bảo mật tài khoản</h3>
        <p className="text-sm text-gray-500">Quản lý mật khẩu và bảo mật</p>
      </div>

      {message.text && (
        <div
          className={`p-4 mb-6 rounded-xl flex items-center gap-3 ${
            message.type === 'success'
              ? 'bg-green-50 text-green-700 border border-green-200'
              : 'bg-red-50 text-red-700 border border-red-200'
          }`}
        >
          {message.type === 'success' ? (
            <CheckCircle className="w-5 h-5" />
          ) : (
            <XCircle className="w-5 h-5" />
          )}
          {message.text}
        </div>
      )}

      <div className="max-w-md">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Mật khẩu hiện tại
            </label>
            <Input
              type="password"
              placeholder="Nhập mật khẩu hiện tại"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Mật khẩu mới
            </label>
            <Input
              type="password"
              placeholder="Nhập mật khẩu mới (ít nhất 6 ký tự)"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Xác nhận mật khẩu mới
            </label>
            <Input
              type="password"
              placeholder="Nhập lại mật khẩu mới"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>
        </div>

        <Button
          onClick={handleChangePassword}
          loading={changing}
          className="mt-6 w-full"
          disabled={!currentPassword || !newPassword || !confirmPassword}
        >
          <Shield className="w-4 h-4 mr-2" />
          Đổi mật khẩu
        </Button>
      </div>
    </div>
  );
};

export default ProfilePage;
