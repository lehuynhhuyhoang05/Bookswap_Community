import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Layout from '../../components/layout/Layout';
import { Card, Button, LoadingSpinner } from '../../components/ui';
import { useExchanges } from '../../hooks/useExchanges';
import { 
  Send, 
  Inbox, 
  Clock, 
  CheckCircle, 
  TrendingUp, 
  RefreshCw, 
  ArrowRight, 
  Plus,
  Sparkles,
  BookOpen,
  Users,
  Calendar,
  MessageCircle,
  Star,
  ChevronRight,
  Zap,
  Target
} from 'lucide-react';

/**
 * Exchange Dashboard - Trang tổng quan trao đổi
 * Backend API: GET /exchanges/stats/me
 */
const ExchangePage = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const { getExchangeStats } = useExchanges();

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    setLoading(true);
    try {
      const data = await getExchangeStats();
      setStats(data);
    } catch (error) {
      console.error('[ExchangePage] Failed to load stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-indigo-200 rounded-full animate-spin border-t-indigo-600"></div>
            <RefreshCw className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 h-6 w-6 text-indigo-600" />
          </div>
          <p className="mt-4 text-gray-600 font-medium">Đang tải thống kê...</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-700">
        {/* Background decorations */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-white/10 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-yellow-500/20 rounded-full blur-3xl"></div>
        </div>

        <div className="container mx-auto px-4 py-12 md:py-16 relative z-10">
          <div className="max-w-4xl mx-auto text-center text-white">
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 mb-6">
              <Sparkles className="h-4 w-4 text-yellow-300" />
              <span className="text-sm font-medium">Trung tâm trao đổi sách</span>
            </div>

            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Trao đổi sách
            </h1>
            
            <p className="text-lg text-white/80 mb-8 max-w-2xl mx-auto">
              Quản lý yêu cầu, theo dõi giao dịch và kết nối với cộng đồng yêu sách
            </p>

            {/* Quick Stats in Hero */}
            <div className="flex flex-wrap justify-center gap-4 md:gap-8">
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl px-6 py-4 min-w-[120px]">
                <div className="text-3xl font-bold">{stats?.active_exchanges || 0}</div>
                <div className="text-sm text-white/70">Đang tiến hành</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl px-6 py-4 min-w-[120px]">
                <div className="text-3xl font-bold">{stats?.pending_requests || 0}</div>
                <div className="text-sm text-white/70">Chờ xử lý</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl px-6 py-4 min-w-[120px]">
                <div className="text-3xl font-bold">{Math.round(stats?.success_rate || 0)}%</div>
                <div className="text-sm text-white/70">Tỷ lệ thành công</div>
              </div>
            </div>
          </div>
        </div>

        {/* Wave divider */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 120L60 110C120 100 240 80 360 70C480 60 600 60 720 65C840 70 960 80 1080 85C1200 90 1320 90 1380 90L1440 90V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" fill="#F9FAFB"/>
          </svg>
        </div>
      </section>

      <div className="bg-gray-50 min-h-screen">
        <div className="max-w-7xl mx-auto px-4 py-8">
          
          {/* Stats Cards Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
            <StatCard
              icon={Send}
              title="Đã gửi"
              value={stats?.total_requests_sent || 0}
              color="blue"
              onClick={() => navigate('/exchange/requests?type=sent')}
            />
            <StatCard
              icon={Inbox}
              title="Nhận được"
              value={stats?.total_requests_received || 0}
              color="green"
              onClick={() => navigate('/exchange/requests?type=received')}
            />
            <StatCard
              icon={Clock}
              title="Đang chờ"
              value={stats?.pending_requests || 0}
              color="amber"
              highlight={stats?.pending_requests > 0}
            />
            <StatCard
              icon={RefreshCw}
              title="Đang diễn ra"
              value={stats?.active_exchanges || 0}
              color="indigo"
              onClick={() => navigate('/exchange/list?status=IN_PROGRESS')}
            />
            <StatCard
              icon={CheckCircle}
              title="Hoàn tất"
              value={stats?.completed_exchanges || 0}
              color="emerald"
              onClick={() => navigate('/exchange/list?status=COMPLETED')}
            />
            <StatCard
              icon={TrendingUp}
              title="Tỷ lệ"
              value={`${Math.round(stats?.success_rate || 0)}%`}
              color="purple"
            />
          </div>

          {/* Main Navigation Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {/* Requests Card */}
            <div 
              onClick={() => navigate('/exchange/requests')}
              className="group bg-white rounded-2xl p-6 shadow-sm border border-gray-100 cursor-pointer hover:shadow-xl hover:border-blue-200 transition-all duration-300"
            >
              <div className="flex items-start justify-between mb-6">
                <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                  <MessageCircle className="h-7 w-7 text-white" />
                </div>
                <ChevronRight className="w-6 h-6 text-gray-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
              </div>
              
              <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                Yêu cầu trao đổi
              </h3>
              <p className="text-gray-600 text-sm mb-6">Quản lý yêu cầu gửi và nhận từ cộng đồng</p>
              
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-blue-50 p-4 rounded-xl text-center">
                  <div className="text-2xl font-bold text-blue-600">{stats?.total_requests_sent || 0}</div>
                  <div className="text-xs text-gray-600 font-medium">Đã gửi</div>
                </div>
                <div className="bg-green-50 p-4 rounded-xl text-center">
                  <div className="text-2xl font-bold text-green-600">{stats?.total_requests_received || 0}</div>
                  <div className="text-xs text-gray-600 font-medium">Nhận được</div>
                </div>
              </div>

              {stats?.pending_requests > 0 && (
                <div className="mt-4 bg-amber-50 border border-amber-200 rounded-xl px-4 py-2 flex items-center gap-2">
                  <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse"></div>
                  <span className="text-sm text-amber-700 font-medium">
                    {stats.pending_requests} yêu cầu đang chờ xử lý
                  </span>
                </div>
              )}
            </div>

            {/* Exchanges Card */}
            <div 
              onClick={() => navigate('/exchange/list')}
              className="group bg-white rounded-2xl p-6 shadow-sm border border-gray-100 cursor-pointer hover:shadow-xl hover:border-emerald-200 transition-all duration-300"
            >
              <div className="flex items-start justify-between mb-6">
                <div className="w-14 h-14 bg-gradient-to-br from-emerald-500 to-green-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                  <RefreshCw className="h-7 w-7 text-white" />
                </div>
                <ChevronRight className="w-6 h-6 text-gray-400 group-hover:text-emerald-600 group-hover:translate-x-1 transition-all" />
              </div>
              
              <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-emerald-600 transition-colors">
                Trao đổi của tôi
              </h3>
              <p className="text-gray-600 text-sm mb-6">Theo dõi tiến độ các giao dịch đang diễn ra</p>
              
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-indigo-50 p-4 rounded-xl text-center">
                  <div className="text-2xl font-bold text-indigo-600">{stats?.active_exchanges || 0}</div>
                  <div className="text-xs text-gray-600 font-medium">Đang tiến hành</div>
                </div>
                <div className="bg-purple-50 p-4 rounded-xl text-center">
                  <div className="text-2xl font-bold text-purple-600">{stats?.completed_exchanges || 0}</div>
                  <div className="text-xs text-gray-600 font-medium">Hoàn tất</div>
                </div>
              </div>

              {stats?.active_exchanges > 0 && (
                <div className="mt-4 bg-indigo-50 border border-indigo-200 rounded-xl px-4 py-2 flex items-center gap-2">
                  <RefreshCw className="w-4 h-4 text-indigo-500 animate-spin" />
                  <span className="text-sm text-indigo-700 font-medium">
                    {stats.active_exchanges} trao đổi đang diễn ra
                  </span>
                </div>
              )}
            </div>

            {/* Suggestions Card */}
            <div 
              onClick={() => navigate('/exchange/suggestions')}
              className="group bg-white rounded-2xl p-6 shadow-sm border border-gray-100 cursor-pointer hover:shadow-xl hover:border-purple-200 transition-all duration-300"
            >
              <div className="flex items-start justify-between mb-6">
                <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                  <Target className="h-7 w-7 text-white" />
                </div>
                <ChevronRight className="w-6 h-6 text-gray-400 group-hover:text-purple-600 group-hover:translate-x-1 transition-all" />
              </div>
              
              <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-purple-600 transition-colors">
                Gợi ý trao đổi
              </h3>
              <p className="text-gray-600 text-sm mb-6">Tìm đối tác phù hợp với sở thích của bạn</p>
              
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-4 rounded-xl">
                <div className="flex items-center gap-3 mb-3">
                  <Zap className="w-5 h-5 text-purple-600" />
                  <span className="font-medium text-gray-900">Tính năng thông minh</span>
                </div>
                <p className="text-sm text-gray-600">
                  Hệ thống tự động gợi ý dựa trên sách bạn có và danh sách mong muốn
                </p>
              </div>

              <button className="mt-4 w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 rounded-xl font-medium hover:from-purple-700 hover:to-pink-700 transition-all flex items-center justify-center gap-2">
                <Sparkles className="w-5 h-5" />
                Tìm gợi ý ngay
              </button>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-gradient-to-r from-emerald-500 to-teal-600 rounded-2xl p-6 md:p-8 text-white">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
              <div>
                <h3 className="text-2xl font-bold mb-2">Bắt đầu trao đổi sách ngay!</h3>
                <p className="text-emerald-100 max-w-xl">
                  Khám phá hàng ngàn cuốn sách từ cộng đồng BookSwap. Tìm kiếm, đề xuất và trao đổi dễ dàng.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <Link to="/books">
                  <button className="w-full sm:w-auto bg-white text-emerald-600 hover:bg-emerald-50 px-6 py-3 rounded-xl font-semibold transition-colors flex items-center justify-center gap-2">
                    <BookOpen className="w-5 h-5" />
                    Khám phá sách
                  </button>
                </Link>
                <Link to="/exchange/suggestions">
                  <button className="w-full sm:w-auto bg-white/20 backdrop-blur-sm border-2 border-white/30 text-white hover:bg-white/30 px-6 py-3 rounded-xl font-semibold transition-colors flex items-center justify-center gap-2">
                    <Target className="w-5 h-5" />
                    Tìm gợi ý
                  </button>
                </Link>
              </div>
            </div>
          </div>

          {/* Meetings Link - if user has meetings */}
          <div className="mt-6">
            <Link 
              to="/exchange/meetings"
              className="flex items-center justify-between bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md hover:border-blue-200 transition-all group"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                  <Calendar className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">Lịch hẹn gặp</h4>
                  <p className="text-sm text-gray-600">Quản lý các buổi hẹn trao đổi sách</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
            </Link>
          </div>
        </div>
      </div>
    </Layout>
  );
};

// Stats Card Component - Enhanced
const StatCard = ({ icon: Icon, title, value, color, onClick, highlight }) => {
  const colorConfig = {
    blue: {
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      icon: 'bg-blue-500',
      text: 'text-blue-700',
      hover: 'hover:border-blue-300 hover:shadow-blue-100'
    },
    green: {
      bg: 'bg-green-50',
      border: 'border-green-200',
      icon: 'bg-green-500',
      text: 'text-green-700',
      hover: 'hover:border-green-300 hover:shadow-green-100'
    },
    amber: {
      bg: 'bg-amber-50',
      border: 'border-amber-200',
      icon: 'bg-amber-500',
      text: 'text-amber-700',
      hover: 'hover:border-amber-300 hover:shadow-amber-100'
    },
    indigo: {
      bg: 'bg-indigo-50',
      border: 'border-indigo-200',
      icon: 'bg-indigo-500',
      text: 'text-indigo-700',
      hover: 'hover:border-indigo-300 hover:shadow-indigo-100'
    },
    emerald: {
      bg: 'bg-emerald-50',
      border: 'border-emerald-200',
      icon: 'bg-emerald-500',
      text: 'text-emerald-700',
      hover: 'hover:border-emerald-300 hover:shadow-emerald-100'
    },
    purple: {
      bg: 'bg-purple-50',
      border: 'border-purple-200',
      icon: 'bg-purple-500',
      text: 'text-purple-700',
      hover: 'hover:border-purple-300 hover:shadow-purple-100'
    }
  };

  const config = colorConfig[color] || colorConfig.blue;

  return (
    <div 
      onClick={onClick}
      className={`
        ${config.bg} border ${config.border} rounded-2xl p-4 
        ${onClick ? 'cursor-pointer' : ''} 
        ${config.hover}
        transition-all duration-300 hover:shadow-lg
        ${highlight ? 'ring-2 ring-amber-400 ring-offset-2' : ''}
      `}
    >
      <div className={`w-10 h-10 ${config.icon} rounded-xl flex items-center justify-center mb-3 shadow-sm`}>
        <Icon className="w-5 h-5 text-white" />
      </div>
      <div className={`text-2xl font-bold ${config.text} mb-1`}>{value}</div>
      <div className="text-sm text-gray-600 font-medium">{title}</div>
      {highlight && (
        <div className="mt-2 flex items-center gap-1">
          <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse"></div>
          <span className="text-xs text-amber-600">Cần xử lý</span>
        </div>
      )}
    </div>
  );
};

export default ExchangePage;
