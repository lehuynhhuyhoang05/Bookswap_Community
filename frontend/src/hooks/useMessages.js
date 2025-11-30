import { useCallback, useEffect, useRef, useState } from 'react';
import messagesService from '../services/api/messages';
import socketService from '../services/socket';

export const useMessages = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [conversations, setConversations] = useState([]);
  const [messages, setMessages] = useState([]);
  const [currentConversation, setCurrentConversation] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [searchResults, setSearchResults] = useState([]);
  const [initialized, setInitialized] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [sendingMessage, setSendingMessage] = useState(false);

  // Use ref to always get latest currentConversation in WebSocket handlers
  const currentConversationRef = useRef(null);
  const tempMessageIdRef = useRef(0);

  // Update ref whenever currentConversation changes
  useEffect(() => {
    currentConversationRef.current = currentConversation;
  }, [currentConversation]);

  const apiCall = useCallback(async (apiFunction, ...args) => {
    setLoading(true);
    setError(null);
    try {
      console.log(
        `🔄 [USEMESSAGES] Calling ${apiFunction?.name || 'anonymous'} with:`,
        args,
      );
      if (typeof apiFunction !== 'function') {
        throw new Error(`apiFunction is not a function: ${typeof apiFunction}`);
      }
      const result = await apiFunction(...args);
      console.log(`✅ [USEMESSAGES] ${apiFunction.name} success:`, result);
      return result;
    } catch (err) {
      console.error(
        `❌ [USEMESSAGES] ${apiFunction?.name || 'anonymous'} error:`,
        err,
      );
      const errorMessage = messagesService.getErrorMessage(err);
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // ========== CONVERSATIONS API ==========
  const getConversations = useCallback(
    (params = {}) =>
      apiCall(messagesService.getConversations, params).then((data) => {
        console.log('📞 [USEMESSAGES] Conversations data:', data);
        const conversationsData = Array.isArray(data)
          ? data
          : data.conversations || data.data || [];
        setConversations(conversationsData);

        // Update unread count from conversations
        const totalUnread = conversationsData.reduce(
          (total, conv) => total + (conv.unread_count || 0),
          0,
        );
        setUnreadCount(totalUnread);

        return conversationsData;
      }),
    [apiCall],
  );

  const getConversationMessages = useCallback(
    (conversationId, params = {}, silent = false) =>
      apiCall(
        messagesService.getConversationMessages,
        conversationId,
        params,
      ).then((data) => {
        const messagesData = Array.isArray(data)
          ? data
          : data.messages || data.data || [];

        // Always do full refresh - simpler and more reliable
        setMessages(messagesData);

        // Find and set the full conversation object from conversations list
        const conversation = conversations.find(
          (c) => c.conversation_id === conversationId,
        );
        if (conversation) {
          setCurrentConversation(conversation);
        }

        return messagesData;
      }),
    [apiCall, conversations],
  );

  // ========== MESSAGES API ==========
  const sendMessage = useCallback(
    (messageData) => {
      console.log('📤 [USEMESSAGES] Preparing to send message:', messageData);

      // Validate before sending
      const validationErrors = messagesService.validateMessageData(messageData);
      if (validationErrors.length > 0) {
        const errorMsg = validationErrors.join(', ');
        console.error('❌ [USEMESSAGES] Validation errors:', errorMsg);
        setError(errorMsg);
        return Promise.reject(new Error(errorMsg));
      }

      const formattedData = messagesService.formatMessageData(messageData);
      console.log('📤 [USEMESSAGES] Formatted message data:', formattedData);

      setSendingMessage(true);

      return apiCall(messagesService.sendMessage, formattedData)
        .then((response) => {
          console.log('✅ [USEMESSAGES] Send message response:', response);
          setSendingMessage(false);

          // Get the real message from response and add it immediately
          const realMessage = response.message || response.data || response;
          const cleanRealMessage = { ...realMessage, is_mine: true };

          // Add the new message to the list
          setMessages((prev) => [...prev, cleanRealMessage]);

          // Refresh conversations list to update last_message
          setTimeout(() => {
            console.log('🔄 [USEMESSAGES] Refreshing conversations after send');
            getConversations().catch(() => {});

            // Also refresh unread count
            apiCall(messagesService.getUnreadCount)
              .then((data) => {
                const count =
                  typeof data === 'number' ? data : data.unread_count || 0;
                setUnreadCount(count);
              })
              .catch(() => {});
          }, 300);

          return response;
        })
        .catch((error) => {
          console.error('❌ [USEMESSAGES] Send message failed:', error);
          setSendingMessage(false);
          throw error;
        });
    },
    [apiCall, getConversations],
  );

  const deleteMessage = useCallback(
    (messageId) =>
      apiCall(messagesService.deleteMessage, messageId)
        .then(() => {
          // Remove message from state
          setMessages((prev) =>
            prev.filter((msg) => msg.message_id !== messageId),
          );
          console.log(
            '✅ [USEMESSAGES] Message deleted successfully:',
            messageId,
          );
        })
        .catch((error) => {
          // If message is already deleted, still remove from UI
          if (
            error.message === 'Message is already deleted' ||
            error.statusCode === 400
          ) {
            console.log(
              '⚠️ [USEMESSAGES] Message already deleted, removing from UI:',
              messageId,
            );
            setMessages((prev) =>
              prev.filter((msg) => msg.message_id !== messageId),
            );
          } else {
            // Re-throw other errors
            throw error;
          }
        }),
    [apiCall],
  );

  // ========== REACTIONS API ==========
  const addReaction = useCallback(
    (messageId, emoji) =>
      apiCall(messagesService.addReaction, messageId, emoji).then(
        (updatedMessage) => {
          setMessages((prev) =>
            prev.map((msg) =>
              msg.message_id === messageId ? updatedMessage : msg,
            ),
          );

          // Refresh messages immediately to show reaction
          const convId = currentConversation?.conversation_id;
          if (convId) {
            setTimeout(() => {
              getConversationMessages(convId, {}, false).catch(() => {});
            }, 200);
          }

          return updatedMessage;
        },
      ),
    [apiCall, currentConversation?.conversation_id, getConversationMessages],
  );

  const removeReaction = useCallback(
    (messageId, reactionId) =>
      apiCall(messagesService.removeReaction, messageId, reactionId).then(
        () => {
          setMessages((prev) =>
            prev.map((msg) => {
              if (msg.message_id === messageId) {
                const updatedReactions =
                  msg.reactions?.filter((r) => r.reaction_id !== reactionId) ||
                  [];
                return { ...msg, reactions: updatedReactions };
              }
              return msg;
            }),
          );

          // Refresh messages immediately to update reactions
          const convId = currentConversation?.conversation_id;
          if (convId) {
            setTimeout(() => {
              getConversationMessages(convId, {}, false).catch(() => {});
            }, 200);
          }
        },
      ),
    [apiCall, currentConversation?.conversation_id, getConversationMessages],
  );

  // ========== MESSAGE MANAGEMENT ==========
  const markAsRead = useCallback(
    (conversationId) =>
      apiCall(messagesService.markAsRead, conversationId).then(() => {
        setConversations((prev) =>
          prev.map((conv) =>
            conv.conversation_id === conversationId
              ? { ...conv, unread_count: 0 }
              : conv,
          ),
        );

        // Recalculate total unread count
        const totalUnread = conversations.reduce(
          (total, conv) =>
            total +
            (conv.conversation_id === conversationId
              ? 0
              : conv.unread_count || 0),
          0,
        );
        setUnreadCount(totalUnread);
      }),
    [apiCall, conversations],
  );

  const searchMessages = useCallback(
    (params = {}) =>
      apiCall(messagesService.searchMessages, params).then((data) => {
        const results = Array.isArray(data)
          ? data
          : data.results || data.data || [];
        setSearchResults(results);
        return results;
      }),
    [apiCall],
  );

  const getUnreadCount = useCallback(
    () =>
      apiCall(messagesService.getUnreadCount).then((data) => {
        const count =
          typeof data === 'number'
            ? data
            : data.count || data.data || data.unread_count || 0;
        setUnreadCount(count);
        return count;
      }),
    [apiCall],
  );

  // ========== UTILITY & STATE MANAGEMENT ==========
  const clearMessages = useCallback(() => {
    setMessages([]);
    setCurrentConversation(null);
  }, []);

  const clearSearchResults = useCallback(() => setSearchResults([]), []);
  const clearError = useCallback(() => setError(null), []);

  const addMessage = useCallback(
    (message) => {
      setMessages((prev) => [...prev, message]);

      // Also update conversations if this message belongs to one
      if (message.conversation_id) {
        setConversations((prev) =>
          prev.map((conv) =>
            conv.conversation_id === message.conversation_id
              ? {
                  ...conv,
                  last_message: message,
                  last_message_at: new Date().toISOString(),
                  unread_count: (conv.unread_count || 0) + 1,
                }
              : conv,
          ),
        );

        // Update unread count if this is not current conversation
        if (currentConversation !== message.conversation_id) {
          setUnreadCount((prev) => prev + 1);
        }
      }
    },
    [currentConversation],
  );

  const refreshData = useCallback(() => {
    getConversations();
    getUnreadCount();
  }, [getConversations, getUnreadCount]);

  // Check if message can be deleted
  const canDeleteMessage = useCallback((messageTimestamp) => {
    return messagesService.canDeleteMessage(messageTimestamp);
  }, []);

  // Format message time
  const formatMessageTime = useCallback((timestamp) => {
    return messagesService.formatMessageTime(timestamp);
  }, []);

  // Get common emojis
  const getCommonEmojis = useCallback(() => {
    return messagesService.getCommonEmojis();
  }, []);

  // Auto-load conversations on mount - CHỈ GỌI 1 LẦN
  useEffect(() => {
    if (!initialized) {
      console.log('🎯 [USEMESSAGES] Initializing hook - FIRST TIME');
      const initializeData = async () => {
        await getConversations();
        await getUnreadCount();
      };
      initializeData();
      setInitialized(true);
    }
  }, [initialized, getConversations, getUnreadCount]);

  // ========== AUTO REFRESH CONVERSATIONS - 8s interval ==========
  useEffect(() => {
    const interval = setInterval(() => {
      console.log('🔄 [USEMESSAGES] Auto-refreshing conversations (8s)');
      getConversations().catch(() => {});
      getUnreadCount().catch(() => {});

      // Also refresh current conversation messages
      const convId = currentConversation?.conversation_id;
      if (convId) {
        console.log(
          '🔄 [USEMESSAGES] Auto-refreshing current conversation messages',
        );
        getConversationMessages(convId, {}, false).catch(() => {});
      }
    }, 8000);

    return () => clearInterval(interval);
  }, [
    getConversations,
    getUnreadCount,
    currentConversation?.conversation_id,
    getConversationMessages,
  ]);

  // ========== AUTO REFRESH MESSAGES - Removed (handled by conversations refresh) ==========
  // Messages now refresh together with conversations every 8s

  // ========== WEBSOCKET CONNECTION ==========
  useEffect(() => {
    console.log('🎬 [USEMESSAGES] WebSocket effect running...');
    const token = localStorage.getItem('accessToken');

    console.log('🔑 [USEMESSAGES] Token exists:', !!token);

    if (!token) {
      console.warn(
        '⚠️ [USEMESSAGES] No token found, skipping socket connection',
      );
      return;
    }

    console.log('🔌 [USEMESSAGES] Initializing WebSocket connection');

    // Connect to socket
    socketService.connect(token);
    setIsConnected(socketService.isConnected());

    console.log(
      '🔌 [USEMESSAGES] Socket connected status:',
      socketService.isConnected(),
    );

    // Listen for connection events
    const handleConnect = () => {
      console.log('✅ [USEMESSAGES] WebSocket connected');
      setIsConnected(true);
    };

    const handleDisconnect = () => {
      console.log('❌ [USEMESSAGES] WebSocket disconnected');
      setIsConnected(false);
    };

    // Listen for new messages
    const handleNewMessage = (data) => {
      console.log('📨 [USEMESSAGES] New message received:', data);
      const newMessage = data.message || data;
      const currentConvId = currentConversationRef.current?.conversation_id;

      // Get current user ID to determine if message is mine
      const currentUserId = currentConversationRef.current?.current_user_id;
      const isMine = currentUserId && newMessage.sender_id === currentUserId;

      console.log('🔍 [USEMESSAGES] Current conversation ID:', currentConvId);
      console.log(
        '🔍 [USEMESSAGES] Message conversation ID:',
        newMessage.conversation_id,
      );
      console.log('🔍 [USEMESSAGES] Current user ID:', currentUserId);
      console.log('🔍 [USEMESSAGES] Sender ID:', newMessage.sender_id);
      console.log('🔍 [USEMESSAGES] Is mine:', isMine);

      // Add to messages if it's for current conversation
      if (currentConvId === newMessage.conversation_id) {
        console.log('✅ [USEMESSAGES] Message is for CURRENT conversation');
        setMessages((prev) => {
          console.log('📊 [USEMESSAGES] Current messages count:', prev.length);
          console.log('📊 [USEMESSAGES] Checking for duplicate...');

          // Check if message already exists to avoid duplicates
          const exists = prev.some(
            (msg) => msg.message_id === newMessage.message_id,
          );
          if (exists) {
            console.log('⚠️ [USEMESSAGES] Message already exists, skipping');
            return prev;
          }

          console.log('➕ [USEMESSAGES] Adding new message to UI');
          const newMessages = [...prev, { ...newMessage, is_mine: isMine }];
          console.log(
            '📊 [USEMESSAGES] New messages count:',
            newMessages.length,
          );
          return newMessages;
        });

        // Refresh conversations list after receiving message (light refresh)
        setTimeout(() => {
          console.log(
            '🔄 [USEMESSAGES] Refreshing conversations after receive',
          );
          getConversations().catch(() => {});
        }, 300);

        // Refresh unread count immediately
        getUnreadCount().catch(() => {});
      } else {
        console.log(
          '⏭️ [USEMESSAGES] Message is for different conversation, updating unread count',
        );

        // Refresh immediately for other conversation
        getConversations().catch(() => {});
        getUnreadCount().catch(() => {});
      }

      // Update conversations list
      setConversations((prev) =>
        prev.map((conv) =>
          conv.conversation_id === newMessage.conversation_id
            ? {
                ...conv,
                last_message: newMessage,
                last_message_at: new Date().toISOString(),
                unread_count:
                  (conv.unread_count || 0) +
                  (currentConvId === newMessage.conversation_id ? 0 : 1),
              }
            : conv,
        ),
      );

      // Update unread count if not current conversation
      if (currentConvId !== newMessage.conversation_id) {
        setUnreadCount((prev) => prev + 1);
      }
    };

    // Listen for message sent confirmation
    const handleMessageSent = (data) => {
      console.log('✅ [USEMESSAGES] Message sent confirmation:', data);
      const sentMessage = data.message || data;
      const currentConvId = currentConversationRef.current?.conversation_id;

      // Add to messages if it's for current conversation (avoid duplicates)
      if (currentConvId === sentMessage.conversation_id) {
        setMessages((prev) => {
          // Check if there's a temp message with same content to replace
          const tempMsgIndex = prev.findIndex(
            (msg) => msg._sending && msg.content === sentMessage.content,
          );

          if (tempMsgIndex !== -1) {
            // Replace temp message with real one
            console.log(
              '🔄 [USEMESSAGES] Replacing temp message with real one',
            );
            const newMessages = [...prev];
            newMessages[tempMsgIndex] = { ...sentMessage, is_mine: true };
            return newMessages;
          }

          // Check if message already exists by ID
          const exists = prev.some(
            (msg) => msg.message_id === sentMessage.message_id,
          );
          if (exists) {
            console.log('⚠️ [USEMESSAGES] Message already exists, skipping');
            return prev;
          }

          console.log('➕ [USEMESSAGES] Adding sent message to UI');
          return [...prev, { ...sentMessage, is_mine: true }];
        });
      }

      // Update conversations list with new last message
      setConversations((prev) =>
        prev.map((conv) =>
          conv.conversation_id === sentMessage.conversation_id
            ? {
                ...conv,
                last_message: sentMessage,
                last_message_at: new Date().toISOString(),
              }
            : conv,
        ),
      );
    };

    // Register event listeners
    socketService.on('connect', handleConnect);
    socketService.on('disconnect', handleDisconnect);
    socketService.on('message:new', handleNewMessage);
    socketService.on('message:sent', handleMessageSent);

    // Cleanup on unmount
    return () => {
      console.log('🔌 [USEMESSAGES] Cleaning up WebSocket listeners');
      socketService.off('connect', handleConnect);
      socketService.off('disconnect', handleDisconnect);
      socketService.off('message:new', handleNewMessage);
      socketService.off('message:sent', handleMessageSent);
      // Don't disconnect socket - keep it alive for app lifetime
    };
  }, []); // Remove currentConversation dependency to avoid re-registering handlers

  return {
    // State
    loading,
    error,
    conversations,
    messages,
    currentConversation,
    unreadCount,
    searchResults,
    initialized,
    isConnected,
    sendingMessage,

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
    setMessages,

    // Utility methods
    canDeleteMessage,
    formatMessageTime,
    getCommonEmojis,

    // Refresh
    refreshData,
  };
};

export default useMessages;
