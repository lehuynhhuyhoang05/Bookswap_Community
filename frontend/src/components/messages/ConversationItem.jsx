import React from 'react';
import Avatar from '../ui/Avatar';
import Badge from '../ui/Badge';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';

const ConversationItem = ({ conversation, isSelected, onSelect }) => {
  const {
    conversation_id,
    other_member,
    other_user,
    last_message,
    unread_count,
    last_message_at,
    updated_at
  } = conversation;

  // Support both API structures
  const otherPerson = other_member || other_user;
  const displayName = otherPerson?.full_name || otherPerson?.name || 'Người dùng';
  const avatarUrl = otherPerson?.avatar_url || otherPerson?.avatar;
  const timestamp = last_message_at || updated_at;
  const isOnline = otherPerson?.is_online || false;

  const handleClick = () => {
    onSelect(conversation);
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);
    
    if (diffInHours < 1) return 'Vừa xong';
    if (diffInHours < 24) return formatDistanceToNow(date, { addSuffix: true, locale: vi });
    
    return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });
  };

  return (
    <div
      className={`px-5 py-4 cursor-pointer transition-all duration-300 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 group ${
        isSelected 
          ? 'bg-gradient-to-r from-blue-50 to-purple-50 border-l-4 border-l-blue-500 shadow-sm' 
          : 'border-l-4 border-l-transparent'
      }`}
      onClick={handleClick}
    >
      <div className="flex items-center space-x-3">
        {/* Avatar with online indicator - Enhanced */}
        <div className="relative flex-shrink-0">
          {avatarUrl ? (
            <img 
              src={avatarUrl} 
              alt={displayName}
              className={`w-14 h-14 rounded-full object-cover ring-2 transition-all ${
                isSelected ? 'ring-blue-400 shadow-lg' : 'ring-white group-hover:ring-blue-200'
              }`}
            />
          ) : (
            <div className={`w-14 h-14 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-lg ring-2 transition-all ${
              isSelected ? 'ring-blue-400 shadow-lg' : 'ring-white group-hover:ring-blue-200'
            }`}>
              {displayName.charAt(0).toUpperCase()}
            </div>
          )}
          {isOnline && (
            <div className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 border-2 border-white rounded-full animate-pulse shadow-sm" />
          )}
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <h3 className={`font-bold truncate transition-colors ${
              unread_count > 0 ? 'text-gray-900' : 'text-gray-700'
            }`}>
              {displayName}
            </h3>
            {timestamp && (
              <span className={`text-xs whitespace-nowrap ml-2 font-semibold transition-colors ${
                unread_count > 0 ? 'text-blue-600' : 'text-gray-500'
              }`}>
                {formatTime(timestamp)}
              </span>
            )}
          </div>

          <div className="flex items-center justify-between">
            <p className={`text-sm truncate flex-1 transition-colors ${
              unread_count > 0 ? 'text-gray-900 font-semibold' : 'text-gray-500'
            }`}>
              {last_message?.content || 'Chưa có tin nhắn'}
            </p>
            
            {unread_count > 0 && (
              <div className="ml-2 min-w-[22px] h-5 bg-gradient-to-r from-blue-500 to-purple-500 text-white text-xs font-bold rounded-full flex items-center justify-center px-2 shadow-sm animate-pulse">
                {unread_count > 99 ? '99+' : unread_count}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConversationItem;