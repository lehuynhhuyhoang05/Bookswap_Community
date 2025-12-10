import {
  AlertCircle,
  AlertTriangle,
  ArrowDown,
  ArrowUp,
  BarChart3,
  BookOpen,
  CheckCircle,
  Clock,
  Download,
  FileSpreadsheet,
  FileText,
  Globe,
  Info,
  MapPin,
  MessageSquare,
  Percent,
  RefreshCw,
  Shield,
  Star,
  TrendingDown,
  TrendingUp,
  Trophy,
  User,
  Users,
  XCircle,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import * as XLSX from 'xlsx';
import { useSystemReports } from '../../hooks/useAdmin';
import { getFullSystemReport } from '../../services/api/adminSystemReports';

const SystemReports = () => {
  const {
    overview,
    trends,
    regions,
    categories,
    topPerformers,
    alerts,
    loading,
    error,
    fetchOverview,
    fetchTrends,
    fetchRegions,
    fetchCategories,
    fetchTopPerformers,
    fetchAlerts,
    fetchAllData,
  } = useSystemReports();

  const [selectedTab, setSelectedTab] = useState('overview');
  const [trendDays, setTrendDays] = useState(30);

  useEffect(() => {
    fetchAllData();
  }, []);

  useEffect(() => {
    if (selectedTab === 'trends') {
      fetchTrends(trendDays);
    }
  }, [trendDays]);

  const handleRefresh = () => {
    fetchAllData();
  };

  const [exporting, setExporting] = useState(false);

  const handleExportReport = async () => {
    try {
      setExporting(true);
      const data = await getFullSystemReport();
      
      // Tạo workbook Excel
      const wb = XLSX.utils.book_new();
      
      // ===== Sheet 1: Tổng quan =====
      const overviewData = [
        ['BÁO CÁO TỔNG THỂ HỆ THỐNG BOOKSWAP'],
        ['Ngày xuất báo cáo:', new Date().toLocaleString('vi-VN')],
        [],
        ['=== NGƯỜI DÙNG ==='],
        ['Tổng số người dùng', data.overview?.users?.total || 0],
        ['Đang hoạt động', data.overview?.users?.active || 0],
        ['Bị khóa', data.overview?.users?.locked || 0],
        ['Đình chỉ', data.overview?.users?.suspended || 0],
        ['Tỉ lệ hoạt động (%)', data.overview?.users?.active_rate || 0],
        ['Mới trong 7 ngày', data.overview?.users?.new_last_7_days || 0],
        ['Mới trong 30 ngày', data.overview?.users?.new_last_30_days || 0],
        [],
        ['=== THÀNH VIÊN ==='],
        ['Tổng số thành viên', data.overview?.members?.total || 0],
        ['Trust Score TB', data.overview?.members?.avg_trust_score || 0],
        ['Trust Score thấp nhất', data.overview?.members?.min_trust_score || 0],
        ['Trust Score cao nhất', data.overview?.members?.max_trust_score || 0],
        ['Thành viên Trust thấp (<30)', data.overview?.members?.low_trust_count || 0],
        ['Thành viên Trust TB (30-70)', data.overview?.members?.medium_trust_count || 0],
        ['Thành viên Trust cao (>70)', data.overview?.members?.high_trust_count || 0],
        [],
        ['=== SÁCH ==='],
        ['Tổng số sách', data.overview?.books?.total || 0],
        ['Sẵn có', data.overview?.books?.available || 0],
        ['Đang trao đổi', data.overview?.books?.exchanging || 0],
        ['Đã xóa', data.overview?.books?.removed || 0],
        ['Mới trong 7 ngày', data.overview?.books?.new_last_7_days || 0],
        ['Mới trong 30 ngày', data.overview?.books?.new_last_30_days || 0],
        [],
        ['=== GIAO DỊCH ==='],
        ['Tổng giao dịch', data.overview?.exchanges?.total || 0],
        ['Hoàn thành', data.overview?.exchanges?.completed || 0],
        ['Chờ xác nhận', data.overview?.exchanges?.pending || 0],
        ['Đã chấp nhận', data.overview?.exchanges?.accepted || 0],
        ['Đang xử lý', data.overview?.exchanges?.in_progress || 0],
        ['Đã hủy', data.overview?.exchanges?.cancelled || 0],
        ['Tỉ lệ thành công (%)', data.overview?.exchanges?.success_rate || 0],
        ['Mới trong 7 ngày', data.overview?.exchanges?.new_last_7_days || 0],
        ['Mới trong 30 ngày', data.overview?.exchanges?.new_last_30_days || 0],
        ['Hoàn thành trong 30 ngày', data.overview?.exchanges?.completed_last_30_days || 0],
        ['Thời gian hoàn thành TB (giờ)', data.overview?.exchanges?.avg_completion_hours || 0],
        [],
        ['=== BÁO CÁO VI PHẠM ==='],
        ['Tổng báo cáo', data.overview?.reports?.total || 0],
        ['Chờ xử lý', data.overview?.reports?.pending || 0],
        ['Đã giải quyết', data.overview?.reports?.resolved || 0],
        ['Đã từ chối', data.overview?.reports?.dismissed || 0],
        ['Tỉ lệ xử lý (%)', data.overview?.reports?.resolve_rate || 0],
        ['Mới trong 7 ngày', data.overview?.reports?.new_last_7_days || 0],
        [],
        ['=== ĐÁNH GIÁ ==='],
        ['Tổng đánh giá', data.overview?.reviews?.total || 0],
        ['Đánh giá TB', data.overview?.reviews?.avg_rating || 0],
        [],
        ['=== TIN NHẮN ==='],
        ['Tổng tin nhắn', data.overview?.messages?.total || 0],
        ['Tổng cuộc hội thoại', data.overview?.messages?.conversations || 0],
        ['Tin nhắn trong 7 ngày', data.overview?.messages?.last_7_days || 0],
      ];
      const wsOverview = XLSX.utils.aoa_to_sheet(overviewData);
      wsOverview['!cols'] = [{ wch: 30 }, { wch: 20 }];
      XLSX.utils.book_append_sheet(wb, wsOverview, 'Tổng quan');

      // ===== Sheet 2: Xu hướng =====
      const trendsHeader = ['Ngày', 'Người dùng mới', 'Sách mới', 'Giao dịch mới', 'GD hoàn thành', 'Báo cáo mới'];
      const trendsData = [trendsHeader];
      
      // Merge all dates
      const allDates = new Set();
      data.trends?.trends?.new_users?.forEach(d => allDates.add(d.date));
      data.trends?.trends?.new_books?.forEach(d => allDates.add(d.date));
      data.trends?.trends?.new_exchanges?.forEach(d => allDates.add(d.date));
      data.trends?.trends?.completed_exchanges?.forEach(d => allDates.add(d.date));
      data.trends?.trends?.new_reports?.forEach(d => allDates.add(d.date));
      
      const sortedDates = Array.from(allDates).sort();
      
      sortedDates.forEach(date => {
        const newUsers = data.trends?.trends?.new_users?.find(d => d.date === date)?.count || 0;
        const newBooks = data.trends?.trends?.new_books?.find(d => d.date === date)?.count || 0;
        const newExchanges = data.trends?.trends?.new_exchanges?.find(d => d.date === date)?.count || 0;
        const completedExchanges = data.trends?.trends?.completed_exchanges?.find(d => d.date === date)?.count || 0;
        const newReports = data.trends?.trends?.new_reports?.find(d => d.date === date)?.count || 0;
        trendsData.push([
          new Date(date).toLocaleDateString('vi-VN'),
          parseInt(newUsers),
          parseInt(newBooks),
          parseInt(newExchanges),
          parseInt(completedExchanges),
          parseInt(newReports)
        ]);
      });
      
      // Add summary row
      trendsData.push([]);
      trendsData.push(['TỔNG CỘNG', 
        data.trends?.summary?.total_new_users || 0,
        data.trends?.summary?.total_new_books || 0,
        data.trends?.summary?.total_new_exchanges || 0,
        data.trends?.summary?.total_completed_exchanges || 0,
        data.trends?.summary?.total_new_reports || 0
      ]);
      
      const wsTrends = XLSX.utils.aoa_to_sheet(trendsData);
      wsTrends['!cols'] = [{ wch: 15 }, { wch: 15 }, { wch: 12 }, { wch: 15 }, { wch: 15 }, { wch: 12 }];
      XLSX.utils.book_append_sheet(wb, wsTrends, 'Xu hướng');

      // ===== Sheet 3: Theo vùng =====
      const regionsData = [
        ['THỐNG KÊ THEO VÙNG'],
        [],
        ['Vùng', 'Số thành viên', 'Số sách', 'Số giao dịch', 'Trust Score TB', 'Trust Min', 'Trust Max'],
      ];
      
      const regionMap = new Map();
      data.regions?.members_by_region?.forEach(r => {
        regionMap.set(r.region || 'Không xác định', { 
          members: parseInt(r.member_count) || 0, books: 0, exchanges: 0, avgTrust: 0, minTrust: 0, maxTrust: 0 
        });
      });
      data.regions?.books_by_region?.forEach(r => {
        const region = regionMap.get(r.region || 'Không xác định') || { members: 0, books: 0, exchanges: 0 };
        region.books = parseInt(r.book_count) || 0;
        regionMap.set(r.region || 'Không xác định', region);
      });
      data.regions?.exchanges_by_region?.forEach(r => {
        const region = regionMap.get(r.region || 'Không xác định') || { members: 0, books: 0, exchanges: 0 };
        region.exchanges = parseInt(r.exchange_count) || 0;
        regionMap.set(r.region || 'Không xác định', region);
      });
      data.regions?.trust_score_by_region?.forEach(r => {
        const region = regionMap.get(r.region || 'Không xác định') || { members: 0, books: 0, exchanges: 0 };
        region.avgTrust = r.avg_trust_score || 0;
        region.minTrust = r.min_trust_score || 0;
        region.maxTrust = r.max_trust_score || 0;
        regionMap.set(r.region || 'Không xác định', region);
      });
      
      regionMap.forEach((value, key) => {
        regionsData.push([key, value.members, value.books, value.exchanges, value.avgTrust, value.minTrust, value.maxTrust]);
      });
      
      const wsRegions = XLSX.utils.aoa_to_sheet(regionsData);
      wsRegions['!cols'] = [{ wch: 20 }, { wch: 15 }, { wch: 12 }, { wch: 15 }, { wch: 15 }, { wch: 12 }, { wch: 12 }];
      XLSX.utils.book_append_sheet(wb, wsRegions, 'Theo vùng');

      // ===== Sheet 4: Thể loại sách =====
      const categoriesData = [
        ['THỐNG KÊ SÁCH THEO THỂ LOẠI'],
        [],
        ['Thể loại', 'Tổng', 'Sẵn có', 'Đang trao đổi'],
      ];
      data.categories?.categories?.forEach(c => {
        categoriesData.push([c.category, c.total, c.available, c.exchanging]);
      });
      
      const wsCategories = XLSX.utils.aoa_to_sheet(categoriesData);
      wsCategories['!cols'] = [{ wch: 25 }, { wch: 10 }, { wch: 12 }, { wch: 15 }];
      XLSX.utils.book_append_sheet(wb, wsCategories, 'Thể loại sách');

      // ===== Sheet 5: Top thành viên =====
      const topData = [
        ['TOP THÀNH VIÊN NỔI BẬT'],
        [],
        ['=== TOP GIAO DỊCH ==='],
        ['Hạng', 'Họ tên', 'Email', 'Số giao dịch', 'Trust Score'],
      ];
      data.top_performers?.top_exchangers?.forEach((t, i) => {
        topData.push([i + 1, t.full_name || t.email, t.email, t.exchange_count, t.trust_score]);
      });
      
      topData.push([]);
      topData.push(['=== TOP ĐÓNG GÓP SÁCH ===']);
      topData.push(['Hạng', 'Họ tên', 'Email', 'Số sách']);
      data.top_performers?.top_book_contributors?.forEach((t, i) => {
        topData.push([i + 1, t.full_name || t.email, t.email, t.book_count]);
      });
      
      topData.push([]);
      topData.push(['=== TOP ĐÁNH GIÁ CAO NHẤT ===']);
      topData.push(['Hạng', 'Họ tên', 'Email', 'Đánh giá TB', 'Số đánh giá']);
      data.top_performers?.highest_rated?.forEach((t, i) => {
        topData.push([i + 1, t.full_name || t.email, t.email, t.avg_rating, t.review_count]);
      });
      
      topData.push([]);
      topData.push(['=== TOP NGƯỜI ĐÁNH GIÁ ===']);
      topData.push(['Hạng', 'Họ tên', 'Email', 'Số đánh giá', 'Đánh giá TB cho']);
      data.top_performers?.top_reviewers?.forEach((t, i) => {
        topData.push([i + 1, t.full_name || t.email, t.email, t.review_count, t.avg_rating_given]);
      });
      
      const wsTop = XLSX.utils.aoa_to_sheet(topData);
      wsTop['!cols'] = [{ wch: 8 }, { wch: 25 }, { wch: 30 }, { wch: 15 }, { wch: 15 }];
      XLSX.utils.book_append_sheet(wb, wsTop, 'Top thành viên');

      // ===== Sheet 6: Cảnh báo =====
      const alertsData = [
        ['CẢNH BÁO HỆ THỐNG'],
        [],
        ['Loại', 'Mức độ', 'Nội dung', 'Số lượng'],
      ];
      data.alerts?.alerts?.forEach(a => {
        alertsData.push([a.type, a.severity === 'critical' ? 'Nghiêm trọng' : a.severity === 'warning' ? 'Cảnh báo' : 'Thông tin', a.message, a.count]);
      });
      
      alertsData.push([]);
      alertsData.push(['=== TÓM TẮT ===']);
      alertsData.push(['Báo cáo chờ xử lý', data.alerts?.summary?.pending_reports || 0]);
      alertsData.push(['Báo cáo ưu tiên cao', data.alerts?.summary?.high_priority_reports || 0]);
      alertsData.push(['Giao dịch quá hạn', data.alerts?.summary?.stale_exchanges || 0]);
      alertsData.push(['Người dùng Trust thấp', data.alerts?.summary?.low_trust_users || 0]);
      alertsData.push(['TK bị khóa gần đây', data.alerts?.summary?.recently_locked_users || 0]);
      alertsData.push(['Sách bị xóa gần đây', data.alerts?.summary?.recently_removed_books || 0]);
      alertsData.push(['GD bị hủy gần đây', data.alerts?.summary?.recently_cancelled_exchanges || 0]);
      
      const wsAlerts = XLSX.utils.aoa_to_sheet(alertsData);
      wsAlerts['!cols'] = [{ wch: 25 }, { wch: 15 }, { wch: 50 }, { wch: 12 }];
      XLSX.utils.book_append_sheet(wb, wsAlerts, 'Cảnh báo');

      // Xuất file
      const fileName = `BaoCaoHeThong_BookSwap_${new Date().toISOString().split('T')[0]}.xlsx`;
      XLSX.writeFile(wb, fileName);
      
    } catch (err) {
      console.error('Export error:', err);
      alert('Lỗi khi xuất báo cáo: ' + (err.response?.data?.message || err.message));
    } finally {
      setExporting(false);
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'warning': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'info': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getSeverityIcon = (severity) => {
    switch (severity) {
      case 'critical': return <XCircle className="h-5 w-5 text-red-600" />;
      case 'warning': return <AlertTriangle className="h-5 w-5 text-yellow-600" />;
      case 'info': return <Info className="h-5 w-5 text-blue-600" />;
      default: return <AlertCircle className="h-5 w-5 text-gray-600" />;
    }
  };

  const tabs = [
    { id: 'overview', label: 'Tổng quan', icon: BarChart3 },
    { id: 'trends', label: 'Xu hướng', icon: TrendingUp },
    { id: 'regions', label: 'Theo vùng', icon: MapPin },
    { id: 'categories', label: 'Thể loại sách', icon: BookOpen },
    { id: 'top', label: 'Top thành viên', icon: Trophy },
    { id: 'alerts', label: 'Cảnh báo', icon: AlertTriangle },
  ];

  return (
    <div className="p-6 bg-white rounded-lg shadow">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">📊 Báo cáo hệ thống</h2>
          <p className="text-sm text-gray-500">
            Cập nhật lúc: {overview?.generated_at ? new Date(overview.generated_at).toLocaleString('vi-VN') : 'N/A'}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleRefresh}
            disabled={loading}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2 disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Làm mới
          </button>
          <button
            onClick={handleExportReport}
            disabled={exporting}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {exporting ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <FileSpreadsheet className="h-4 w-4" />
            )}
            {exporting ? 'Đang xuất...' : 'Xuất Excel'}
          </button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center text-red-700">
          <AlertCircle className="h-5 w-5 mr-2" />
          <span>{error}</span>
        </div>
      )}

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="flex space-x-4 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedTab(tab.id)}
              className={`py-2 px-4 flex items-center gap-2 border-b-2 font-medium text-sm whitespace-nowrap ${
                selectedTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <tab.icon className="h-4 w-4" />
              {tab.label}
              {tab.id === 'alerts' && alerts?.alerts?.length > 0 && (
                <span className="ml-1 px-2 py-0.5 text-xs bg-red-500 text-white rounded-full">
                  {alerts.alerts.length}
                </span>
              )}
            </button>
          ))}
        </nav>
      </div>

      {/* Loading */}
      {loading && (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-500 border-t-transparent"></div>
          <p className="mt-2 text-gray-600">Đang tải dữ liệu...</p>
        </div>
      )}

      {/* Tab Content */}
      {!loading && (
        <>
          {/* Overview Tab */}
          {selectedTab === 'overview' && overview && (
            <div className="space-y-6">
              {/* Main Stats Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {/* Users */}
                <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-4 rounded-lg shadow-md">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm opacity-90">Tổng người dùng</p>
                      <p className="text-3xl font-bold">{overview.users?.total || 0}</p>
                      <div className="mt-2 text-xs opacity-90 space-y-0.5">
                        <p className="flex items-center gap-1">
                          <CheckCircle className="h-3 w-3" /> Hoạt động: {overview.users?.active || 0}
                        </p>
                        <p className="flex items-center gap-1">
                          <XCircle className="h-3 w-3" /> Khóa: {overview.users?.locked || 0}
                        </p>
                        <p className="flex items-center gap-1">
                          <Shield className="h-3 w-3" /> Đình chỉ: {overview.users?.suspended || 0}
                        </p>
                      </div>
                    </div>
                    <Users className="h-10 w-10 opacity-75" />
                  </div>
                  <div className="mt-3 pt-2 border-t border-white/20">
                    <div className="flex items-center justify-between text-xs">
                      <span>Tỉ lệ hoạt động</span>
                      <span className="font-bold">{overview.users?.active_rate || 0}%</span>
                    </div>
                    <div className="w-full bg-white/20 rounded-full h-1.5 mt-1">
                      <div 
                        className="bg-white rounded-full h-1.5"
                        style={{ width: `${overview.users?.active_rate || 0}%` }}
                      ></div>
                    </div>
                  </div>
                </div>

                {/* Books */}
                <div className="bg-gradient-to-br from-green-500 to-green-600 text-white p-4 rounded-lg shadow-md">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm opacity-90">Tổng sách</p>
                      <p className="text-3xl font-bold">{overview.books?.total || 0}</p>
                      <div className="mt-2 text-xs opacity-90 space-y-0.5">
                        <p className="flex items-center gap-1">
                          <CheckCircle className="h-3 w-3" /> Sẵn có: {overview.books?.available || 0}
                        </p>
                        <p className="flex items-center gap-1">
                          <Clock className="h-3 w-3" /> Đang trao đổi: {overview.books?.exchanging || 0}
                        </p>
                        <p className="flex items-center gap-1">
                          <XCircle className="h-3 w-3" /> Đã xóa: {overview.books?.removed || 0}
                        </p>
                      </div>
                    </div>
                    <BookOpen className="h-10 w-10 opacity-75" />
                  </div>
                  <div className="mt-3 pt-2 border-t border-white/20">
                    <div className="flex items-center justify-between text-xs">
                      <span>Tỉ lệ sẵn có</span>
                      <span className="font-bold">
                        {overview.books?.total > 0 
                          ? ((overview.books?.available / overview.books?.total) * 100).toFixed(1) 
                          : 0}%
                      </span>
                    </div>
                    <div className="w-full bg-white/20 rounded-full h-1.5 mt-1">
                      <div 
                        className="bg-white rounded-full h-1.5"
                        style={{ width: `${overview.books?.total > 0 ? (overview.books?.available / overview.books?.total) * 100 : 0}%` }}
                      ></div>
                    </div>
                  </div>
                </div>

                {/* Exchanges */}
                <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white p-4 rounded-lg shadow-md">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm opacity-90">Tổng giao dịch</p>
                      <p className="text-3xl font-bold">{overview.exchanges?.total || 0}</p>
                      <div className="mt-2 text-xs opacity-90 space-y-0.5">
                        <p className="flex items-center gap-1">
                          <CheckCircle className="h-3 w-3" /> Hoàn thành: {overview.exchanges?.completed || 0}
                        </p>
                        <p className="flex items-center gap-1">
                          <Clock className="h-3 w-3" /> Đang chờ: {overview.exchanges?.pending || 0}
                        </p>
                        <p className="flex items-center gap-1">
                          <XCircle className="h-3 w-3" /> Đã hủy: {overview.exchanges?.cancelled || 0}
                        </p>
                      </div>
                    </div>
                    <TrendingUp className="h-10 w-10 opacity-75" />
                  </div>
                  <div className="mt-3 pt-2 border-t border-white/20">
                    <div className="flex items-center justify-between text-xs">
                      <span>Tỉ lệ thành công</span>
                      <span className="font-bold">{overview.exchanges?.success_rate || 0}%</span>
                    </div>
                    <div className="w-full bg-white/20 rounded-full h-1.5 mt-1">
                      <div 
                        className="bg-white rounded-full h-1.5"
                        style={{ width: `${overview.exchanges?.success_rate || 0}%` }}
                      ></div>
                    </div>
                  </div>
                </div>

                {/* Reports */}
                <div className="bg-gradient-to-br from-red-500 to-red-600 text-white p-4 rounded-lg shadow-md">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm opacity-90">Báo cáo vi phạm</p>
                      <p className="text-3xl font-bold">{overview.reports?.total || 0}</p>
                      <div className="mt-2 text-xs opacity-90 space-y-0.5">
                        <p className="flex items-center gap-1">
                          <Clock className="h-3 w-3" /> Chờ xử lý: {overview.reports?.pending || 0}
                        </p>
                        <p className="flex items-center gap-1">
                          <CheckCircle className="h-3 w-3" /> Đã giải quyết: {overview.reports?.resolved || 0}
                        </p>
                      </div>
                    </div>
                    <AlertTriangle className="h-10 w-10 opacity-75" />
                  </div>
                  <div className="mt-3 pt-2 border-t border-white/20">
                    <div className="flex items-center justify-between text-xs">
                      <span>Tỉ lệ xử lý</span>
                      <span className="font-bold">{overview.reports?.resolve_rate || 0}%</span>
                    </div>
                    <div className="w-full bg-white/20 rounded-full h-1.5 mt-1">
                      <div 
                        className="bg-white rounded-full h-1.5"
                        style={{ width: `${overview.reports?.resolve_rate || 0}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Secondary Stats Grid */}
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {/* Total Members */}
                <div className="bg-white p-4 rounded-lg border shadow-sm">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <User className="h-5 w-5 text-blue-600" />
                    </div>
                    <span className="font-medium text-gray-700">Thành viên</span>
                  </div>
                  <p className="text-2xl font-bold text-gray-800">
                    {overview.members?.total || 0}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Tổng số thành viên
                  </p>
                </div>

                {/* Trust Score */}
                <div className="bg-white p-4 rounded-lg border shadow-sm">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="p-2 bg-yellow-100 rounded-lg">
                      <Shield className="h-5 w-5 text-yellow-600" />
                    </div>
                    <span className="font-medium text-gray-700">Trust Score TB</span>
                  </div>
                  <p className="text-2xl font-bold text-gray-800">
                    {overview.members?.avg_trust_score || 0}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Điểm uy tín trung bình
                  </p>
                </div>

                {/* Reviews */}
                <div className="bg-white p-4 rounded-lg border shadow-sm">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="p-2 bg-orange-100 rounded-lg">
                      <Star className="h-5 w-5 text-orange-600" />
                    </div>
                    <span className="font-medium text-gray-700">Đánh giá</span>
                  </div>
                  <p className="text-2xl font-bold text-gray-800">
                    {overview.reviews?.avg_rating || 0} <span className="text-yellow-500">⭐</span>
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {overview.reviews?.total || 0} đánh giá
                  </p>
                </div>

                {/* Messages */}
                <div className="bg-white p-4 rounded-lg border shadow-sm">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="p-2 bg-indigo-100 rounded-lg">
                      <MessageSquare className="h-5 w-5 text-indigo-600" />
                    </div>
                    <span className="font-medium text-gray-700">Tin nhắn</span>
                  </div>
                  <p className="text-2xl font-bold text-gray-800">
                    {overview.messages?.total?.toLocaleString() || 0}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {overview.messages?.conversations || 0} cuộc hội thoại
                  </p>
                </div>

                {/* Avg Completion Time */}
                <div className="bg-white p-4 rounded-lg border shadow-sm">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <Clock className="h-5 w-5 text-purple-600" />
                    </div>
                    <span className="font-medium text-gray-700">Thời gian GD</span>
                  </div>
                  <p className="text-2xl font-bold text-gray-800">
                    {overview.exchanges?.avg_completion_hours || 0}h
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Trung bình hoàn thành
                  </p>
                </div>
              </div>

              {/* Recent Activity Stats - 7 & 30 days */}
              <div className="bg-gradient-to-r from-slate-50 to-slate-100 p-5 rounded-lg border">
                <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-blue-500" />
                  Hoạt động gần đây
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-white p-4 rounded-lg border">
                    <p className="text-sm text-gray-500 mb-1">Người dùng mới</p>
                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl font-bold text-blue-600">{overview.users?.new_last_7_days || 0}</span>
                      <span className="text-xs text-gray-400">7 ngày</span>
                    </div>
                    <div className="flex items-baseline gap-2 mt-1">
                      <span className="text-lg font-semibold text-gray-600">{overview.users?.new_last_30_days || 0}</span>
                      <span className="text-xs text-gray-400">30 ngày</span>
                    </div>
                  </div>
                  <div className="bg-white p-4 rounded-lg border">
                    <p className="text-sm text-gray-500 mb-1">Sách mới</p>
                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl font-bold text-green-600">{overview.books?.new_last_7_days || 0}</span>
                      <span className="text-xs text-gray-400">7 ngày</span>
                    </div>
                    <div className="flex items-baseline gap-2 mt-1">
                      <span className="text-lg font-semibold text-gray-600">{overview.books?.new_last_30_days || 0}</span>
                      <span className="text-xs text-gray-400">30 ngày</span>
                    </div>
                  </div>
                  <div className="bg-white p-4 rounded-lg border">
                    <p className="text-sm text-gray-500 mb-1">Giao dịch mới</p>
                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl font-bold text-purple-600">{overview.exchanges?.new_last_7_days || 0}</span>
                      <span className="text-xs text-gray-400">7 ngày</span>
                    </div>
                    <div className="flex items-baseline gap-2 mt-1">
                      <span className="text-lg font-semibold text-gray-600">{overview.exchanges?.new_last_30_days || 0}</span>
                      <span className="text-xs text-gray-400">30 ngày</span>
                    </div>
                  </div>
                  <div className="bg-white p-4 rounded-lg border">
                    <p className="text-sm text-gray-500 mb-1">GD hoàn thành</p>
                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl font-bold text-teal-600">{overview.exchanges?.completed_last_30_days || 0}</span>
                      <span className="text-xs text-gray-400">30 ngày</span>
                    </div>
                    <div className="flex items-baseline gap-2 mt-1">
                      <span className="text-lg font-semibold text-gray-600">{overview.messages?.last_7_days || 0}</span>
                      <span className="text-xs text-gray-400">tin nhắn / 7 ngày</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Trust Score Distribution */}
              <div className="bg-white p-5 rounded-lg border shadow-sm">
                <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <Shield className="h-5 w-5 text-yellow-500" />
                  Phân bố Trust Score
                </h3>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div className="p-4 bg-red-50 rounded-lg border border-red-100">
                    <p className="text-3xl font-bold text-red-600">{overview.members?.low_trust_count || 0}</p>
                    <p className="text-sm text-gray-600 mt-1">Thấp (&lt;30)</p>
                    <p className="text-xs text-gray-400">Cần theo dõi</p>
                  </div>
                  <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-100">
                    <p className="text-3xl font-bold text-yellow-600">{overview.members?.medium_trust_count || 0}</p>
                    <p className="text-sm text-gray-600 mt-1">Trung bình (30-70)</p>
                    <p className="text-xs text-gray-400">Bình thường</p>
                  </div>
                  <div className="p-4 bg-green-50 rounded-lg border border-green-100">
                    <p className="text-3xl font-bold text-green-600">{overview.members?.high_trust_count || 0}</p>
                    <p className="text-sm text-gray-600 mt-1">Cao (≥70)</p>
                    <p className="text-xs text-gray-400">Uy tín cao</p>
                  </div>
                </div>
                <div className="mt-4 flex items-center justify-between text-sm">
                  <span className="text-gray-500">Min: <span className="font-medium text-gray-800">{overview.members?.min_trust_score || 0}</span></span>
                  <span className="text-gray-500">TB: <span className="font-medium text-blue-600">{overview.members?.avg_trust_score || 0}</span></span>
                  <span className="text-gray-500">Max: <span className="font-medium text-gray-800">{overview.members?.max_trust_score || 0}</span></span>
                </div>
              </div>

              {/* Rating Distribution */}
              {overview.reviews?.rating_distribution && overview.reviews.rating_distribution.length > 0 && (
                <div className="bg-white p-5 rounded-lg border shadow-sm">
                  <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <Star className="h-5 w-5 text-yellow-500" />
                    Phân bố đánh giá
                  </h3>
                  <div className="space-y-2">
                    {[5, 4, 3, 2, 1].map((rating) => {
                      const ratingData = overview.reviews.rating_distribution.find(r => r.rating === rating);
                      const count = ratingData?.count || 0;
                      const percentage = overview.reviews.total > 0 ? (count / overview.reviews.total) * 100 : 0;
                      return (
                        <div key={rating} className="flex items-center gap-3">
                          <div className="flex items-center gap-1 w-16">
                            <span className="font-medium">{rating}</span>
                            <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                          </div>
                          <div className="flex-1 bg-gray-100 rounded-full h-4">
                            <div 
                              className="bg-yellow-400 h-4 rounded-full transition-all"
                              style={{ width: `${percentage}%` }}
                            ></div>
                          </div>
                          <div className="w-20 text-right text-sm">
                            <span className="font-medium">{count}</span>
                            <span className="text-gray-400 ml-1">({percentage.toFixed(1)}%)</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Detailed Breakdown Section */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* User Status Breakdown */}
                <div className="bg-white p-5 rounded-lg border shadow-sm">
                  <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <Users className="h-5 w-5 text-blue-500" />
                    Trạng thái tài khoản
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full bg-green-500"></span>
                        <span className="text-gray-600">Hoạt động</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-gray-800">{overview.users?.active || 0}</span>
                        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                          {overview.users?.active_rate || 0}%
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full bg-yellow-500"></span>
                        <span className="text-gray-600">Bị khóa</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-gray-800">{overview.users?.locked || 0}</span>
                        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                          {overview.users?.total > 0 ? ((overview.users?.locked / overview.users?.total) * 100).toFixed(1) : 0}%
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full bg-red-500"></span>
                        <span className="text-gray-600">Đình chỉ</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-gray-800">{overview.users?.suspended || 0}</span>
                        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                          {overview.users?.total > 0 ? ((overview.users?.suspended / overview.users?.total) * 100).toFixed(1) : 0}%
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Book Status Breakdown */}
                <div className="bg-white p-5 rounded-lg border shadow-sm">
                  <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <BookOpen className="h-5 w-5 text-green-500" />
                    Trạng thái sách
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full bg-green-500"></span>
                        <span className="text-gray-600">Sẵn có</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-gray-800">{overview.books?.available || 0}</span>
                        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                          {overview.books?.total > 0 ? ((overview.books?.available / overview.books?.total) * 100).toFixed(1) : 0}%
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full bg-yellow-500"></span>
                        <span className="text-gray-600">Đang trao đổi</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-gray-800">{overview.books?.exchanging || 0}</span>
                        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                          {overview.books?.total > 0 ? ((overview.books?.exchanging / overview.books?.total) * 100).toFixed(1) : 0}%
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full bg-red-500"></span>
                        <span className="text-gray-600">Đã xóa</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-gray-800">{overview.books?.removed || 0}</span>
                        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                          {overview.books?.total > 0 ? ((overview.books?.removed / overview.books?.total) * 100).toFixed(1) : 0}%
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Exchange Details */}
              <div className="bg-white p-5 rounded-lg border shadow-sm">
                <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-purple-500" />
                  Chi tiết giao dịch
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-center">
                  <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-100">
                    <p className="text-3xl font-bold text-yellow-600">{overview.exchanges?.pending || 0}</p>
                    <p className="text-sm text-gray-600 mt-1">Chờ xác nhận</p>
                    <p className="text-xs text-gray-400">
                      {overview.exchanges?.total > 0 ? ((overview.exchanges?.pending / overview.exchanges?.total) * 100).toFixed(1) : 0}%
                    </p>
                  </div>
                  <div className="p-3 bg-green-50 rounded-lg border border-green-100">
                    <p className="text-3xl font-bold text-green-600">{overview.exchanges?.completed || 0}</p>
                    <p className="text-sm text-gray-600 mt-1">Hoàn thành</p>
                    <p className="text-xs text-gray-400">
                      {overview.exchanges?.total > 0 ? ((overview.exchanges?.completed / overview.exchanges?.total) * 100).toFixed(1) : 0}%
                    </p>
                  </div>
                  <div className="p-3 bg-red-50 rounded-lg border border-red-100">
                    <p className="text-3xl font-bold text-red-600">{overview.exchanges?.cancelled || 0}</p>
                    <p className="text-sm text-gray-600 mt-1">Đã hủy</p>
                    <p className="text-xs text-gray-400">
                      {overview.exchanges?.total > 0 ? ((overview.exchanges?.cancelled / overview.exchanges?.total) * 100).toFixed(1) : 0}%
                    </p>
                  </div>
                  <div className="p-3 bg-blue-50 rounded-lg border border-blue-100">
                    <p className="text-3xl font-bold text-blue-600">{overview.exchanges?.success_rate || 0}%</p>
                    <p className="text-sm text-gray-600 mt-1">Tỷ lệ thành công</p>
                  </div>
                  <div className="p-3 bg-purple-50 rounded-lg border border-purple-100">
                    <p className="text-3xl font-bold text-purple-600">{overview.exchanges?.total || 0}</p>
                    <p className="text-sm text-gray-600 mt-1">Tổng cộng</p>
                  </div>
                </div>

                {/* Reports Details */}
                <h3 className="font-semibold text-gray-800 mt-6 mb-4 flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-red-500" />
                  Chi tiết báo cáo vi phạm
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                  <div className="p-3 bg-orange-50 rounded-lg border border-orange-100">
                    <p className="text-3xl font-bold text-orange-600">{overview.reports?.pending || 0}</p>
                    <p className="text-sm text-gray-600 mt-1">Chờ xử lý</p>
                  </div>
                  <div className="p-3 bg-green-50 rounded-lg border border-green-100">
                    <p className="text-3xl font-bold text-green-600">{overview.reports?.resolved || 0}</p>
                    <p className="text-sm text-gray-600 mt-1">Đã giải quyết</p>
                  </div>
                  <div className="p-3 bg-blue-50 rounded-lg border border-blue-100">
                    <p className="text-3xl font-bold text-blue-600">{overview.reports?.resolve_rate || 0}%</p>
                    <p className="text-sm text-gray-600 mt-1">Tỷ lệ xử lý</p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg border border-gray-100">
                    <p className="text-3xl font-bold text-gray-600">{overview.reports?.total || 0}</p>
                    <p className="text-sm text-gray-600 mt-1">Tổng cộng</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Trends Tab */}
          {selectedTab === 'trends' && trends && (
            <div className="space-y-6">
              {/* Period Selector */}
              <div className="flex gap-2 mb-4">
                {[7, 30, 90].map((days) => (
                  <button
                    key={days}
                    onClick={() => setTrendDays(days)}
                    className={`px-4 py-2 rounded-lg ${
                      trendDays === days
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {days} ngày
                  </button>
                ))}
              </div>

              {/* Summary */}
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                  <p className="text-sm text-blue-600">Người dùng mới</p>
                  <p className="text-2xl font-bold text-blue-800">{trends.summary?.total_new_users || 0}</p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg border border-green-100">
                  <p className="text-sm text-green-600">Sách mới</p>
                  <p className="text-2xl font-bold text-green-800">{trends.summary?.total_new_books || 0}</p>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg border border-purple-100">
                  <p className="text-sm text-purple-600">Giao dịch mới</p>
                  <p className="text-2xl font-bold text-purple-800">{trends.summary?.total_new_exchanges || 0}</p>
                </div>
                <div className="bg-teal-50 p-4 rounded-lg border border-teal-100">
                  <p className="text-sm text-teal-600">Hoàn thành</p>
                  <p className="text-2xl font-bold text-teal-800">{trends.summary?.total_completed_exchanges || 0}</p>
                </div>
                <div className="bg-red-50 p-4 rounded-lg border border-red-100">
                  <p className="text-sm text-red-600">Báo cáo mới</p>
                  <p className="text-2xl font-bold text-red-800">{trends.summary?.total_new_reports || 0}</p>
                </div>
              </div>

              {/* Trend Tables */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* New Users */}
                <div className="bg-gray-50 p-4 rounded-lg border">
                  <h4 className="font-medium text-gray-800 mb-3 flex items-center gap-2">
                    <Users className="h-4 w-4" /> Người dùng mới theo ngày
                  </h4>
                  <div className="max-h-60 overflow-y-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-100 sticky top-0">
                        <tr>
                          <th className="px-2 py-1 text-left">Ngày</th>
                          <th className="px-2 py-1 text-right">Số lượng</th>
                        </tr>
                      </thead>
                      <tbody>
                        {trends.trends?.new_users?.map((item, idx) => (
                          <tr key={idx} className="border-b">
                            <td className="px-2 py-1">{new Date(item.date).toLocaleDateString('vi-VN')}</td>
                            <td className="px-2 py-1 text-right font-medium">{item.count}</td>
                          </tr>
                        ))}
                        {(!trends.trends?.new_users || trends.trends.new_users.length === 0) && (
                          <tr><td colSpan="2" className="px-2 py-4 text-center text-gray-500">Không có dữ liệu</td></tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* New Exchanges */}
                <div className="bg-gray-50 p-4 rounded-lg border">
                  <h4 className="font-medium text-gray-800 mb-3 flex items-center gap-2">
                    <TrendingUp className="h-4 w-4" /> Giao dịch mới theo ngày
                  </h4>
                  <div className="max-h-60 overflow-y-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-100 sticky top-0">
                        <tr>
                          <th className="px-2 py-1 text-left">Ngày</th>
                          <th className="px-2 py-1 text-right">Số lượng</th>
                        </tr>
                      </thead>
                      <tbody>
                        {trends.trends?.new_exchanges?.map((item, idx) => (
                          <tr key={idx} className="border-b">
                            <td className="px-2 py-1">{new Date(item.date).toLocaleDateString('vi-VN')}</td>
                            <td className="px-2 py-1 text-right font-medium">{item.count}</td>
                          </tr>
                        ))}
                        {(!trends.trends?.new_exchanges || trends.trends.new_exchanges.length === 0) && (
                          <tr><td colSpan="2" className="px-2 py-4 text-center text-gray-500">Không có dữ liệu</td></tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Regions Tab */}
          {selectedTab === 'regions' && regions && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Members by Region */}
                <div className="bg-gray-50 p-4 rounded-lg border">
                  <h4 className="font-medium text-gray-800 mb-3 flex items-center gap-2">
                    <Users className="h-4 w-4" /> Thành viên theo vùng
                  </h4>
                  <div className="space-y-2">
                    {regions.members_by_region?.map((item, idx) => (
                      <div key={idx} className="flex justify-between items-center py-2 border-b">
                        <span className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-gray-400" />
                          {item.region || 'Không xác định'}
                        </span>
                        <span className="font-medium bg-blue-100 text-blue-800 px-2 py-1 rounded">
                          {item.member_count}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Books by Region */}
                <div className="bg-gray-50 p-4 rounded-lg border">
                  <h4 className="font-medium text-gray-800 mb-3 flex items-center gap-2">
                    <BookOpen className="h-4 w-4" /> Sách theo vùng
                  </h4>
                  <div className="space-y-2">
                    {regions.books_by_region?.map((item, idx) => (
                      <div key={idx} className="flex justify-between items-center py-2 border-b">
                        <span className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-gray-400" />
                          {item.region || 'Không xác định'}
                        </span>
                        <span className="font-medium bg-green-100 text-green-800 px-2 py-1 rounded">
                          {item.book_count}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Trust Score by Region */}
                <div className="bg-gray-50 p-4 rounded-lg border col-span-full">
                  <h4 className="font-medium text-gray-800 mb-3 flex items-center gap-2">
                    <Star className="h-4 w-4" /> Trust Score theo vùng
                  </h4>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-100">
                        <tr>
                          <th className="px-3 py-2 text-left">Vùng</th>
                          <th className="px-3 py-2 text-right">Trung bình</th>
                          <th className="px-3 py-2 text-right">Thấp nhất</th>
                          <th className="px-3 py-2 text-right">Cao nhất</th>
                        </tr>
                      </thead>
                      <tbody>
                        {regions.trust_score_by_region?.map((item, idx) => (
                          <tr key={idx} className="border-b">
                            <td className="px-3 py-2">{item.region || 'Không xác định'}</td>
                            <td className="px-3 py-2 text-right font-medium text-blue-600">{item.avg_trust_score}</td>
                            <td className="px-3 py-2 text-right text-red-600">{item.min_trust_score}</td>
                            <td className="px-3 py-2 text-right text-green-600">{item.max_trust_score}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Categories Tab */}
          {selectedTab === 'categories' && categories && (
            <div className="space-y-6">
              <div className="bg-gray-50 p-4 rounded-lg border">
                <h4 className="font-medium text-gray-800 mb-3 flex items-center gap-2">
                  <BookOpen className="h-4 w-4" /> Sách theo thể loại ({categories.total_categories} thể loại)
                </h4>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="px-3 py-2 text-left">Thể loại</th>
                        <th className="px-3 py-2 text-right">Tổng</th>
                        <th className="px-3 py-2 text-right">Sẵn có</th>
                        <th className="px-3 py-2 text-right">Đang trao đổi</th>
                      </tr>
                    </thead>
                    <tbody>
                      {categories.categories?.map((item, idx) => (
                        <tr key={idx} className="border-b hover:bg-gray-50">
                          <td className="px-3 py-2 font-medium">{item.category}</td>
                          <td className="px-3 py-2 text-right">{item.total}</td>
                          <td className="px-3 py-2 text-right text-green-600">{item.available}</td>
                          <td className="px-3 py-2 text-right text-yellow-600">{item.exchanging}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Top Performers Tab */}
          {selectedTab === 'top' && topPerformers && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Top Exchangers */}
                <div className="bg-gray-50 p-4 rounded-lg border">
                  <h4 className="font-medium text-gray-800 mb-3 flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-purple-500" /> Top giao dịch
                  </h4>
                  <div className="space-y-2">
                    {topPerformers.top_exchangers?.map((item, idx) => (
                      <div key={idx} className="flex justify-between items-center py-2 border-b">
                        <div className="flex items-center gap-2">
                          <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                            idx === 0 ? 'bg-yellow-400 text-yellow-900' :
                            idx === 1 ? 'bg-gray-300 text-gray-700' :
                            idx === 2 ? 'bg-orange-300 text-orange-900' :
                            'bg-gray-100 text-gray-600'
                          }`}>
                            {idx + 1}
                          </span>
                          <div>
                            <p className="font-medium text-sm">{item.full_name || item.email}</p>
                            <p className="text-xs text-gray-500">{item.email}</p>
                          </div>
                        </div>
                        <span className="font-bold text-purple-600">{item.exchange_count} GD</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Top Book Contributors */}
                <div className="bg-gray-50 p-4 rounded-lg border">
                  <h4 className="font-medium text-gray-800 mb-3 flex items-center gap-2">
                    <BookOpen className="h-4 w-4 text-green-500" /> Top đóng góp sách
                  </h4>
                  <div className="space-y-2">
                    {topPerformers.top_book_contributors?.map((item, idx) => (
                      <div key={idx} className="flex justify-between items-center py-2 border-b">
                        <div className="flex items-center gap-2">
                          <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                            idx === 0 ? 'bg-yellow-400 text-yellow-900' :
                            idx === 1 ? 'bg-gray-300 text-gray-700' :
                            idx === 2 ? 'bg-orange-300 text-orange-900' :
                            'bg-gray-100 text-gray-600'
                          }`}>
                            {idx + 1}
                          </span>
                          <div>
                            <p className="font-medium text-sm">{item.full_name || item.email}</p>
                            <p className="text-xs text-gray-500">{item.email}</p>
                          </div>
                        </div>
                        <span className="font-bold text-green-600">{item.book_count} sách</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Highest Rated */}
                <div className="bg-gray-50 p-4 rounded-lg border">
                  <h4 className="font-medium text-gray-800 mb-3 flex items-center gap-2">
                    <Star className="h-4 w-4 text-yellow-500" /> Đánh giá cao nhất
                  </h4>
                  <div className="space-y-2">
                    {topPerformers.highest_rated?.map((item, idx) => (
                      <div key={idx} className="flex justify-between items-center py-2 border-b">
                        <div className="flex items-center gap-2">
                          <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                            idx === 0 ? 'bg-yellow-400 text-yellow-900' :
                            idx === 1 ? 'bg-gray-300 text-gray-700' :
                            idx === 2 ? 'bg-orange-300 text-orange-900' :
                            'bg-gray-100 text-gray-600'
                          }`}>
                            {idx + 1}
                          </span>
                          <div>
                            <p className="font-medium text-sm">{item.full_name || item.email}</p>
                            <p className="text-xs text-gray-500">{item.review_count} đánh giá</p>
                          </div>
                        </div>
                        <span className="font-bold text-yellow-600">{item.avg_rating} ⭐</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Top Reviewers */}
                <div className="bg-gray-50 p-4 rounded-lg border">
                  <h4 className="font-medium text-gray-800 mb-3 flex items-center gap-2">
                    <MessageSquare className="h-4 w-4 text-blue-500" /> Top đánh giá
                  </h4>
                  <div className="space-y-2">
                    {topPerformers.top_reviewers?.map((item, idx) => (
                      <div key={idx} className="flex justify-between items-center py-2 border-b">
                        <div className="flex items-center gap-2">
                          <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                            idx === 0 ? 'bg-yellow-400 text-yellow-900' :
                            idx === 1 ? 'bg-gray-300 text-gray-700' :
                            idx === 2 ? 'bg-orange-300 text-orange-900' :
                            'bg-gray-100 text-gray-600'
                          }`}>
                            {idx + 1}
                          </span>
                          <div>
                            <p className="font-medium text-sm">{item.full_name || item.email}</p>
                            <p className="text-xs text-gray-500">TB: {item.avg_rating_given} ⭐</p>
                          </div>
                        </div>
                        <span className="font-bold text-blue-600">{item.review_count} đánh giá</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Alerts Tab */}
          {selectedTab === 'alerts' && alerts && (
            <div className="space-y-6">
              {/* Alerts List */}
              {alerts.alerts?.length > 0 ? (
                <div className="space-y-3">
                  {alerts.alerts.map((alert, idx) => (
                    <div
                      key={idx}
                      className={`p-4 rounded-lg border flex items-start gap-3 ${getSeverityColor(alert.severity)}`}
                    >
                      {getSeverityIcon(alert.severity)}
                      <div className="flex-1">
                        <p className="font-medium">{alert.message}</p>
                        <p className="text-sm opacity-75 mt-1">Loại: {alert.type}</p>
                      </div>
                      <span className="font-bold text-lg">{alert.count}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <CheckCircle className="h-12 w-12 mx-auto mb-2 text-green-500" />
                  <p>Không có cảnh báo nào!</p>
                </div>
              )}

              {/* Summary */}
              <div className="bg-gray-50 p-4 rounded-lg border">
                <h4 className="font-medium text-gray-800 mb-3">Tóm tắt</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <p className="text-gray-500">Báo cáo chờ xử lý</p>
                    <p className="font-bold text-xl">{alerts.summary?.pending_reports || 0}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Ưu tiên cao</p>
                    <p className="font-bold text-xl text-red-600">{alerts.summary?.high_priority_reports || 0}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">GD quá hạn</p>
                    <p className="font-bold text-xl text-yellow-600">{alerts.summary?.stale_exchanges || 0}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Trust thấp</p>
                    <p className="font-bold text-xl">{alerts.summary?.low_trust_users || 0}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default SystemReports;
