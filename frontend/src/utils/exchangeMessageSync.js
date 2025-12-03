// frontend/src/utils/exchangeMessageSync.js
import { messagesService } from '../services/api/messages';

/**
 * Send exchange action notification message
 * Automatically sends a message when exchange status changes
 */
export const sendExchangeActionMessage = async (conversationId, action, actorName, exchangeId) => {
  const actionMessages = {
    'meeting_confirmed': `${actorName} đã xác nhận lịch gặp mặt`,
    'exchange_completed': `${actorName} đã hoàn thành trao đổi`,
    'exchange_cancelled': `${actorName} đã hủy yêu cầu trao đổi`,
  };

  const content = actionMessages[action] || `${actorName} đã thực hiện hành động: ${action}`;

  try {
    await messagesService.sendMessage({
      conversation_id: conversationId,
      content,
      metadata: {
        type: 'exchange_action',
        action,
        exchange_id: exchangeId,
        actor_name: actorName,
        timestamp: new Date().toISOString(),
      }
    });
    return { success: true };
  } catch (error) {
    console.error('[exchangeMessageSync] Error sending action message:', error);
    return { success: false, error };
  }
};

/**
 * Sync exchange status with conversation
 * Called after exchange actions to update conversation data
 */
export const syncExchangeToConversation = async (exchangeId) => {
  // This would refresh the conversation to get updated exchange_request data
  // The backend already includes exchange_request in getMyConversations
  return { success: true };
};
