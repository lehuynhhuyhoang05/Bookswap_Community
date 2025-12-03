import { useState, useEffect, useCallback, useRef } from 'react';
import messagesApi from '../services/api/messages'; // file axios API

export const useMessages = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [conversations, setConversations] = useState([]);
  const [messages, setMessages] = useState([]);
  const [currentConversation, setCurrentConversation] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [searchResults, setSearchResults] = useState([]);

  const apiCall = useCallback(async (apiFunction, ...args) => {
    setLoading(true);
    setError(null);
    try {
      console.log(`🔄 [USEMESSAGES] Calling ${apiFunction?.name || 'anonymous'} with:`, args);
      if (typeof apiFunction !== 'function') {
        throw new Error(`apiFunction is not a function: ${typeof apiFunction}`);
      }
      const result = await apiFunction(...args);
      console.log(`✅ [USEMESSAGES] ${apiFunction.name} success:`, result);
      return result;
    } catch (err) {
      console.error(`❌ [USEMESSAGES] ${apiFunction?.name || 'anonymous'} error:`, err);
      const errorMessage = err.message || `Failed to call ${apiFunction?.name || 'anonymous'}`;
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // ========== CONVERSATIONS API ==========
  const getConversations = useCallback((params = {}) =>
    apiCall(messagesApi.getConversations, params)
      .then(response => {
        const data = response.data?.conversations || response.data || response;
        setConversations(Array.isArray(data) ? data : []);
        return data;
      }), [apiCall]);

  const getConversationMessages = useCallback((conversationId, params = {}) =>
    apiCall(messagesApi.getMessages, conversationId, params)
      .then(response => {
        const data = response.data?.messages || response.data || response;
        setMessages(Array.isArray(data) ? data : []);
        setCurrentConversation(conversationId);
        return data;
      }), [apiCall]);

  // ========== MESSAGES API ==========
  const sendMessage = useCallback((messageData) =>
    apiCall(messagesApi.sendMessage, messageData)
      .then(response => {
        const newMessage = response.data?.message || response.data || response;
        setMessages(prev => [...prev, newMessage]);
        setConversations(prev =>
          prev.map(conv =>
            conv.id === messageData.conversation_id
              ? { ...conv, last_message: newMessage, updated_at: new Date().toISOString() }
              : conv
          )
        );
        return newMessage;
      }), [apiCall]);

  const deleteMessage = useCallback((messageId) =>
    apiCall(messagesApi.deleteMessage, messageId)
      .then(() => setMessages(prev => prev.filter(msg => msg.id !== messageId))),
    [apiCall]
  );

  // ========== REACTIONS API ==========
  const addReaction = useCallback((messageId, emoji) =>
    apiCall(messagesApi.addReaction, messageId, emoji)
      .then(response => {
        const updatedMessage = response.data?.message || response.data || response;
        setMessages(prev => prev.map(msg => msg.id === messageId ? updatedMessage : msg));
        return updatedMessage;
      }), [apiCall]);

  const removeReaction = useCallback((messageId, reactionId) =>
    apiCall(messagesApi.removeReaction, messageId, reactionId)
      .then(() => {
        setMessages(prev => prev.map(msg => {
          if (msg.id === messageId) {
            const updatedReactions = msg.reactions?.filter(r => r.id !== reactionId) || [];
            return { ...msg, reactions: updatedReactions };
          }
          return msg;
        }));
      }), [apiCall]);

  // ========== MESSAGE MANAGEMENT ==========
  const markAsRead = useCallback((conversationId) =>
    apiCall(messagesApi.markAsRead, conversationId)
      .then(() => {
        setConversations(prev =>
          prev.map(conv => conv.id === conversationId ? { ...conv, unread_count: 0 } : conv)
        );
        const totalUnread = conversations.reduce((total, conv) =>
          total + (conv.id === conversationId ? 0 : (conv.unread_count || 0)), 0
        );
        setUnreadCount(totalUnread);
      }), [apiCall, conversations]);

  const searchMessages = useCallback((query, conversationId, params = {}) =>
    apiCall(messagesApi.searchMessages, { conversation_id: conversationId, q: query, ...params })
      .then(response => {
        const data = response.data?.results || response.data || response;
        setSearchResults(Array.isArray(data) ? data : []);
        return data;
      }), [apiCall]);

  const getUnreadCount = useCallback(() =>
    apiCall(messagesApi.getUnreadCount)
      .then(response => {
        const count = response.data?.count || response.data || response;
        setUnreadCount(count);
        return count;
      }), [apiCall]);

  // ========== UTILITY & STATE MANAGEMENT ==========
  const clearMessages = useCallback(() => { setMessages([]); setCurrentConversation(null); }, []);
  const clearSearchResults = useCallback(() => setSearchResults([]), []);
  const clearError = useCallback(() => setError(null), []);
  const addMessage = useCallback((message) => setMessages(prev => [...prev, message]), []);
  const refreshData = useCallback(() => { getConversations(); getUnreadCount(); }, [getConversations, getUnreadCount]);

  // Auto-load conversations on mount
  useEffect(() => { getConversations(); getUnreadCount(); }, []);

  return {
    // State
    loading,
    error,
    conversations,
    messages,
    currentConversation,
    unreadCount,
    searchResults,

    // API methods
    getConversations,
    getConversationMessages,
    sendMessage,
    deleteMessage,
    addReaction,
    removeReaction,
    markAsRead,
    searchMessages,
    getUnreadCount,

    // State management
    clearMessages,
    clearSearchResults,
    clearError,
    addMessage,

    // Refresh
    refreshData,
  };
};

export default useMessages;
