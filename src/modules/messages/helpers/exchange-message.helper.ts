// src/modules/messages/helpers/exchange-message.helper.ts
import { MessagesService } from '../services/messages.service';
import { MessagesGateway } from '../gateways/messages/messages.gateway';

export interface ExchangeActionMetadata {
  type: 'exchange_action';
  action: 'request_created' | 'request_accepted' | 'request_rejected' | 
          'meeting_confirmed' | 'exchange_completed' | 'exchange_cancelled';
  exchange_id: string;
  actor_name: string;
  timestamp: Date;
  additional_data?: Record<string, any>;
}

export class ExchangeMessageHelper {
  /**
   * Send exchange action message to conversation
   */
  static async sendExchangeActionMessage(
    messagesService: MessagesService,
    messagesGateway: MessagesGateway,
    conversationId: string,
    senderId: string,
    metadata: ExchangeActionMetadata
  ) {
    const actionTexts = {
      'request_created': 'đã tạo yêu cầu trao đổi sách',
      'request_accepted': 'đã chấp nhận yêu cầu trao đổi',
      'request_rejected': 'đã từ chối yêu cầu trao đổi',
      'meeting_confirmed': 'đã xác nhận lịch gặp mặt',
      'exchange_completed': 'đã hoàn thành trao đổi',
      'exchange_cancelled': 'đã hủy trao đổi',
    };

    const content = `${metadata.actor_name} ${actionTexts[metadata.action]}`;

    try {
      // This would need the actual user_id from sender member_id
      // For now, we'll add this to the metadata
      const messageData = {
        conversation_id: conversationId,
        content,
        metadata,
      };

      // Send via service
      // Note: You'll need to modify this based on your actual implementation
      // const result = await messagesService.sendMessage(userId, messageData);
      
      // Emit via gateway
      // messagesGateway.emitNewMessage(receiverId, result);

      return { success: true, message: content };
    } catch (error) {
      console.error('[ExchangeMessageHelper] Error sending exchange action:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Create metadata for exchange request created
   */
  static createRequestCreatedMetadata(
    exchangeId: string, 
    actorName: string
  ): ExchangeActionMetadata {
    return {
      type: 'exchange_action',
      action: 'request_created',
      exchange_id: exchangeId,
      actor_name: actorName,
      timestamp: new Date(),
    };
  }

  /**
   * Create metadata for exchange request accepted
   */
  static createRequestAcceptedMetadata(
    exchangeId: string,
    actorName: string
  ): ExchangeActionMetadata {
    return {
      type: 'exchange_action',
      action: 'request_accepted',
      exchange_id: exchangeId,
      actor_name: actorName,
      timestamp: new Date(),
    };
  }

  /**
   * Create metadata for meeting confirmed
   */
  static createMeetingConfirmedMetadata(
    exchangeId: string,
    actorName: string,
    meetingDetails?: { date?: string; location?: string }
  ): ExchangeActionMetadata {
    return {
      type: 'exchange_action',
      action: 'meeting_confirmed',
      exchange_id: exchangeId,
      actor_name: actorName,
      timestamp: new Date(),
      additional_data: meetingDetails,
    };
  }

  /**
   * Create metadata for exchange completed
   */
  static createExchangeCompletedMetadata(
    exchangeId: string,
    actorName: string
  ): ExchangeActionMetadata {
    return {
      type: 'exchange_action',
      action: 'exchange_completed',
      exchange_id: exchangeId,
      actor_name: actorName,
      timestamp: new Date(),
    };
  }
}
