// src/modules/messages/services/messages.service.ts
import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { Conversation } from '../../../infrastructure/database/entities/conversation.entity';
import { Message } from '../../../infrastructure/database/entities/message.entity';
import { Member } from '../../../infrastructure/database/entities/member.entity';
import { ExchangeRequest, ExchangeRequestStatus } from '../../../infrastructure/database/entities/exchange-request.entity';
import { SendMessageDto } from '../dto/send-message.dto';

@Injectable()
export class MessagesService {
  private readonly logger = new Logger(MessagesService.name);

  constructor(
    @InjectRepository(Conversation)
    private conversationRepo: Repository<Conversation>,

    @InjectRepository(Message)
    private messageRepo: Repository<Message>,

    @InjectRepository(Member)
    private memberRepo: Repository<Member>,

    @InjectRepository(ExchangeRequest)
    private requestRepo: Repository<ExchangeRequest>,
  ) {}

  /**
   * Get all conversations for a user
   */
  async getMyConversations(userId: string, page: number = 1, limit: number = 20) {
    this.logger.log(`[getMyConversations] userId=${userId}, page=${page}`);

    const member = await this.memberRepo.findOne({ where: { user_id: userId } });
    if (!member) throw new NotFoundException('Member profile not found');

    const skip = (page - 1) * limit;

    const [conversations, total] = await this.conversationRepo.findAndCount({
      where: [
        { member_a_id: member.member_id },
        { member_b_id: member.member_id },
      ],
      relations: ['member_a', 'member_a.user', 'member_b', 'member_b.user', 'exchange_request'],
      order: { last_message_at: 'DESC', created_at: 'DESC' },
      skip,
      take: limit,
    });

    // Get unread count for each conversation
    const conversationsWithUnread = await Promise.all(
      conversations.map(async (conv) => {
        const unreadCount = await this.messageRepo.count({
          where: {
            conversation_id: conv.conversation_id,
            receiver_id: member.member_id,
            is_read: false,
          },
        });

        const otherMember =
          conv.member_a_id === member.member_id ? conv.member_b : conv.member_a;

        return {
          conversation_id: conv.conversation_id,
          exchange_request_id: conv.exchange_request_id,
          other_member: {
            member_id: otherMember.member_id,
            full_name: otherMember.user.full_name,
            avatar_url: otherMember.user.avatar_url,
            region: otherMember.region,
            trust_score: parseFloat(otherMember.trust_score.toString()),
            is_verified: otherMember.is_verified,
          },
          total_messages: conv.total_messages,
          unread_count: unreadCount,
          last_message_at: conv.last_message_at,
          created_at: conv.created_at,
        };
      })
    );

    return {
      conversations: conversationsWithUnread,
      pagination: {
        page,
        limit,
        total,
        total_pages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get messages in a conversation
   */
  async getMessages(
    userId: string,
    conversationId: string,
    page: number = 1,
    limit: number = 50,
  ) {
    this.logger.log(`[getMessages] userId=${userId}, conversationId=${conversationId}`);

    const member = await this.memberRepo.findOne({ where: { user_id: userId } });
    if (!member) throw new NotFoundException('Member profile not found');

    const conversation = await this.conversationRepo.findOne({
      where: { conversation_id: conversationId },
      relations: ['member_a', 'member_a.user', 'member_b', 'member_b.user'],
    });

    if (!conversation) {
      throw new NotFoundException('Conversation not found');
    }

    // Check if user is part of conversation
    if (
      conversation.member_a_id !== member.member_id &&
      conversation.member_b_id !== member.member_id
    ) {
      throw new ForbiddenException('You are not part of this conversation');
    }

    const skip = (page - 1) * limit;

    const [messages, total] = await this.messageRepo.findAndCount({
      where: { conversation_id: conversationId },
      relations: ['sender', 'sender.user', 'receiver', 'receiver.user'],
      order: { sent_at: 'DESC' },
      skip,
      take: limit,
    });

    // Auto-mark messages as read
    const unreadMessageIds = messages
      .filter((msg) => msg.receiver_id === member.member_id && !msg.is_read)
      .map((msg) => msg.message_id);

    if (unreadMessageIds.length > 0) {
      await this.markMessagesAsRead(member.member_id, unreadMessageIds);
    }

    const otherMember =
      conversation.member_a_id === member.member_id
        ? conversation.member_b
        : conversation.member_a;

    return {
      conversation: {
        conversation_id: conversation.conversation_id,
        other_member: {
          member_id: otherMember.member_id,
          full_name: otherMember.user.full_name,
          avatar_url: otherMember.user.avatar_url,
          region: otherMember.region,
        },
      },
      messages: messages.reverse().map((msg) => ({
        message_id: msg.message_id,
        sender: {
          member_id: msg.sender.member_id,
          full_name: msg.sender.user.full_name,
          avatar_url: msg.sender.user.avatar_url,
        },
        receiver: {
          member_id: msg.receiver.member_id,
          full_name: msg.receiver.user.full_name,
          avatar_url: msg.receiver.user.avatar_url,
        },
        content: msg.content,
        is_read: msg.is_read,
        read_at: msg.read_at,
        sent_at: msg.sent_at,
        is_mine: msg.sender_id === member.member_id,
      })),
      pagination: {
        page,
        limit,
        total,
        total_pages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Send a message (create conversation if needed)
   */
  async sendMessage(userId: string, dto: SendMessageDto) {
    this.logger.log(`[sendMessage] userId=${userId}`);

    const member = await this.memberRepo.findOne({
      where: { user_id: userId },
      relations: ['user'],
    });
    if (!member) throw new NotFoundException('Member profile not found');

    let conversation: Conversation;

    // Case 1: Existing conversation
    if (dto.conversation_id) {
      const existingConv = await this.conversationRepo.findOne({
        where: { conversation_id: dto.conversation_id },
        relations: ['member_a', 'member_a.user', 'member_b', 'member_b.user'],
      });

      if (!existingConv) {
        throw new NotFoundException('Conversation not found');
      }

      conversation = existingConv;

      // Check if user is part of conversation
      if (
        conversation.member_a_id !== member.member_id &&
        conversation.member_b_id !== member.member_id
      ) {
        throw new ForbiddenException('You are not part of this conversation');
      }
    }
    // Case 2: Create new conversation from exchange request
    else if (dto.exchange_request_id) {
      // Check if conversation already exists
      const existingConversation = await this.conversationRepo.findOne({
        where: { exchange_request_id: dto.exchange_request_id },
        relations: ['member_a', 'member_a.user', 'member_b', 'member_b.user'],
      });

      if (existingConversation) {
        conversation = existingConversation;
      } else {
        // Create new conversation
        const request = await this.requestRepo.findOne({
          where: { request_id: dto.exchange_request_id },
          relations: ['requester', 'receiver'],
        });

        if (!request) {
          throw new NotFoundException('Exchange request not found');
        }

        // Check if user is part of request
        if (
          request.requester_id !== member.member_id &&
          request.receiver_id !== member.member_id
        ) {
          throw new ForbiddenException('You are not part of this exchange request');
        }

        // Request must be ACCEPTED to start conversation
        if (request.status !== ExchangeRequestStatus.ACCEPTED) {
          throw new BadRequestException(
            'Can only message after exchange request is accepted'
          );
        }

        const newConversation = this.conversationRepo.create({
          conversation_id: uuidv4(),
          exchange_request_id: dto.exchange_request_id,
          member_a_id: request.requester_id,
          member_b_id: request.receiver_id,
        });

        conversation = await this.conversationRepo.save(newConversation);

        // Load relations for response
        const savedConversation = await this.conversationRepo.findOne({
          where: { conversation_id: conversation.conversation_id },
          relations: ['member_a', 'member_a.user', 'member_b', 'member_b.user'],
        });

        if (!savedConversation) {
          throw new NotFoundException('Failed to load saved conversation');
        }

        conversation = savedConversation;
      }
    } else {
      throw new BadRequestException(
        'Must provide either conversation_id or exchange_request_id'
      );
    }

    // Determine receiver
    const receiverId =
      conversation.member_a_id === member.member_id
        ? conversation.member_b_id
        : conversation.member_a_id;

    const receiver =
      conversation.member_a_id === receiverId
        ? conversation.member_a
        : conversation.member_b;

    // Create message
    const message = this.messageRepo.create({
      message_id: uuidv4(),
      conversation_id: conversation.conversation_id,
      sender_id: member.member_id,
      receiver_id: receiverId,
      content: dto.content,
      sent_at: new Date(),
    });

    await this.messageRepo.save(message);

    // Update conversation
    conversation.total_messages += 1;
    conversation.last_message_at = new Date();
    await this.conversationRepo.save(conversation);

    return {
      message: {
        message_id: message.message_id,
        conversation_id: message.conversation_id,
        sender: {
          member_id: member.member_id,
          full_name: member.user.full_name,
          avatar_url: member.user.avatar_url,
        },
        receiver: {
          member_id: receiver.member_id,
          full_name: receiver.user.full_name,
          avatar_url: receiver.user.avatar_url,
        },
        content: message.content,
        is_read: message.is_read,
        sent_at: message.sent_at,
      },
      conversation_id: conversation.conversation_id,
    };
  }

  /**
   * Mark messages as read
   */
  async markMessagesAsRead(memberId: string, messageIds: string[]) {
    if (messageIds.length === 0) return { updated: 0 };

    const result = await this.messageRepo.update(
      {
        message_id: In(messageIds),
        receiver_id: memberId,
        is_read: false,
      },
      {
        is_read: true,
        read_at: new Date(),
      }
    );

    return { updated: result.affected || 0 };
  }

  /**
   * Mark all messages in conversation as read
   */
  async markConversationAsRead(userId: string, conversationId: string) {
    this.logger.log(`[markConversationAsRead] userId=${userId}, conversationId=${conversationId}`);

    const member = await this.memberRepo.findOne({ where: { user_id: userId } });
    if (!member) throw new NotFoundException('Member profile not found');

    const conversation = await this.conversationRepo.findOne({
      where: { conversation_id: conversationId },
    });

    if (!conversation) {
      throw new NotFoundException('Conversation not found');
    }

    // Check if user is part of conversation
    if (
      conversation.member_a_id !== member.member_id &&
      conversation.member_b_id !== member.member_id
    ) {
      throw new ForbiddenException('You are not part of this conversation');
    }

    const result = await this.messageRepo.update(
      {
        conversation_id: conversationId,
        receiver_id: member.member_id,
        is_read: false,
      },
      {
        is_read: true,
        read_at: new Date(),
      }
    );

    return { updated: result.affected || 0 };
  }

  /**
   * Get unread message count
   */
  async getUnreadCount(userId: string) {
    const member = await this.memberRepo.findOne({ where: { user_id: userId } });
    if (!member) throw new NotFoundException('Member profile not found');

    const count = await this.messageRepo.count({
      where: {
        receiver_id: member.member_id,
        is_read: false,
      },
    });

    return { unread_count: count };
  }
}