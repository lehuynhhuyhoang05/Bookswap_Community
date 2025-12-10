// src/pages/profile/member/[id].jsx
// Public member profile page - view other user's profile
import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link, useLocation } from 'react-router-dom';
import {
  ArrowLeft,
  Calendar,
  MapPin,
  Star,
  Shield,
  MessageSquare,
  Flag,
  User,
  Award,
  BookOpen,
  ArrowRightLeft,
  CheckCircle,
} from 'lucide-react';
import Layout from '../../../components/layout/Layout';
import {
  Avatar,
  Badge,
  Button,
  Card,
  LoadingSpinner,
  RatingStars,
} from '../../../components/ui';
import { membersService } from '../../../services/api/members';
import { reviewsService } from '../../../services/api/reviews';
import { exchangeService } from '../../../services/api/exchanges';
import { useMessages } from '../../../hooks/useMessages';
import { useAuth } from '../../../hooks/useAuth';
import CreateReportModal from '../../../components/reports/CreateReportModal';
import { toDisplayScore, getTrustBadgeConfig } from '../../../utils/trustScore';

const MemberProfilePage = () => {
  const { id: memberId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { createDirectConversation } = useMessages();

  // Get member data from navigation state if available
  const initialMemberData = location.state?.memberData || null;

  const [member, setMember] = useState(initialMemberData);
  const [reviewStats, setReviewStats] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [exchangeHistory, setExchangeHistory] = useState(null);
  const [loading, setLoading] = useState(!initialMemberData);
  const [error, setError] = useState(null);
  const [chatLoading, setChatLoading] = useState(false);
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    if (memberId) {
      loadMemberProfile();
    }
  }, [memberId]);

  const loadMemberProfile = async () => {
    // Only show loading if we don't have initial data
    if (!initialMemberData) {
      setLoading(true);
    }
    setError(null);
    
    try {
      // If we don't have member data from navigation state, fetch it
      if (!initialMemberData) {
        try {
          const memberData = await membersService.getMemberById(memberId);
          setMember(memberData);
        } catch (e) {
          console.error('Failed to load member info:', e);
          // Use minimal data if fetch fails
          setMember({
            member_id: memberId,
            trust_score: 0,
            user: { username: 'Thành viên' },
          });
        }
      }

      // Load review stats
      try {
        const stats = await reviewsService.getMemberReviewStats(memberId);
        setReviewStats(stats);
      } catch (e) {
        console.error('Failed to load review stats:', e);
      }

      // Load reviews about this member
      try {
        const reviewsData = await reviewsService.getMemberReviews(memberId, { page: 1, pageSize: 5 });
        setReviews(reviewsData?.data || []);
      } catch (e) {
        console.error('Failed to load reviews:', e);
      }

      // Load exchange history
      try {
        const historyData = await exchangeService.getMemberPublicExchangeHistory(memberId, 10);
        setExchangeHistory(historyData);
      } catch (e) {
        console.error('Failed to load exchange history:', e);
      }

    } catch (err) {
      console.error('Failed to load member profile:', err);
      setError(err.message || 'Không thể tải hồ sơ thành viên');
    } finally {
      setLoading(false);
    }
  };

  const handleChatWithMember = async () => {
    if (!member) return;

    const ownerId = member.user_id || member.user?.user_id;
    if (!ownerId) {
      alert('Không tìm thấy thông tin người dùng');
      return;
    }

    // Check if viewing own profile
    if (ownerId === user?.user_id) {
      alert('Đây là hồ sơ của bạn');
      return;
    }

    setChatLoading(true);
    try {
      const result = await createDirectConversation(ownerId);
      const conversationData = result?.data || result;
      const conversationId = conversationData?.conversation_id;

      if (conversationId) {
        navigate(`/messages?conversation_id=${conversationId}`);
      } else {
        throw new Error('Không nhận được conversation_id');
      }
    } catch (error) {
      console.error('Failed to create conversation:', error);
      alert('Không thể mở chat: ' + (error.message || 'Vui lòng thử lại'));
    } finally {
      setChatLoading(false);
    }
  };

  // Trust Score - using utility for consistent display
  // trust_score is 0-1 scale in DB, utility converts to 0-100 for display

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <LoadingSpinner size="lg" />
        </div>
      </Layout>
    );
  }

  if (error || !member) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <Button variant="text" onClick={() => navigate(-1)} className="mb-6">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Quay lại
          </Button>
          <Card className="p-12 text-center">
            <User className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Không tìm thấy thành viên
            </h3>
            <p className="text-gray-600 mb-4">{error || 'Thành viên này không tồn tại hoặc đã bị xóa'}</p>
            <Button onClick={() => navigate('/books')}>
              Khám phá sách
            </Button>
          </Card>
        </div>
      </Layout>
    );
  }

  const memberUser = member.user || member;
  // Convert from DB scale (0-1) to display scale (0-100)
  const trustScoreDisplay = toDisplayScore(member.trust_score);
  const trustBadge = getTrustBadgeConfig(trustScoreDisplay);
  const averageRating = Number(reviewStats?.average_rating || member.average_rating) || 0;
  const totalReviews = reviewStats?.total_reviews || 0;
  const totalExchanges = exchangeHistory?.total_completed || member.successful_exchanges || 0;
  const isOwnProfile = user?.user_id === memberUser.user_id || user?.member?.member_id === memberId;

  const tabs = [
    { id: 'overview', label: 'Tổng quan', icon: User },
    { id: 'exchanges', label: `Lịch sử trao đổi (${totalExchanges})`, icon: ArrowRightLeft },
    { id: 'reviews', label: `Đánh giá (${totalReviews})`, icon: Star },
  ];

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        {/* Back Navigation */}
        <Button variant="text" onClick={() => navigate(-1)} className="mb-6 text-blue-600">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Quay lại
        </Button>

        {/* Profile Header */}
        <Card className="p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-6">
            {/* Avatar & Basic Info */}
            <div className="flex flex-col items-center md:items-start">
              <Avatar
                src={memberUser.avatar_url}
                alt={memberUser.full_name || memberUser.username}
                size="xl"
                className="w-32 h-32"
              />
              <div className="mt-4 text-center md:text-left">
                <h1 className="text-2xl font-bold text-gray-900">
                  {memberUser.full_name || memberUser.username || 'Thành viên'}
                </h1>
                <p className="text-gray-500">@{memberUser.username || 'user'}</p>
              </div>
            </div>

            {/* Stats & Actions */}
            <div className="flex-1 space-y-4">
              {/* Trust Score & Rating */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {/* Trust Score */}
                <div className="bg-gray-50 rounded-lg p-4 text-center">
                  <div className={`inline-flex items-center px-3 py-1 rounded-full text-white text-sm ${trustBadge.badgeColor} mb-2`}>
                    <Shield className="w-4 h-4 mr-1" />
                    {trustBadge.shortLabel}
                  </div>
                  <p className="text-2xl font-bold text-gray-900">{trustScoreDisplay}</p>
                  <p className="text-sm text-gray-500">Độ tin cậy</p>
                </div>

                {/* Rating */}
                <div className="bg-gray-50 rounded-lg p-4 text-center">
                  <div className="flex items-center justify-center gap-1 mb-2">
                    <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                    <span className="text-2xl font-bold text-gray-900">{averageRating.toFixed(1)}</span>
                  </div>
                  <RatingStars rating={averageRating} size="sm" />
                  <p className="text-sm text-gray-500 mt-1">{totalReviews} đánh giá</p>
                </div>

                {/* Exchanges Count */}
                {totalExchanges > 0 && (
                  <div className="bg-gray-50 rounded-lg p-4 text-center">
                    <Award className="w-6 h-6 text-green-500 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-gray-900">{totalExchanges}</p>
                    <p className="text-sm text-gray-500">Trao đổi thành công</p>
                  </div>
                )}
              </div>

              {/* Member Info */}
              <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                {member.region && (
                  <div className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    <span>{member.region}</span>
                  </div>
                )}
                {member.created_at && (
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    <span>Tham gia: {formatDate(member.created_at)}</span>
                  </div>
                )}
              </div>

              {/* Actions */}
              {!isOwnProfile && (
                <div className="flex flex-wrap gap-3 pt-4">
                  <Button
                    onClick={handleChatWithMember}
                    disabled={chatLoading}
                    className="flex items-center gap-2"
                  >
                    <MessageSquare className="w-4 h-4" />
                    {chatLoading ? 'Đang mở...' : 'Nhắn tin'}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setReportModalOpen(true)}
                    className="flex items-center gap-2 text-red-600 border-red-300 hover:bg-red-50"
                  >
                    <Flag className="w-4 h-4" />
                    Báo cáo
                  </Button>
                </div>
              )}
            </div>
          </div>
        </Card>

        {/* Tabs Navigation */}
        <div className="flex border-b mb-6 overflow-x-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-medium whitespace-nowrap transition-colors ${
                  activeTab === tab.id
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <Card className="p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Giới thiệu</h2>
            {member.bio ? (
              <p className="text-gray-600">{member.bio}</p>
            ) : (
              <p className="text-gray-400 italic">Thành viên chưa thêm giới thiệu</p>
            )}
            
            {/* Quick Stats */}
            <div className="mt-6 pt-6 border-t">
              <h3 className="text-lg font-semibold mb-4">Thống kê nhanh</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-3 bg-blue-50 rounded-lg">
                  <Shield className="w-6 h-6 text-blue-500 mx-auto mb-1" />
                  <p className="text-lg font-bold text-gray-900">{trustScoreDisplay}</p>
                  <p className="text-xs text-gray-500">Độ tin cậy</p>
                </div>
                <div className="text-center p-3 bg-yellow-50 rounded-lg">
                  <Star className="w-6 h-6 text-yellow-500 mx-auto mb-1" />
                  <p className="text-lg font-bold text-gray-900">{averageRating.toFixed(1)}</p>
                  <p className="text-xs text-gray-500">Đánh giá TB</p>
                </div>
                <div className="text-center p-3 bg-green-50 rounded-lg">
                  <CheckCircle className="w-6 h-6 text-green-500 mx-auto mb-1" />
                  <p className="text-lg font-bold text-gray-900">{totalExchanges}</p>
                  <p className="text-xs text-gray-500">Hoàn thành</p>
                </div>
                <div className="text-center p-3 bg-purple-50 rounded-lg">
                  <MessageSquare className="w-6 h-6 text-purple-500 mx-auto mb-1" />
                  <p className="text-lg font-bold text-gray-900">{totalReviews}</p>
                  <p className="text-xs text-gray-500">Đánh giá</p>
                </div>
              </div>
            </div>
          </Card>
        )}

        {activeTab === 'exchanges' && (
          <Card className="p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <ArrowRightLeft className="w-5 h-5" />
              Lịch sử trao đổi ({totalExchanges})
            </h2>

            {!exchangeHistory || exchangeHistory.exchanges?.length === 0 ? (
              <div className="text-center py-8">
                <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">Chưa có giao dịch hoàn thành nào</p>
              </div>
            ) : (
              <div className="space-y-4">
                {exchangeHistory.exchanges.map((exchange) => (
                  <div key={exchange.exchange_id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <Avatar
                          src={exchange.partner?.avatar_url}
                          alt={exchange.partner?.full_name}
                          size="sm"
                        />
                        <div>
                          <p className="font-medium text-gray-900">
                            Trao đổi với {exchange.partner?.full_name || 'Thành viên'}
                          </p>
                          <p className="text-xs text-gray-500">
                            {formatDate(exchange.completed_at)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 text-green-600">
                        <CheckCircle className="w-4 h-4" />
                        <span className="text-xs font-medium">Hoàn thành</span>
                      </div>
                    </div>
                    
                    <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3">
                      {/* Books Given */}
                      {exchange.books_given?.length > 0 && (
                        <div className="bg-orange-50 rounded-lg p-3">
                          <p className="text-xs font-medium text-orange-700 mb-1">📚 Đã cho</p>
                          {exchange.books_given.map((book, idx) => (
                            <p key={idx} className="text-sm text-gray-700">
                              {book.title}
                            </p>
                          ))}
                        </div>
                      )}
                      
                      {/* Books Received */}
                      {exchange.books_received?.length > 0 && (
                        <div className="bg-green-50 rounded-lg p-3">
                          <p className="text-xs font-medium text-green-700 mb-1">📖 Đã nhận</p>
                          {exchange.books_received.map((book, idx) => (
                            <p key={idx} className="text-sm text-gray-700">
                              {book.title}
                            </p>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                
                {exchangeHistory.total_completed > exchangeHistory.shown && (
                  <p className="text-center text-sm text-gray-500 pt-2">
                    Hiển thị {exchangeHistory.shown} / {exchangeHistory.total_completed} giao dịch
                  </p>
                )}
              </div>
            )}
          </Card>
        )}

        {activeTab === 'reviews' && (
          <Card className="p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Star className="w-5 h-5" />
              Đánh giá ({totalReviews})
            </h2>

            {reviews.length === 0 ? (
              <p className="text-gray-500 text-center py-8">
                Chưa có đánh giá nào
              </p>
            ) : (
              <div className="space-y-4">
                {reviews.map((review) => (
                  <div key={review.review_id} className="border-b pb-4 last:border-0">
                    <div className="flex items-start gap-3">
                      <Avatar
                        src={review.reviewer?.user?.avatar_url}
                        alt={review.reviewer?.user?.username}
                        size="sm"
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-gray-900">
                            {review.reviewer?.user?.full_name || review.reviewer?.user?.username || 'Người dùng'}
                          </span>
                          <RatingStars rating={review.rating} size="xs" />
                        </div>
                        {review.comment && (
                          <p className="text-gray-600 text-sm">{review.comment}</p>
                        )}
                        <p className="text-xs text-gray-400 mt-1">
                          {formatDate(review.created_at)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        )}

        {/* Report Modal */}
        <CreateReportModal
          isOpen={reportModalOpen}
          onClose={() => setReportModalOpen(false)}
          reportedMember={{
            member_id: memberId,
            full_name: memberUser.full_name || memberUser.username || 'Người dùng',
          }}
        />
      </div>
    </Layout>
  );
};

export default MemberProfilePage;
