import React, { useState } from 'react';
import { CheckCircle, XCircle, Calendar, MapPin, Package, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { exchangeService } from '../../services/api/exchanges';
import { sendExchangeActionMessage } from '../../utils/exchangeMessageSync';
import { toast } from 'react-hot-toast';

/**
 * Exchange Quick Actions Component
 * Hiển thị thông tin exchange và các action nhanh trong chat
 */
const ExchangeQuickActions = ({ exchangeRequest, conversationId, currentUserName, onRefresh }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  if (!exchangeRequest) return null;

  const { request_id, status, requester, receiver, created_at } = exchangeRequest;

  const getStatusBadge = () => {
    const badges = {
      PENDING: { text: 'Chờ phản hồi', color: 'bg-yellow-100 text-yellow-800', icon: '⏳' },
      ACCEPTED: { text: 'Đã chấp nhận', color: 'bg-green-100 text-green-800', icon: '✅' },
      REJECTED: { text: 'Đã từ chối', color: 'bg-red-100 text-red-800', icon: '❌' },
      COMPLETED: { text: 'Hoàn thành', color: 'bg-blue-100 text-blue-800', icon: '🎉' },
      CANCELLED: { text: 'Đã hủy', color: 'bg-gray-100 text-gray-800', icon: '🚫' },
    };
    const badge = badges[status] || badges.PENDING;
    return (
      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${badge.color}`}>
        <span>{badge.icon}</span>
        {badge.text}
      </span>
    );
  };

  const handleViewExchange = () => {
    navigate(`/exchange/detail/${request_id}`);
  };

  const handleConfirmMeeting = async () => {
    if (loading) return;
    
    try {
      setLoading(true);
      await exchangeService.confirmMeeting(request_id);
      toast.success('Đã xác nhận lịch gặp mặt!');
      
      // Send notification message
      if (conversationId && currentUserName) {
        await sendExchangeActionMessage(
          conversationId,
          'meeting_confirmed',
          currentUserName,
          request_id
        );
      }
      
      if (onRefresh) onRefresh();
    } catch (error) {
      console.error('Error confirming meeting:', error);
      toast.error(error.message || 'Không thể xác nhận lịch gặp. Vui lòng thử lại!');
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteExchange = async () => {
    if (loading) return;
    
    if (!window.confirm('Bạn có chắc muốn đánh dấu trao đổi này là hoàn thành?')) {
      return;
    }

    try {
      setLoading(true);
      await exchangeService.confirmExchange(request_id);
      toast.success('Đã hoàn thành trao đổi!');
      
      // Send notification message
      if (conversationId && currentUserName) {
        await sendExchangeActionMessage(
          conversationId,
          'exchange_completed',
          currentUserName,
          request_id
        );
      }
      
      if (onRefresh) onRefresh();
    } catch (error) {
      console.error('Error completing exchange:', error);
      toast.error(error.message || 'Không thể hoàn thành trao đổi. Vui lòng thử lại!');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelRequest = async () => {
    if (loading) return;
    
    if (!window.confirm('Bạn có chắc muốn hủy yêu cầu trao đổi này?')) {
      return;
    }

    try {
      setLoading(true);
      await exchangeService.cancelExchange(request_id);
      toast.success('Đã hủy yêu cầu trao đổi!');
      
      // Send notification message
      if (conversationId && currentUserName) {
        await sendExchangeActionMessage(
          conversationId,
          'exchange_cancelled',
          currentUserName,
          request_id
        );
      }
      
      if (onRefresh) onRefresh();
    } catch (error) {
      console.error('Error cancelling request:', error);
      toast.error(error.message || 'Không thể hủy yêu cầu. Vui lòng thử lại!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4 mb-4">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <Package className="w-5 h-5 text-blue-600" />
          <h3 className="font-semibold text-gray-900">Yêu cầu trao đổi sách</h3>
        </div>
        {getStatusBadge()}
      </div>

      <div className="space-y-2 text-sm text-gray-700 mb-4">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-gray-500" />
          <span>Tạo lúc: {new Date(created_at).toLocaleDateString('vi-VN', { 
            day: '2-digit', 
            month: '2-digit', 
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          })}</span>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          onClick={handleViewExchange}
          disabled={loading}
          className="flex-1 min-w-[120px] px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2 text-sm font-medium"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Package className="w-4 h-4" />}
          Xem chi tiết
        </button>

        {status === 'ACCEPTED' && (
          <>
            <button
              onClick={handleConfirmMeeting}
              disabled={loading}
              className="flex-1 min-w-[120px] px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2 text-sm font-medium"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Calendar className="w-4 h-4" />}
              Xác nhận gặp mặt
            </button>
            <button
              onClick={handleCompleteExchange}
              disabled={loading}
              className="flex-1 min-w-[120px] px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2 text-sm font-medium"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
              Hoàn thành trao đổi
            </button>
          </>
        )}

        {status === 'PENDING' && (
          <button
            onClick={handleCancelRequest}
            disabled={loading}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2 text-sm font-medium"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4" />}
            Hủy yêu cầu
          </button>
        )}
      </div>
    </div>
  );
};

export default ExchangeQuickActions;
