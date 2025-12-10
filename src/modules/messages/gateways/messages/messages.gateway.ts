// src/modules/messages/gateways/messages.gateway.ts
import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Member } from '../../../../infrastructure/database/entities/member.entity';
import { MessagesService } from '../../services/messages.service';
import { SendMessageDto } from '../../dto/send-message.dto';

@WebSocketGateway({
  cors: {
    origin: '*', // Configure this properly in production
    credentials: true,
  },
  namespace: '/messages',
})
export class MessagesGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(MessagesGateway.name);
  private onlineUsers = new Map<string, string>(); // memberId -> socketId

  constructor(
    private jwtService: JwtService,
    private messagesService: MessagesService,
    @InjectRepository(Member)
    private memberRepo: Repository<Member>,
  ) {}

  /**
   * Handle client connection
   */
  async handleConnection(client: Socket) {
    try {
      // Extract token from handshake
      const token = client.handshake.auth.token || client.handshake.headers.authorization?.split(' ')[1];

      if (!token) {
        this.logger.warn(`[handleConnection] No token provided`);
        client.disconnect();
        return;
      }

      // Verify JWT
      const payload = this.jwtService.verify(token);
      const userId = payload.sub || payload.userId;

      // Get member
      const member = await this.memberRepo.findOne({ where: { user_id: userId } });

      if (!member) {
        this.logger.warn(`[handleConnection] Member not found for userId=${userId}`);
        client.disconnect();
        return;
      }

      // Store connection
      client.data.memberId = member.member_id;
      client.data.userId = userId;
      this.onlineUsers.set(member.member_id, client.id);

      // Update online status in DB
      await this.memberRepo.update(
        { member_id: member.member_id },
        { is_online: true, last_seen_at: new Date() }
      );

      // Join user's room
      client.join(`user:${member.member_id}`);

      this.logger.log(
        `[handleConnection] Client connected: ${client.id}, memberId=${member.member_id}`,
      );

      // Notify user's contacts that they're online
      client.broadcast.emit('user:online', {
        member_id: member.member_id,
        timestamp: new Date()
      });

      // Send online users list to the connected user
      const onlineUserIds = Array.from(this.onlineUsers.keys());
      client.emit('users:online', { member_ids: onlineUserIds });
    } catch (error) {
      this.logger.error(`[handleConnection] Error: ${error.message}`);
      client.disconnect();
    }
  }

  /**
   * Handle client disconnection
   */
  async handleDisconnect(client: Socket) {
    const memberId = client.data.memberId;

    if (memberId) {
      this.onlineUsers.delete(memberId);
      
      // Update online status in DB
      await this.memberRepo.update(
        { member_id: memberId },
        { is_online: false, last_seen_at: new Date() }
      );
      
      client.broadcast.emit('user:offline', { 
        member_id: memberId,
        last_seen_at: new Date()
      });
      
      this.logger.log(`[handleDisconnect] Client disconnected: ${client.id}, memberId=${memberId}`);
    }
  }

  /**
   * Send message via WebSocket
   */
  @SubscribeMessage('message:send')
  async handleSendMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() dto: SendMessageDto,
  ) {
    try {
      const userId = client.data.userId;
      const memberId = client.data.memberId;

      if (!userId || !memberId) {
        return { error: 'Unauthorized' };
      }

      // Send message using service
      const result = await this.messagesService.sendMessage(userId, dto);

      // Emit to sender
      client.emit('message:sent', result);

      // Emit to receiver if online
      const receiverId = result.message.receiver.member_id;
      this.server.to(`user:${receiverId}`).emit('message:new', result);

      return result;
    } catch (error) {
      this.logger.error(`[handleSendMessage] Error: ${error.message}`);
      return { error: error.message };
    }
  }

  /**
   * Typing indicator
   */
  @SubscribeMessage('typing:start')
  handleTypingStart(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { conversation_id: string; receiver_id: string },
  ) {
    const memberId = client.data.memberId;

    if (memberId) {
      this.server.to(`user:${data.receiver_id}`).emit('typing:start', {
        conversation_id: data.conversation_id,
        member_id: memberId,
      });
    }
  }

  @SubscribeMessage('typing:stop')
  handleTypingStop(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { conversation_id: string; receiver_id: string },
  ) {
    const memberId = client.data.memberId;

    if (memberId) {
      this.server.to(`user:${data.receiver_id}`).emit('typing:stop', {
        conversation_id: data.conversation_id,
        member_id: memberId,
      });
    }
  }

  /**
   * Mark message as read
   */
  @SubscribeMessage('message:read')
  async handleMarkRead(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { message_ids: string[]; sender_id: string },
  ) {
    try {
      const memberId = client.data.memberId;

      if (!memberId) {
        return { error: 'Unauthorized' };
      }

      const result = await this.messagesService.markMessagesAsRead(memberId, data.message_ids);

      // Notify sender that messages were read
      if (data.sender_id) {
        this.server.to(`user:${data.sender_id}`).emit('message:status', {
          message_ids: data.message_ids,
          status: 'read',
          read_at: new Date()
        });
      }

      return result;
    } catch (error) {
      this.logger.error(`[handleMarkRead] Error: ${error.message}`);
      return { error: error.message };
    }
  }

  /**
   * Emit message delivered event
   */
  emitMessageDelivered(receiverId: string, messageId: string, senderId: string) {
    this.server.to(`user:${senderId}`).emit('message:status', {
      message_ids: [messageId],
      status: 'delivered',
      delivered_at: new Date()
    });
  }

  /**
   * Check if user is online
   */
  isUserOnline(memberId: string): boolean {
    return this.onlineUsers.has(memberId);
  }

  /**
   * Get online users count
   */
  getOnlineUsersCount(): number {
    return this.onlineUsers.size;
  }

  /**
   * Emit new message to receiver (called from HTTP controller)
   */
  emitNewMessage(receiverId: string, messageData: any) {
    this.logger.log(`[emitNewMessage] Emitting to user:${receiverId}`);
    this.server.to(`user:${receiverId}`).emit('message:new', messageData);
  }
}