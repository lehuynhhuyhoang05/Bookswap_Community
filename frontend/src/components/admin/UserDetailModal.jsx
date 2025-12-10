import {
  Activity,
  Award,
  Book,
  Calendar,
  Globe,
  Lock,
  Mail,
  MapPin,
  MessageSquare,
  RefreshCw,
  Shield,
  Star,
  TrendingUp,
  User,
  X,
  Edit,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { getAdminUser } from '../../services/api/adminUsers';
import { getTrustScoreHistory } from '../../services/api/adminTrustScore';
import ActivityTimeline from './ActivityTimeline';
import TrustScoreAdjustModal from './TrustScoreAdjustModal';
import AdminUserEditModal from './AdminUserEditModal';

const UserDetailModal = ({ userId, onClose, onRefresh }) => {
  const [activeTab, setActiveTab] = useState('info');
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [trustHistory, setTrustHistory] = useState(null);
  const [trustLoading, setTrustLoading] = useState(false);
  const [showAdjustModal, setShowAdjustModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  useEffect(() => {
    if (userId) {
      loadUserDetail();
    }
  }, [userId]);

  useEffect(() => {
    if (activeTab === 'trust' && userData?.member_id && !trustHistory && !trustLoading) {
      loadTrustHistory();
    }
  }, [activeTab, userData]);

  const loadUserDetail = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getAdminUser(userId);
      setUserData(data);
    } catch (err) {
      console.error('Failed to load user detail:', err);
      setError(err.message || 'Không thể tải thông tin người dùng');
    } finally {
      setLoading(false);
    }
  };

  const loadTrustHistory = async () => {
    try {
      setTrustLoading(true);
      const data = await getTrustScoreHistory(userData.member_id);
      setTrustHistory(data);
    } catch (err) {
      console.error('Failed to load trust history:', err);
      setTrustHistory({ history: [], error: err.message });
    } finally {
      setTrustLoading(false);
    }
  };

  const handleAdjustSuccess = () => {
    setTrustHistory(null); // Reset to reload
    loadUserDetail();
    onRefresh?.();
  };

  const getTrustScoreColor = (score) => {
    if (score >= 80) return 'text-green-600 bg-green-50';
    if (score >= 60) return 'text-blue-600 bg-blue-50';
    if (score >= 40) return 'text-yellow-600 bg-yellow-50';
    if (score >= 20) return 'text-orange-600 bg-orange-50';
    return 'text-red-600 bg-red-50';
  };

  const getTrustScoreLabel = (score) => {
    if (score >= 80) return 'Xuất sắc';
    if (score >= 60) return 'Tốt';
    if (score >= 40) return 'Trung bình';
    if (score >= 20) return 'Kém';
    return 'Rất kém';
  };

  const getStatusBadge = (status) => {
    const badges = {
      ACTIVE: 'bg-green-100 text-green-800',
      LOCKED: 'bg-red-100 text-red-800',
      DELETED: 'bg-gray-100 text-gray-800',
    };
    return badges[status] || 'bg-gray-100 text-gray-800';
  };

  const getRoleBadge = (role) => {
    return role === 'ADMIN'
      ? 'bg-purple-100 text-purple-800'
      : 'bg-gray-100 text-gray-800';
  };

  if (!userId) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10">
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <User className="h-6 w-6" />
            Chi tiết người dùng
          </h2>
          <div className="flex items-center gap-2">
            {!loading && userData && (
              <button
                onClick={() => setShowEditModal(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
              >
                <Edit className="h-4 w-4" />
                Chỉnh sửa
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition"
            >
              <X className="h-5 w-5 text-gray-500" />
            </button>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="p-12 text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
            <p className="mt-4 text-gray-600">Đang tải thông tin...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="p-6">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
              <p className="font-medium">Lỗi khi tải dữ liệu</p>
              <p className="text-sm mt-1">{error}</p>
              <button
                onClick={loadUserDetail}
                className="mt-3 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
              >
                Thử lại
              </button>
            </div>
          </div>
        )}

        {/* Content */}
        {!loading && !error && userData && (
          <>
            {/* User Header Card */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-6">
              <div className="flex items-start gap-4">
                {/* Avatar */}
                <div className="flex-shrink-0">
                  <div className="w-20 h-20 bg-gradient-to-br from-blue-400 to-indigo-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                    {userData.full_name?.charAt(0).toUpperCase() || 'U'}
                  </div>
                </div>

                {/* User Info */}
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-2xl font-bold text-gray-900">
                      {userData.full_name}
                    </h3>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusBadge(userData.account_status)}`}
                    >
                      {userData.account_status}
                    </span>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${getRoleBadge(userData.role)}`}
                    >
                      {userData.role}
                    </span>
                  </div>

                  <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                    <span className="flex items-center gap-1">
                      <Mail className="h-4 w-4" />
                      {userData.email}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      Tham gia{' '}
                      {new Date(userData.created_at).toLocaleDateString(
                        'vi-VN',
                      )}
                    </span>
                  </div>

                  {/* Trust Score Badge */}
                  {userData.member && (
                    <div className="flex items-center gap-4">
                      <div
                        className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg ${getTrustScoreColor(userData.member.trust_score)}`}
                      >
                        <Award className="h-5 w-5" />
                        <span className="font-bold text-lg">
                          {parseFloat(userData.member.trust_score).toFixed(1)}
                        </span>
                        <span className="text-sm">
                          {getTrustScoreLabel(userData.member.trust_score)}
                        </span>
                      </div>
                      {userData.member.region && (
                        <span className="flex items-center gap-1 text-gray-600">
                          <MapPin className="h-4 w-4" />
                          {userData.member.region}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div className="border-b border-gray-200 px-6">
              <div className="flex gap-6">
                <button
                  onClick={() => setActiveTab('info')}
                  className={`py-3 px-1 border-b-2 font-medium text-sm transition ${
                    activeTab === 'info'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Thông tin chính
                </button>
                <button
                  onClick={() => setActiveTab('stats')}
                  className={`py-3 px-1 border-b-2 font-medium text-sm transition ${
                    activeTab === 'stats'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Thống kê
                </button>
                <button
                  onClick={() => setActiveTab('trust')}
                  className={`py-3 px-1 border-b-2 font-medium text-sm transition ${
                    activeTab === 'trust'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Trust Score
                </button>
                <button
                  onClick={() => setActiveTab('activities')}
                  className={`py-3 px-1 border-b-2 font-medium text-sm transition ${
                    activeTab === 'activities'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Lịch sử hoạt động
                </button>
              </div>
            </div>

            {/* Tab Content */}
            <div className="px-6 py-6">
              {activeTab === 'info' && (
                <div className="space-y-6">
                  {/* Basic Info */}
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      <User className="h-5 w-5 text-blue-600" />
                      Thông tin cơ bản
                    </h4>
                    <div className="grid grid-cols-2 gap-4 bg-gray-50 rounded-lg p-4">
                      <div>
                        <label className="text-xs text-gray-500">
                          User ID
                        </label>
                        <p className="font-mono text-sm text-gray-900 break-all">
                          {userData.user_id}
                        </p>
                      </div>
                      <div>
                        <label className="text-xs text-gray-500">Email</label>
                        <p className="text-sm text-gray-900">
                          {userData.email}
                        </p>
                      </div>
                      <div>
                        <label className="text-xs text-gray-500">
                          Họ và tên
                        </label>
                        <p className="text-sm text-gray-900">
                          {userData.full_name}
                        </p>
                      </div>
                      <div>
                        <label className="text-xs text-gray-500">Quyền</label>
                        <p className="text-sm text-gray-900">
                          {userData.role}
                        </p>
                      </div>
                      <div>
                        <label className="text-xs text-gray-500">
                          Trạng thái
                        </label>
                        <p className="text-sm text-gray-900">
                          {userData.account_status}
                        </p>
                      </div>
                      <div>
                        <label className="text-xs text-gray-500">
                          Ngày tạo
                        </label>
                        <p className="text-sm text-gray-900">
                          {new Date(userData.created_at).toLocaleString(
                            'vi-VN',
                          )}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Member Info */}
                  {userData.member && (
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                        <Globe className="h-5 w-5 text-blue-600" />
                        Thông tin thành viên
                      </h4>
                      <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="text-xs text-gray-500">
                              Member ID
                            </label>
                            <p className="font-mono text-sm text-gray-900 break-all">
                              {userData.member.member_id}
                            </p>
                          </div>
                          <div>
                            <label className="text-xs text-gray-500">
                              Khu vực
                            </label>
                            <p className="text-sm text-gray-900">
                              {userData.member.region || 'Chưa cập nhật'}
                            </p>
                          </div>
                          <div className="col-span-2">
                            <label className="text-xs text-gray-500">
                              Trust Score
                            </label>
                            <div className="flex items-center gap-3 mt-1">
                              <div className="flex-1 bg-gray-200 rounded-full h-3">
                                <div
                                  className={`h-3 rounded-full transition-all ${
                                    parseFloat(userData.member.trust_score) >= 80
                                      ? 'bg-green-500'
                                      : parseFloat(userData.member.trust_score) >= 60
                                        ? 'bg-blue-500'
                                        : parseFloat(userData.member.trust_score) >= 40
                                          ? 'bg-yellow-500'
                                          : parseFloat(userData.member.trust_score) >=
                                              20
                                            ? 'bg-orange-500'
                                            : 'bg-red-500'
                                  }`}
                                  style={{
                                    width: `${parseFloat(userData.member.trust_score)}%`,
                                  }}
                                ></div>
                              </div>
                              <span className="font-bold text-gray-900">
                                {parseFloat(userData.member.trust_score).toFixed(1)}
                              </span>
                            </div>
                          </div>
                        </div>

                        {userData.member.bio && (
                          <div>
                            <label className="text-xs text-gray-500">
                              Giới thiệu
                            </label>
                            <p className="text-sm text-gray-900 mt-1">
                              {userData.member.bio}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'stats' && (
                <div className="space-y-6">
                  {!userData.member ? (
                    <div className="text-center py-8 text-gray-500">
                      User này chưa có member profile
                    </div>
                  ) : (
                    <>
                  <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-blue-600" />
                    Thống kê hoạt động
                  </h4>

                  {/* Stats Grid */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
                      <div className="flex items-center gap-2 mb-2">
                        <Book className="h-5 w-5 text-blue-600" />
                        <span className="text-sm text-gray-600">Sách</span>
                      </div>
                      <p className="text-3xl font-bold text-blue-600">
                        {userData.stats?.total_books || 0}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">Tổng số sách</p>
                    </div>

                    <div className="bg-green-50 rounded-lg p-4 border border-green-100">
                      <div className="flex items-center gap-2 mb-2">
                        <RefreshCw className="h-5 w-5 text-green-600" />
                        <span className="text-sm text-gray-600">
                          Giao dịch
                        </span>
                      </div>
                      <p className="text-3xl font-bold text-green-600">
                        {userData.stats?.total_exchanges || 0}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        Đã tham gia
                      </p>
                    </div>

                    <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-100">
                      <div className="flex items-center gap-2 mb-2">
                        <Star className="h-5 w-5 text-yellow-600" />
                        <span className="text-sm text-gray-600">Đánh giá</span>
                      </div>
                      <p className="text-3xl font-bold text-yellow-600">
                        {userData.stats?.total_reviews_received || 0}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">Nhận được</p>
                    </div>

                    <div className="bg-purple-50 rounded-lg p-4 border border-purple-100">
                      <div className="flex items-center gap-2 mb-2">
                        <Award className="h-5 w-5 text-purple-600" />
                        <span className="text-sm text-gray-600">
                          Rating TB
                        </span>
                      </div>
                      <p className="text-3xl font-bold text-purple-600">
                        {userData.stats?.average_rating
                          ? parseFloat(userData.stats.average_rating).toFixed(1)
                          : 'N/A'}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {userData.stats?.average_rating && (
                          <span>
                            ⭐{' '}
                            {parseFloat(userData.stats.average_rating) >= 4.5
                              ? 'Xuất sắc'
                              : parseFloat(userData.stats.average_rating) >= 4.0
                                ? 'Tốt'
                                : parseFloat(userData.stats.average_rating) >= 3.0
                                  ? 'Khá'
                                  : 'Trung bình'}
                          </span>
                        )}
                      </p>
                    </div>
                  </div>
                    </>
                  )}
                </div>
              )}

              {activeTab === 'trust' && (
                <div>
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-lg font-semibold text-gray-900">
                      Lịch sử Trust Score
                    </h3>
                    <button
                      onClick={() => setShowAdjustModal(true)}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
                    >
                      <TrendingUp className="h-4 w-4" />
                      Điều chỉnh Trust Score
                    </button>
                  </div>

                  {trustLoading ? (
                    <div className="text-center py-8 text-gray-500">
                      Đang tải lịch sử...
                    </div>
                  ) : trustHistory?.error ? (
                    <div className="text-center py-8 text-red-500">
                      Lỗi: {trustHistory.error}
                    </div>
                  ) : trustHistory ? (
                    <div className="space-y-4">
                      {trustHistory.history && trustHistory.history.length > 0 ? (
                        trustHistory.history.map((entry) => (
                          <div
                            key={entry.change_id}
                            className="border border-gray-200 rounded-lg p-4"
                          >
                            <div className="flex items-start justify-between mb-2">
                              <div>
                                <div className="flex items-center gap-2">
                                  <span
                                    className={`font-semibold ${
                                      entry.change_amount > 0
                                        ? 'text-green-600'
                                        : entry.change_amount < 0
                                        ? 'text-red-600'
                                        : 'text-gray-600'
                                    }`}
                                  >
                                    {entry.change_amount > 0 ? '+' : ''}
                                    {entry.change_amount}
                                  </span>
                                  <span
                                    className={`px-2 py-0.5 rounded text-xs font-medium ${
                                      entry.source === 'ADMIN'
                                        ? 'bg-purple-100 text-purple-700'
                                        : entry.source === 'SYSTEM'
                                        ? 'bg-blue-100 text-blue-700'
                                        : 'bg-gray-100 text-gray-700'
                                    }`}
                                  >
                                    {entry.source}
                                  </span>
                                </div>
                                <p className="text-sm text-gray-600 mt-1">
                                  {entry.reason}
                                </p>
                                {entry.admin_name && (
                                  <p className="text-xs text-gray-500 mt-1">
                                    Bởi: {entry.admin_name}
                                  </p>
                                )}
                              </div>
                              <div className="text-right">
                                <div className="text-sm font-medium text-gray-900">
                                  {entry.old_score} → {entry.new_score}
                                </div>
                                <div className="text-xs text-gray-500 mt-1">
                                  {new Date(entry.created_at).toLocaleString('vi-VN')}
                                </div>
                              </div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-8 text-gray-500">
                          Chưa có lịch sử thay đổi Trust Score
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      Đang tải lịch sử...
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'activities' && (
                <ActivityTimeline 
                  userId={userData.user_id} 
                  userName={userData.full_name}
                />
              )}
            </div>

            {/* Footer Actions */}
            <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 flex justify-end gap-3">
              <button
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition text-gray-700"
              >
                Đóng
              </button>
              {onRefresh && (
                <button
                  onClick={() => {
                    onRefresh();
                    onClose();
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
                >
                  <RefreshCw className="h-4 w-4" />
                  Làm mới danh sách
                </button>
              )}
            </div>
          </>
        )}
      </div>

      {/* Trust Score Adjust Modal */}
      {showAdjustModal && userData && userData.member && (
        <TrustScoreAdjustModal
          member={{
            member_id: userData.member.member_id,
            full_name: userData.full_name,
            email: userData.email,
            avatar_url: userData.avatar_url,
            trust_score: userData.member.trust_score,
          }}
          onClose={() => setShowAdjustModal(false)}
          onSuccess={handleAdjustSuccess}
        />
      )}

      {/* User Edit Modal */}
      {showEditModal && userData && (
        <AdminUserEditModal
          userData={userData}
          onClose={() => setShowEditModal(false)}
          onSuccess={() => {
            loadUserDetail();
            onRefresh?.();
          }}
        />
      )}
    </div>
  );
};

export default UserDetailModal;
