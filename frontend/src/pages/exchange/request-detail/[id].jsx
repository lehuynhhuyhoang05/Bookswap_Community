import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Layout from '../../../components/layout/Layout';
import { Card, Button, LoadingSpinner, Badge, Avatar } from '../../../components/ui';
import { useExchanges } from '../../../hooks/useExchanges';
import { useAuth } from '../../../hooks/useAuth';
import { useMessages } from '../../../hooks/useMessages';
import { ArrowLeft, Send, Inbox, Check, X, Calendar, MessageSquare, CheckCircle } from 'lucide-react';
import { toDisplayScore } from '../../../utils/trustScore';

/**
 * Exchange Request Detail Page
 * Backend API: GET /exchanges/requests/:id
 * Response: ExchangeRequestResponseDto
 */
const ExchangeRequestDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { getExchangeRequestDetail, cancelExchangeRequest, respondToExchangeRequest } = useExchanges();
  const { sendMessage } = useMessages();

  const [request, setRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [messageLoading, setMessageLoading] = useState(false);

  useEffect(() => {
    loadRequestDetail();
  }, [id]);

  const loadRequestDetail = async () => {
    setLoading(true);
    try {
      const data = await getExchangeRequestDetail(id);
      setRequest(data);
    } catch (error) {
      console.error('[RequestDetail] Failed to load:', error);
      alert('Không thể tải chi tiết yêu cầu');
      navigate('/exchange/requests');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async () => {
    if (!confirm('Bạn có chắc muốn hủy yêu cầu này?')) return;
    
    setActionLoading(true);
    try {
      await cancelExchangeRequest(id);
      alert('Đã hủy yêu cầu');
      navigate('/exchange/requests');
    } catch (error) {
      alert('Hủy thất bại: ' + (error.message || 'Vui lòng thử lại'));
    } finally {
      setActionLoading(false);
    }
  };

  const handleAccept = async () => {
    if (!confirm('Chấp nhận yêu cầu này?')) return;
    
    setActionLoading(true);
    try {
      await respondToExchangeRequest(id, 'accept');
      alert('Đã chấp nhận yêu cầu!');
      loadRequestDetail();
    } catch (error) {
      alert('Thất bại: ' + (error.message || 'Vui lòng thử lại'));
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    const reason = prompt('Nhập lý do từ chối:');
    if (!reason?.trim()) return;
    
    setActionLoading(true);
    try {
      await respondToExchangeRequest(id, 'reject', reason);
      alert('Đã từ chối yêu cầu');
      loadRequestDetail();
    } catch (error) {
      alert('Thất bại: ' + (error.message || 'Vui lòng thử lại'));
    } finally {
      setActionLoading(false);
    }
  };

  const handleOpenChat = async () => {
    setMessageLoading(true);
    try {
      // Gửi message đầu tiên để tạo conversation
      await sendMessage({
        exchange_request_id: id,
        content: '👋 Xin chào! Tôi muốn thảo luận về yêu cầu trao đổi này.'
      });
      // Chuyển đến trang messages
      navigate('/messages');
    } catch (error) {
      alert('Không thể mở chat: ' + (error.message || 'Vui lòng thử lại'));
    } finally {
      setMessageLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const map = {
      PENDING: { variant: 'warning', label: 'Đang chờ', icon: '⏳' },
      ACCEPTED: { variant: 'success', label: 'Đã chấp nhận', icon: '✅' },
      REJECTED: { variant: 'error', label: 'Bị từ chối', icon: '❌' },
      CANCELLED: { variant: 'default', label: 'Đã hủy', icon: '🚫' }
    };
    const config = map[status] || map.PENDING;
    return (
      <Badge variant={config.variant} className="text-lg px-4 py-2">
        {config.icon} {config.label}
      </Badge>
    );
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center py-20">
          <LoadingSpinner size="lg" />
        </div>
      </Layout>
    );
  }

  if (!request) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto px-4 py-8 text-center">
          <h2 className="text-2xl font-bold text-gray-900">Không tìm thấy yêu cầu</h2>
          <Button variant="primary" onClick={() => navigate('/exchange/requests')} className="mt-4">
            Quay lại danh sách
          </Button>
        </div>
      </Layout>
    );
  }

  // Determine role: check if current user's member_id matches requester
  const currentMemberId = user?.member?.member_id;
  const isSender = currentMemberId === request.requester?.member_id;
  const isReceiver = !isSender;
  const otherUser = isSender ? request.receiver : request.requester;

  return (
    <Layout>
      <div className="max-w-5xl mx-auto px-4 py-8">
        <Button variant="text" onClick={() => navigate('/exchange/requests')} className="mb-4 text-blue-600">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Quay lại
        </Button>

        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Chi tiết yêu cầu trao đổi</h1>
            <p className="text-gray-600">ID: {request.request_id}</p>
          </div>
          {getStatusBadge(request.status)}
        </div>

        {/* User Info */}
        <Card className="p-6 mb-6 bg-gradient-to-r from-blue-50 to-indigo-50">
          <div className="mb-4">
            <h2 className="text-lg font-semibold text-gray-700 mb-2">
              {isSender ? '📤 Người nhận yêu cầu' : '📥 Người gửi yêu cầu'}
            </h2>
          </div>
          <div className="flex items-center gap-4">
            <Avatar src={otherUser?.avatar_url} alt={otherUser?.full_name} size="lg" />
            <div className="flex-1">
              <h3 className="text-xl font-semibold text-gray-900">{otherUser?.full_name || 'Người dùng'}</h3>
              <p className="text-sm text-gray-600 mt-1">📍 {otherUser?.region || 'Khu vực không xác định'}</p>
              <div className="flex items-center gap-2 mt-2">
                <Badge variant="outline" size="sm">⭐ Độ tin cậy: {toDisplayScore(otherUser?.trust_score)}</Badge>
              </div>
            </div>
            <div className="text-right text-sm text-gray-500">
              <div className="flex items-center gap-2 mb-1">
                <Calendar className="w-4 h-4" />
                {new Date(request.created_at).toLocaleDateString('vi-VN', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </div>
              {request.responded_at && (
                <div className="text-xs text-gray-400">
                  Phản hồi: {new Date(request.responded_at).toLocaleDateString('vi-VN')}
                </div>
              )}
            </div>
          </div>
        </Card>

        {/* Books Exchange */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Offered Books */}
          <Card className="p-6 bg-blue-50 border-blue-200">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Send className="w-5 h-5 text-blue-600" />
              Sách đề nghị ({request.offered_books?.length || 0})
            </h2>
            <div className="space-y-3">
              {request.offered_books?.map((book) => (
                <div key={book.book_id} className="bg-white p-4 rounded-lg shadow-sm">
                  <div className="font-semibold text-gray-900">{book.title}</div>
                  <div className="text-sm text-gray-600 mt-1">{book.author}</div>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant="outline" size="sm">{book.condition}</Badge>
                    {book.category && <Badge variant="info" size="sm">{book.category}</Badge>}
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Requested Books */}
          <Card className="p-6 bg-green-50 border-green-200">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Inbox className="w-5 h-5 text-green-600" />
              Sách yêu cầu ({request.requested_books?.length || 0})
            </h2>
            <div className="space-y-3">
              {request.requested_books?.map((book) => (
                <div key={book.book_id} className="bg-white p-4 rounded-lg shadow-sm">
                  <div className="font-semibold text-gray-900">{book.title}</div>
                  <div className="text-sm text-gray-600 mt-1">{book.author}</div>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant="outline" size="sm">{book.condition}</Badge>
                    {book.category && <Badge variant="info" size="sm">{book.category}</Badge>}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Message */}
        {request.message && (
          <Card className="p-6 mb-6 bg-purple-50 border-purple-200">
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-purple-600" />
              Lời nhắn
            </h3>
            <p className="text-gray-700 whitespace-pre-wrap">{request.message}</p>
          </Card>
        )}

        {/* Rejection Reason */}
        {request.rejection_reason && (
          <Card className="p-6 mb-6 bg-red-50 border-red-200">
            <h3 className="font-semibold text-red-900 mb-3">❌ Lý do từ chối</h3>
            <p className="text-red-700">{request.rejection_reason}</p>
          </Card>
        )}

        {/* Accepted - Link to Exchange */}
        {request.status === 'ACCEPTED' && (
          <Card className="p-6 mb-6 bg-green-50 border-green-200">
            <div className="text-center">
              <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-green-900 mb-2">Yêu cầu đã được chấp nhận!</h3>
              <p className="text-green-700 mb-4">Giao dịch trao đổi đã được tạo</p>
              <Button 
                variant="success" 
                onClick={() => navigate('/exchange/list')}
                className="mx-auto"
              >
                Xem danh sách giao dịch
              </Button>
            </div>
          </Card>
        )}

        {/* Message Button - Always show */}
        <Card className="p-6 mb-6">
          <div className="flex gap-3 justify-center">
            <Button 
              variant="primary"
              onClick={handleOpenChat}
              disabled={messageLoading}
              className="min-w-[200px]"
            >
              {messageLoading ? (
                <>
                  <LoadingSpinner size="sm" className="mr-2" />
                  Đang mở...
                </>
              ) : (
                <>
                  <MessageSquare className="w-4 h-4 mr-2" />
                  💬 Nhắn tin với {isSender ? 'người nhận' : 'người yêu cầu'}
                </>
              )}
            </Button>
          </div>
        </Card>

        {/* Actions */}
        {request.status === 'PENDING' && (
          <Card className="p-6">
            <div className="flex gap-3 justify-end">
              {isSender ? (
                <Button 
                  variant="error" 
                  onClick={handleCancel}
                  disabled={actionLoading}
                >
                  <X className="w-4 h-4 mr-2" />
                  Hủy yêu cầu
                </Button>
              ) : (
                <>
                  <Button 
                    variant="outline"
                    onClick={handleReject}
                    disabled={actionLoading}
                  >
                    <X className="w-4 h-4 mr-2" />
                    Từ chối
                  </Button>
                  <Button 
                    variant="success"
                    onClick={handleAccept}
                    disabled={actionLoading}
                  >
                    {actionLoading ? (
                      <>
                        <LoadingSpinner size="sm" className="mr-2" />
                        Đang xử lý...
                      </>
                    ) : (
                      <>
                        <Check className="w-4 h-4 mr-2" />
                        Chấp nhận
                      </>
                    )}
                  </Button>
                </>
              )}
            </div>
          </Card>
        )}
      </div>
    </Layout>
  );
};

export default ExchangeRequestDetailPage;
