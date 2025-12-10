import {
  ArcElement,
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  Title,
  Tooltip,
} from 'chart.js';
import {
  Activity,
  AlertCircle,
  ArrowLeftRight,
  BookOpen,
  Star,
  TrendingUp,
  Users,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { Bar, Doughnut } from 'react-chartjs-2';
import { useAdminDashboard } from '../../hooks/useAdmin';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
);

const DashboardStats = () => {
  const { stats, loading, error, fetchDashboardStats } = useAdminDashboard();
  const [mockData] = useState({
    users: {
      total: 12,
      active: 5,
      locked: 1,
      deleted: 7,
      new_today: 0,
    },
    books: {
      total: 8,
      available: 3,
      borrowing: 1,
      exchanging: 2,
      removed: 3,
    },
    exchanges: {
      total: 5,
      completed: 3,
      pending: 2,
      success_rate: 60.0,
    },
    reports: {
      total: 2,
      pending: 1,
      resolved: 1,
      avg_resolution_time: 2.5,
    },
  });

  // Always prefer real API data, only fallback to mock when API fails
  const displayStats = stats || mockData;

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      await fetchDashboardStats();
      console.log('API stats received:', stats);
      console.log('API users data:', stats?.users);
      console.log('Mock data:', mockData);
      console.log('Display stats being used:', displayStats);
      console.log(
        'Using API data?',
        stats && stats.users && typeof stats.users.deleted !== 'undefined',
      );
    } catch (err) {
      console.error('Failed to load dashboard stats:', err);
    }
  };

  if (loading && !mockData) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
          <p className="mt-4 text-gray-600">Đang tải thống kê...</p>
        </div>
      </div>
    );
  }

  if (error && !mockData) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <p className="text-red-600 text-lg mb-4">Không thể tải thống kê</p>
          <button
            onClick={loadStats}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90 mb-1">Tổng người dùng</p>
              <p className="text-3xl font-bold">
                {displayStats?.users?.total?.toLocaleString() || 0}
              </p>
              {displayStats?.users?.new_today > 0 && (
                <p className="text-xs mt-2 opacity-75">
                  +{displayStats.users.new_today} hôm nay
                </p>
              )}
            </div>
            <div className="bg-white bg-opacity-20 rounded-full p-3">
              <Users className="h-8 w-8" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 text-white rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90 mb-1">Tổng sách</p>
              <p className="text-3xl font-bold">
                {displayStats?.books?.total?.toLocaleString() || 0}
              </p>
              {displayStats?.books?.available > 0 && (
                <p className="text-xs mt-2 opacity-75">
                  {displayStats.books.available} có sẵn
                </p>
              )}
            </div>
            <div className="bg-white bg-opacity-20 rounded-full p-3">
              <BookOpen className="h-8 w-8" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90 mb-1">Tổng giao dịch</p>
              <p className="text-3xl font-bold">
                {displayStats?.exchanges?.total?.toLocaleString() || 0}
              </p>
              {displayStats?.exchanges?.pending > 0 && (
                <p className="text-xs mt-2 opacity-75">
                  {displayStats.exchanges.pending} đang hoạt động
                </p>
              )}
            </div>
            <div className="bg-white bg-opacity-20 rounded-full p-3">
              <ArrowLeftRight className="h-8 w-8" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-500 to-orange-600 text-white rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90 mb-1">Tổng báo cáo</p>
              <p className="text-3xl font-bold">
                {displayStats?.reports?.total?.toLocaleString() || 0}
              </p>
              {displayStats?.reports?.pending > 0 && (
                <p className="text-xs mt-2 opacity-75">
                  {displayStats.reports.pending} chưa xử lý
                </p>
              )}
            </div>
            <div className="bg-white bg-opacity-20 rounded-full p-3">
              <Star className="h-8 w-8" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-600">
              Tỷ lệ giao dịch thành công
            </h3>
            <TrendingUp className="h-5 w-5 text-green-600" />
          </div>
          <p className="text-3xl font-bold text-gray-900">
            {displayStats?.exchanges?.success_rate?.toFixed(1) || 0}%
          </p>
          <p className="text-xs text-gray-500 mt-2">30 ngày qua</p>
          <div className="mt-4 bg-gray-200 rounded-full h-2">
            <div
              className="bg-green-600 h-2 rounded-full transition-all"
              style={{
                width: `${displayStats?.exchanges?.success_rate || 0}%`,
              }}
            />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-600">
              Người dùng hoạt động
            </h3>
            <Users className="h-5 w-5 text-blue-600" />
          </div>
          <p className="text-3xl font-bold text-gray-900">
            {displayStats?.users?.active || 0}
          </p>
          <p className="text-xs text-gray-500 mt-2">
            {displayStats?.users?.total > 0
              ? (
                  (displayStats.users.active / displayStats.users.total) *
                  100
                ).toFixed(0)
              : 0}
            % tổng số users
          </p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-600">Sách có sẵn</h3>
            <BookOpen className="h-5 w-5 text-green-600" />
          </div>
          <p className="text-3xl font-bold text-gray-900">
            {displayStats?.books?.available || 0}
          </p>
          <p className="text-xs text-gray-500 mt-2">Hiện tại</p>
          <p className="text-xs text-gray-600 mt-1">
            {displayStats?.books?.exchanging || 0} đang trao đổi
          </p>
        </div>
      </div>

      <div className="space-y-6">
        <h3 className="text-xl font-bold text-gray-800">Biểu đồ thống kê</h3>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h4 className="text-lg font-semibold text-gray-800 mb-4">
              Tỷ lệ giao dịch thành công
            </h4>
            <div className="h-64">
              <Doughnut
                data={{
                  labels: ['Thành công', 'Thất bại'],
                  datasets: [
                    {
                      data: [
                        displayStats?.exchanges?.completed || 0,
                        (displayStats?.exchanges?.total || 0) -
                          (displayStats?.exchanges?.completed || 0),
                      ],
                      backgroundColor: ['#10B981', '#EF4444'],
                      hoverBackgroundColor: ['#059669', '#DC2626'],
                      borderWidth: 0,
                    },
                  ],
                }}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: { position: 'bottom' },
                    tooltip: {
                      callbacks: {
                        label: function (context) {
                          const total = context.dataset.data.reduce(
                            (a, b) => a + b,
                            0,
                          );
                          const percentage =
                            total > 0
                              ? ((context.parsed / total) * 100).toFixed(1)
                              : 0;
                          return `${context.label}: ${context.parsed} (${percentage}%)`;
                        },
                      },
                    },
                  },
                }}
              />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h4 className="text-lg font-semibold text-gray-800 mb-4">
              Phân bố trạng thái người dùng
            </h4>
            <div className="h-64">
              <Bar
                data={{
                  labels: ['Hoạt động', 'Khóa'],
                  datasets: [
                    {
                      label: 'Số lượng',
                      data: [
                        displayStats?.users?.active || 0,
                        displayStats?.users?.locked || 0,
                      ],
                      backgroundColor: ['#3B82F6', '#F59E0B'],
                      borderColor: ['#2563EB', '#D97706'],
                      borderWidth: 2,
                    },
                  ],
                }}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: { display: false },
                  },
                  scales: {
                    y: { beginAtZero: true },
                  },
                }}
              />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h4 className="text-lg font-semibold text-gray-800 mb-4">
              Phân bố trạng thái sách
            </h4>
            <div className="h-64">
              <Doughnut
                data={{
                  labels: ['Có sẵn', 'Đang trao đổi'],
                  datasets: [
                    {
                      data: [
                        displayStats?.books?.available || 0,
                        displayStats?.books?.exchanging || 0,
                      ],
                      backgroundColor: ['#10B981', '#F59E0B'],
                      hoverBackgroundColor: ['#059669', '#D97706'],
                      borderWidth: 0,
                    },
                  ],
                }}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: { position: 'bottom' },
                    tooltip: {
                      callbacks: {
                        label: function (context) {
                          const total = context.dataset.data.reduce(
                            (a, b) => a + b,
                            0,
                          );
                          const percentage =
                            total > 0
                              ? ((context.parsed / total) * 100).toFixed(1)
                              : 0;
                          return `${context.label}: ${context.parsed} (${percentage}%)`;
                        },
                      },
                    },
                  },
                }}
              />
            </div>
          </div>
        </div>
      </div>

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
