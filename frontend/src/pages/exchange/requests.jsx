import React, { useState, useEffect } from 'react';
import Layout from '../../components/layout/Layout'; // ✅ Thêm Layout
import { Tabs, Card, Button, Badge, Avatar } from '../../components/ui';
import { useExchanges } from '../../hooks/useExchanges';

const ExchangeRequestsPage = () => {
  const [requests, setRequests] = useState([]);
  const [activeTab, setActiveTab] = useState('sent');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);

  const { getExchangeRequests, cancelExchangeRequest, respondToExchangeRequest } = useExchanges();

  useEffect(() => {
    loadRequests();
  }, [activeTab, currentPage]);

  // Load danh sách yêu cầu trao đổi
  const loadRequests = async () => {
    setLoading(true);
    try {
      const result = await getExchangeRequests({
        type: activeTab,
        page: currentPage,
        limit: 10
      });
      setRequests(result.items || []);
      setTotalPages(result.pages || 1);
    } catch (error) {
      console.error('Không tải được danh sách yêu cầu:', error);
    } finally {
      setLoading(false);
    }
  };

  // Hủy yêu cầu trao đổi
  const handleCancelRequest = async (requestId) => {
    try {
      await cancelExchangeRequest(requestId);
      loadRequests();
    } catch (error) {
      console.error('Hủy yêu cầu thất bại:', error);
    }
  };

  // Phản hồi yêu cầu trao đổi
  const handleRespondToRequest = async (requestId, action, reason = '') => {
    try {
      await respondToExchangeRequest(requestId, action, reason);
      loadRequests();
    } catch (error) {
      console.error('Phản hồi yêu cầu thất bại:', error);
    }
  };

  const getStatusVariant = (status) => {
    const variants = {
      PENDING: 'warning',
      ACCEPTED: 'success',
      REJECTED: 'error',
      CANCELLED: 'error',
      COMPLETED: 'info'
    };
    return variants[status] || 'default';
  };

  return (
    <Layout>
      <div className="exchange-requests-page">
        <h1>Yêu cầu trao đổi</h1>
        
        <Tabs 
          activeTab={activeTab} 
          onTabChange={setActiveTab}
          tabs={[
            { id: 'sent', label: 'Yêu cầu đã gửi' },
            { id: 'received', label: 'Yêu cầu nhận được' }
          ]}
        />

        {loading ? (
          <div className="loading">Đang tải yêu cầu...</div>
        ) : requests.length === 0 ? (
          <div className="empty-state">
            <p>Không có yêu cầu {activeTab === 'sent' ? 'đã gửi' : 'nhận được'}.</p>
          </div>
        ) : (
          <div className="requests-list">
            {requests.map(request => (
              <Card key={request.request_id} className="request-card">
                <div className="request-header">
                  <div className="user-info">
                    <Avatar 
                      src={activeTab === 'sent' ? 
                        request.receiver.avatar_url : 
                        request.requester.avatar_url
                      }
                      alt={activeTab === 'sent' ? 
                        request.receiver.full_name : 
                        request.requester.full_name
                      }
                    />
                    <div>
                      <h4>
                        {activeTab === 'sent' ? 
                          `Gửi tới: ${request.receiver.full_name}` : 
                          `Nhận từ: ${request.requester.full_name}`
                        }
                      </h4>
                      <p>{new Date(request.created_at).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <Badge variant={getStatusVariant(request.status)}>
                    {request.status === 'PENDING' ? 'Đang chờ' :
                     request.status === 'ACCEPTED' ? 'Đã chấp nhận' :
                     request.status === 'REJECTED' ? 'Bị từ chối' :
                     request.status === 'CANCELLED' ? 'Đã hủy' :
                     request.status === 'COMPLETED' ? 'Hoàn tất' :
                     request.status}
                  </Badge>
                </div>

                <div className="request-books">
                  <div className="books-section">
                    <h5>Sách đề nghị:</h5>
                    <div className="books-list">
                      {request.offered_books.map(bookId => (
                        <span key={bookId} className="book-id">{bookId}</span>
                      ))}
                    </div>
                  </div>
                  <div className="books-section">
                    <h5>Sách yêu cầu:</h5>
                    <div className="books-list">
                      {request.requested_books.map(bookId => (
                        <span key={bookId} className="book-id">{bookId}</span>
                      ))}
                    </div>
                  </div>
                </div>

                {request.message && (
                  <div className="request-message">
                    <p>{request.message}</p>
                  </div>
                )}

                {request.rejection_reason && (
                  <div className="rejection-reason">
                    <strong>Lý do từ chối:</strong> {request.rejection_reason}
                  </div>
                )}

                <div className="request-actions">
                  {activeTab === 'sent' && request.status === 'PENDING' && (
                    <Button 
                      variant="error" 
                      size="sm"
                      onClick={() => handleCancelRequest(request.request_id)}
                    >
                      Hủy yêu cầu
                    </Button>
                  )}
                  
                  {activeTab === 'received' && request.status === 'PENDING' && (
                    <>
                      <Button 
                        variant="success" 
                        size="sm"
                        onClick={() => handleRespondToRequest(request.request_id, 'accept')}
                      >
                        Chấp nhận
                      </Button>
                      <Button 
                        variant="error" 
                        size="sm"
                        onClick={() => {
                          const reason = prompt('Vui lòng nhập lý do từ chối:');
                          if (reason) {
                            handleRespondToRequest(request.request_id, 'reject', reason);
                          }
                        }}
                      >
                        Từ chối
                      </Button>
                    </>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default ExchangeRequestsPage;
