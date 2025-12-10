import { useState, useEffect, useCallback, useRef } from 'react';
import messagesApi from '../services/api/messages'; // file axios API
import socketService from '../services/socket';

export const useMessages = () => {
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);
  const [conversations, setConversations] = useState([]);
  const [messages, setMessages] = useState([]);
  const [currentConversation, setCurrentConversation] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [searchResults, setSearchResults] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const [typingUsers, setTypingUsers] = useState(new Set());
  const [pagination, setPagination] = useState({ page: 1, hasMore: true, totalPages: 1 });

  // Store currentConversation in a ref for event handlers
  const currentConversationRef = useRef(currentConversation);
  useEffect(() => {
    currentConversationRef.current = currentConversation;
  }, [currentConversation]);

  // Initialize socket connection - only run once on mount
  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    console.log('🔍 [useMessages] Token exists:', !!token);
    
    if (!token) {
      console.warn('⚠️ [useMessages] No token found, skipping socket connection');
      return;
    }

    console.log('🔌 [useMessages] Calling socketService.connect()');
    socketService.connect(token);
    
    // Register connection status callback
    const unsubscribe = socketService.onConnectionChange((connected) => {
      setIsConnected(connected);
    });

    // Listen for new messages
    socketService.on('message:new', (data) => {
      const newMessage = data?.message || data;
      setMessages(prev => [...prev, { ...newMessage, is_mine: false }]);
      
      // Update conversation list
      setConversations(prev =>
        prev.map(conv => {
          const convId = conv.conversation_id || conv.id;
          return convId === newMessage.conversation_id
            ? { ...conv, last_message: newMessage.content, last_message_at: newMessage.sent_at }
            : conv;
        })
      );
    });

    // Listen for typing indicators - use ref to get current conversation
    socketService.on('typing:start', ({ conversation_id, member_id }) => {
      if (currentConversationRef.current === conversation_id) {
        setTypingUsers(prev => new Set([...prev, member_id]));
      }
    });

    socketService.on('typing:stop', ({ conversation_id, member_id }) => {
      if (currentConversationRef.current === conversation_id) {
        setTypingUsers(prev => {
          const newSet = new Set(prev);
          newSet.delete(member_id);
          return newSet;
        });
      }
    });

    // Listen for message status updates
    socketService.on('message:status', ({ message_ids, status, delivered_at, read_at }) => {
      setMessages(prev => prev.map(msg => {
        if (message_ids.includes(msg.message_id)) {
          return {
            ...msg,
            status,
            delivered_at: delivered_at || msg.delivered_at,
            read_at: read_at || msg.read_at,
            is_read: status === 'read' ? true : msg.is_read
          };
        }
        return msg;
      }));
    });

    // Listen for user online/offline status
    socketService.on('user:online', ({ member_id, timestamp }) => {
      setConversations(prev => prev.map(conv => {
        if (conv.other_member?.member_id === member_id) {
          return {
            ...conv,
            other_member: {
              ...conv.other_member,
              is_online: true,
              last_seen_at: timestamp
            }
          };
        }
        return conv;
      }));
    });

    socketService.on('user:offline', ({ member_id, last_seen_at }) => {
      setConversations(prev => prev.map(conv => {
        if (conv.other_member?.member_id === member_id) {
          return {
            ...conv,
            other_member: {
              ...conv.other_member,
              is_online: false,
              last_seen_at
            }
          };
        }
        return conv;
      }));
    });

    return () => {
      unsubscribe();
      socketService.disconnect();
    };
  }, []); // Empty dependency - only run on mount/unmount

  const apiCall = useCallback(async (apiFunction, ...args) => {
    setLoading(true);
    setError(null);
    try {
      if (typeof apiFunction !== 'function') {
        throw new Error(`apiFunction is not a function: ${typeof apiFunction}`);
      }
      const result = await apiFunction(...args);
      return result;
    } catch (err) {
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
        const data = response.data?.conversations || response.conversations || response.data || response;
        setConversations(Array.isArray(data) ? data : []);
        return data;
      }), [apiCall]);

  const createDirectConversation = useCallback((receiverUserId) =>
    apiCall(messagesApi.createDirectConversation, receiverUserId)
      .then(response => {
        const data = response.data || response;
        // Refresh conversations after creating new one
        getConversations();
        return data;
      }), [apiCall, getConversations]);

  const getConversationMessages = useCallback((conversationId, params = {}) =>
    apiCall(messagesApi.getConversationMessages, conversationId, params)
      .then(response => {
        // Backend returns {conversation: {...}, messages: [...], pagination: {...}}
        const messagesData = response?.messages || response.data?.messages || [];
        const paginationData = response?.pagination || response.data?.pagination || {};
        
        // If loading first page, replace messages; otherwise append to top
        if (params.page === 1 || !params.page) {
          setMessages(Array.isArray(messagesData) ? messagesData : []);
        } else {
          setMessages(prev => [...messagesData, ...prev]);
        }
        
        setCurrentConversation(conversationId);
        
        // Update pagination state
        setPagination({
          page: paginationData.current_page || params.page || 1,
          hasMore: paginationData.current_page < paginationData.total_pages,
          totalPages: paginationData.total_pages || 1
        });
        
        return { messages: messagesData, pagination: paginationData };
      }), [apiCall]);

  // ========== MESSAGES API ==========
  const sendMessage = useCallback((messageData) =>
    apiCall(messagesApi.sendMessage, messageData)
      .then(response => {
        // Backend returns {message: {...}, conversation_id: ...}
        const newMessage = response?.message || response.data?.message || response;
        
        // CRITICAL: Backend doesn't include is_mine, so we add it manually
        // since this is always the current user's message
        const messageWithOwnership = {
          ...newMessage,
          is_mine: true,
          sender_id: newMessage.sender?.member_id // Also extract sender_id for fallback
        };
        
        setMessages(prev => [...prev, messageWithOwnership]);
        setConversations(prev =>
          prev.map(conv => {
            const convId = conv.conversation_id || conv.id;
            return convId === messageData.conversation_id
              ? { ...conv, last_message: newMessage.content, last_message_at: newMessage.sent_at }
              : conv;
          })
        );
        return messageWithOwnership;
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
        // Backend returns reaction data
        const reactionData = response?.reaction || response.data?.reaction || response;
        
        // Update message with new reaction
        setMessages(prev => prev.map(msg => {
          const msgId = msg.message_id || msg.id;
          if (msgId === messageId) {
            const existingReactions = msg.reactions || [];
            return {
              ...msg,
              reactions: [...existingReactions, reactionData]
            };
          }
          return msg;
        }));
        
        return reactionData;
      }), [apiCall]);

  const removeReaction = useCallback((messageId, reactionId) =>
    apiCall(messagesApi.removeReaction, messageId, reactionId)
      .then(() => {
        setMessages(prev => prev.map(msg => {
          const msgId = msg.message_id || msg.id;
          if (msgId === messageId) {
            const updatedReactions = msg.reactions?.filter(
              r => (r.reaction_id || r.id) !== reactionId
            ) || [];
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
          prev.map(conv => {
            const convId = conv.conversation_id || conv.id;
            return convId === conversationId ? { ...conv, unread_count: 0 } : conv;
          })
        );
        const totalUnread = conversations.reduce((total, conv) => {
          const convId = conv.conversation_id || conv.id;
          return total + (convId === conversationId ? 0 : (conv.unread_count || 0));
        }, 0);
        setUnreadCount(totalUnread);
      }), [apiCall, conversations]);

  const markMessagesAsRead = useCallback((messageIds, senderId) => {
    if (!messageIds || messageIds.length === 0) return;
    
    // Emit to server via WebSocket
    socketService.emit('message:read', { 
      message_ids: messageIds,
      sender_id: senderId
    });
    
    // Update local state immediately
    setMessages(prev => prev.map(msg => {
      if (messageIds.includes(msg.message_id)) {
        return {
          ...msg,
          is_read: true,
          status: 'read',
          read_at: new Date().toISOString()
        };
      }
      return msg;
    }));
  }, []);

  const searchMessages = useCallback((query, conversationId, params = {}) =>
    apiCall(messagesApi.searchMessages, query, conversationId, params)
      .then(response => {
        const data = response?.messages || response.data?.messages || response.data || response;
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
  const clearMessages = useCallback(() => { 
    setMessages([]);
    setCurrentConversation(null);
    setPagination({ page: 1, hasMore: true, totalPages: 1 });
  }, []);
  
  const clearSearchResults = useCallback(() => setSearchResults([]), []);
  const clearError = useCallback(() => setError(null), []);
  const addMessage = useCallback((message) => setMessages(prev => [...prev, message]), []);
  const refreshData = useCallback(() => { getConversations(); getUnreadCount(); }, [getConversations, getUnreadCount]);

  // Load more messages (pagination)
  const loadMore = useCallback(() => {
    if (!currentConversation || !pagination.hasMore || loadingMore) return;
    
    setLoadingMore(true);
    const nextPage = pagination.page + 1;
    
    getConversationMessages(currentConversation, { page: nextPage, limit: 50 })
      .finally(() => setLoadingMore(false));
  }, [currentConversation, pagination, loadingMore, getConversationMessages]);

  // Send typing indicator
  const sendTypingIndicator = useCallback((conversationId, isTyping) => {
    if (!isConnected) return;
    
    const event = isTyping ? 'typing:start' : 'typing:stop';
    socketService.emit(event, { conversation_id: conversationId });
  }, [isConnected]);

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
    isConnected,
    typingUsers,
    pagination,
    loadingMore,

    // API methods
    getConversations,
    createDirectConversation,
    getConversationMessages,
    sendMessage,
    deleteMessage,
    addReaction,
    removeReaction,
    markAsRead,
    markMessagesAsRead,
    searchMessages,
    getUnreadCount,

    // Real-time methods
    sendTypingIndicator,
    loadMore,

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
