import { MessageCircle, MoreVertical, Search, Users } from 'lucide-react';
import { useEffect, useState } from 'react';
import Layout from '../../components/layout/Layout';
import ConversationList from '../../components/messages/ConversationList';
import MessageInput from '../../components/messages/MessageInput';
import MessageThread from '../../components/messages/MessageThread';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { useMessages } from '../../hooks/useMessages';

const MessagesPage = () => {
  const {
    conversations,
    messages,
    loading,
    currentConversation,
    unreadCount,
    getConversations,
    getConversationMessages,
    sendMessage,
    markAsRead,
    deleteMessage,
    addReaction,
    removeReaction,
    formatMessageTime,
    canDeleteMessage,
    getCommonEmojis,
    isConnected,
    sendingMessage,
    setMessages,
    getUnreadCount,
  } = useMessages();

  const [selectedConversation, setSelectedConversation] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  const currentUserId = selectedConversation?.current_user_id || 'me';

  useEffect(() => {
    getConversations();
  }, []);

  useEffect(() => {
    if (selectedConversation) {
      const convId =
        selectedConversation.conversation_id || selectedConversation.id;
      if (convId) {
        getConversationMessages(convId);

        // Mark as read and immediately refresh unread count (don't wait for promise)
        markAsRead(convId);
        getUnreadCount();

        // Also refresh conversations list after a short delay
        setTimeout(() => {
          getConversations();
        }, 100);
      }
    } else {
      // Clear messages when no conversation selected
      setMessages([]);
    }
  }, [selectedConversation]);

  const handleSelectConversation = (conversation) => {
    setSelectedConversation(conversation);
  };

  const handleSendMessage = async (content) => {
    if (!selectedConversation) return;

    try {
      await sendMessage({
        conversation_id: selectedConversation.conversation_id,
        content,
      });
    } catch (error) {
      console.error('Lỗi gửi tin nhắn:', error.message);
    }
  };

  // Filter conversations based on search
  const filteredConversations = conversations.filter(
    (conv) =>
      conv.other_member?.full_name
        ?.toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      conv.last_message?.content
        ?.toLowerCase()
        .includes(searchQuery.toLowerCase()),
  );

  if (loading && !conversations.length) {
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
      <div className="h-screen bg-gradient-to-br from-blue-50 to-indigo-100 overflow-hidden">
        <div className="container mx-auto max-w-7xl h-full py-6 px-4">
          <div className="bg-white rounded-2xl shadow-xl h-full flex overflow-hidden">
            {/* Conversation List Sidebar */}
            <div className="w-96 border-r border-gray-200 bg-white flex flex-col flex-shrink-0">
              {/* Header */}
              <div className="p-6 border-b border-gray-100">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                      Tin nhắn
                    </h1>
                    {unreadCount > 0 && (
                      <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                        {unreadCount}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center space-x-2">
                    <div
                      className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}
                      title={isConnected ? 'Đã kết nối' : 'Mất kết nối'}
                    />
                    <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                      <Users className="w-5 h-5 text-gray-600" />
                    </button>
                  </div>
                </div>

                {/* Search Bar */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Tìm kiếm cuộc trò chuyện..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                </div>
              </div>

              {/* Conversations List */}
              <div className="flex-1 overflow-y-auto">
                {filteredConversations.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-64 text-gray-500">
                    <MessageCircle className="w-12 h-12 mb-3 text-gray-300" />
                    <p className="text-sm">Chưa có cuộc trò chuyện nào</p>
                    <p className="text-xs mt-1">
                      Bắt đầu trò chuyện với ai đó!
                    </p>
                  </div>
                ) : (
                  <ConversationList
                    conversations={filteredConversations}
                    loading={loading}
                    selectedConversationId={
                      selectedConversation?.conversation_id
                    }
                    onSelectConversation={handleSelectConversation}
                  />
                )}
              </div>
            </div>

            {/* Main Chat Area */}
            <div className="flex-1 flex flex-col min-w-0">
              {selectedConversation ? (
                <>
                  {/* Chat Header - Fixed */}
                  <div className="flex-shrink-0 p-6 border-b border-gray-100 bg-white">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <button
                          onClick={() => setSelectedConversation(null)}
                          className="lg:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                          <svg
                            className="w-5 h-5 text-gray-600"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M15 19l-7-7 7-7"
                            />
                          </svg>
                        </button>
                        <div className="flex items-center space-x-3">
                          <div className="relative">
                            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold text-lg">
                              {selectedConversation.other_member?.full_name?.charAt(
                                0,
                              ) || 'U'}
                            </div>
                            <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
                          </div>
                          <div>
                            <h2 className="font-semibold text-gray-900 text-lg">
                              {selectedConversation.other_member?.full_name ||
                                'Người dùng'}
                            </h2>
                            <p className="text-sm text-gray-500 flex items-center">
                              <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                              Đang hoạt động
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                          <svg
                            className="w-5 h-5 text-gray-600"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                            />
                          </svg>
                        </button>
                        <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                          <svg
                            className="w-5 h-5 text-gray-600"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                            />
                          </svg>
                        </button>
                        <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                          <MoreVertical className="w-5 h-5 text-gray-600" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Messages Area - Scrollable */}
                  <div className="flex-1 flex flex-col overflow-hidden">
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

                    {/* Message Input - Fixed at Bottom */}
                    <div className="flex-shrink-0 p-6 bg-white border-t border-gray-200">
                      <MessageInput
                        onSendMessage={handleSendMessage}
                        disabled={loading}
                        sending={sendingMessage}
                      />
                    </div>
                  </div>
                </>
              ) : (
                /* Empty State */
                <div className="flex-1 flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50">
                  <div className="text-center max-w-md">
                    <div className="w-24 h-24 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-6">
                      <MessageCircle className="w-10 h-10 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-3">
                      Chào mừng đến với Tin nhắn
                    </h3>
                    <p className="text-gray-600 mb-8">
                      Chọn một cuộc trò chuyện từ danh sách để bắt đầu trò
                      chuyện hoặc tìm kiếm bạn bè để kết nối.
                    </p>
                    <div className="flex items-center justify-center space-x-4 text-sm text-gray-500">
                      <div className="flex items-center">
                        <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                        <span>Trực tuyến</span>
                      </div>
                      <div className="flex items-center">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                        <span>Tin nhắn mới</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default MessagesPage; // ok
