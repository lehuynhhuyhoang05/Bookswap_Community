import {
  Activity,
  AlertCircle,
  ArrowLeftRight,
  BookOpen,
  Star,
  TrendingUp,
  Users,
} from 'lucide-react';
import { useEffect } from 'react';
import { useAdminDashboard } from '../../hooks/useAdmin';

const DashboardStats = () => {
  const { stats, loading, error, fetchDashboardStats } = useAdminDashboard();

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      await fetchDashboardStats();
    } catch (err) {
      console.error('Failed to load dashboard stats:', err);
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
          <p className="mt-4 text-gray-600">Đang tải thống kê...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 flex items-center text-red-700">
          <AlertCircle className="h-6 w-6 mr-3" />
          <div>
            <h3 className="font-bold">Lỗi tải dữ liệu</h3>
            <p>{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="p-6">
        <div className="text-center py-12 text-gray-500">Không có dữ liệu</div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          Dashboard Admin
        </h2>
        <p className="text-gray-600">Tổng quan hệ thống BookSwap</p>
      </div>

      {/* Main Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Users */}
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90 mb-1">Tổng người dùng</p>
              <p className="text-3xl font-bold">
                {stats.users?.total?.toLocaleString() || 0}
              </p>
              {stats.users?.new_today > 0 && (
                <p className="text-xs mt-2 opacity-75">
                  +{stats.users.new_today} hôm nay
                </p>
              )}
            </div>
            <div className="bg-white bg-opacity-20 rounded-full p-3">
              <Users className="h-8 w-8" />
            </div>
          </div>
        </div>

        {/* Total Books */}
        <div className="bg-gradient-to-br from-green-500 to-green-600 text-white rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90 mb-1">Tổng sách</p>
              <p className="text-3xl font-bold">
                {stats.books?.total?.toLocaleString() || 0}
              </p>
              {stats.books?.available > 0 && (
                <p className="text-xs mt-2 opacity-75">
                  {stats.books.available} có sẵn
                </p>
              )}
            </div>
            <div className="bg-white bg-opacity-20 rounded-full p-3">
              <BookOpen className="h-8 w-8" />
            </div>
          </div>
        </div>

        {/* Total Exchanges */}
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90 mb-1">Tổng giao dịch</p>
              <p className="text-3xl font-bold">
                {stats.exchanges?.total?.toLocaleString() || 0}
              </p>
              {stats.exchanges?.pending > 0 && (
                <p className="text-xs mt-2 opacity-75">
                  {stats.exchanges.pending} đang hoạt động
                </p>
              )}
            </div>
            <div className="bg-white bg-opacity-20 rounded-full p-3">
              <ArrowLeftRight className="h-8 w-8" />
            </div>
          </div>
        </div>

        {/* Total Reports */}
        <div className="bg-gradient-to-br from-orange-500 to-orange-600 text-white rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90 mb-1">Tổng báo cáo</p>
              <p className="text-3xl font-bold">
                {stats.reports?.total?.toLocaleString() || 0}
              </p>
              {stats.reports?.pending > 0 && (
                <p className="text-xs mt-2 opacity-75">
                  {stats.reports.pending} chưa xử lý
                </p>
              )}
            </div>
            <div className="bg-white bg-opacity-20 rounded-full p-3">
              <Star className="h-8 w-8" />
            </div>
          </div>
        </div>
      </div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Exchange Success Rate */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-600">
              Tỷ lệ giao dịch thành công
            </h3>
            <TrendingUp className="h-5 w-5 text-green-600" />
          </div>
          <p className="text-3xl font-bold text-gray-900">
            {stats.exchanges?.success_rate?.toFixed(1) || 0}%
          </p>
          <p className="text-xs text-gray-500 mt-2">30 ngày qua</p>
          <div className="mt-4 bg-gray-200 rounded-full h-2">
            <div
              className="bg-green-600 h-2 rounded-full transition-all"
              style={{ width: `${stats.exchanges?.success_rate || 0}%` }}
            />
          </div>
        </div>

        {/* Active Users */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-600">
              Người dùng hoạt động
            </h3>
            <Users className="h-5 w-5 text-blue-600" />
          </div>
          <p className="text-3xl font-bold text-gray-900">
            {stats.users?.active || 0}
          </p>
          <p className="text-xs text-gray-500 mt-2">
            {stats.users?.total > 0
              ? ((stats.users.active / stats.users.total) * 100).toFixed(0)
              : 0}
            % tổng số users
          </p>
        </div>

        {/* Available Books */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-600">Sách có sẵn</h3>
            <BookOpen className="h-5 w-5 text-green-600" />
          </div>
          <p className="text-3xl font-bold text-gray-900">
            {stats.books?.available || 0}
          </p>
          <p className="text-xs text-gray-500 mt-2">Hiện tại</p>
          <p className="text-xs text-gray-600 mt-1">
            {stats.books?.exchanging || 0} đang trao đổi
          </p>
        </div>
      </div>

      {/* Refresh Button */}
      <div className="flex justify-center">
        <button
          onClick={loadStats}
          disabled={loading}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center"
        >
          <Activity className="h-4 w-4 mr-2" />
          {loading ? 'Đang tải...' : 'Làm mới dữ liệu'}
        </button>
      </div>
    </div>
  );
};

export default DashboardStats;
