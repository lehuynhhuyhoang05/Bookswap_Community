import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../../components/layout/Layout';
import { Card, Button, LoadingSpinner } from '../../components/ui';
import { useExchanges } from '../../hooks/useExchanges';
import { Send, Inbox, Clock, CheckCircle, TrendingUp, RefreshCw, ArrowRight, Plus } from 'lucide-react';

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
        <div className="flex flex-col items-center justify-center min-h-screen">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-gray-600">Đang tải thống kê...</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Trao đổi sách</h1>
          <p className="text-gray-600">Quản lý yêu cầu và trao đổi sách của bạn</p>
        </div>

        {/* Stats Cards - Map từ ExchangeStatsResponseDto */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
          <StatCard
            icon={Send}
            title="Đã gửi"
            value={stats?.total_requests_sent || 0}
            color="blue"
          />
          <StatCard
            icon={Inbox}
            title="Nhận được"
            value={stats?.total_requests_received || 0}
            color="green"
          />
          <StatCard
            icon={Clock}
            title="Đang chờ"
            value={stats?.pending_requests || 0}
            color="yellow"
          />
          <StatCard
            icon={RefreshCw}
            title="Đang diễn ra"
            value={stats?.active_exchanges || 0}
            color="indigo"
          />
          <StatCard
            icon={CheckCircle}
            title="Hoàn tất"
            value={stats?.completed_exchanges || 0}
            color="purple"
          />
          <StatCard
            icon={TrendingUp}
            title="Tỷ lệ"
            value={`${Math.round(stats?.success_rate || 0)}%`}
            color="emerald"
          />
        </div>

        {/* Main Navigation Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Requests Card */}
          <Card className="p-6 cursor-pointer hover:shadow-xl transition-all hover:scale-105 border-2 border-blue-200 hover:border-blue-400">
            <div 
              onClick={() => navigate('/exchange/requests')}
              className="space-y-4"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-1">Yêu cầu trao đổi</h3>
                  <p className="text-sm text-gray-600">Quản lý yêu cầu gửi và nhận</p>
                </div>
                <ArrowRight className="w-6 h-6 text-blue-600" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-blue-50 p-3 rounded-lg text-center">
                  <div className="text-2xl font-bold text-blue-600">{stats?.total_requests_sent || 0}</div>
                  <div className="text-xs text-gray-600">Đã gửi</div>
                </div>
                <div className="bg-green-50 p-3 rounded-lg text-center">
                  <div className="text-2xl font-bold text-green-600">{stats?.total_requests_received || 0}</div>
                  <div className="text-xs text-gray-600">Nhận được</div>
                </div>
              </div>
            </div>
          </Card>

          {/* Exchanges Card */}
          <Card className="p-6 cursor-pointer hover:shadow-xl transition-all hover:scale-105 border-2 border-green-200 hover:border-green-400">
            <div 
              onClick={() => navigate('/exchange/list')}
              className="space-y-4"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-1">Trao đổi</h3>
                  <p className="text-sm text-gray-600">Theo dõi giao dịch</p>
                </div>
                <ArrowRight className="w-6 h-6 text-green-600" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-yellow-50 p-3 rounded-lg text-center">
                  <div className="text-2xl font-bold text-yellow-600">{stats?.active_exchanges || 0}</div>
                  <div className="text-xs text-gray-600">Đang tiến hành</div>
                </div>
                <div className="bg-purple-50 p-3 rounded-lg text-center">
                  <div className="text-2xl font-bold text-purple-600">{stats?.completed_exchanges || 0}</div>
                  <div className="text-xs text-gray-600">Hoàn tất</div>
                </div>
              </div>
            </div>
          </Card>

          {/* Suggestions Card */}
          <Card className="p-6 cursor-pointer hover:shadow-xl transition-all hover:scale-105 border-2 border-purple-200 hover:border-purple-400">
            <div 
              onClick={() => navigate('/exchange/suggestions')}
              className="space-y-4"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-1">Gợi ý</h3>
                  <p className="text-sm text-gray-600">Tìm đối tác phù hợp</p>
                </div>
                <Plus className="w-6 h-6 text-purple-600" />
              </div>
              <Button variant="primary" className="w-full">
                Tìm gợi ý mới
              </Button>
            </div>
          </Card>
        </div>

        {/* Call to Action */}
        <Card className="p-6 bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-1">Bắt đầu trao đổi sách</h3>
              <p className="text-gray-600 text-sm">
                Tạo yêu cầu trao đổi với các thành viên khác hoặc tìm gợi ý phù hợp
              </p>
            </div>
            <Button 
              variant="primary" 
              size="lg"
              onClick={() => navigate('/exchange/suggestions')}
            >
              Tìm gợi ý ngay
            </Button>
          </div>
        </Card>
      </div>
    </Layout>
  );
};

// Stats Card Component
const StatCard = ({ icon: Icon, title, value, color }) => {
  const colorClasses = {
    blue: 'bg-blue-50 border-blue-200 text-blue-700',
    green: 'bg-green-50 border-green-200 text-green-700',
    yellow: 'bg-yellow-50 border-yellow-200 text-yellow-700',
    indigo: 'bg-indigo-50 border-indigo-200 text-indigo-700',
    purple: 'bg-purple-50 border-purple-200 text-purple-700',
    emerald: 'bg-emerald-50 border-emerald-200 text-emerald-700'
  };

  return (
    <div className={`border rounded-lg p-4 text-center transition-all hover:shadow-md ${colorClasses[color]}`}>
      <div className="flex justify-center mb-2">
        <Icon className="w-8 h-8" />
      </div>
      <div className="text-3xl font-bold mb-1">{value}</div>
      <div className="font-semibold text-sm">{title}</div>
    </div>
  );
};

export default ExchangePage;
