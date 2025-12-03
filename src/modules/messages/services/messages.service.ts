// src/modules/messages/services/messages.service.ts
import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In, Like } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { Conversation } from '../../../infrastructure/database/entities/conversation.entity';
import { Message } from '../../../infrastructure/database/entities/message.entity';
import { MessageReaction } from '../../../infrastructure/database/entities/message-reaction.entity';
import { Member } from '../../../infrastructure/database/entities/member.entity';
import { ExchangeRequest, ExchangeRequestStatus } from '../../../infrastructure/database/entities/exchange-request.entity';
import { SendMessageDto } from '../dto/send-message.dto';
import { SearchMessagesDto } from '../dto/search-messages.dto';
import { AddReactionDto } from '../dto/reaction.dto';

@Injectable()
export class MessagesService {
  private readonly logger = new Logger(MessagesService.name);

  constructor(
    @InjectRepository(Conversation)
    private conversationRepo: Repository<Conversation>,

    @InjectRepository(Message)
    private messageRepo: Repository<Message>,

    @InjectRepository(MessageReaction)
    private reactionRepo: Repository<MessageReaction>,

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
      relations: [
        'member_a', 
        'member_a.user', 
        'member_b', 
        'member_b.user', 
        'exchange_request',
        'exchange_request.requester',
        'exchange_request.requester.user',
        'exchange_request.receiver',
        'exchange_request.receiver.user'
      ],
      order: { last_message_at: 'DESC', created_at: 'DESC' },
      skip,
      take: limit,
    });

    // Get unread count and last message for each conversation
    const conversationsWithUnread = await Promise.all(
      conversations.map(async (conv) => {
        const unreadCount = await this.messageRepo.count({
          where: {
            conversation_id: conv.conversation_id,
            receiver_id: member.member_id,
            is_read: false,
            deleted_at: undefined, // Exclude deleted messages
          },
        });

        // Get the last message for this conversation
        const lastMessage = await this.messageRepo.findOne({
          where: {
            conversation_id: conv.conversation_id,
            deleted_at: undefined,
          },
          order: { sent_at: 'DESC' },
          relations: ['sender', 'sender.user'],
        });

        const otherMember =
          conv.member_a_id === member.member_id ? conv.member_b : conv.member_a;

        return {
          conversation_id: conv.conversation_id,
          exchange_request_id: conv.exchange_request_id,
          exchange_request: conv.exchange_request ? {
            request_id: conv.exchange_request.request_id,
            status: conv.exchange_request.status,
            message: conv.exchange_request.message,
            created_at: conv.exchange_request.created_at,
            responded_at: conv.exchange_request.responded_at,
            requester: conv.exchange_request.requester ? {
              member_id: conv.exchange_request.requester.member_id,
              full_name: conv.exchange_request.requester.user?.full_name,
            } : null,
            receiver: conv.exchange_request.receiver ? {
              member_id: conv.exchange_request.receiver.member_id,
              full_name: conv.exchange_request.receiver.user?.full_name,
            } : null,
          } : null,
          other_member: {
            member_id: otherMember.member_id,
            full_name: otherMember.user.full_name,
            avatar_url: otherMember.user.avatar_url,
            region: otherMember.region,
            trust_score: parseFloat(otherMember.trust_score.toString()),
            is_verified: otherMember.is_verified,
            is_online: otherMember.is_online || false,
            last_seen_at: otherMember.last_seen_at,
          },
          last_message: lastMessage ? {
            message_id: lastMessage.message_id,
            content: lastMessage.content,
            sent_at: lastMessage.sent_at,
            is_read: lastMessage.is_read,
            sender_name: lastMessage.sender?.user?.full_name,
            is_mine: lastMessage.sender_id === member.member_id,
          } : null,
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
   * Create or get existing direct conversation between 2 users
   */
  async createDirectConversation(currentUserId: string, receiverUserId: string) {
    this.logger.log(`[createDirectConversation] current=${currentUserId}, receiver=${receiverUserId}`);

    // Validate not chatting with yourself
    if (currentUserId === receiverUserId) {
      throw new BadRequestException('Cannot create conversation with yourself');
    }

    // Get current user's member profile
    const currentMember = await this.memberRepo.findOne({
      where: { user_id: currentUserId },
      relations: ['user'],
    });
    if (!currentMember) throw new NotFoundException('Your member profile not found');

    // Get receiver's member profile
    const receiverMember = await this.memberRepo.findOne({
      where: { user_id: receiverUserId },
      relations: ['user'],
    });
    if (!receiverMember) throw new NotFoundException('Receiver user not found');

    // Check if conversation already exists (bidirectional)
    const existingConversation = await this.conversationRepo
      .createQueryBuilder('conv')
      .where(
        '(conv.member_a_id = :currentId AND conv.member_b_id = :receiverId) OR (conv.member_a_id = :receiverId AND conv.member_b_id = :currentId)',
        { currentId: currentMember.member_id, receiverId: receiverMember.member_id }
      )
      .andWhere('conv.exchange_request_id IS NULL') // Only direct conversations
      .leftJoinAndSelect('conv.member_a', 'member_a')
      .leftJoinAndSelect('conv.member_b', 'member_b')
      .leftJoinAndSelect('member_a.user', 'user_a')
      .leftJoinAndSelect('member_b.user', 'user_b')
      .getOne();

    if (existingConversation) {
      this.logger.log(`[createDirectConversation] Found existing conversation: ${existingConversation.conversation_id}`);
      
      const otherMember =
        existingConversation.member_a_id === currentMember.member_id
          ? existingConversation.member_b
          : existingConversation.member_a;

      return {
        conversation_id: existingConversation.conversation_id,
        is_new: false,
        other_member: {
          member_id: otherMember.member_id,
          user_id: otherMember.user.user_id,
          full_name: otherMember.user.full_name,
          avatar_url: otherMember.user.avatar_url,
          region: otherMember.region,
          trust_score: parseFloat(otherMember.trust_score.toString()),
        },
      };
    }

    // Create new direct conversation
    const newConversation = this.conversationRepo.create({
      conversation_id: uuidv4(),
      member_a_id: currentMember.member_id,
      member_b_id: receiverMember.member_id,
      exchange_request_id: null, // Direct conversation (no exchange request)
    });

    const savedConversation = await this.conversationRepo.save(newConversation) as Conversation;

    this.logger.log(`[createDirectConversation] Created new conversation: ${savedConversation.conversation_id}`);

    return {
      conversation_id: savedConversation.conversation_id,
      is_new: true,
      other_member: {
        member_id: receiverMember.member_id,
        user_id: receiverMember.user.user_id,
        full_name: receiverMember.user.full_name,
        avatar_url: receiverMember.user.avatar_url,
        region: receiverMember.region,
        trust_score: parseFloat(receiverMember.trust_score.toString()),
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

    // Use query builder to avoid collation issues
    const conversation = await this.conversationRepo
      .createQueryBuilder('conv')
      .leftJoinAndSelect('conv.member_a', 'member_a')
      .leftJoinAndSelect('member_a.user', 'member_a_user')
      .leftJoinAndSelect('conv.member_b', 'member_b')
      .leftJoinAndSelect('member_b.user', 'member_b_user')
      .where('conv.conversation_id = :conversationId COLLATE utf8mb4_unicode_ci', { conversationId })
      .getOne();

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

    // Use query builder to handle collation issues
    const queryBuilder = this.messageRepo
      .createQueryBuilder('msg')
      .leftJoinAndSelect('msg.sender', 'sender')
      .leftJoinAndSelect('sender.user', 'sender_user')
      .leftJoinAndSelect('msg.receiver', 'receiver')
      .leftJoinAndSelect('receiver.user', 'receiver_user')
      .leftJoinAndSelect('msg.reactions', 'reactions')
      .leftJoinAndSelect('reactions.member', 'reaction_member')
      .where('msg.conversation_id = :conversationId COLLATE utf8mb4_unicode_ci', { conversationId })
      .andWhere('msg.deleted_at IS NULL')
      .orderBy('msg.sent_at', 'DESC')
      .skip(skip)
      .take(limit);

    const [messages, total] = await queryBuilder.getManyAndCount();

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
          is_online: otherMember.is_online || false,
          last_seen_at: otherMember.last_seen_at,
        },
      },
      messages: messages.reverse().map((msg) => this.formatMessage(msg, member.member_id)),
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
      attachment_url: dto.attachment_url,
      attachment_type: dto.attachment_type,
      attachment_name: dto.attachment_name,
      attachment_size: dto.attachment_size,
      sent_at: new Date(),
      status: 'sent', // Initial status
    });

    await this.messageRepo.save(message);

    // Check if receiver is online - if yes, mark as delivered
    if (receiver.is_online) {
      message.status = 'delivered';
      message.delivered_at = new Date();
      await this.messageRepo.save(message);
    }

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
        attachment_url: message.attachment_url,
        attachment_type: message.attachment_type,
        attachment_name: message.attachment_name,
        attachment_size: message.attachment_size,
        is_read: message.is_read,
        status: message.status,
        sent_at: message.sent_at,
        delivered_at: message.delivered_at,
        read_at: message.read_at,
        reactions: [],
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
        status: 'read',
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
        deleted_at: undefined, // Exclude deleted messages
      },
    });

    return { unread_count: count };
  }

  /**
   * Search messages in a conversation
   */
  async searchMessages(userId: string, query: SearchMessagesDto) {
    this.logger.log(`[searchMessages] userId=${userId}, q=${query.q}`);

    const member = await this.memberRepo.findOne({ where: { user_id: userId } });
    if (!member) throw new NotFoundException('Member profile not found');

    // Validate user has access to conversation
    const conversation = await this.conversationRepo.findOne({
      where: { conversation_id: query.conversation_id },
    });

    if (!conversation) {
      throw new NotFoundException('Conversation not found');
    }

    // Check authorization
    if (
      conversation.member_a_id !== member.member_id &&
      conversation.member_b_id !== member.member_id
    ) {
      throw new ForbiddenException('You are not part of this conversation');
    }

    const skip = (query.page! - 1) * query.limit!;

    // Use query builder to handle collation issues
    const queryBuilder = this.messageRepo
      .createQueryBuilder('msg')
      .leftJoinAndSelect('msg.sender', 'sender')
      .leftJoinAndSelect('sender.user', 'sender_user')
      .leftJoinAndSelect('msg.receiver', 'receiver')
      .leftJoinAndSelect('receiver.user', 'receiver_user')
      .leftJoinAndSelect('msg.reactions', 'reactions')
      .leftJoinAndSelect('reactions.member', 'reaction_member')
      .where('msg.conversation_id = :conversationId COLLATE utf8mb4_unicode_ci', { conversationId: query.conversation_id })
      .andWhere('msg.content LIKE :searchTerm COLLATE utf8mb4_unicode_ci', { searchTerm: `%${query.q}%` })
      .andWhere('msg.deleted_at IS NULL')
      .orderBy('msg.sent_at', 'DESC')
      .skip(skip)
      .take(query.limit!);

    const [messages, total] = await queryBuilder.getManyAndCount();

    return {
      messages: messages.reverse().map((msg) => this.formatMessage(msg, member.member_id)),
      pagination: {
        page: query.page!,
        limit: query.limit!,
        total,
        total_pages: Math.ceil(total / query.limit!),
      },
    };
  }

  /**
   * Delete a message (soft delete - only own messages, within 1 hour)
   */
  async deleteMessage(userId: string, messageId: string) {
    this.logger.log(`[deleteMessage] userId=${userId}, messageId=${messageId}`);

    const member = await this.memberRepo.findOne({ where: { user_id: userId } });
    if (!member) throw new NotFoundException('Member profile not found');

    const message = await this.messageRepo.findOne({
      where: { message_id: messageId },
    });

    if (!message) {
      throw new NotFoundException('Message not found');
    }

    // Only sender can delete their own message
    if (message.sender_id !== member.member_id) {
      throw new ForbiddenException('Can only delete your own messages');
    }

    // Check if message is already deleted
    if (message.deleted_at) {
      throw new BadRequestException('Message is already deleted');
    }

    // Check if message is older than 1 hour
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    if (message.sent_at < oneHourAgo) {
      throw new BadRequestException('Can only delete messages within 1 hour of sending');
    }

    // Soft delete
    message.deleted_at = new Date();
    await this.messageRepo.save(message);

    this.logger.log(`[deleteMessage] SUCCESS messageId=${messageId}`);
    return { success: true, message_id: messageId };
  }

  /**
   * Add emoji reaction to a message
   */
  async addReaction(userId: string, messageId: string, dto: AddReactionDto) {
    this.logger.log(`[addReaction] userId=${userId}, messageId=${messageId}, emoji=${dto.emoji}`);

    const member = await this.memberRepo.findOne({ where: { user_id: userId } });
    if (!member) throw new NotFoundException('Member profile not found');

    // Verify message exists and not deleted
    const message = await this.messageRepo.findOne({
      where: { message_id: messageId },
    });

    if (!message) {
      throw new NotFoundException('Message not found');
    }

    if (message.deleted_at) {
      throw new BadRequestException('Cannot react to deleted message');
    }

    // Verify user has access to the conversation
    const conversation = await this.conversationRepo.findOne({
      where: { conversation_id: message.conversation_id },
    });

    if (!conversation) {
      throw new NotFoundException('Conversation not found');
    }

    if (
      conversation.member_a_id !== member.member_id &&
      conversation.member_b_id !== member.member_id
    ) {
      throw new ForbiddenException('You are not part of this conversation');
    }

    // Check if user already reacted with this emoji
    const existingReaction = await this.reactionRepo.findOne({
      where: {
        message_id: messageId,
        member_id: member.member_id,
        emoji: dto.emoji,
      },
    });

    if (existingReaction) {
      // Toggle off: delete the reaction
      await this.reactionRepo.remove(existingReaction);
      this.logger.log(`[addReaction] Removed reaction for user`);
      return { success: true, action: 'removed', reaction_id: existingReaction.reaction_id };
    }

    // Add new reaction
    const reaction = this.reactionRepo.create({
      reaction_id: uuidv4(),
      message_id: messageId,
      member_id: member.member_id,
      emoji: dto.emoji,
    });

    const saved = await this.reactionRepo.save(reaction);
    this.logger.log(`[addReaction] Added reaction for user`);

    return {
      success: true,
      action: 'added',
      reaction: {
        reaction_id: saved.reaction_id,
        message_id: saved.message_id,
        member_id: saved.member_id,
        emoji: saved.emoji,
        created_at: saved.created_at,
      },
    };
  }

  /**
   * Remove emoji reaction from a message
   */
  async removeReaction(userId: string, reactionId: string) {
    this.logger.log(`[removeReaction] userId=${userId}, reactionId=${reactionId}`);

    const member = await this.memberRepo.findOne({ where: { user_id: userId } });
    if (!member) throw new NotFoundException('Member profile not found');

    const reaction = await this.reactionRepo.findOne({
      where: { reaction_id: reactionId },
    });

    if (!reaction) {
      throw new NotFoundException('Reaction not found');
    }

    // Only the user who added the reaction can remove it
    if (reaction.member_id !== member.member_id) {
      throw new ForbiddenException('Can only remove your own reactions');
    }

    await this.reactionRepo.remove(reaction);
    this.logger.log(`[removeReaction] SUCCESS reactionId=${reactionId}`);

    return { success: true, reaction_id: reactionId };
  }

  /**
   * Get reactions summary for a message
   */
  async getMessageReactions(messageId: string, currentMemberId: string) {
    const reactions = await this.reactionRepo.find({
      where: { message_id: messageId },
      relations: ['member'],
    });

    // Group by emoji
    const grouped: { [emoji: string]: { count: number; members: string[]; userReacted: boolean } } = {};

    reactions.forEach((reaction) => {
      if (!grouped[reaction.emoji]) {
        grouped[reaction.emoji] = { count: 0, members: [], userReacted: false };
      }
      grouped[reaction.emoji].count++;
      grouped[reaction.emoji].members.push(reaction.member_id);
      if (reaction.member_id === currentMemberId) {
        grouped[reaction.emoji].userReacted = true;
      }
    });

    return Object.entries(grouped).map(([emoji, data]) => ({
      emoji,
      count: data.count,
      members: data.members,
      current_user_reacted: data.userReacted,
    }));
  }

  /**
   * Helper: Format message for response
   */
  private formatMessage(msg: Message, currentMemberId: string) {
    return {
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
      attachment_url: msg.attachment_url,
      attachment_type: msg.attachment_type,
      attachment_name: msg.attachment_name,
      attachment_size: msg.attachment_size,
      is_read: msg.is_read,
      read_at: msg.read_at,
      status: msg.status,
      delivered_at: msg.delivered_at,
      sent_at: msg.sent_at,
      is_mine: msg.sender_id === currentMemberId,
      deleted_at: msg.deleted_at,
      reactions: msg.reactions
        ? msg.reactions.reduce(
            (acc, reaction) => {
              const existing = acc.find((r) => r.emoji === reaction.emoji);
              if (existing) {
                existing.count++;
                existing.members.push(reaction.member_id);
                if (reaction.member_id === currentMemberId) {
                  existing.current_user_reacted = true;
                }
              } else {
                acc.push({
                  emoji: reaction.emoji,
                  count: 1,
                  members: [reaction.member_id],
                  current_user_reacted: reaction.member_id === currentMemberId,
                });
              }
              return acc;
            },
            [] as Array<{ emoji: string; count: number; members: string[]; current_user_reacted: boolean }>
          )
        : [],
    };
  }
}