import React, { useState } from 'react';
import MessageReactions from './MessageReactions';

const MessageItem = ({ message, isOwn, onDelete, onAddReaction, onRemoveReaction, currentUserId }) => {
  const [showActions, setShowActions] = useState(false);
  const canDelete = isOwn;

  const handleDelete = () => {
    if (window.confirm('Bạn có chắc muốn xóa tin nhắn này?')) {
      onDelete(message.id);
    }
  };

  const formatTime = (timestamp) =>
    new Date(timestamp).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });

  return (
    <div
      className={`flex gap-3 group ${isOwn ? 'flex-row-reverse' : 'flex-row'}`}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      <div className={`flex flex-col ${isOwn ? 'items-end' : 'items-start'}`}>
        {!isOwn && <span className="text-sm font-medium">{message.sender?.name}</span>}

        <div className="relative">
          <div className={`rounded-lg px-4 py-2 max-w-xs lg:max-w-md ${isOwn ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-900'}`}>
            <p className="text-sm whitespace-pre-wrap">{message.content}</p>
            <span className="text-xs mt-1 block">{formatTime(message.created_at)}</span>
          </div>

          {showActions && canDelete && (
            <button
              onClick={handleDelete}
              className="absolute top-0 right-0 bg-red-500 text-white p-1 rounded text-xs"
            >
              🗑️
            </button>
          )}
        </div>

        {message.reactions?.length > 0 && (
          <MessageReactions
            reactions={message.reactions}
            onReaction={onAddReaction}
            onRemoveReaction={onRemoveReaction}
            messageId={message.id}
            currentUserId={currentUserId}
          />
        )}
      </div>
    </div>
  );
};

export default MessageItem;
