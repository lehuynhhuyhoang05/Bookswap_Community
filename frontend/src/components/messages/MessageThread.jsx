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
    <div className="flex-1 overflow-y-auto p-6 bg-gradient-to-b from-gray-50 to-blue-50/30 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
      {messages.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-full text-center">
          <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-purple-100 rounded-3xl flex items-center justify-center mb-5 shadow-inner">
            <svg className="w-12 h-12 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">Chưa có tin nhắn nào</h3>
          <p className="text-gray-500 max-w-sm">Hãy bắt đầu cuộc trò chuyện bằng cách gửi tin nhắn đầu tiên!</p>
        </div>
      ) : (
        <>
          {/* Load More Button - Enhanced */}
          {hasMore && (
            <div className="flex justify-center mb-6">
              <button
                onClick={onLoadMore}
                disabled={loadingMore}
                className="px-6 py-2.5 bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold rounded-full hover:from-blue-600 hover:to-purple-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg transform hover:scale-105"
              >
                {loadingMore ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Đang tải...
                  </span>
                ) : (
                  'Tải thêm tin nhắn'
                )}
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