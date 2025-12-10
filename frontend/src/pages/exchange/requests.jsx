import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Layout from '../../components/layout/Layout';
import { Card, Button, LoadingSpinner, Badge, Avatar, Tabs } from '../../components/ui';
import { useExchanges } from '../../hooks/useExchanges';
import { useAuth } from '../../hooks/useAuth';
import { 
  ArrowLeft, 
  Send, 
  Inbox, 
  AlertCircle, 
  Check, 
  X, 
  Eye,
  MessageCircle,
  Clock,
  CheckCircle2,
  XCircle,
  Ban,
  ChevronLeft,
  ChevronRight,
  Star,
  MapPin,
  Sparkles,
  RefreshCw,
  BookOpen,
  Target
} from 'lucide-react';
import { toDisplayScore } from '../../utils/trustScore';

/**
 * Exchange Requests Page
 * Backend API: GET /exchanges/requests?type=sent|received&status=PENDING|ACCEPTED|REJECTED&page=1&limit=20
 * Response: PaginatedExchangeRequestsDto
 */
const ExchangeRequestsPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { getExchangeRequests, cancelExchangeRequest, respondToExchangeRequest } = useExchanges();

  const [type, setType] = useState('received'); // 'sent' | 'received'
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [actionLoading, setActionLoading] = useState(null);

  useEffect(() => {
    loadRequests();
  }, [type, page]);

  const loadRequests = async () => {
    setLoading(true);
    try {
      const result = await getExchangeRequests({
        type,
        page,
        limit: 10
      });
      setRequests(result.items || []);
      setTotal(result.total || 0);
      setTotalPages(result.pages || 1);
    } catch (error) {
      console.error('[Requests] Failed to load:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (requestId) => {
    if (!confirm('Bạn có chắc muốn hủy yêu cầu này?')) return;
    
    setActionLoading(requestId);
    try {
      await cancelExchangeRequest(requestId);
      alert('Đã hủy yêu cầu');
      loadRequests();
    } catch (error) {
      alert('Hủy thất bại: ' + (error.message || 'Vui lòng thử lại'));
    } finally {
      setActionLoading(null);
    }
  };

  const handleAccept = async (requestId) => {
    if (!confirm('Chấp nhận yêu cầu này?')) return;
    
    setActionLoading(requestId);
    try {
      await respondToExchangeRequest(requestId, 'accept');
      alert('Đã chấp nhận yêu cầu!');
      loadRequests();
    } catch (error) {
      alert('Thất bại: ' + (error.message || 'Vui lòng thử lại'));
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (requestId) => {
    const reason = prompt('Nhập lý do từ chối:');
    if (!reason?.trim()) return;
    
    setActionLoading(requestId);
    try {
      await respondToExchangeRequest(requestId, 'reject', reason);
      alert('Đã từ chối yêu cầu');
      loadRequests();
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
        label: 'Đang chờ', 
        bg: 'bg-amber-100', 
        text: 'text-amber-700',
        border: 'border-amber-200'
      },
      ACCEPTED: { 
        icon: CheckCircle2, 
        label: 'Đã chấp nhận', 
        bg: 'bg-green-100', 
        text: 'text-green-700',
        border: 'border-green-200'
      },
      REJECTED: { 
        icon: XCircle, 
        label: 'Bị từ chối', 
        bg: 'bg-red-100', 
        text: 'text-red-700',
        border: 'border-red-200'
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

  // Calculate pending count for tab badge
  const pendingCount = requests.filter(r => r.status === 'PENDING').length;

  return (
    <Layout>
      {/* Hero Header */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-white/10 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-cyan-500/20 rounded-full blur-3xl"></div>
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
              <MessageCircle className="h-4 w-4 text-yellow-300" />
              <span className="text-sm font-medium text-white">Quản lý yêu cầu</span>
            </div>

            <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">
              Yêu cầu trao đổi
            </h1>
            <p className="text-white/80 text-lg mb-6">
              Quản lý các yêu cầu gửi đi và nhận được từ cộng đồng
            </p>

            {/* Stats Quick View */}
            <div className="flex flex-wrap gap-4">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl px-5 py-3 flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                  <Send className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-white">{total}</div>
                  <div className="text-sm text-white/70">Tổng yêu cầu</div>
                </div>
              </div>
              {pendingCount > 0 && (
                <div className="bg-amber-500/20 backdrop-blur-sm rounded-xl px-5 py-3 flex items-center gap-3 border border-amber-400/30">
                  <div className="w-10 h-10 bg-amber-500 rounded-lg flex items-center justify-center">
                    <Clock className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-white">{pendingCount}</div>
                    <div className="text-sm text-white/70">Chờ xử lý</div>
                  </div>
                </div>
              )}
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
          {/* Tab Buttons */}
          <div className="flex gap-2 mb-6 bg-white p-2 rounded-2xl shadow-sm">
            <button
              onClick={() => { setType('received'); setPage(1); }}
              className={`flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-medium transition-all ${
                type === 'received' 
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg' 
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Inbox className="w-5 h-5" />
              <span>Nhận được</span>
              {type === 'received' && pendingCount > 0 && (
                <span className="bg-amber-500 text-white text-xs px-2 py-0.5 rounded-full">{pendingCount}</span>
              )}
            </button>
            <button
              onClick={() => { setType('sent'); setPage(1); }}
              className={`flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-medium transition-all ${
                type === 'sent' 
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg' 
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Send className="w-5 h-5" />
              <span>Đã gửi</span>
            </button>
          </div>

          {/* Content */}
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="relative">
                <div className="w-16 h-16 border-4 border-indigo-200 rounded-full animate-spin border-t-indigo-600"></div>
                <RefreshCw className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 h-6 w-6 text-indigo-600" />
              </div>
              <p className="mt-4 text-gray-600 font-medium">Đang tải yêu cầu...</p>
            </div>
          ) : requests.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 text-center shadow-sm">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                {type === 'sent' ? (
                  <Send className="w-10 h-10 text-gray-400" />
                ) : (
                  <Inbox className="w-10 h-10 text-gray-400" />
                )}
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {type === 'sent' ? 'Chưa có yêu cầu nào được gửi đi' : 'Chưa nhận được yêu cầu nào'}
              </h3>
              <p className="text-gray-600 mb-8 max-w-md mx-auto">
                {type === 'sent' 
                  ? 'Bắt đầu trao đổi bằng cách tìm gợi ý phù hợp hoặc khám phá các cuốn sách mới' 
                  : 'Khi có người muốn trao đổi sách với bạn, yêu cầu sẽ hiển thị ở đây'}
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link to="/exchange/suggestions">
                  <button className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-xl font-medium hover:from-blue-700 hover:to-indigo-700 transition-all">
                    <Target className="w-5 h-5" />
                    Tìm gợi ý trao đổi
                  </button>
                </Link>
                <Link to="/books">
                  <button className="inline-flex items-center gap-2 bg-gray-100 text-gray-700 px-6 py-3 rounded-xl font-medium hover:bg-gray-200 transition-all">
                    <BookOpen className="w-5 h-5" />
                    Khám phá sách
                  </button>
                </Link>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {requests.map(req => {
                const isSentByMe = type === 'sent';
                const other = isSentByMe ? req.receiver : req.requester;
                const statusConfig = getStatusConfig(req.status);
                const StatusIcon = statusConfig.icon;
                const isLoading = actionLoading === req.request_id;
                
                return (
                  <div 
                    key={req.request_id} 
                    className={`bg-white rounded-2xl shadow-sm border ${req.status === 'PENDING' ? 'border-amber-200' : 'border-gray-100'} overflow-hidden hover:shadow-md transition-shadow`}
                  >
                    {/* Card Header */}
                    <div className="p-5 border-b border-gray-100">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-4">
                          <div className="relative">
                            <Avatar src={other.avatar_url} alt={other.full_name} size="lg" />
                            <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-white rounded-full flex items-center justify-center shadow-sm">
                              {isSentByMe ? (
                                <Send className="w-3 h-3 text-blue-600" />
                              ) : (
                                <Inbox className="w-3 h-3 text-green-600" />
                              )}
                            </div>
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-900 text-lg">{other.full_name}</h4>
                            <div className="flex items-center gap-3 mt-1">
                              {other.region && (
                                <span className="inline-flex items-center gap-1 text-sm text-gray-500">
                                  <MapPin className="w-3 h-3" />
                                  {other.region}
                                </span>
                              )}
                              <span className="inline-flex items-center gap-1 text-sm text-amber-600 font-medium">
                                <Star className="w-3 h-3 fill-current" />
                                {toDisplayScore(other.trust_score)}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full ${statusConfig.bg} ${statusConfig.text} border ${statusConfig.border}`}>
                            <StatusIcon className="w-4 h-4" />
                            <span className="text-sm font-medium">{statusConfig.label}</span>
                          </div>
                          <p className="text-xs text-gray-500 mt-2">
                            {new Date(req.created_at).toLocaleDateString('vi-VN', {
                              day: '2-digit',
                              month: '2-digit',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Books Section */}
                    <div className="p-5">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Offered Books */}
                        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-4 rounded-xl border border-blue-100">
                          <h5 className="font-medium text-blue-900 mb-3 flex items-center gap-2">
                            <div className="w-7 h-7 bg-blue-500 rounded-lg flex items-center justify-center">
                              <Send className="w-4 h-4 text-white" />
                            </div>
                            {isSentByMe ? 'Sách bạn đề nghị' : 'Sách họ đề nghị'}
                            <span className="ml-auto bg-blue-500 text-white text-xs px-2 py-0.5 rounded-full">
                              {req.offered_books?.length || 0}
                            </span>
                          </h5>
                          <div className="space-y-2">
                            {req.offered_books?.map(book => (
                              <div key={book.book_id} className="flex items-center justify-between bg-white p-3 rounded-lg shadow-sm">
                                <span className="font-medium text-gray-900 text-sm truncate flex-1">{book.title}</span>
                                <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded-full ml-2 whitespace-nowrap">
                                  {book.condition}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Requested Books */}
                        <div className="bg-gradient-to-br from-emerald-50 to-green-50 p-4 rounded-xl border border-green-100">
                          <h5 className="font-medium text-green-900 mb-3 flex items-center gap-2">
                            <div className="w-7 h-7 bg-green-500 rounded-lg flex items-center justify-center">
                              <Inbox className="w-4 h-4 text-white" />
                            </div>
                            {isSentByMe ? 'Sách bạn muốn' : 'Sách họ muốn'}
                            <span className="ml-auto bg-green-500 text-white text-xs px-2 py-0.5 rounded-full">
                              {req.requested_books?.length || 0}
                            </span>
                          </h5>
                          <div className="space-y-2">
                            {req.requested_books?.map(book => (
                              <div key={book.book_id} className="flex items-center justify-between bg-white p-3 rounded-lg shadow-sm">
                                <span className="font-medium text-gray-900 text-sm truncate flex-1">{book.title}</span>
                                <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded-full ml-2 whitespace-nowrap">
                                  {book.condition}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Message */}
                      {req.message && (
                        <div className="mt-4 bg-gray-50 p-4 rounded-xl border border-gray-100">
                          <div className="flex items-start gap-3">
                            <div className="w-8 h-8 bg-gray-200 rounded-lg flex items-center justify-center flex-shrink-0">
                              <MessageCircle className="w-4 h-4 text-gray-600" />
                            </div>
                            <p className="text-gray-700 text-sm leading-relaxed">{req.message}</p>
                          </div>
                        </div>
                      )}

                      {/* Rejection Reason */}
                      {req.rejection_reason && (
                        <div className="mt-4 bg-red-50 p-4 rounded-xl border border-red-200">
                          <div className="flex items-start gap-3">
                            <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0">
                              <XCircle className="w-4 h-4 text-red-600" />
                            </div>
                            <div>
                              <p className="text-sm font-medium text-red-800 mb-1">Lý do từ chối:</p>
                              <p className="text-red-700 text-sm">{req.rejection_reason}</p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="px-5 py-4 bg-gray-50 border-t border-gray-100 flex flex-wrap gap-2 justify-end">
                      <button 
                        onClick={() => navigate(`/exchange/request/${req.request_id}`)}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-100 hover:border-gray-300 transition-colors"
                      >
                        <Eye className="w-4 h-4" />
                        Xem chi tiết
                      </button>
                      
                      {isSentByMe && req.status === 'PENDING' && (
                        <button 
                          onClick={() => handleCancel(req.request_id)}
                          disabled={isLoading}
                          className="inline-flex items-center gap-2 px-4 py-2 bg-red-50 border border-red-200 text-red-600 rounded-lg font-medium hover:bg-red-100 transition-colors disabled:opacity-50"
                        >
                          {isLoading ? (
                            <RefreshCw className="w-4 h-4 animate-spin" />
                          ) : (
                            <X className="w-4 h-4" />
                          )}
                          Hủy yêu cầu
                        </button>
                      )}
                      
                      {!isSentByMe && req.status === 'PENDING' && (
                        <>
                          <button 
                            onClick={() => handleReject(req.request_id)}
                            disabled={isLoading}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-red-50 border border-red-200 text-red-600 rounded-lg font-medium hover:bg-red-100 transition-colors disabled:opacity-50"
                          >
                            {isLoading ? (
                              <RefreshCw className="w-4 h-4 animate-spin" />
                            ) : (
                              <X className="w-4 h-4" />
                            )}
                            Từ chối
                          </button>
                          <button 
                            onClick={() => handleAccept(req.request_id)}
                            disabled={isLoading}
                            className="inline-flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg font-medium hover:from-green-700 hover:to-emerald-700 transition-all shadow-sm disabled:opacity-50"
                          >
                            {isLoading ? (
                              <RefreshCw className="w-4 h-4 animate-spin" />
                            ) : (
                              <Check className="w-4 h-4" />
                            )}
                            Chấp nhận
                          </button>
                        </>
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
                  // Show first, last, and pages around current
                  if (pageNum === 1 || pageNum === totalPages || (pageNum >= page - 1 && pageNum <= page + 1)) {
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setPage(pageNum)}
                        className={`w-10 h-10 rounded-lg font-medium transition-colors ${
                          page === pageNum 
                            ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg' 
                            : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  }
                  // Show ellipsis
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

export default ExchangeRequestsPage;
