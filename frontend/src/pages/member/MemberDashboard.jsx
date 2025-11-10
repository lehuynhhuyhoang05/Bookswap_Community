import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  BookOpen, 
  Users, 
  RefreshCw, 
  Star, 
  TrendingUp, 
  Bell, 
  MessageCircle,
  Search,
  Plus,
  Eye,
  Heart,
  MapPin,
  Calendar,
  Award,
  Zap,
  Clock,
  CheckCircle,
  ArrowRight,
  Bookmark,
  Shield
} from 'lucide-react';

const MemberDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [user, setUser] = useState({
    name: 'Nguyễn Văn A',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
    rating: 4.8,
    exchanges: 24,
    memberSince: '2023-01-15',
    location: 'Hà Nội'
  });

  // Mock data
  const stats = [
    { 
      label: 'Sách đang có', 
      value: '12', 
      change: '+2',
      icon: <BookOpen className="w-6 h-6" />,
      color: 'from-blue-500 to-cyan-500'
    },
    { 
      label: 'Đang trao đổi', 
      value: '3', 
      change: '+1',
      icon: <RefreshCw className="w-6 h-6" />,
      color: 'from-green-500 to-emerald-500'
    },
    { 
      label: 'Thành công', 
      value: '18', 
      change: '+5',
      icon: <CheckCircle className="w-6 h-6" />,
      color: 'from-purple-500 to-pink-500'
    },
    { 
      label: 'Đánh giá', 
      value: '4.8', 
      change: '+0.2',
      icon: <Star className="w-6 h-6" />,
      color: 'from-amber-500 to-orange-500'
    }
  ];

  const recentBooks = [
    {
      id: 1,
      title: "Clean Code: A Handbook of Agile Software Craftsmanship",
      author: "Robert C. Martin",
      image: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&h=500&fit=crop",
      status: 'available',
      views: 142,
      likes: 18,
      requests: 3,
      addedDate: '2024-01-15'
    },
    {
      id: 2,
      title: "The Pragmatic Programmer",
      author: "David Thomas, Andrew Hunt",
      image: "https://images.unsplash.com/photo-1589998059171-988d887df646?w=400&h=500&fit=crop",
      status: 'exchanging',
      views: 89,
      likes: 12,
      requests: 1,
      addedDate: '2024-01-10'
    },
    {
      id: 3,
      title: "Design Patterns: Elements of Reusable Object-Oriented Software",
      author: "Erich Gamma",
      image: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400&h=500&fit=crop",
      status: 'available',
      views: 76,
      likes: 8,
      requests: 2,
      addedDate: '2024-01-08'
    }
  ];

  const pendingExchanges = [
    {
      id: 1,
      book: "Nhà Giả Kim",
      user: "Trần Thị B",
      userAvatar: "TB",
      type: 'incoming',
      status: 'pending',
      date: '2024-01-20',
      duration: '2 ngày'
    },
    {
      id: 2,
      book: "Đắc Nhân Tâm", 
      user: "Lê Văn C",
      userAvatar: "LC",
      type: 'outgoing',
      status: 'waiting',
      date: '2024-01-19',
      duration: '1 ngày'
    }
  ];

  const recommendations = [
    {
      id: 1,
      title: "Atomic Habits",
      author: "James Clear",
      image: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=300&h=400&fit=crop",
      match: 95,
      reason: "Phù hợp với sở thích lập trình và phát triển bản thân"
    },
    {
      id: 2,
      title: "Deep Work",
      author: "Cal Newport", 
      image: "https://images.unsplash.com/photo-1589998059171-988d887df646?w=300&h=400&fit=crop",
      match: 88,
      reason: "Dựa trên lịch sử đọc sách về năng suất"
    },
    {
      id: 3,
      title: "The Clean Coder",
      author: "Robert C. Martin",
      image: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=300&h=400&fit=crop",
      match: 92,
      reason: "Tác giả bạn yêu thích"
    }
  ];

  const quickActions = [
    {
      title: 'Thêm sách mới',
      description: 'Đăng sách bạn muốn trao đổi',
      icon: <Plus className="w-6 h-6" />,
      link: '/books/add',
      color: 'from-blue-500 to-cyan-500'
    },
    {
      title: 'Tìm sách',
      description: 'Khám phá sách mới',
      icon: <Search className="w-6 h-6" />,
      link: '/search',
      color: 'from-green-500 to-emerald-500'
    },
    {
      title: 'Tin nhắn',
      description: '5 tin nhắn chưa đọc',
      icon: <MessageCircle className="w-6 h-6" />,
      link: '/messages',
      color: 'from-purple-500 to-pink-500'
    },
    {
      title: 'Quản lý yêu cầu',
      description: '3 yêu cầu đang chờ',
      icon: <Bell className="w-6 h-6" />,
      link: '/exchange/pending',
      color: 'from-orange-500 to-amber-500'
    }
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'available': return 'from-green-500 to-emerald-500';
      case 'exchanging': return 'from-blue-500 to-cyan-500';
      case 'pending': return 'from-amber-500 to-orange-500';
      case 'waiting': return 'from-purple-500 to-pink-500';
      default: return 'from-gray-500 to-gray-600';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'available': return 'Có sẵn';
      case 'exchanging': return 'Đang trao đổi';
      case 'pending': return 'Chờ phản hồi';
      case 'waiting': return 'Đang chờ';
      default: return status;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200/50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Tổng quan</h1>
              <p className="text-gray-600">Chào mừng trở lại, {user.name}! 👋</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <div className="text-sm text-gray-600">Hạng thành viên</div>
                <div className="flex items-center space-x-2">
                  <Award className="w-5 h-5 text-amber-500" />
                  <span className="font-semibold text-gray-900">Vàng</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-3xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 group"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-2xl bg-gradient-to-r ${stat.color} text-white shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                  {stat.icon}
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
                  <div className="text-sm text-green-600 font-semibold">{stat.change}</div>
                </div>
              </div>
              <div className="text-sm text-gray-600">{stat.label}</div>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-8">
            {/* Quick Actions */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-3xl p-6 shadow-lg border border-gray-100"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">Thao tác nhanh</h2>
                <Zap className="w-5 h-5 text-amber-500" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                {quickActions.map((action, index) => (
                  <Link
                    key={index}
                    to={action.link}
                    className="group block p-4 rounded-2xl border-2 border-gray-100 hover:border-transparent hover:shadow-lg transition-all duration-300"
                  >
                    <div className={`p-3 rounded-xl bg-gradient-to-r ${action.color} text-white w-12 h-12 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300`}>
                      {action.icon}
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-1">{action.title}</h3>
                    <p className="text-sm text-gray-600">{action.description}</p>
                  </Link>
                ))}
              </div>
            </motion.div>

            {/* Recent Books */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-3xl p-6 shadow-lg border border-gray-100"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">Sách gần đây</h2>
                <Link 
                  to="/my-books"
                  className="text-blue-600 hover:text-blue-700 font-semibold text-sm flex items-center space-x-1"
                >
                  <span>Xem tất cả</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
              <div className="space-y-4">
                {recentBooks.map((book, index) => (
                  <div
                    key={book.id}
                    className="flex items-center space-x-4 p-4 rounded-2xl border border-gray-100 hover:bg-gray-50 transition-all duration-300 group"
                  >
                    <img
                      src={book.image}
                      alt={book.title}
                      className="w-16 h-20 object-cover rounded-xl group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 truncate">{book.title}</h3>
                      <p className="text-blue-600 text-sm mb-2">{book.author}</p>
                      <div className="flex items-center space-x-4 text-sm text-gray-600">
                        <div className="flex items-center space-x-1">
                          <Eye className="w-4 h-4" />
                          <span>{book.views}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Heart className="w-4 h-4" />
                          <span>{book.likes}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <RefreshCw className="w-4 h-4" />
                          <span>{book.requests} yêu cầu</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={`px-3 py-1 text-xs text-white font-semibold rounded-full bg-gradient-to-r ${getStatusColor(book.status)}`}>
                        {getStatusText(book.status)}
                      </span>
                      <div className="text-xs text-gray-500 mt-1">
                        {new Date(book.addedDate).toLocaleDateString('vi-VN')}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Right Column */}
          <div className="space-y-8">
            {/* Profile Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-gradient-to-br from-blue-600 to-cyan-600 rounded-3xl p-6 text-white shadow-xl"
            >
              <div className="flex items-center space-x-4 mb-6">
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="w-16 h-16 rounded-2xl border-2 border-white/20"
                />
                <div className="flex-1">
                  <h3 className="font-bold text-lg">{user.name}</h3>
                  <div className="flex items-center space-x-2 text-blue-100 text-sm">
                    <MapPin className="w-4 h-4" />
                    <span>{user.location}</span>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="text-center">
                  <div className="flex items-center justify-center text-yellow-400 mb-1">
                    <Star className="w-5 h-5 fill-current" />
                  </div>
                  <div className="text-2xl font-bold">{user.rating}</div>
                  <div className="text-blue-100 text-xs">Đánh giá</div>
                </div>
                
                <div className="text-center">
                  <div className="flex items-center justify-center text-white mb-1">
                    <RefreshCw className="w-5 h-5" />
                  </div>
                  <div className="text-2xl font-bold">{user.exchanges}</div>
                  <div className="text-blue-100 text-xs">Trao đổi</div>
                </div>
              </div>

              <button className="w-full bg-white/20 backdrop-blur-sm text-white py-3 rounded-xl hover:bg-white/30 transition-all duration-300 font-semibold">
                Xem hồ sơ
              </button>
            </motion.div>

            {/* Pending Exchanges */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-white rounded-3xl p-6 shadow-lg border border-gray-100"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">Trao đổi đang chờ</h2>
                <div className="w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs font-bold">
                  {pendingExchanges.length}
                </div>
              </div>
              <div className="space-y-4">
                {pendingExchanges.map((exchange, index) => (
                  <div
                    key={exchange.id}
                    className="p-4 rounded-2xl border border-gray-100 hover:shadow-md transition-all duration-300"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-xl flex items-center justify-center font-semibold">
                          {exchange.userAvatar}
                        </div>
                        <div>
                          <div className="font-semibold text-gray-900">{exchange.user}</div>
                          <div className="text-sm text-gray-600">{exchange.book}</div>
                        </div>
                      </div>
                      <span className={`px-2 py-1 text-xs text-white rounded-full bg-gradient-to-r ${getStatusColor(exchange.status)}`}>
                        {getStatusText(exchange.status)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm text-gray-600">
                      <div className="flex items-center space-x-1">
                        <Calendar className="w-4 h-4" />
                        <span>{exchange.date}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Clock className="w-4 h-4" />
                        <span>{exchange.duration}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Recommendations */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="bg-white rounded-3xl p-6 shadow-lg border border-gray-100"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">Đề xuất cho bạn</h2>
                <TrendingUp className="w-5 h-5 text-green-500" />
              </div>
              <div className="space-y-4">
                {recommendations.map((book, index) => (
                  <div
                    key={book.id}
                    className="flex items-center space-x-4 p-4 rounded-2xl border border-gray-100 hover:bg-gray-50 transition-all duration-300 group"
                  >
                    <img
                      src={book.image}
                      alt={book.title}
                      className="w-12 h-16 object-cover rounded-xl group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 text-sm truncate">{book.title}</h3>
                      <p className="text-blue-600 text-xs mb-1">{book.author}</p>
                      <p className="text-gray-600 text-xs truncate">{book.reason}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-green-600">{book.match}%</div>
                      <div className="text-xs text-gray-500">Khớp</div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MemberDashboard;