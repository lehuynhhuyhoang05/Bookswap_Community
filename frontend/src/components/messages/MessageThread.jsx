import React, { useEffect, useRef } from 'react';
import MessageItem from './MessageItem';
import LoadingSpinner from '../ui/LoadingSpinner';

const MessageThread = ({ 
  messages, 
  loading, 
  currentUserId,
  onDeleteMessage,
  onAddReaction,
  onRemoveReaction 
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
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      {messages.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          Chưa có tin nhắn nào. Hãy bắt đầu cuộc trò chuyện!
        </div>
      ) : (
        <>
          {messages.map((message) => (
            <MessageItem
              key={message.id}
              message={message}
              isOwn={message.sender_id === currentUserId}
              onDelete={onDeleteMessage}
              onAddReaction={onAddReaction}
              onRemoveReaction={onRemoveReaction}
            />
          ))}
          <div ref={messagesEndRef} />
        </>
      )}
    </div>
  );
};

export default MessageThread;