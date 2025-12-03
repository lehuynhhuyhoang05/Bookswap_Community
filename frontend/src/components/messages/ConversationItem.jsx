import React from 'react';
import Avatar from '../ui/Avatar';
import Badge from '../ui/Badge';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';

const ConversationItem = ({ conversation, isSelected, onSelect }) => {
  const {
    id,
    other_user,
    last_message,
    unread_count,
    updated_at
  } = conversation;

  const handleClick = () => {
    onSelect(conversation);
  };

  const formatTime = (timestamp) => {
    return formatDistanceToNow(new Date(timestamp), {
      addSuffix: true,
      locale: vi
    });
  };

  return (
    <div
      className={`p-4 border-b cursor-pointer hover:bg-gray-50 transition-colors ${
        isSelected ? 'bg-blue-50 border-blue-200' : 'border-gray-100'
      }`}
      onClick={handleClick}
    >
      <div className="flex items-start space-x-3">
        <Avatar
          src={other_user?.avatar}
          name={other_user?.name}
          size="md"
        />
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <h3 className="font-semibold text-gray-900 truncate">
              {other_user?.name || 'Người dùng'}
            </h3>
            {last_message && (
              <span className="text-xs text-gray-500 whitespace-nowrap">
                {formatTime(updated_at)}
              </span>
            )}
          </div>

          {last_message && (
            <p className="text-sm text-gray-600 truncate mb-1">
              {last_message.content}
            </p>
          )}

          <div className="flex items-center justify-between">
            {other_user?.city && (
              <span className="text-xs text-gray-500">
                {other_user.city}
              </span>
            )}
            
            {unread_count > 0 && (
              <Badge 
                variant="primary" 
                size="sm"
              >
                {unread_count}
              </Badge>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConversationItem;