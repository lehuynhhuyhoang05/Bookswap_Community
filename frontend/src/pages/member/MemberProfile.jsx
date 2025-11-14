import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ArrowLeft,
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Shield,
  Star,
  Edit3,
  Camera,
  Save,
  X,
  BookOpen,
  RefreshCw,
  CheckCircle,
  Award,
  MessageCircle,
  Heart,
  Eye,
  Settings,
  Lock,
  Bell,
  Globe,
  Bookmark
} from 'lucide-react';

const MemberProfile = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');
  const [avatarPreview, setAvatarPreview] = useState('');

  // Mock user data
  const [userData, setUserData] = useState({
    id: 1,
    name: 'Nguyễn Văn A',
    email: 'nguyenvana@example.com',
    phone: '+84 123 456 789',
    location: 'Hà Nội, Việt Nam',
    bio: 'Yêu thích đọc sách về lập trình, phát triển bản thân và khoa học. Luôn tìm kiếm những cuốn sách hay để trao đổi!',
    joinDate: '2023-01-15',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
    coverImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=300&fit=crop',
    rating: 4.8,
    totalRatings: 24,
    exchanges: 18,
    booksOwned: 12,
    successfulExchanges: 15,
    memberLevel: 'gold'
  });

  const [editForm, setEditForm] = useState({ ...userData });

  const stats = [
    { label: 'Sách đang có', value: userData.booksOwned, icon: BookOpen, color: 'blue' },
    { label: 'Trao đổi', value: userData.exchanges, icon: RefreshCw, color: 'green' },
    { label: 'Thành công', value: userData.successfulExchanges, icon: CheckCircle, color: 'purple' },
    { label: 'Đánh giá', value: userData.rating, icon: Star, color: 'amber' }
  ];

  const recentActivities = [
    {
      id: 1,
      type: 'exchange',
      message: 'Đã trao đổi "Clean Code" với Trần Thị B',
      time: '2 giờ trước',
      icon: RefreshCw
    },
    {
      id: 2,
      type: 'review',
      message: 'Nhận được đánh giá 5 sao từ Lê Văn C',
      time: '1 ngày trước',
      icon: Star
    },
    {
      id: 3,
      type: 'add',
      message: 'Đã thêm sách "The Pragmatic Programmer"',
      time: '2 ngày trước',
      icon: BookOpen
    },
    {
      id: 4,
      type: 'message',
      message: 'Có tin nhắn mới từ Phạm Thị D',
      time: '3 ngày trước',
      icon: MessageCircle
    }
  ];

  const memberLevels = {
    bronze: { label: 'Đồng', color: 'from-amber-600 to-orange-600', benefits: ['Trao đổi cơ bản', '5 sách tối đa'] },
    silver: { label: 'Bạc', color: 'from-gray-400 to-gray-600', benefits: ['Tất cả tính năng Bronze', '10 sách tối đa', 'Ưu tiên tìm kiếm'] },
    gold: { label: 'Vàng', color: 'from-amber-500 to-yellow-500', benefits: ['Tất cả tính năng Silver', '20 sách tối đa', 'Hỗ trợ ưu tiên', 'Badge đặc biệt'] },
    platinum: { label: 'Bạch Kim', color: 'from-cyan-400 to-blue-500', benefits: ['Tất cả tính năng Gold', 'Không giới hạn sách', 'Hỗ trợ 24/7', 'Quà tặng đặc biệt'] }
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setAvatarPreview(e.target.result);
        setEditForm(prev => ({ ...prev, avatar: e.target.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    setUserData(editForm);
    setIsEditing(false);
    setAvatarPreview('');
  };

  const handleCancel = () => {
    setEditForm(userData);
    setIsEditing(false);
    setAvatarPreview('');
  };

  const getLevelColor = (level) => {
    const colors = {
      bronze: 'bg-amber-500',
      silver: 'bg-gray-400',
      gold: 'bg-yellow-500',
      platinum: 'bg-cyan-400'
    };
    return colors[level] || 'bg-gray-400';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200/50 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link 
                to="/dashboard"
                className="inline-flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors bg-white/80 backdrop-blur-sm rounded-2xl px-4 py-2 border border-gray-200"
              >
                <ArrowLeft className="w-5 h-5" />
                <span>Quay lại</span>
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Hồ sơ cá nhân</h1>
                <p className="text-gray-600">Quản lý thông tin và cài đặt tài khoản</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              {!isEditing ? (
                <button
                  onClick={() => setIsEditing(true)}
                  className="flex items-center space-x-2 bg-blue-600 text-white px-6 py-3 rounded-2xl hover:bg-blue-700 transition-all duration-300 font-semibold"
                >
                  <Edit3 className="w-5 h-5" />
                  <span>Chỉnh sửa</span>
                </button>
              ) : (
                <div className="flex items-center space-x-3">
                  <button
                    onClick={handleCancel}
                    className="flex items-center space-x-2 bg-gray-500 text-white px-6 py-3 rounded-2xl hover:bg-gray-600 transition-all duration-300 font-semibold"
                  >
                    <X className="w-5 h-5" />
                    <span>Hủy</span>
                  </button>
                  <button
                    onClick={handleSave}
                    className="flex items-center space-x-2 bg-green-600 text-white px-6 py-3 rounded-2xl hover:bg-green-700 transition-all duration-300 font-semibold"
                  >
                    <Save className="w-5 h-5" />
                    <span>Lưu</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Left Sidebar */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6"
            >
              {/* Profile Card */}
              <div className="bg-white rounded-3xl p-6 shadow-lg border border-gray-100">
                <div className="text-center">
                  <div className="relative inline-block mb-4">
                    <img
                      src={isEditing && avatarPreview ? avatarPreview : userData.avatar}
                      alt={userData.name}
                      className="w-24 h-24 rounded-2xl object-cover border-4 border-white shadow-lg"
                    />
                    {isEditing && (
                      <label className="absolute bottom-0 right-0 bg-blue-600 text-white p-2 rounded-full cursor-pointer hover:bg-blue-700 transition-colors">
                        <Camera className="w-4 h-4" />
                        <input
                          type="file"
                          className="hidden"
                          accept="image/*"
                          onChange={handleAvatarChange}
                        />
                      </label>
                    )}
                  </div>
                  
                  <h2 className="text-xl font-bold text-gray-900 mb-1">{userData.name}</h2>
                  <div className="flex items-center justify-center space-x-2 text-gray-600 mb-3">
                    <MapPin className="w-4 h-4" />
                    <span className="text-sm">{userData.location}</span>
                  </div>
                  
                  <div className="flex items-center justify-center space-x-2 mb-4">
                    <div className={`px-3 py-1 text-white text-sm font-semibold rounded-full bg-gradient-to-r ${memberLevels[userData.memberLevel].color}`}>
                      {memberLevels[userData.memberLevel].label}
                    </div>
                    <Award className="w-5 h-5 text-amber-500" />
                  </div>

                  <div className="flex items-center justify-center space-x-4 text-sm text-gray-600">
                    <div className="text-center">
                      <div className="font-semibold text-gray-900">{userData.rating}</div>
                      <div>Đánh giá</div>
                    </div>
                    <div className="text-center">
                      <div className="font-semibold text-gray-900">{userData.exchanges}</div>
                      <div>Trao đổi</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Navigation */}
              <div className="bg-white rounded-3xl p-6 shadow-lg border border-gray-100">
                <nav className="space-y-2">
                  {[
                    { id: 'profile', label: 'Thông tin cá nhân', icon: User },
                    { id: 'security', label: 'Bảo mật', icon: Lock },
                    { id: 'notifications', label: 'Thông báo', icon: Bell },
                    { id: 'privacy', label: 'Quyền riêng tư', icon: Shield }
                  ].map((item) => (
                    <button
                      key={item.id}
                      onClick={() => setActiveTab(item.id)}
                      className={`w-full flex items-center space-x-3 px-4 py-3 rounded-2xl transition-all duration-300 ${
                        activeTab === item.id
                          ? 'bg-blue-50 text-blue-600 border border-blue-200'
                          : 'text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      <item.icon className="w-5 h-5" />
                      <span className="font-medium">{item.label}</span>
                    </button>
                  ))}
                </nav>
              </div>
            </motion.div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-8"
            >
              {activeTab === 'profile' && (
                <>
                  {/* Stats Grid */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    {stats.map((stat, index) => (
                      <div
                        key={index}
                        className="bg-white rounded-3xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
                            <div className="text-sm text-gray-600">{stat.label}</div>
                          </div>
                          <div className={`p-3 rounded-2xl bg-${stat.color}-100 text-${stat.color}-600`}>
                            <stat.icon className="w-6 h-6" />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Profile Information */}
                  <div className="bg-white rounded-3xl p-8 shadow-lg border border-gray-100">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-xl font-bold text-gray-900">Thông tin cá nhân</h3>
                      {!isEditing && (
                        <button
                          onClick={() => setIsEditing(true)}
                          className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 font-semibold"
                        >
                          <Edit3 className="w-5 h-5" />
                          <span>Chỉnh sửa</span>
                        </button>
                      )}
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Họ và tên
                        </label>
                        {isEditing ? (
                          <input
                            type="text"
                            name="name"
                            value={editForm.name}
                            onChange={handleInputChange}
                            className="w-full px-4 py-3 rounded-2xl border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-300"
                          />
                        ) : (
                          <div className="flex items-center space-x-3 text-gray-900">
                            <User className="w-5 h-5 text-gray-400" />
                            <span>{userData.name}</span>
                          </div>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Email
                        </label>
                        {isEditing ? (
                          <input
                            type="email"
                            name="email"
                            value={editForm.email}
                            onChange={handleInputChange}
                            className="w-full px-4 py-3 rounded-2xl border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-300"
                          />
                        ) : (
                          <div className="flex items-center space-x-3 text-gray-900">
                            <Mail className="w-5 h-5 text-gray-400" />
                            <span>{userData.email}</span>
                          </div>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Số điện thoại
                        </label>
                        {isEditing ? (
                          <input
                            type="tel"
                            name="phone"
                            value={editForm.phone}
                            onChange={handleInputChange}
                            className="w-full px-4 py-3 rounded-2xl border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-300"
                          />
                        ) : (
                          <div className="flex items-center space-x-3 text-gray-900">
                            <Phone className="w-5 h-5 text-gray-400" />
                            <span>{userData.phone}</span>
                          </div>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Địa chỉ
                        </label>
                        {isEditing ? (
                          <input
                            type="text"
                            name="location"
                            value={editForm.location}
                            onChange={handleInputChange}
                            className="w-full px-4 py-3 rounded-2xl border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-300"
                          />
                        ) : (
                          <div className="flex items-center space-x-3 text-gray-900">
                            <MapPin className="w-5 h-5 text-gray-400" />
                            <span>{userData.location}</span>
                          </div>
                        )}
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Giới thiệu bản thân
                        </label>
                        {isEditing ? (
                          <textarea
                            name="bio"
                            value={editForm.bio}
                            onChange={handleInputChange}
                            rows="4"
                            className="w-full px-4 py-3 rounded-2xl border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-300 resize-none"
                          />
                        ) : (
                          <div className="text-gray-900 leading-relaxed">
                            {userData.bio}
                          </div>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Ngày tham gia
                        </label>
                        <div className="flex items-center space-x-3 text-gray-900">
                          <Calendar className="w-5 h-5 text-gray-400" />
                          <span>{new Date(userData.joinDate).toLocaleDateString('vi-VN')}</span>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Trạng thái xác minh
                        </label>
                        <div className="flex items-center space-x-3 text-green-600">
                          <Shield className="w-5 h-5" />
                          <span className="font-semibold">Đã xác minh</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Recent Activity */}
                  <div className="bg-white rounded-3xl p-8 shadow-lg border border-gray-100">
                    <h3 className="text-xl font-bold text-gray-900 mb-6">Hoạt động gần đây</h3>
                    <div className="space-y-4">
                      {recentActivities.map((activity) => (
                        <div
                          key={activity.id}
                          className="flex items-center space-x-4 p-4 rounded-2xl border border-gray-100 hover:bg-gray-50 transition-all duration-300"
                        >
                          <div className="p-3 bg-blue-100 text-blue-600 rounded-2xl">
                            <activity.icon className="w-5 h-5" />
                          </div>
                          <div className="flex-1">
                            <p className="text-gray-900 font-medium">{activity.message}</p>
                            <p className="text-gray-500 text-sm">{activity.time}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {activeTab === 'security' && (
                <div className="bg-white rounded-3xl p-8 shadow-lg border border-gray-100">
                  <h3 className="text-xl font-bold text-gray-900 mb-6">Bảo mật tài khoản</h3>
                  <div className="space-y-6">
                    <div className="flex items-center justify-between p-6 rounded-2xl border border-gray-200">
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-1">Đổi mật khẩu</h4>
                        <p className="text-gray-600 text-sm">Cập nhật mật khẩu mới cho tài khoản của bạn</p>
                      </div>
                      <button className="bg-blue-600 text-white px-6 py-3 rounded-2xl hover:bg-blue-700 transition-all duration-300 font-semibold">
                        Đổi mật khẩu
                      </button>
                    </div>

                    <div className="flex items-center justify-between p-6 rounded-2xl border border-gray-200">
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-1">Xác minh 2 bước</h4>
                        <p className="text-gray-600 text-sm">Thêm lớp bảo mật bổ sung cho tài khoản</p>
                      </div>
                      <button className="bg-gray-600 text-white px-6 py-3 rounded-2xl hover:bg-gray-700 transition-all duration-300 font-semibold">
                        Bật
                      </button>
                    </div>

                    <div className="flex items-center justify-between p-6 rounded-2xl border border-gray-200">
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-1">Thiết bị đăng nhập</h4>
                        <p className="text-gray-600 text-sm">Quản lý các thiết bị đã đăng nhập</p>
                      </div>
                      <button className="bg-blue-600 text-white px-6 py-3 rounded-2xl hover:bg-blue-700 transition-all duration-300 font-semibold">
                        Quản lý
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'notifications' && (
                <div className="bg-white rounded-3xl p-8 shadow-lg border border-gray-100">
                  <h3 className="text-xl font-bold text-gray-900 mb-6">Cài đặt thông báo</h3>
                  <div className="space-y-6">
                    {[
                      { title: 'Thông báo trao đổi', description: 'Nhận thông báo khi có yêu cầu trao đổi mới' },
                      { title: 'Tin nhắn', description: 'Thông báo khi có tin nhắn mới' },
                      { title: 'Đánh giá', description: 'Thông báo khi nhận được đánh giá mới' },
                      { title: 'Sách mới', description: 'Thông báo về sách mới phù hợp với sở thích' },
                      { title: 'Khuyến mãi', description: 'Nhận thông tin về chương trình khuyến mãi' }
                    ].map((item, index) => (
                      <div key={index} className="flex items-center justify-between p-6 rounded-2xl border border-gray-200">
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-1">{item.title}</h4>
                          <p className="text-gray-600 text-sm">{item.description}</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" className="sr-only peer" defaultChecked />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'privacy' && (
                <div className="bg-white rounded-3xl p-8 shadow-lg border border-gray-100">
                  <h3 className="text-xl font-bold text-gray-900 mb-6">Quyền riêng tư</h3>
                  <div className="space-y-6">
                    {[
                      { title: 'Hiển thị hồ sơ công khai', description: 'Cho phép người khác xem hồ sơ của bạn' },
                      { title: 'Hiển thị email', description: 'Cho phép thành viên khác xem email của bạn' },
                      { title: 'Hiển thị sách đang có', description: 'Hiển thị danh sách sách bạn đang sở hữu' },
                      { title: 'Cho phép nhắn tin', description: 'Cho phép thành viên khác gửi tin nhắn cho bạn' },
                      { title: 'Hiển thị lịch sử trao đổi', description: 'Hiển thị các trao đổi đã hoàn thành' }
                    ].map((item, index) => (
                      <div key={index} className="flex items-center justify-between p-6 rounded-2xl border border-gray-200">
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-1">{item.title}</h4>
                          <p className="text-gray-600 text-sm">{item.description}</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" className="sr-only peer" defaultChecked />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MemberProfile;