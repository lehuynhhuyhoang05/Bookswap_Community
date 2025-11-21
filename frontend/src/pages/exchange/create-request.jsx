import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ExchangeRequestForm } from '../../components/exchanges';
import { Card, Button, LoadingSpinner, Avatar } from '../../components/ui';
import { useExchanges } from '../../hooks/useExchanges';
import { useAuth } from '../../hooks/useAuth';
import Layout from '../../components/layout/Layout';

const CreateExchangeRequestPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [receiver, setReceiver] = useState(null);

  const { createExchangeRequest } = useExchanges();
  const { user } = useAuth();

  useEffect(() => {
    if (location.state?.receiver) {
      setReceiver(location.state.receiver);
    } else {
      navigate('/exchange/suggestions');
    }
  }, [location.state, navigate]);

  const handleSubmit = async (requestData) => {
    setLoading(true);
    try {
      await createExchangeRequest(requestData);
      navigate('/exchange/requests', { 
        state: { 
          message: 'Yêu cầu trao đổi đã được gửi thành công!',
          type: 'success'
        }
      });
    } catch (error) {
      console.error('Gửi yêu cầu trao đổi thất bại:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    navigate(-1);
  };

  if (!receiver) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center min-h-64">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-gray-600">Đang tải thông tin người nhận...</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-6">
          <Button 
            variant="text" 
            onClick={handleClose} 
            className="flex items-center gap-2 text-gray-600 hover:text-gray-800"
          >
            <span>←</span> Quay lại
          </Button>
          <h1 className="text-2xl font-bold text-gray-900">Tạo Yêu Cầu Trao Đổi</h1>
        </div>

        <div className="space-y-6">
          {/* Thông tin người nhận */}
          <Card className="p-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <Avatar 
                src={receiver.avatar_url} 
                alt={receiver.full_name}
                size="lg"
              />
              <div className="flex-1">
                <h2 className="text-xl font-semibold text-gray-900">{receiver.full_name}</h2>
                <div className="flex flex-wrap gap-3 mt-2">
                  {receiver.region && (
                    <span className="text-sm text-gray-600 bg-gray-100 px-2 py-1 rounded">📍 {receiver.region}</span>
                  )}
                  {receiver.average_rating && (
                    <span className="text-sm text-gray-600 bg-gray-100 px-2 py-1 rounded">⭐ {receiver.average_rating}</span>
                  )}
                  {receiver.completed_exchanges !== undefined && (
                    <span className="text-sm text-gray-600 bg-gray-100 px-2 py-1 rounded">🔄 {receiver.completed_exchanges} giao dịch</span>
                  )}
                  {receiver.is_verified && (
                    <span className="text-sm text-green-600 bg-green-100 px-2 py-1 rounded">✅ Đã xác minh</span>
                  )}
                </div>
                {receiver.trust_score && (
                  <div className="mt-2 text-sm text-gray-600">
                    <span>Điểm tin cậy: </span>
                    <strong className="text-green-600">{receiver.trust_score}/5</strong>
                  </div>
                )}
              </div>
            </div>
          </Card>

          {/* Form tạo yêu cầu trao đổi */}
          <div>
            <ExchangeRequestForm 
              isOpen={true}
              onClose={handleClose}
              onSubmit={handleSubmit}
              receiver={receiver}
              loading={loading}
            />
          </div>

          {/* Mẹo trao đổi */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">💡 Mẹo Trao Đổi</h3>
            <div className="space-y-2">
              <ul className="list-disc list-inside space-y-2 text-gray-600">
                <li>Hãy cụ thể về sách bạn muốn trao đổi</li>
                <li>Kiểm tra tình trạng sách trước khi đề xuất</li>
                <li>Hãy lịch sự và rõ ràng trong tin nhắn</li>
                <li>Xem xét sở thích và vị trí của người kia</li>
                <li>Đảm bảo bạn có thể hoàn thành giao dịch</li>
                <li>Thảo luận rõ về phương thức vận chuyển/giao nhận</li>
                <li>Chụp ảnh sách thực tế để minh họa tình trạng</li>
              </ul>
            </div>
          </Card>

          {/* Thông tin thêm */}
          <Card className="p-6 bg-blue-50 border-blue-200">
            <h3 className="text-lg font-semibold text-blue-900 mb-3">ℹ️ Thông Tin Quan Trọng</h3>
            <div className="space-y-2 text-blue-800">
              <p className="text-sm">
                <strong>Quy trình trao đổi:</strong> 
              </p>
              <ol className="list-decimal list-inside space-y-1 text-sm">
                <li>Gửi yêu cầu trao đổi</li>
                <li>Chờ người nhận phản hồi</li>
                <li>Thống nhất phương thức giao dịch</li>
                <li>Hoàn thành trao đổi và xác nhận</li>
                <li>Đánh giá chất lượng giao dịch</li>
              </ol>
            </div>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default CreateExchangeRequestPage;