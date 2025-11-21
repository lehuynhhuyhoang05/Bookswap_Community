import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../../components/layout/Layout';
import { Card, Button, LoadingSpinner, Badge, Avatar, Tabs } from '../../components/ui';
import { useExchanges } from '../../hooks/useExchanges';
import { useAuth } from '../../hooks/useAuth';
import { ArrowLeft, Send, Inbox, AlertCircle, Check, X, Eye } from 'lucide-react';

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
    
    try {
      await cancelExchangeRequest(requestId);
      alert('Đã hủy yêu cầu');
      loadRequests();
    } catch (error) {
      alert('Hủy thất bại: ' + (error.message || 'Vui lòng thử lại'));
    }
  };

  const handleAccept = async (requestId) => {
    if (!confirm('Chấp nhận yêu cầu này?')) return;
    
    try {
      await respondToExchangeRequest(requestId, 'accept');
      alert('Đã chấp nhận yêu cầu!');
      loadRequests();
    } catch (error) {
      alert('Thất bại: ' + (error.message || 'Vui lòng thử lại'));
    }
  };

  const handleReject = async (requestId) => {
    const reason = prompt('Nhập lý do từ chối:');
    if (!reason?.trim()) return;
    
    try {
      await respondToExchangeRequest(requestId, 'reject', reason);
      alert('Đã từ chối yêu cầu');
      loadRequests();
    } catch (error) {
      alert('Thất bại: ' + (error.message || 'Vui lòng thử lại'));
    }
  };

  const getStatusBadge = (status) => {
    const map = {
      PENDING: { variant: 'warning', label: 'Đang chờ' },
      ACCEPTED: { variant: 'success', label: 'Đã chấp nhận' },
      REJECTED: { variant: 'error', label: 'Bị từ chối' },
      CANCELLED: { variant: 'default', label: 'Đã hủy' }
    };
    const config = map[status] || map.PENDING;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  return (
    <Layout>
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-6">
          <Button variant="text" onClick={() => navigate('/exchange')} className="mb-4 text-blue-600">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Quay lại
          </Button>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Yêu cầu trao đổi</h1>
              <p className="text-gray-600">Quản lý các yêu cầu gửi và nhận</p>
            </div>
            <Badge variant="info" className="text-lg px-4 py-2">
              {total} yêu cầu
            </Badge>
          </div>
        </div>

        {/* Tabs */}
        <Tabs
          tabs={[
            { id: 'received', name: `📥 Nhận được` },
            { id: 'sent', name: `📤 Đã gửi` }
          ]}
          activeTab={type}
          onTabChange={(newType) => {
            setType(newType);
            setPage(1);
          }}
        />

        {/* Content */}
        {loading ? (
          <div className="flex justify-center py-16">
            <LoadingSpinner size="lg" />
          </div>
        ) : requests.length === 0 ? (
          <Card className="p-12 text-center">
            <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Không có yêu cầu {type === 'sent' ? 'đã gửi' : 'nhận được'}
            </h3>
            <p className="text-gray-600 mb-6">
              {type === 'sent' 
                ? 'Bạn chưa gửi yêu cầu nào' 
                : 'Bạn chưa nhận được yêu cầu nào'}
            </p>
            <Button variant="primary" onClick={() => navigate('/exchange/suggestions')}>
              Tìm gợi ý trao đổi
            </Button>
          </Card>
        ) : (
          <div className="space-y-4">
            {requests.map(req => {
              const isSentByMe = type === 'sent';
              const other = isSentByMe ? req.receiver : req.requester;
              
              return (
                <Card key={req.request_id} className="p-6">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <Avatar src={other.avatar_url} alt={other.full_name} size="md" />
                      <div>
                        <h4 className="font-semibold text-gray-900">{other.full_name}</h4>
                        <p className="text-sm text-gray-600">{other.region}</p>
                        <Badge variant="outline" size="sm">⭐ {other.trust_score}</Badge>
                      </div>
                    </div>
                    <div className="text-right">
                      {getStatusBadge(req.status)}
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(req.created_at).toLocaleDateString('vi-VN')}
                      </p>
                    </div>
                  </div>

                  {/* Books */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    {/* Offered */}
                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                      <h5 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
                        <Send className="w-4 h-4" />
                        Sách đề nghị ({req.offered_books?.length || 0})
                      </h5>
                      <div className="space-y-2">
                        {req.offered_books?.map(book => (
                          <div key={book.book_id} className="flex items-center justify-between text-sm bg-white p-2 rounded">
                            <span className="font-medium">{book.title}</span>
                            <Badge variant="outline" size="sm">{book.condition}</Badge>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Requested */}
                    <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                      <h5 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
                        <Inbox className="w-4 h-4" />
                        Sách yêu cầu ({req.requested_books?.length || 0})
                      </h5>
                      <div className="space-y-2">
                        {req.requested_books?.map(book => (
                          <div key={book.book_id} className="flex items-center justify-between text-sm bg-white p-2 rounded">
                            <span className="font-medium">{book.title}</span>
                            <Badge variant="outline" size="sm">{book.condition}</Badge>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Message */}
                  {req.message && (
                    <div className="bg-gray-50 p-3 rounded-lg mb-4">
                      <p className="text-sm text-gray-700">💬 {req.message}</p>
                    </div>
                  )}

                  {/* Rejection Reason */}
                  {req.rejection_reason && (
                    <div className="bg-red-50 p-3 rounded-lg mb-4 border border-red-200">
                      <p className="text-sm text-red-700">❌ {req.rejection_reason}</p>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-2 justify-end">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => navigate(`/exchange/request/${req.request_id}`)}
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      Chi tiết
                    </Button>
                    
                    {isSentByMe && req.status === 'PENDING' && (
                      <Button 
                        variant="error" 
                        size="sm"
                        onClick={() => handleCancel(req.request_id)}
                      >
                        <X className="w-4 h-4 mr-1" />
                        Hủy
                      </Button>
                    )}
                    
                    {!isSentByMe && req.status === 'PENDING' && (
                      <>
                        <Button 
                          variant="error" 
                          size="sm"
                          onClick={() => handleReject(req.request_id)}
                        >
                          <X className="w-4 h-4 mr-1" />
                          Từ chối
                        </Button>
                        <Button 
                          variant="success" 
                          size="sm"
                          onClick={() => handleAccept(req.request_id)}
                        >
                          <Check className="w-4 h-4 mr-1" />
                          Chấp nhận
                        </Button>
                      </>
                    )}
                  </div>
                </Card>
              );
            })}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center gap-2 mt-6">
            <Button
              variant="outline"
              disabled={page === 1}
              onClick={() => setPage(p => p - 1)}
            >
              Trước
            </Button>
            <span className="py-2 px-4 text-gray-700">
              Trang {page} / {totalPages}
            </span>
            <Button
              variant="outline"
              disabled={page === totalPages}
              onClick={() => setPage(p => p + 1)}
            >
              Sau
            </Button>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default ExchangeRequestsPage;
