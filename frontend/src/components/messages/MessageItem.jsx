import React, { useState } from 'react';
import { Download, FileText } from 'lucide-react';
import MessageReactions from './MessageReactions';
import MessageStatus from './MessageStatus';

const MessageItem = ({ message, isOwn, onDelete, onAddReaction, onRemoveReaction, currentUserId }) => {
  const [showActions, setShowActions] = useState(false);
  const canDelete = isOwn;

  const handleDelete = () => {
    if (window.confirm('Bạn có chắc muốn xóa tin nhắn này?')) {
      onDelete(message.message_id || message.id);
    }
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    return new Date(timestamp).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
  };

  // Backend returns sender.full_name directly
  const senderName = message.sender?.full_name || message.sender?.user?.full_name || message.sender?.name || 'Unknown';
  const senderAvatar = message.sender?.avatar_url || message.sender?.user?.avatar_url;
  const messageTime = message.sent_at || message.created_at;

  return (
    <div
      className={`flex gap-3 group mb-4 ${isOwn ? 'flex-row-reverse' : 'flex-row'}`}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      {/* Avatar */}
      {!isOwn && (
        <div className="flex-shrink-0">
          {senderAvatar ? (
            <img 
              src={senderAvatar} 
              alt={senderName}
              className="w-8 h-8 rounded-full object-cover"
            />
          ) : (
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-sm font-semibold">
              {senderName.charAt(0).toUpperCase()}
            </div>
          )}
        </div>
      )}

      <div className={`flex flex-col max-w-[70%] ${isOwn ? 'items-end' : 'items-start'}`}>
        {!isOwn && (
          <span className="text-xs font-medium text-gray-600 mb-1 px-1">{senderName}</span>
        )}

        <div className="relative group">
          <div 
            className={`rounded-2xl px-4 py-2.5 shadow-sm ${
              isOwn 
                ? 'bg-blue-500 text-white rounded-tr-sm' 
                : 'bg-gray-100 text-gray-900 rounded-tl-sm'
            }`}
          >
            {/* Image Attachment */}
            {message.attachment_url && message.attachment_type === 'image' && (
              <div className="mb-2">
                <img 
                  src={`http://localhost:3000${message.attachment_url}`}
                  alt={message.attachment_name || 'Image'}
                  className="max-w-full rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
                  style={{ maxHeight: '300px', objectFit: 'contain' }}
                  onClick={() => window.open(`http://localhost:3000${message.attachment_url}`, '_blank')}
                />
                {message.attachment_name && (
                  <p className="text-xs mt-1 opacity-75">{message.attachment_name}</p>
                )}
              </div>
            )}

            {/* File Attachment */}
            {message.attachment_url && message.attachment_type === 'file' && (
              <a
                href={`http://localhost:3000${message.attachment_url}`}
                download={message.attachment_name}
                className={`flex items-center gap-2 p-2 rounded-lg mb-2 hover:opacity-80 transition-opacity ${
                  isOwn ? 'bg-blue-600' : 'bg-gray-200'
                }`}
              >
                <FileText className="w-5 h-5" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{message.attachment_name || 'File'}</p>
                  {message.attachment_size && (
                    <p className="text-xs opacity-75">
                      {(message.attachment_size / 1024).toFixed(2)} KB
                    </p>
                  )}
                </div>
                <Download className="w-4 h-4" />
              </a>
            )}

            {/* Text Content */}
            {message.content && (
              <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>
            )}
          </div>
          
          <span 
            className={`text-xs text-gray-500 mt-1 flex items-center gap-1 px-1 ${
              isOwn ? 'justify-end' : 'justify-start'
            }`}
          >
            {formatTime(messageTime)}
            <MessageStatus status={message.status} isMine={isOwn} />
          </span>

          {showActions && canDelete && (
            <button
              onClick={handleDelete}
              className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white p-1.5 rounded-full text-xs shadow-lg transition-all"
              title="Xóa tin nhắn"
            >
              🗑️
            </button>
          )}
        </div>

        {/* Reactions Display */}
        {message.reactions?.length > 0 && (
          <MessageReactions
            reactions={message.reactions}
            onReaction={onAddReaction}
            onRemoveReaction={onRemoveReaction}
            messageId={message.message_id || message.id}
            currentUserId={currentUserId}
          />
        )}

        {/* Add Reaction Button - Show on hover */}
        {showActions && (
          <div className="flex gap-1 mt-1">
            {['👍', '❤️', '😂', '😮', '🎉'].map(emoji => (
              <button
                key={emoji}
                onClick={() => onAddReaction(message.message_id || message.id, emoji)}
                className="text-sm hover:scale-125 transition-transform p-1 hover:bg-gray-100 rounded"
                title={`React with ${emoji}`}
              >
                {emoji}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MessageItem;
