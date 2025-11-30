import api from './config';

export const messagesService = {
  /**
   * 1️⃣ Send a message
   * POST /api/v1/messages
   */
  async sendMessage(messageData) {
    try {
      console.log('📤 [SERVICE] Sending message data:', messageData);

      // Format data according to API spec (removes null/undefined values)
      const payload = messagesService.formatMessageData(messageData);

      console.log('📤 [SERVICE] Final payload:', payload);

      const response = await api.post('/api/v1/messages', payload);
      console.log('✅ [SERVICE] Send message success:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ [SERVICE] Send message error:', {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message,
      });

      const status = error.response?.status;
      const errorData = error.response?.data;

      if (status === 400) {
        throw errorData || { message: 'Dữ liệu không hợp lệ' };
      } else if (status === 404) {
        throw (
          errorData || { message: 'Conversation hoặc request không tồn tại' }
        );
      }
      throw errorData || { message: 'Gửi tin nhắn thất bại' };
    }
  },

  /**
   * 2️⃣ Delete a message
   * DELETE /api/v1/messages/{messageId}
   */
  async deleteMessage(messageId) {
    try {
      const response = await api.delete(`/api/v1/messages/${messageId}`);
      return response.data;
    } catch (error) {
      const status = error.response?.status;
      const errorData = error.response?.data;

      if (status === 400) {
        throw errorData || { message: 'Không thể xóa tin nhắn' };
      } else if (status === 403) {
        throw errorData || { message: 'Chỉ có thể xóa tin nhắn của chính bạn' };
      } else if (status === 404) {
        throw errorData || { message: 'Tin nhắn không tồn tại' };
      }
      throw errorData || { message: 'Xóa tin nhắn thất bại' };
    }
  },

  /**
   * 3️⃣ Add emoji reaction
   * POST /api/v1/messages/{messageId}/reactions
   */
  async addReaction(messageId, emoji) {
    try {
      const response = await api.post(
        `/api/v1/messages/${messageId}/reactions`,
        { emoji },
      );
      return response.data;
    } catch (error) {
      const status = error.response?.status;
      const errorData = error.response?.data;

      if (status === 400) {
        throw (
          errorData || { message: 'Emoji không hợp lệ hoặc tin nhắn đã bị xóa' }
        );
      } else if (status === 403) {
        throw errorData || { message: 'Không có quyền truy cập conversation' };
      } else if (status === 404) {
        throw errorData || { message: 'Tin nhắn không tồn tại' };
      }
      throw errorData || { message: 'Thêm reaction thất bại' };
    }
  },

  /**
   * 4️⃣ Remove emoji reaction
   * DELETE /api/v1/messages/{messageId}/reactions/{reactionId}
   */
  async removeReaction(messageId, reactionId) {
    try {
      const response = await api.delete(
        `/api/v1/messages/${messageId}/reactions/${reactionId}`,
      );
      return response.data;
    } catch (error) {
      const status = error.response?.status;
      const errorData = error.response?.data;

      if (status === 403) {
        throw errorData || { message: 'Chỉ có thể xóa reaction của chính bạn' };
      } else if (status === 404) {
        throw errorData || { message: 'Reaction không tồn tại' };
      }
      throw errorData || { message: 'Xóa reaction thất bại' };
    }
  },

  /**
   * 5️⃣ Get my conversations
   * GET /api/v1/messages/conversations
   */
  async getConversations(params = {}) {
    try {
      const response = await api.get('/api/v1/messages/conversations', {
        params: {
          page: params.page || 1,
          limit: params.limit || 20,
        },
      });
      return response.data;
    } catch (error) {
      console.error(
        '❌ [SERVICE] Get conversations error:',
        error.response?.data || error,
      );
      throw (
        error.response?.data || { message: 'Tải danh sách hội thoại thất bại' }
      );
    }
  },

  /**
   * 6️⃣ Get messages in a conversation
   * GET /api/v1/messages/conversations/{conversationId}
   */
  async getConversationMessages(conversationId, params = {}) {
    try {
      const response = await api.get(
        `/api/v1/messages/conversations/${conversationId}`,
        {
          params: {
            page: params.page || 1,
            limit: params.limit || 50,
          },
        },
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Tải tin nhắn thất bại' };
    }
  },

  /**
   * 7️⃣ Mark all messages as read
   * PATCH /api/v1/messages/conversations/{conversationId}/read
   */
  async markAsRead(conversationId) {
    try {
      const response = await api.patch(
        `/api/v1/messages/conversations/${conversationId}/read`,
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Đánh dấu đã đọc thất bại' };
    }
  },

  /**
   * 8️⃣ Search messages in a conversation
   * GET /api/v1/messages/search
   */
  async searchMessages(params = {}) {
    try {
      // Validate required parameters
      if (!params.q || params.q.length < 2) {
        throw { message: 'Từ khóa tìm kiếm phải có ít nhất 2 ký tự' };
      }
      if (!params.conversation_id) {
        throw { message: 'Conversation ID là bắt buộc' };
      }

      const response = await api.get('/api/v1/messages/search', {
        params: {
          q: params.q,
          conversation_id: params.conversation_id,
          page: params.page || 1,
          limit: params.limit || 20,
        },
      });
      return response.data;
    } catch (error) {
      const status = error.response?.status;
      const errorData = error.response?.data;

      if (status === 400) {
        throw errorData || { message: 'Truy vấn tìm kiếm không hợp lệ' };
      } else if (status === 404) {
        throw errorData || { message: 'Hội thoại không tồn tại' };
      }
      throw errorData || { message: 'Tìm kiếm tin nhắn thất bại' };
    }
  },

  /**
   * 9️⃣ Get unread message count
   * GET /api/v1/messages/unread/count
   */
  async getUnreadCount() {
    try {
      const response = await api.get('/api/v1/messages/unread/count');
      return response.data;
    } catch (error) {
      throw (
        error.response?.data || { message: 'Tải số tin nhắn chưa đọc thất bại' }
      );
    }
  },

  // ========== UTILITY METHODS ==========

  /**
   * Validate message data before sending
   */
  validateMessageData(messageData) {
    const errors = [];

    // Either conversation_id or exchange_request_id is required
    if (!messageData.conversation_id && !messageData.exchange_request_id) {
      errors.push('Cần có conversation_id hoặc exchange_request_id');
    }

    if (!messageData.content?.trim()) {
      errors.push('Nội dung tin nhắn không được để trống');
    }

    if (messageData.content?.length > 1000) {
      errors.push('Tin nhắn không được vượt quá 1000 ký tự');
    }

    return errors;
  },

  /**
   * Format message data for sending
   */
  formatMessageData(messageData) {
    const formatted = {
      content: (messageData.content || '').trim(),
    };

    // Only add conversation_id or exchange_request_id if they exist
    if (messageData.conversation_id) {
      formatted.conversation_id = messageData.conversation_id;
    }
    if (messageData.exchange_request_id) {
      formatted.exchange_request_id = messageData.exchange_request_id;
    }

    return formatted;
  },

  /**
   * Common emoji reactions
   */
  getCommonEmojis() {
    return ['👍', '❤️', '😂', '😮', '😢', '😡', '🎉', '👏', '🙏', '🔥'];
  },

  /**
   * Check if message can be deleted (within 1 hour)
   */
  canDeleteMessage(messageTimestamp) {
    if (!messageTimestamp) return false;

    try {
      const messageTime = new Date(messageTimestamp).getTime();
      const currentTime = new Date().getTime();
      const oneHour = 60 * 60 * 1000; // 1 hour in milliseconds

      return currentTime - messageTime <= oneHour;
    } catch (error) {
      console.error('Error checking if message can be deleted:', error);
      return false;
    }
  },

  /**
   * Format message timestamp for display
   */
  formatMessageTime(timestamp) {
    if (!timestamp) return '';

    try {
      const messageTime = new Date(timestamp);
      const now = new Date();
      const diffInMinutes = Math.floor((now - messageTime) / (1000 * 60));

      if (diffInMinutes < 1) return 'Vừa xong';
      if (diffInMinutes < 60) return `${diffInMinutes} phút trước`;

      const diffInHours = Math.floor(diffInMinutes / 60);
      if (diffInHours < 24) return `${diffInHours} giờ trước`;

      const diffInDays = Math.floor(diffInHours / 24);
      if (diffInDays < 7) return `${diffInDays} ngày trước`;

      return messageTime.toLocaleDateString('vi-VN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      });
    } catch (error) {
      console.error('Error formatting message time:', error);
      return '';
    }
  },

  /**
   * Extract error message from error object
   */
  getErrorMessage(error) {
    if (typeof error === 'string') return error;
    if (error?.message) return error.message;
    if (error?.response?.data?.message) return error.response.data.message;
    if (error?.details?.message) return error.details.message;
    return 'Đã xảy ra lỗi không xác định';
  },
};

export default messagesService;
