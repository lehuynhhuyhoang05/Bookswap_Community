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
      className={`flex gap-3 group mb-6 ${isOwn ? 'flex-row-reverse' : 'flex-row'} animate-fadeIn`}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      {/* Avatar - Enhanced with shadow */}
      {!isOwn && (
        <div className="flex-shrink-0">
          {senderAvatar ? (
            <img 
              src={senderAvatar} 
              alt={senderName}
              className="w-10 h-10 rounded-full object-cover ring-2 ring-white shadow-md"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-sm font-bold shadow-md">
              {senderName.charAt(0).toUpperCase()}
            </div>
          )}
        </div>
      )}

      <div className={`flex flex-col max-w-[70%] ${isOwn ? 'items-end' : 'items-start'}`}>
        {!isOwn && (
          <span className="text-xs font-semibold text-gray-600 mb-1.5 px-2">{senderName}</span>
        )}

        <div className="relative group">
          <div 
            className={`rounded-2xl px-4 py-3 shadow-md transition-all transform hover:scale-[1.02] ${
              isOwn 
                ? 'bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-tr-sm' 
                : 'bg-white text-gray-900 rounded-tl-sm border border-gray-100'
            }`}
          >
            {/* Image Attachment - Enhanced */}
            {message.attachment_url && message.attachment_type === 'image' && (
              <div className="mb-2">
                <img 
                  src={`http://localhost:3000${message.attachment_url}`}
                  alt={message.attachment_name || 'Image'}
                  className="max-w-full rounded-xl cursor-pointer hover:opacity-90 transition-all shadow-sm hover:shadow-md"
                  style={{ maxHeight: '300px', objectFit: 'contain' }}
                  onClick={() => window.open(`http://localhost:3000${message.attachment_url}`, '_blank')}
                />
                {message.attachment_name && (
                  <p className="text-xs mt-1.5 opacity-75">{message.attachment_name}</p>
                )}
              </div>
            )}

            {/* File Attachment - Enhanced */}
            {message.attachment_url && message.attachment_type === 'file' && (
              <a
                href={`http://localhost:3000${message.attachment_url}`}
                download={message.attachment_name}
                className={`flex items-center gap-2 p-3 rounded-xl mb-2 hover:opacity-90 transition-all shadow-sm ${
                  isOwn ? 'bg-blue-600/80 backdrop-blur-sm' : 'bg-gray-50'
                }`}
              >
                <FileText className="w-5 h-5" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate">{message.attachment_name || 'File'}</p>
                  {message.attachment_size && (
                    <p className="text-xs opacity-80">
                      {(message.attachment_size / 1024).toFixed(2)} KB
                    </p>
                  )}
                </div>
                <Download className="w-4 h-4 flex-shrink-0" />
              </a>
            )}

            {/* Text Content - Enhanced typography */}
            {message.content && (
              <p className="text-[15px] leading-relaxed whitespace-pre-wrap break-words">{message.content}</p>
            )}
          </div>
          
          <span 
            className={`text-xs mt-1.5 flex items-center gap-1.5 px-1 font-medium ${
              isOwn ? 'justify-end text-gray-600' : 'justify-start text-gray-500'
            }`}
          >
            {formatTime(messageTime)}
            <MessageStatus status={message.status} isMine={isOwn} />
          </span>

          {showActions && canDelete && (
            <button
              onClick={handleDelete}
              className="absolute -top-2 -right-2 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white p-2 rounded-full text-xs shadow-lg hover:shadow-xl transition-all transform hover:scale-110"
              title="Xóa tin nhắn"
            >
              🗑️
            </button>
          )}
        </div>

        {/* Reactions Display - Enhanced */}
        {message.reactions?.length > 0 && (
          <MessageReactions
            reactions={message.reactions}
            onReaction={onAddReaction}
            onRemoveReaction={onRemoveReaction}
            messageId={message.message_id || message.id}
            currentUserId={currentUserId}
          />
        )}

        {/* Add Reaction Button - Enhanced hover effect */}
        {showActions && (
          <div className="flex gap-1 mt-2 animate-fadeIn">
            {['👍', '❤️', '😂', '😮', '🎉'].map(emoji => (
              <button
                key={emoji}
                onClick={() => onAddReaction(message.message_id || message.id, emoji)}
                className="text-lg hover:scale-125 transition-all p-1.5 hover:bg-white hover:shadow-md rounded-lg transform"
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
