import { ArrowLeft, MoreVertical, Phone, Search } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Layout from '../../../components/layout/Layout';
import MessageInput from '../../../components/messages/MessageInput';
import MessageThread from '../../../components/messages/MessageThread';
import Button from '../../../components/ui/Button';
import LoadingSpinner from '../../../components/ui/LoadingSpinner';
import { useMessages } from '../../../hooks/useMessages';

const ConversationDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [showSearch, setShowSearch] = useState(false);

  const {
    messages,
    loading,
    currentConversation,
    conversations,
    getConversations,
    getConversationMessages,
    sendMessage,
    markAsRead,
    deleteMessage,
    addReaction,
    removeReaction,
    searchMessages,
    searchResults,
    clearSearchResults,
    formatMessageTime,
    canDeleteMessage,
    getCommonEmojis,
    isConnected,
    sendingMessage,
  } = useMessages();

  const currentUserId = localStorage.getItem('userId') || 'me';

  // Get conversation info from conversations list
  const conversation =
    conversations.find((c) => c.conversation_id === id) || currentConversation;

  console.log('🔍 [CONVERSATION] Page loaded with:', {
    id,
    idType: typeof id,
    currentConversation,
    conversationsCount: conversations.length,
  });

  useEffect(() => {
    const loadConversation = async () => {
      console.log('🎬 [CONVERSATION] useEffect triggered with id:', id);

      if (!id || id === 'undefined') {
        console.warn(
          '⚠️ [CONVERSATION] Invalid conversation ID, redirecting...',
          id,
        );
        navigate('/messages', { replace: true });
        return;
      }

      // Load conversations first if not loaded yet
      if (conversations.length === 0) {
        await getConversations();
      }

      // Then load messages
      await getConversationMessages(id);
      await markAsRead(id);
    };

    loadConversation();
  }, [id, navigate, conversations.length]);

  const handleSendMessage = async (content) => {
    // Get conversation_id from multiple sources
    const conversationId =
      id ||
      currentConversation?.conversation_id ||
      conversation?.conversation_id;

    console.log(
      '📤 [CONVERSATION] Sending message with conversation_id:',
      conversationId,
    );

    if (!conversationId || conversationId === 'undefined') {
      console.error('❌ [CONVERSATION] No valid conversation_id');
      return;
    }

    try {
      await sendMessage({
        conversation_id: conversationId,
        content,
      });
    } catch (error) {
      console.error('Lỗi gửi tin nhắn:', error.message);
    }
  };

  const handleSearch = async (params) => {
    try {
      await searchMessages(params);
    } catch (error) {
      console.error('Lỗi tìm kiếm:', error.message);
    }
  };

  const handleCloseSearch = () => {
    setShowSearch(false);
    clearSearchResults();
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
                        {conversation?.other_member?.full_name?.charAt(0) ||
                          'U'}
                      </div>
                      <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
                    </div>
                    <div>
                      <h1 className="font-semibold text-gray-900 text-lg">
                        {conversation?.other_member?.full_name || 'Người dùng'}
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
                  <button
                    onClick={() => setShowSearch(!showSearch)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <Search className="w-5 h-5 text-gray-600" />
                  </button>
                  <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                    <MoreVertical className="w-5 h-5 text-gray-600" />
                  </button>
                </div>
              </div>
            </div>

            {/* Search Messages Component */}
            {showSearch && (
              <SearchMessages
                conversationId={id}
                onSearch={handleSearch}
                searchResults={searchResults}
                loading={loading}
                onClose={handleCloseSearch}
              />
            )}

            {/* Messages Area */}
            <div className="flex-1 flex flex-col bg-gray-50 relative">
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
                  sending={sendingMessage}
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
