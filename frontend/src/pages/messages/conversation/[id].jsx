import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useMessages } from '../../../hooks/useMessages';
import MessageThread from '../../../components/messages/MessageThread';
import MessageInput from '../../../components/messages/MessageInput';
import Button from '../../../components/ui/Button';
import LoadingSpinner from '../../../components/ui/LoadingSpinner';
import Layout from '../../../components/layout/Layout';
import { ArrowLeft, Phone, Search, MoreVertical } from 'lucide-react';

const ConversationDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const {
    messages,
    loading,
    currentConversation,
    getConversationMessages,
    sendMessage,
    markAsRead,
    deleteMessage,
    addReaction,
    removeReaction,
    formatMessageTime,
    canDeleteMessage,
    getCommonEmojis,
    isConnected
  } = useMessages();

  const currentUserId = localStorage.getItem('userId') || 'me';

  useEffect(() => {
    if (id) {
      getConversationMessages(id);
      markAsRead(id);
    }
  }, [id]);

  const handleSendMessage = async (content) => {
    try {
      await sendMessage({
        conversation_id: id,
        content
      });
    } catch (error) {
      console.error('Lỗi gửi tin nhắn:', error.message);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
          <div className="text-center">
            <LoadingSpinner size="lg" />
            <p className="mt-4 text-gray-600">Đang tải tin nhắn...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-6">
        <div className="container mx-auto max-w-4xl">
          <div className="bg-white rounded-2xl shadow-xl h-[calc(100vh-140px)] flex flex-col">
            {/* Header */}
            <div className="p-6 border-b border-gray-100 bg-white rounded-t-2xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <Button
                    variant="ghost"
                    onClick={() => navigate('/messages')}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <ArrowLeft className="w-5 h-5 text-gray-600" />
                  </Button>
                  
                  <div className="flex items-center space-x-3">
                    <div className="relative">
                      <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold text-lg">
                        {currentConversation?.other_user?.name?.charAt(0) || 'U'}
                      </div>
                      <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
                    </div>
                    <div>
                      <h1 className="font-semibold text-gray-900 text-lg">
                        {currentConversation?.other_user?.name || 'Người dùng'}
                      </h1>
                      <p className="text-sm text-gray-500 flex items-center">
                        <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                        Đang hoạt động
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                    <Phone className="w-5 h-5 text-gray-600" />
                  </button>
                  <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                    <Search className="w-5 h-5 text-gray-600" />
                  </button>
                  <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                    <MoreVertical className="w-5 h-5 text-gray-600" />
                  </button>
                </div>
              </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 flex flex-col bg-gray-50">
              {/* Messages */}
              <MessageThread
                messages={messages}
                loading={loading}
                currentUserId={currentUserId}
                onDeleteMessage={deleteMessage}
                onAddReaction={addReaction}
                onRemoveReaction={removeReaction}
                formatMessageTime={formatMessageTime}
                canDeleteMessage={canDeleteMessage}
                getCommonEmojis={getCommonEmojis}
              />

              {/* Message Input */}
              <div className="p-6 bg-white border-t border-gray-200 rounded-b-2xl">
                <MessageInput
                  onSendMessage={handleSendMessage}
                  disabled={loading}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ConversationDetailPage;