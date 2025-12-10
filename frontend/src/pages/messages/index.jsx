import React, { useState, useEffect } from 'react';
import { useMessages } from '../../hooks/useMessages';
import { useSearchParams, useNavigate } from 'react-router-dom';
import ConversationList from '../../components/messages/ConversationList';
import MessageThread from '../../components/messages/MessageThread';
import MessageInput from '../../components/messages/MessageInput';
import SearchMessages from '../../components/messages/SearchMessages';
import OnlineStatus from '../../components/messages/OnlineStatus';
import ExchangeQuickActions from '../../components/messages/ExchangeQuickActions';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import Layout from '../../components/layout/Layout'; 
import { Search, Users, MessageCircle, MoreVertical } from 'lucide-react';

const MessagesPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const conversationIdFromUrl = searchParams.get('conversation_id');

  const {
    conversations,
    messages,
    loading,
    currentConversation,
    searchResults,
    getConversations,
    getConversationMessages,
    sendMessage,
    markAsRead,
    markMessagesAsRead,
    deleteMessage,
    addReaction,
    removeReaction,
    searchMessages,
    clearSearchResults,
    formatMessageTime,
    canDeleteMessage,
    getCommonEmojis,
    isConnected,
    typingUsers,
    pagination,
    loadingMore,
    loadMore,
    sendTypingIndicator
  } = useMessages();

  const [selectedConversation, setSelectedConversation] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  
  const currentUserId = selectedConversation?.current_user_id || 'me';

  useEffect(() => {
    getConversations();
  }, []);

  // Auto-select conversation from URL when conversations load
  useEffect(() => {
    if (conversationIdFromUrl && conversations.length > 0 && !selectedConversation) {
      const conv = conversations.find(c => 
        (c.conversation_id === conversationIdFromUrl) || 
        (c.id === conversationIdFromUrl)
      );
      if (conv) {
        setSelectedConversation(conv);
      }
    }
  }, [conversationIdFromUrl, conversations, selectedConversation]);

  useEffect(() => {
    if (selectedConversation) {
      const convId = selectedConversation.conversation_id || selectedConversation.id;
      getConversationMessages(convId);
      markAsRead(convId);
      
      // Mark unread messages as read when viewing conversation
      const unreadMessages = messages.filter(msg => 
        !msg.is_read && !msg.is_mine && msg.sender_id
      );
      
      if (unreadMessages.length > 0) {
        const messageIds = unreadMessages.map(msg => msg.message_id);
        const senderId = unreadMessages[0].sender?.member_id || unreadMessages[0].sender_id;
        markMessagesAsRead(messageIds, senderId);
      }
    }
  }, [selectedConversation, messages.length]);

  const handleSelectConversation = (conversation) => {
    setSelectedConversation(conversation);
    // Update URL to persist selection
    const convId = conversation.conversation_id || conversation.id;
    setSearchParams({ conversation_id: convId });
  };

  const handleSendMessage = async (content, messageData = {}) => {
    if (!selectedConversation) return;

    try {
      const convId = selectedConversation.conversation_id || selectedConversation.id;
      await sendMessage({
        conversation_id: convId,
        content: content || '',
        ...messageData
      });
    } catch (error) {
      console.error('Lỗi gửi tin nhắn:', error.message);
      throw error;
    }
  };

  const handleSearchMessages = async (searchParams) => {
    if (!selectedConversation) return;
    const convId = selectedConversation.conversation_id || selectedConversation.id;
    try {
      await searchMessages(searchParams.q, convId, searchParams);
    } catch (error) {
      console.error('Lỗi tìm kiếm:', error.message);
    }
  };

  // Filter conversations based on search
  const filteredConversations = conversations.filter(conv => {
    const otherUser = conv.other_member || conv.other_user;
    const userName = otherUser?.full_name || otherUser?.name;
    return userName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
           conv.last_message?.content?.toLowerCase().includes(searchQuery.toLowerCase());
  });

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
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <div className="container mx-auto max-w-7xl h-screen flex flex-col">
          {/* Page Header - Modern Gradient Design */}
          <div className="bg-white/80 backdrop-blur-xl border-b border-gray-200/50 px-6 py-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-500 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/30 transform hover:scale-105 transition-transform">
                  <MessageCircle className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Tin nhắn</h1>
                  <p className="text-sm text-gray-600 font-medium">{conversations.length} cuộc trò chuyện</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className={`flex items-center space-x-2 px-4 py-2 rounded-full shadow-sm ${
                  isConnected ? 'bg-green-50 text-green-700 ring-1 ring-green-200' : 'bg-red-50 text-red-700 ring-1 ring-red-200'
                }`}>
                  <div className={`w-2.5 h-2.5 rounded-full ${
                    isConnected ? 'bg-green-500 animate-pulse shadow-sm shadow-green-500/50' : 'bg-red-500'
                  }`} />
                  <span className="text-xs font-semibold">
                    {isConnected ? 'Đang kết nối' : 'Mất kết nối'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content - Modern Card Layout */}
          <div className="flex-1 flex overflow-hidden mt-4 mx-4 mb-4 rounded-2xl bg-white shadow-xl">
            {/* Conversation List Sidebar - Enhanced Design */}
            <div className={`${
              selectedConversation ? 'hidden' : 'flex'
            } md:flex w-full md:w-80 lg:w-96 border-r border-gray-200/50 bg-gradient-to-b from-white to-gray-50/50 flex-col`}>
              {/* Search Bar - Modern Glass Effect */}
              <div className="p-5 border-b border-gray-200/50">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Tìm kiếm cuộc trò chuyện..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 text-sm bg-white/80 backdrop-blur-sm border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-300 focus:bg-white shadow-sm transition-all placeholder:text-gray-400"
                  />
                </div>
              </div>

              {/* Conversations List - Enhanced Scrollbar */}
              <div className="flex-1 overflow-hidden flex flex-col">
                {filteredConversations.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full p-8 text-center">
                    <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-purple-100 rounded-3xl flex items-center justify-center mb-5 shadow-inner">
                      <MessageCircle className="w-10 h-10 text-blue-500" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                      Chưa có cuộc trò chuyện
                    </h3>
                    <p className="text-sm text-gray-500 max-w-xs">
                      Bắt đầu trò chuyện mới với bạn bè và trao đổi sách ngay!
                    </p>
                  </div>
                ) : (
                  <ConversationList
                    conversations={filteredConversations}
                    loading={loading}
                    selectedConversationId={selectedConversation?.conversation_id || selectedConversation?.id}
                    onSelectConversation={handleSelectConversation}
                  />
                )}
              </div>
            </div>

            {/* Main Chat Area - Modern Background Pattern */}
            <div className={`${
              !selectedConversation ? 'hidden md:flex' : 'flex'
            } flex-1 flex-col bg-gradient-to-br from-gray-50 via-blue-50/20 to-purple-50/20`}>
              {selectedConversation ? (
                <>
                  {/* Chat Header - Glass Morphism */}
                  <div className="bg-white/90 backdrop-blur-xl border-b border-gray-200/50 px-6 py-4 shadow-sm">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3 min-w-0 flex-1">
                        {/* Back button for mobile */}
                        <button 
                          onClick={() => {
                            setSelectedConversation(null);
                            setSearchParams({});
                          }}
                          className="md:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0"
                        >
                          <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                          </svg>
                        </button>
                        
                        {/* Avatar and User Info */}
                        <div className="flex items-center space-x-3 min-w-0 flex-1">
                          {(() => {
                            const otherPerson = selectedConversation.other_member || selectedConversation.other_user;
                            const displayName = otherPerson?.full_name || otherPerson?.name || 'Người dùng';
                            const avatarUrl = otherPerson?.avatar_url;
                            const isOnline = otherPerson?.is_online || false;
                            const lastSeenAt = otherPerson?.last_seen_at;
                            
                            return (
                              <>
                                <div className="relative flex-shrink-0">
                                  {avatarUrl ? (
                                    <img 
                                      src={avatarUrl} 
                                      alt={displayName} 
                                      className="w-12 h-12 rounded-full object-cover ring-2 ring-white"
                                    />
                                  ) : (
                                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-lg ring-2 ring-white">
                                      {displayName.charAt(0).toUpperCase()}
                                    </div>
                                  )}
                                  {isOnline && (
                                    <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 border-2 border-white rounded-full" />
                                  )}
                                </div>
                                <div className="min-w-0 flex-1">
                                  <h2 className="font-semibold text-gray-900 text-lg truncate">
                                    {displayName}
                                  </h2>
                                  <OnlineStatus isOnline={isOnline} lastSeenAt={lastSeenAt} />
                                </div>
                              </>
                            );
                          })()}
                        </div>
                      </div>
                      
                      {/* Action Buttons */}
                      <div className="flex items-center space-x-2 flex-shrink-0">
                        <button 
                          onClick={() => setSearchOpen(!searchOpen)}
                          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                          title="Tìm kiếm tin nhắn"
                        >
                          <Search className="w-5 h-5 text-gray-600" />
                        </button>
                        <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                          <MoreVertical className="w-5 h-5 text-gray-600" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Search Messages Overlay */}
                  {searchOpen && (
                    <SearchMessages
                      conversationId={selectedConversation?.conversation_id || selectedConversation?.id}
                      onSearch={handleSearchMessages}
                      searchResults={searchResults}
                      loading={loading}
                      onClose={() => {
                        setSearchOpen(false);
                        clearSearchResults();
                      }}
                    />
                  )}

                  {/* Messages Area */}
                  <div className="flex-1 flex flex-col overflow-hidden">
                    {/* Exchange Quick Actions */}
                    {selectedConversation?.exchange_request_id && selectedConversation?.exchange_request && (
                      <div className="px-4 pt-4">
                        <ExchangeQuickActions
                          exchangeRequest={selectedConversation.exchange_request}
                          conversationId={selectedConversation.conversation_id || selectedConversation.id}
                          currentUserName={localStorage.getItem('userName') || 'Bạn'}
                          onRefresh={() => {
                            // Refresh conversations to get updated exchange status
                            getConversations();
                            // Reload messages to show new action message
                            const convId = selectedConversation.conversation_id || selectedConversation.id;
                            getConversationMessages(convId);
                          }}
                        />
                      </div>
                    )}

                    {/* Connection Status */}
                    {!isConnected && (
                      <div className="bg-yellow-50 border-b border-yellow-200 px-4 py-2 text-center">
                        <span className="text-sm text-yellow-700">
                          ⚠️ Đang kết nối lại... Real-time messaging tạm thời không khả dụng
                        </span>
                      </div>
                    )}

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
                      hasMore={pagination.hasMore}
                      onLoadMore={loadMore}
                      loadingMore={loadingMore}
                    />

                    {/* Typing Indicator */}
                    {typingUsers.size > 0 && (
                      <div className="px-4 py-2 text-sm text-gray-500 italic">
                        <span className="inline-flex items-center gap-1">
                          <span className="flex gap-1">
                            <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0ms'}}></span>
                            <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '150ms'}}></span>
                            <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '300ms'}}></span>
                          </span>
                          <span className="ml-2">Đang soạn tin...</span>
                        </span>
                      </div>
                    )}

                    {/* Message Input */}
                    <div className="flex-shrink-0">
                      <MessageInput
                        onSendMessage={handleSendMessage}
                        disabled={loading}
                        conversationId={selectedConversation?.conversation_id || selectedConversation?.id}
                      />
                    </div>
                  </div>
                </>
              ) : (
                /* Empty State */
                <div className="flex-1 flex flex-col items-center justify-center bg-gradient-to-br from-gray-50 to-blue-50 p-8">
                  <div className="text-center max-w-md">
                    <div className="w-32 h-32 bg-gradient-to-br from-blue-500 to-purple-500 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl">
                      <MessageCircle className="w-16 h-16 text-white" />
                    </div>
                    <h3 className="text-3xl font-bold text-gray-900 mb-3">
                      Chào mừng đến với Tin nhắn
                    </h3>
                    <p className="text-gray-600 mb-8 text-lg">
                      Chọn một cuộc trò chuyện từ danh sách để bắt đầu trò chuyện 
                      hoặc tìm kiếm bạn bè để kết nối.
                    </p>
                    <div className="flex flex-wrap items-center justify-center gap-6 text-sm">
                      <div className="flex flex-col items-center space-y-2">
                        <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                        </div>
                        <span className="text-gray-600 font-medium">Trực tuyến</span>
                      </div>
                      <div className="flex flex-col items-center space-y-2">
                        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                          <MessageCircle className="w-6 h-6 text-blue-600" />
                        </div>
                        <span className="text-gray-600 font-medium">Tin nhắn mới</span>
                      </div>
                      <div className="flex flex-col items-center space-y-2">
                        <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                          <Users className="w-6 h-6 text-purple-600" />
                        </div>
                        <span className="text-gray-600 font-medium">Kết nối</span>
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

export default MessagesPage;