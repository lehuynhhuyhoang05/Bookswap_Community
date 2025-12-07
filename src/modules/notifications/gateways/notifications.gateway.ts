import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

/**
 * WebSocket Gateway for Real-time Notifications
 * 
 * Namespace: /notifications
 * Events:
 * - new_notification: Emitted when a new notification is created
 * - notification_read: Emitted when a notification is marked as read
 * - notification_deleted: Emitted when a notification is deleted
 */
@WebSocketGateway({
  namespace: 'notifications',
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
  },
})
export class NotificationsGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(NotificationsGateway.name);
  private userSockets: Map<string, Set<string>> = new Map(); // userId -> Set<socketId>

  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  afterInit(server: Server) {
    this.logger.log('🔌 NotificationsGateway initialized');
  }

  async handleConnection(client: Socket) {
    try {
      // Extract token from handshake auth
      const token = client.handshake.auth.token;

      if (!token) {
        throw new UnauthorizedException('No token provided');
      }

      // Verify JWT token
      const payload = this.jwtService.verify(token, {
        secret: this.configService.get<string>('JWT_SECRET'),
      });

      const userId = payload.user_id;

      // Store socket connection
      if (!this.userSockets.has(userId)) {
        this.userSockets.set(userId, new Set());
      }
      this.userSockets.get(userId)!.add(client.id);

      // Store userId in socket data for later use
      client.data.userId = userId;

      this.logger.log(
        `✅ Client connected: ${client.id} (User: ${userId}, Total connections: ${this.userSockets.get(userId)?.size || 0})`,
      );

      // Join user to their personal room
      client.join(`user:${userId}`);

      // Send connection success event
      client.emit('connected', {
        message: 'Successfully connected to notifications',
        userId,
      });
    } catch (error) {
      this.logger.error(`❌ Connection failed: ${error.message}`);
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    const userId = client.data.userId;

    if (userId && this.userSockets.has(userId)) {
      this.userSockets.get(userId)!.delete(client.id);

      if (this.userSockets.get(userId)!.size === 0) {
        this.userSockets.delete(userId);
      }

      this.logger.log(
        `❌ Client disconnected: ${client.id} (User: ${userId})`,
      );
    }
  }

  /**
   * Emit new notification to specific user
   */
  emitToUser(userId: string, event: string, data: any) {
    this.server.to(`user:${userId}`).emit(event, data);
    this.logger.log(`📨 Emitted '${event}' to user ${userId}`);
  }

  /**
   * Send new notification event
   */
  sendNewNotification(userId: string, notification: any) {
    this.emitToUser(userId, 'new_notification', notification);
  }

  /**
   * Send notification read event
   */
  sendNotificationRead(userId: string, notificationId: string) {
    this.emitToUser(userId, 'notification_read', { notificationId });
  }

  /**
   * Send notification deleted event
   */
  sendNotificationDeleted(userId: string, notificationId: string) {
    this.emitToUser(userId, 'notification_deleted', { notificationId });
  }

  /**
   * Send unread count update
   */
  sendUnreadCountUpdate(userId: string, count: number) {
    this.emitToUser(userId, 'unread_count_update', { count });
  }

  /**
   * Get online status
   */
  isUserOnline(userId: string): boolean {
    return this.userSockets.has(userId) && (this.userSockets.get(userId)?.size || 0) > 0;
  }

  /**
   * Get total connected clients
   */
  getConnectedCount(): number {
    return this.userSockets.size;
  }
}
