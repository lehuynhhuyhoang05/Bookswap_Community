import React, { useEffect, useRef } from 'react';
import MessageItem from './MessageItem';
import ExchangeMessageCard from './ExchangeMessageCard';
import LoadingSpinner from '../ui/LoadingSpinner';

const MessageThread = ({ 
  messages, 
  loading, 
  currentUserId,
  onDeleteMessage,
  onAddReaction,
  onRemoveReaction,
  hasMore,
  onLoadMore,
  loadingMore
}) => {
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
      {messages.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          Chưa có tin nhắn nào. Hãy bắt đầu cuộc trò chuyện!
        </div>
      ) : (
        <>
          {/* Load More Button */}
          {hasMore && (
            <div className="flex justify-center mb-4">
              <button
                onClick={onLoadMore}
                disabled={loadingMore}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loadingMore ? 'Đang tải...' : 'Tải thêm tin nhắn'}
              </button>
            </div>
          )}
          
          {messages.map((message) => {
            // Render exchange action cards for metadata messages
            if (message.metadata && message.metadata.type === 'exchange_action') {
              return (
                <ExchangeMessageCard
                  key={message.message_id || message.id}
                  metadata={message.metadata}
                  isOwn={message.is_mine || message.sender_id === currentUserId}
                />
              );
            }
            
            // Regular message
            return (
              <MessageItem
                key={message.message_id || message.id}
                message={message}
                isOwn={message.is_mine || message.sender_id === currentUserId}
                currentUserId={currentUserId}
                onDelete={onDeleteMessage}
                onAddReaction={onAddReaction}
                onRemoveReaction={onRemoveReaction}
              />
            );
          })}
          <div ref={messagesEndRef} />
        </>
      )}
    </div>
  );
};

export default MessageThread;