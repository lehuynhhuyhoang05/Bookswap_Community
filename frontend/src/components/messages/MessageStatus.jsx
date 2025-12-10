import React from 'react';
import { Check, CheckCheck } from 'lucide-react';

/**
 * Message Status Component
 * Hiển thị trạng thái tin nhắn: sent (✓), delivered (✓✓), read (✓✓ màu xanh)
 */
const MessageStatus = ({ status, isMine }) => {
  // Chỉ hiển thị status cho tin nhắn của mình
  if (!isMine) return null;

  const getStatusIcon = () => {
    switch (status) {
      case 'sent':
        return <Check className="w-4 h-4 text-gray-400" />;
      case 'delivered':
        return <CheckCheck className="w-4 h-4 text-gray-400" />;
      case 'read':
        return <CheckCheck className="w-4 h-4 text-blue-500" />;
      default:
        return null;
    }
  };

  return (
    <div className="inline-flex items-center ml-1" title={`Trạng thái: ${status}`}>
      {getStatusIcon()}
    </div>
  );
};

export default MessageStatus;
