import {
  AlertCircle,
  ArrowLeft,
  Check,
  Eye,
  Inbox,
  MessageCircle,
  Send,
  X,
} from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../../components/layout/Layout';
import {
  Avatar,
  Badge,
  Button,
  Card,
  LoadingSpinner,
  Tabs,
} from '../../components/ui';
import { useAuth } from '../../hooks/useAuth';
import { useExchanges } from '../../hooks/useExchanges';
import { useMessages } from '../../hooks/useMessages';

const ExchangeRequestsPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const {
    getExchangeRequests,
    cancelExchangeRequest,
    respondToExchangeRequest,
  } = useExchanges();
  const { sendMessage, getConversations } = useMessages();

  const [type, setType] = useState('received');
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [actionLoading, setActionLoading] = useState(null);

  // Debug effect - chỉ log khi có thay đổi quan trọng
  useEffect(() => {
    console.log('🔍 [REQUESTS] State updated:', {
      type,
      requestsCount: requests.length,
      page,
      totalPages,
      total,
      loading: loading ? 'loading...' : 'idle',
      actionLoading,
    });
  }, [type, requests.length, page, totalPages, total, loading, actionLoading]);

  // Load requests với useCallback để tránh re-render không cần thiết
  const loadRequests = useCallback(async () => {
    if (loading) {
      console.log('⏳ [REQUESTS] Skipping load - already loading');
      return; // Prevent multiple simultaneous calls
    }

    setLoading(true);
    try {
      console.log('📥 [REQUESTS] Loading requests:', { type, page });
      const result = await getExchangeRequests({ type, page, limit: 10 });
      console.log('✅ [REQUESTS] Load requests success:', result);

      const requestsData = result.items || result.data || [];
      setRequests(requestsData);
      setTotal(result.total || 0);

      // Fix pages calculation - đảm bảo luôn có ít nhất 1 trang
      const itemsCount = requestsData.length;
      const totalCount = result.total || 0;
      const limit = 10;
      const calculatedPages =
        itemsCount > 0 ? Math.max(1, Math.ceil(totalCount / limit)) : 1;

      setTotalPages(calculatedPages);

      console.log('📊 [REQUESTS] Pagination calculated:', {
        total: totalCount,
        items: itemsCount,
        pages: calculatedPages,
      });
    } catch (error) {
      console.error('❌ [REQUESTS] Failed to load requests:', error);
      alert(
        'Tải danh sách yêu cầu thất bại: ' +
          (error.message || 'Vui lòng thử lại'),
      );
    } finally {
      setLoading(false);
    }
  }, [type, page, getExchangeRequests]); // REMOVED loading from dependencies

  // Load requests khi type hoặc page thay đổi - FIXED INFINITE LOOP
  useEffect(() => {
    console.log('🎯 [REQUESTS] useEffect triggered:', { type, page });
    loadRequests();
  }, [type, page]); // Chỉ phụ thuộc vào type và page

  const handleCancel = async (requestId) => {
    if (!confirm('Bạn có chắc muốn hủy yêu cầu này?')) return;

    setActionLoading(`cancel-${requestId}`);
    try {
      await cancelExchangeRequest(requestId);
      alert('✅ Đã hủy yêu cầu thành công');
      await loadRequests(); // Reload data
    } catch (error) {
      console.error('❌ Cancel request error:', error);
      alert('❌ Hủy thất bại: ' + (error.message || 'Vui lòng thử lại'));
    } finally {
      setActionLoading(null);
    }
  };

  const handleAccept = async (requestId) => {
    if (!confirm('Chấp nhận yêu cầu trao đổi này?')) return;

    setActionLoading(`accept-${requestId}`);
    try {
      await respondToExchangeRequest(requestId, 'accept');
      alert('✅ Đã chấp nhận yêu cầu thành công!');
      await loadRequests(); // Reload data
    } catch (error) {
      console.error('❌ Accept request error:', error);
      alert('❌ Thất bại: ' + (error.message || 'Vui lòng thử lại'));
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (requestId) => {
    const reason = prompt('Nhập lý do từ chối:');
    if (!reason?.trim()) {
      alert('Vui lòng nhập lý do từ chối');
      return;
    }

    setActionLoading(`reject-${requestId}`);
    try {
      await respondToExchangeRequest(requestId, 'reject', reason);
      alert('✅ Đã từ chối yêu cầu thành công');
      await loadRequests(); // Reload data
    } catch (error) {
      console.error('❌ Reject request error:', error);
      alert('❌ Thất bại: ' + (error.message || 'Vui lòng thử lại'));
    } finally {
      setActionLoading(null);
    }
  };

  // 💬 Start chat: gửi message đầu tiên với exchange_request_id
  const handleStartChat = async (request) => {
    console.log('💬 [REQUESTS] Starting chat for request:', {
      request_id: request.request_id,
      status: request.status,
      type: type,
    });

    setActionLoading(`chat-${request.request_id}`);
    try {
      // Tìm conversation hiện có liên quan đến exchange request này
      const conversations = await getConversations();
      console.log('📞 [REQUESTS] All conversations:', conversations);

      let existingConversation = conversations.find(
        (conv) => conv.exchange_request_id === request.request_id,
      );

      console.log(
        '📞 [REQUESTS] Found existing conversation:',
        existingConversation,
      );

      if (existingConversation) {
        // Nếu đã có conversation, điều hướng đến đó
        const conversationId =
          existingConversation.conversation_id || existingConversation.id;

        if (!conversationId || conversationId === 'undefined') {
          console.error(
            '❌ [REQUESTS] Invalid conversationId from existing conversation:',
            existingConversation,
          );
          throw new Error('Invalid conversation ID');
        }

        console.log(
          '🎯 [REQUESTS] Navigating to existing conversation:',
          conversationId,
        );
        navigate(`/messages/conversation/${conversationId}`);
      } else {
        // Nếu chưa có, tạo message đầu tiên với exchange_request_id
        const messageData = {
          exchange_request_id: request.request_id,
          content: `Xin chào! Tôi muốn trao đổi về yêu cầu trao đổi sách.`,
        };

        console.log('📤 [REQUESTS] Sending first message:', messageData);

        const response = await sendMessage(messageData);
        console.log('✅ [REQUESTS] Message sent successfully:', response);
        console.log('🔍 [REQUESTS] Response structure:', {
          hasMessage: !!response.message,
          hasData: !!response.data,
          topLevelConvId: response.conversation_id,
          messageConvId: response.message?.conversation_id,
          response: response,
        });

        // Backend can return conversation_id at top level OR inside message object
        const conversationId =
          response.conversation_id ||
          response.message?.conversation_id ||
          response.data?.conversation_id;

        console.log('🔍 [REQUESTS] Extracted conversationId:', conversationId);

        if (conversationId && conversationId !== 'undefined') {
          console.log(
            '🎯 [REQUESTS] Navigating to new conversation:',
            conversationId,
          );
          navigate(`/messages/conversation/${conversationId}`);
        } else {
          // Fallback: điều hướng đến trang messages
          console.error(
            '❌ [REQUESTS] No valid conversation_id in response:',
            response,
          );
          navigate('/messages', {
            state: {
              exchangeRequestId: request.request_id,
              autoCreateConversation: true,
            },
          });
        }
      }
    } catch (error) {
      console.error('❌ [REQUESTS] Chat error details:', {
        error,
        message: error.message,
        response: error.response,
      });

      let errorMessage = 'Không thể bắt đầu chat';

      if (error.message?.includes('after exchange request is accepted')) {
        errorMessage =
          '⚠️ Chỉ có thể nhắn tin sau khi yêu cầu trao đổi được chấp nhận';
      } else if (error.message?.includes('Dữ liệu không hợp lệ')) {
        errorMessage +=
          ': Dữ liệu gửi không hợp lệ. Vui lòng kiểm tra lại thông tin.';
      } else if (error.message?.includes('conversation_id')) {
        errorMessage += ': Thiếu thông tin conversation. Vui lòng thử lại.';
      } else if (error.message) {
        errorMessage += ': ' + error.message;
      } else {
        errorMessage += '. Vui lòng thử lại sau.';
      }

      alert(errorMessage);
    } finally {
      setActionLoading(null);
    }
  };

  const getStatusBadge = (status) => {
    const map = {
      PENDING: { variant: 'warning', label: 'Đang chờ' },
      ACCEPTED: { variant: 'success', label: 'Đã chấp nhận' },
      REJECTED: { variant: 'error', label: 'Bị từ chối' },
      CANCELLED: { variant: 'default', label: 'Đã hủy' },
      COMPLETED: { variant: 'success', label: 'Hoàn thành' },
      ARCHIVED: { variant: 'default', label: 'Đã lưu trữ' },
    };
    const config = map[status] || map.PENDING;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  // Kiểm tra xem có thể nhắn tin không (chỉ khi request đã ACCEPTED)
  const canStartChat = (request) => {
    // Backend chỉ cho phép gửi message khi exchange request đã ACCEPTED
    return request.status === 'ACCEPTED';
  };

  // Kiểm tra xem có thể hủy không (chỉ PENDING và là người gửi)
  const canCancel = (request, isSentByMe) => {
    return isSentByMe && request.status === 'PENDING';
  };

  // Kiểm tra xem có thể phản hồi không (chỉ PENDING và là người nhận)
  const canRespond = (request, isSentByMe) => {
    return !isSentByMe && request.status === 'PENDING';
  };

  const renderBookList = (books, title, icon, bgColor) => (
    <div
      className={`${bgColor} p-4 rounded-lg border ${bgColor.includes('blue') ? 'border-blue-200' : 'border-green-200'}`}
    >
      <h5 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
        {icon}
        {title} ({books?.length || 0})
      </h5>
      <div className="space-y-2">
        {books?.length > 0 ? (
          books.map((book) => (
            <div
              key={book.book_id}
              className="flex items-center justify-between text-sm bg-white p-2 rounded"
            >
              <span
                className="font-medium truncate flex-1 mr-2"
                title={book.title}
              >
                {book.title}
              </span>
              <Badge variant="outline" size="sm">
                {book.condition}
              </Badge>
            </div>
          ))
        ) : (
          <p className="text-sm text-gray-500 italic">Không có sách</p>
        )}
      </div>
    </div>
  );

  const handleTabChange = (newType) => {
    console.log('📑 [REQUESTS] Tab changed:', { from: type, to: newType });
    setType(newType);
    setPage(1); // Reset về trang 1 khi đổi tab
  };

  const handlePageChange = (newPage) => {
    console.log('📄 [REQUESTS] Page changed:', { from: page, to: newPage });
    setPage(newPage);
  };

  return (
    <Layout>
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="mb-6">
          <Button
            variant="text"
            onClick={() => navigate('/exchange')}
            className="mb-4 text-blue-600 hover:text-blue-700"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Quay lại trao đổi
          </Button>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Yêu cầu trao đổi
              </h1>
              <p className="text-gray-600">
                Quản lý các yêu cầu trao đổi sách bạn đã gửi và nhận được
              </p>
            </div>
            <Badge variant="info" className="text-lg px-4 py-2 w-fit">
              {total} yêu cầu
            </Badge>
          </div>
        </div>

        {/* Tabs */}
        <Tabs
          tabs={[
            { id: 'received', name: '📥 Yêu cầu nhận được' },
            { id: 'sent', name: '📤 Yêu cầu đã gửi' },
          ]}
          activeTab={type}
          onTabChange={handleTabChange}
          className="mb-6"
        />

        {/* Content */}
        {loading ? (
          <div className="flex justify-center py-16">
            <LoadingSpinner size="lg" />
            <span className="ml-3 text-gray-600">Đang tải yêu cầu...</span>
          </div>
        ) : requests.length === 0 ? (
          <Card className="p-12 text-center">
            <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {type === 'sent'
                ? 'Chưa có yêu cầu đã gửi'
                : 'Chưa có yêu cầu nhận được'}
            </h3>
            <p className="text-gray-600 mb-6">
              {type === 'sent'
                ? 'Bạn chưa gửi yêu cầu trao đổi nào cho người dùng khác'
                : 'Chưa có ai gửi yêu cầu trao đổi sách với bạn'}
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button
                variant="primary"
                onClick={() => navigate('/exchange/suggestions')}
              >
                Tìm gợi ý trao đổi
              </Button>
              <Button
                variant="outline"
                onClick={() => navigate('/books/my-library')}
              >
                Quản lý thư viện
              </Button>
            </div>
          </Card>
        ) : (
          <div className="space-y-6">
            {requests.map((req) => {
              const isSentByMe = type === 'sent';
              const other = isSentByMe ? req.receiver : req.requester;
              const canChat = canStartChat(req);
              const showCancel = canCancel(req, isSentByMe);
              const showRespond = canRespond(req, isSentByMe);

              return (
                <Card
                  key={req.request_id}
                  className="p-6 hover:shadow-md transition-shadow"
                >
                  <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4 mb-4">
                    <div className="flex items-start gap-3 flex-1">
                      <Avatar
                        src={other?.avatar_url}
                        alt={other?.full_name}
                        size="md"
                      />
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900 text-lg">
                          {other?.full_name || 'Người dùng'}
                        </h4>
                        <p className="text-sm text-gray-600 mb-2">
                          {other?.region || 'Chưa cập nhật địa chỉ'}
                        </p>
                        <div className="flex flex-wrap gap-2">
                          <Badge variant="outline" size="sm">
                            ⭐ {other?.trust_score || 0}/10
                          </Badge>
                          <Badge variant="outline" size="sm">
                            📚 {other?.total_books || 0} sách
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      {getStatusBadge(req.status)}
                      <p className="text-xs text-gray-500 mt-2">
                        {new Date(req.created_at).toLocaleDateString('vi-VN', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                  </div>

                  {/* Books Grid */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
                    {renderBookList(
                      req.offered_books,
                      'Sách đề nghị trao đổi',
                      <Send className="w-4 h-4" />,
                      'bg-blue-50',
                    )}
                    {renderBookList(
                      req.requested_books,
                      'Sách yêu cầu nhận',
                      <Inbox className="w-4 h-4" />,
                      'bg-green-50',
                    )}
                  </div>

                  {/* Messages */}
                  {req.message && (
                    <div className="bg-gray-50 p-3 rounded-lg mb-4 border border-gray-200">
                      <p className="text-sm text-gray-700">
                        <span className="font-medium">💬 Lời nhắn:</span>{' '}
                        {req.message}
                      </p>
                    </div>
                  )}

                  {req.rejection_reason && (
                    <div className="bg-red-50 p-3 rounded-lg mb-4 border border-red-200">
                      <p className="text-sm text-red-700">
                        <span className="font-medium">❌ Lý do từ chối:</span>{' '}
                        {req.rejection_reason}
                      </p>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex flex-wrap gap-2 justify-end pt-4 border-t border-gray-200">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        navigate(`/exchange/request/${req.request_id}`)
                      }
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      Chi tiết
                    </Button>

                    {/* Chat Button */}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleStartChat(req)}
                      disabled={
                        !canChat || actionLoading === `chat-${req.request_id}`
                      }
                      loading={actionLoading === `chat-${req.request_id}`}
                      title={
                        !canChat
                          ? 'Chỉ có thể nhắn tin sau khi yêu cầu được chấp nhận'
                          : 'Nhắn tin về yêu cầu này'
                      }
                    >
                      <MessageCircle className="w-4 h-4 mr-1" />
                      {canChat ? 'Nhắn tin' : 'Chưa chấp nhận'}
                    </Button>

                    {/* Cancel Button (for sender) */}
                    {showCancel && (
                      <Button
                        variant="error"
                        size="sm"
                        onClick={() => handleCancel(req.request_id)}
                        loading={actionLoading === `cancel-${req.request_id}`}
                        disabled={
                          actionLoading &&
                          actionLoading !== `cancel-${req.request_id}`
                        }
                      >
                        <X className="w-4 h-4 mr-1" />
                        Hủy yêu cầu
                      </Button>
                    )}

                    {/* Respond Buttons (for receiver) */}
                    {showRespond && (
                      <>
                        <Button
                          variant="error"
                          size="sm"
                          onClick={() => handleReject(req.request_id)}
                          loading={actionLoading === `reject-${req.request_id}`}
                          disabled={
                            actionLoading &&
                            actionLoading !== `reject-${req.request_id}`
                          }
                        >
                          <X className="w-4 h-4 mr-1" />
                          Từ chối
                        </Button>
                        <Button
                          variant="success"
                          size="sm"
                          onClick={() => handleAccept(req.request_id)}
                          loading={actionLoading === `accept-${req.request_id}`}
                          disabled={
                            actionLoading &&
                            actionLoading !== `accept-${req.request_id}`
                          }
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

        {/* Pagination - Chỉ hiển thị khi có nhiều hơn 1 trang */}
        {totalPages > 1 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-8 pt-6 border-t border-gray-200">
            <p className="text-sm text-gray-600">
              Hiển thị {requests.length} trên tổng số {total} yêu cầu
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={page === 1 || loading}
                onClick={() => handlePageChange(page - 1)}
              >
                Trước
              </Button>
              <span className="py-2 px-4 text-sm text-gray-700 bg-gray-100 rounded">
                Trang {page} / {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={page === totalPages || loading}
                onClick={() => handlePageChange(page + 1)}
              >
                Sau
              </Button>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default ExchangeRequestsPage;
