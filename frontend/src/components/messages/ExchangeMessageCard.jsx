import React from 'react';
import { Package, Book, ArrowRightLeft, User } from 'lucide-react';

/**
 * Exchange Message Card Component
 * Hiển thị tin nhắn đặc biệt về exchange trong chat
 */
const ExchangeMessageCard = ({ metadata, isOwn }) => {
  if (!metadata || !metadata.type || metadata.type !== 'exchange_action') {
    return null;
  }

  const { action, exchange_id, timestamp, actor_name } = metadata;

  const getActionDisplay = () => {
    const actions = {
      'request_created': {
        icon: <Package className="w-5 h-5 text-blue-500" />,
        text: 'đã tạo yêu cầu trao đổi sách',
        bgColor: 'bg-blue-50',
        borderColor: 'border-blue-200',
      },
      'request_accepted': {
        icon: <ArrowRightLeft className="w-5 h-5 text-green-500" />,
        text: 'đã chấp nhận yêu cầu trao đổi',
        bgColor: 'bg-green-50',
        borderColor: 'border-green-200',
      },
      'request_rejected': {
        icon: <Package className="w-5 h-5 text-red-500" />,
        text: 'đã từ chối yêu cầu trao đổi',
        bgColor: 'bg-red-50',
        borderColor: 'border-red-200',
      },
      'meeting_confirmed': {
        icon: <User className="w-5 h-5 text-purple-500" />,
        text: 'đã xác nhận lịch gặp mặt',
        bgColor: 'bg-purple-50',
        borderColor: 'border-purple-200',
      },
      'exchange_completed': {
        icon: <Book className="w-5 h-5 text-indigo-500" />,
        text: 'đã hoàn thành trao đổi',
        bgColor: 'bg-indigo-50',
        borderColor: 'border-indigo-200',
      },
      'exchange_cancelled': {
        icon: <Package className="w-5 h-5 text-gray-500" />,
        text: 'đã hủy trao đổi',
        bgColor: 'bg-gray-50',
        borderColor: 'border-gray-200',
      },
    };

    return actions[action] || actions['request_created'];
  };

  const display = getActionDisplay();

  return (
    <div className="flex justify-center my-3">
      <div className={`max-w-md px-4 py-3 rounded-lg border ${display.bgColor} ${display.borderColor}`}>
        <div className="flex items-center gap-3">
          {display.icon}
          <div className="flex-1">
            <p className="text-sm text-gray-700">
              <span className="font-semibold">{actor_name || 'Người dùng'}</span> {display.text}
            </p>
            {timestamp && (
              <p className="text-xs text-gray-500 mt-1">
                {new Date(timestamp).toLocaleString('vi-VN')}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExchangeMessageCard;
