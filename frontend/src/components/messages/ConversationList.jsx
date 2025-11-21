import React from 'react';
import ConversationItem from './ConversationItem';
import LoadingSpinner from '../ui/LoadingSpinner';

const ConversationList = ({ 
  conversations, 
  loading, 
  onSelectConversation,
  selectedConversationId 
}) => {
  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <LoadingSpinner />
      </div>
    );
  }

  if (!conversations || conversations.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        Chưa có cuộc trò chuyện nào
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {conversations.map((conversation) => (
        <ConversationItem
          key={conversation.id}
          conversation={conversation}
          isSelected={selectedConversationId === conversation.id}
          onSelect={onSelectConversation}
        />
      ))}
    </div>
  );
};

export default ConversationList;