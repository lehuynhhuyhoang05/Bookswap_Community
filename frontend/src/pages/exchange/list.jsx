import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Layout from '../../components/layout/Layout';
import { Card, Button, LoadingSpinner, Badge, Avatar, Tabs } from '../../components/ui';
import { useExchanges } from '../../hooks/useExchanges';
import { 
  ArrowLeft, 
  AlertCircle, 
  Check, 
  Calendar, 
  MapPin, 
  Eye,
  RefreshCw,
  Clock,
  CheckCircle2,
  XCircle,
  Ban,
  ArrowRightLeft,
  BookOpen,
  Target,
  ChevronRight,
  ChevronLeft,
  Sparkles,
  Star,
  Users,
  MessageCircle
} from 'lucide-react';

/**
 * Exchanges List Page
 * Backend API: GET /exchanges?status=PENDING|IN_PROGRESS|COMPLETED|CANCELLED&page=1&limit=20
 * Response: PaginatedExchangesDto
 */
const ExchangesListPage = () => {
  const navigate = useNavigate();
  const { getExchanges, confirmExchange } = useExchanges();

  const [status, setStatus] = useState(''); // '' | 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED'
  const [exchanges, setExchanges] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [actionLoading, setActionLoading] = useState(null);

  useEffect(() => {
    loadExchanges();
  }, [status, page]);

  const loadExchanges = async () => {
    setLoading(true);
    try {
      const params = { page, limit: 10 };
      if (status) params.status = status;
      
      const result = await getExchanges(params);
      setExchanges(result.items || []);
      setTotal(result.total || 0);
      setTotalPages(result.pages || 1);
    } catch (error) {
      console.error('[Exchanges] Failed to load:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = async (exchangeId) => {
    if (!confirm('Xác nhận hoàn tất trao đổi này?')) return;
    
    setActionLoading(exchangeId);
    try {
      await confirmExchange(exchangeId);
      alert('Đã xác nhận hoàn tất!');
      loadExchanges();
    } catch (error) {
      alert('Thất bại: ' + (error.message || 'Vui lòng thử lại'));
    } finally {
      setActionLoading(null);
    }
  };

  const getStatusConfig = (status) => {
    const map = {
      PENDING: { 
        icon: Clock, 
        label: 'Chờ xác nhận', 
        bg: 'bg-amber-100', 
        text: 'text-amber-700',
        border: 'border-amber-200'
      },
      IN_PROGRESS: { 
        icon: RefreshCw, 
        label: 'Đang trao đổi', 
        bg: 'bg-blue-100', 
        text: 'text-blue-700',
        border: 'border-blue-200'
      },
      COMPLETED: { 
        icon: CheckCircle2, 
        label: 'Hoàn tất', 
        bg: 'bg-green-100', 
        text: 'text-green-700',
        border: 'border-green-200'
      },
      CANCELLED: { 
        icon: Ban, 
        label: 'Đã hủy', 
        bg: 'bg-gray-100', 
        text: 'text-gray-600',
        border: 'border-gray-200'
      }
    };
    return map[status] || map.PENDING;
  };

  const statusTabs = [
    { id: '', label: 'Tất cả', icon: ArrowRightLeft, count: null },
    { id: 'PENDING', label: 'Chờ xác nhận', icon: Clock, count: null },
    { id: 'IN_PROGRESS', label: 'Đang tiến hành', icon: RefreshCw, count: null },
    { id: 'COMPLETED', label: 'Hoàn tất', icon: CheckCircle2, count: null },
    { id: 'CANCELLED', label: 'Đã hủy', icon: Ban, count: null }
  ];

  return (
    <Layout>
      {/* Hero Header */}
      <section className="relative overflow-hidden bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-700">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-white/10 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-yellow-500/20 rounded-full blur-3xl"></div>
        </div>

        <div className="container mx-auto px-4 py-8 md:py-12 relative z-10">
          <button 
            onClick={() => navigate('/exchange')} 
            className="inline-flex items-center gap-2 text-white/80 hover:text-white mb-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Quay lại Trao đổi</span>
          </button>

          <div className="max-w-4xl">
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 mb-4">
              <ArrowRightLeft className="h-4 w-4 text-yellow-300" />
              <span className="text-sm font-medium text-white">Theo dõi giao dịch</span>
            </div>

            <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">
              Trao đổi của tôi
            </h1>
            <p className="text-white/80 text-lg mb-6">
              Theo dõi tiến độ và quản lý các giao dịch trao đổi sách
            </p>

            {/* Stats Quick View */}
            <div className="flex flex-wrap gap-4">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl px-5 py-3 flex items-center gap-3">
                <div className="w-10 h-10 bg-emerald-500 rounded-lg flex items-center justify-center">
                  <ArrowRightLeft className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-white">{total}</div>
                  <div className="text-sm text-white/70">Tổng trao đổi</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Wave */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 120L60 110C120 100 240 80 360 70C480 60 600 60 720 65C840 70 960 80 1080 85C1200 90 1320 90 1380 90L1440 90V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" fill="#F9FAFB"/>
          </svg>
        </div>
      </section>

      <div className="bg-gray-50 min-h-screen">
        <div className="max-w-6xl mx-auto px-4 py-8">
          
          {/* Status Tabs */}
          <div className="bg-white p-2 rounded-2xl shadow-sm mb-6 overflow-x-auto">
            <div className="flex gap-1 min-w-max">
              {statusTabs.map(tab => {
                const TabIcon = tab.icon;
                const isActive = status === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => { setStatus(tab.id); setPage(1); }}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium transition-all whitespace-nowrap ${
                      isActive 
                        ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg' 
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <TabIcon className={`w-4 h-4 ${isActive && tab.id === 'IN_PROGRESS' ? 'animate-spin' : ''}`} />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Content */}
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="relative">
                <div className="w-16 h-16 border-4 border-emerald-200 rounded-full animate-spin border-t-emerald-600"></div>
                <ArrowRightLeft className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 h-6 w-6 text-emerald-600" />
              </div>
              <p className="mt-4 text-gray-600 font-medium">Đang tải trao đổi...</p>
            </div>
          ) : exchanges.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 text-center shadow-sm">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <ArrowRightLeft className="w-10 h-10 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {status ? 'Không có trao đổi với trạng thái này' : 'Chưa có trao đổi nào'}
              </h3>
              <p className="text-gray-600 mb-8 max-w-md mx-auto">
                Khi yêu cầu trao đổi được chấp nhận, giao dịch sẽ xuất hiện ở đây
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link to="/exchange/requests">
                  <button className="inline-flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-6 py-3 rounded-xl font-medium hover:from-emerald-700 hover:to-teal-700 transition-all">
                    <MessageCircle className="w-5 h-5" />
                    Xem yêu cầu
                  </button>
                </Link>
                <Link to="/exchange/suggestions">
                  <button className="inline-flex items-center gap-2 bg-gray-100 text-gray-700 px-6 py-3 rounded-xl font-medium hover:bg-gray-200 transition-all">
                    <Target className="w-5 h-5" />
                    Tìm gợi ý
                  </button>
                </Link>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {exchanges.map(ex => {
                const otherMember = ex.member_b;
                const myBooks = ex.books?.filter(b => b.from === ex.member_a?.member_id) || [];
                const theirBooks = ex.books?.filter(b => b.from === ex.member_b?.member_id) || [];
                const statusConfig = getStatusConfig(ex.status);
                const StatusIcon = statusConfig.icon;
                const isLoading = actionLoading === ex.exchange_id;

                return (
                  <div 
                    key={ex.exchange_id} 
                    className={`bg-white rounded-2xl shadow-sm border overflow-hidden hover:shadow-md transition-shadow ${
                      ex.status === 'IN_PROGRESS' ? 'border-blue-200' : 'border-gray-100'
                    }`}
                  >
                    {/* Card Header */}
                    <div className="p-5 border-b border-gray-100">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-4">
                          <div className="relative">
                            <Avatar src={ex.member_a?.avatar_url} alt={ex.member_a?.full_name} size="md" />
                            <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-white rounded-full flex items-center justify-center shadow">
                              <ArrowRightLeft className="w-3 h-3 text-emerald-600" />
                            </div>
                          </div>
                          <Avatar src={ex.member_b?.avatar_url} alt={ex.member_b?.full_name} size="md" />
                          <div className="ml-2">
                            <h4 className="font-semibold text-gray-900">
                              {ex.member_a?.full_name || 'Người dùng A'}
                              <span className="text-gray-400 mx-2">↔</span>
                              {ex.member_b?.full_name || 'Người dùng B'}
                            </h4>
                            <div className="flex items-center gap-2 mt-1">
                              <Users className="w-4 h-4 text-gray-400" />
                              <span className="text-sm text-gray-500">Trao đổi #{ex.exchange_id?.slice(0, 8)}</span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full ${statusConfig.bg} ${statusConfig.text} border ${statusConfig.border}`}>
                            <StatusIcon className={`w-4 h-4 ${ex.status === 'IN_PROGRESS' ? 'animate-spin' : ''}`} />
                            <span className="text-sm font-medium">{statusConfig.label}</span>
                          </div>
                          <p className="text-xs text-gray-500 mt-2">
                            Bắt đầu: {new Date(ex.created_at).toLocaleDateString('vi-VN')}
                          </p>
                          {ex.completed_at && (
                            <p className="text-xs text-green-600 font-medium">
                              Hoàn tất: {new Date(ex.completed_at).toLocaleDateString('vi-VN')}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Books Section */}
                    <div className="p-5">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Member A Books */}
                        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-4 rounded-xl border border-blue-100">
                          <h5 className="font-medium text-blue-900 mb-3 flex items-center gap-2">
                            <div className="w-7 h-7 bg-blue-500 rounded-lg flex items-center justify-center">
                              <BookOpen className="w-4 h-4 text-white" />
                            </div>
                            Từ {ex.member_a?.full_name || 'Người gửi'}
                            <span className="ml-auto bg-blue-500 text-white text-xs px-2 py-0.5 rounded-full">
                              {myBooks.length}
                            </span>
                          </h5>
                          <div className="space-y-2">
                            {myBooks.length === 0 ? (
                              <p className="text-sm text-gray-500 italic">Không có sách</p>
                            ) : (
                              myBooks.map(book => (
                                <div key={book.book_id} className="bg-white p-3 rounded-lg shadow-sm">
                                  <div className="font-medium text-gray-900 text-sm">{book.title}</div>
                                </div>
                              ))
                            )}
                          </div>
                        </div>

                        {/* Member B Books */}
                        <div className="bg-gradient-to-br from-emerald-50 to-green-50 p-4 rounded-xl border border-green-100">
                          <h5 className="font-medium text-green-900 mb-3 flex items-center gap-2">
                            <div className="w-7 h-7 bg-green-500 rounded-lg flex items-center justify-center">
                              <BookOpen className="w-4 h-4 text-white" />
                            </div>
                            Từ {ex.member_b?.full_name || 'Người nhận'}
                            <span className="ml-auto bg-green-500 text-white text-xs px-2 py-0.5 rounded-full">
                              {theirBooks.length}
                            </span>
                          </h5>
                          <div className="space-y-2">
                            {theirBooks.length === 0 ? (
                              <p className="text-sm text-gray-500 italic">Không có sách</p>
                            ) : (
                              theirBooks.map(book => (
                                <div key={book.book_id} className="bg-white p-3 rounded-lg shadow-sm">
                                  <div className="font-medium text-gray-900 text-sm">{book.title}</div>
                                </div>
                              ))
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Meeting Info */}
                      {ex.meeting_location && (
                        <div className="mt-4 bg-gradient-to-r from-purple-50 to-pink-50 p-4 rounded-xl border border-purple-100">
                          <h5 className="font-medium text-purple-900 mb-3 flex items-center gap-2">
                            <div className="w-7 h-7 bg-purple-500 rounded-lg flex items-center justify-center">
                              <Calendar className="w-4 h-4 text-white" />
                            </div>
                            Thông tin gặp mặt
                          </h5>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="flex items-center gap-3 bg-white p-3 rounded-lg">
                              <MapPin className="w-5 h-5 text-purple-600" />
                              <span className="text-sm text-gray-700">{ex.meeting_location}</span>
                            </div>
                            {ex.meeting_time && (
                              <div className="flex items-center gap-3 bg-white p-3 rounded-lg">
                                <Clock className="w-5 h-5 text-purple-600" />
                                <span className="text-sm text-gray-700">
                                  {new Date(ex.meeting_time).toLocaleString('vi-VN')}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Confirmation Status */}
                      {(ex.status === 'PENDING' || ex.status === 'IN_PROGRESS') && (
                        <div className="mt-4 bg-amber-50 p-4 rounded-xl border border-amber-200">
                          <div className="flex flex-wrap items-center gap-3">
                            <span className="font-medium text-amber-800">Xác nhận hoàn tất:</span>
                            <div className="flex gap-2">
                              <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm ${
                                ex.member_a_confirmed 
                                  ? 'bg-green-100 text-green-700 border border-green-200' 
                                  : 'bg-gray-100 text-gray-500 border border-gray-200'
                              }`}>
                                {ex.member_a_confirmed ? <CheckCircle2 className="w-4 h-4" /> : <Clock className="w-4 h-4" />}
                                {ex.member_a?.full_name || 'A'}
                              </span>
                              <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm ${
                                ex.member_b_confirmed 
                                  ? 'bg-green-100 text-green-700 border border-green-200' 
                                  : 'bg-gray-100 text-gray-500 border border-gray-200'
                              }`}>
                                {ex.member_b_confirmed ? <CheckCircle2 className="w-4 h-4" /> : <Clock className="w-4 h-4" />}
                                {ex.member_b?.full_name || 'B'}
                              </span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="px-5 py-4 bg-gray-50 border-t border-gray-100 flex flex-wrap gap-2 justify-end">
                      <button 
                        onClick={() => navigate(`/exchange/${ex.exchange_id}`)}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-100 hover:border-gray-300 transition-colors"
                      >
                        <Eye className="w-4 h-4" />
                        Xem chi tiết
                      </button>
                      
                      {(ex.status === 'PENDING' || ex.status === 'IN_PROGRESS') && (
                        <button 
                          onClick={() => handleConfirm(ex.exchange_id)}
                          disabled={isLoading}
                          className="inline-flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg font-medium hover:from-green-700 hover:to-emerald-700 transition-all shadow-sm disabled:opacity-50"
                        >
                          {isLoading ? (
                            <RefreshCw className="w-4 h-4 animate-spin" />
                          ) : (
                            <Check className="w-4 h-4" />
                          )}
                          Xác nhận hoàn tất
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-8">
              <button
                disabled={page === 1}
                onClick={() => setPage(p => p - 1)}
                className="inline-flex items-center gap-1 px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
                Trước
              </button>
              
              <div className="flex items-center gap-1">
                {[...Array(totalPages)].map((_, idx) => {
                  const pageNum = idx + 1;
                  if (pageNum === 1 || pageNum === totalPages || (pageNum >= page - 1 && pageNum <= page + 1)) {
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setPage(pageNum)}
                        className={`w-10 h-10 rounded-lg font-medium transition-colors ${
                          page === pageNum 
                            ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg' 
                            : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  }
                  if (pageNum === page - 2 || pageNum === page + 2) {
                    return <span key={pageNum} className="px-2 text-gray-400">...</span>;
                  }
                  return null;
                })}
              </div>
              
              <button
                disabled={page === totalPages}
                onClick={() => setPage(p => p + 1)}
                className="inline-flex items-center gap-1 px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Sau
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default ExchangesListPage;
