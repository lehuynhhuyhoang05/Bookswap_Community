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
   * ============================================
   * HANDLER: handleConnection
   * ============================================
   * Tự động gọi khi client WebSocket kết nối
   * 
   * CHỨC NĂNG:
   * 1. Xác thực JWT token từ handshake
   * 2. Query member profile từ DB
   * 3. Lưu session info vào client.data
   * 4. Update is_online = true trong DB
   * 5. Join vào room cá nhân (user:member-id)
   * 6. Broadcast online status cho tất cả users khác
   * 7. Gửi danh sách online users cho client mới
   * 
   * TRƯỜNG HỢP TỪ CHỐI:
   * - Không có token
   * - Token invalid/expired
   * - Member không tồn tại trong DB
   * ============================================
   */
  async handleConnection(client: Socket) {
    try {
      // ===== BƯỚC 1: EXTRACT JWT TOKEN =====
      // Lấy token từ 2 vị trí có thể:
      // - client.handshake.auth.token (socket.io-client gửi qua auth option)
      // - client.handshake.headers.authorization (gửi qua header như REST API)
      const token = client.handshake.auth.token || client.handshake.headers.authorization?.split(' ')[1];

      if (!token) {
        // Không có token → Từ chối kết nối ngay
        this.logger.warn(`[handleConnection] No token provided`);
        client.disconnect();
        return;
      }

      // ===== BƯỚC 2: VERIFY JWT TOKEN =====
      // Kiểm tra token có hợp lệ không (chữ ký, expiry time)
      // Nếu token sai/hết hạn → jwtService.verify() sẽ throw Error
      const payload = this.jwtService.verify(token);
      const userId = payload.sub || payload.userId;  // Extract user ID từ payload

      // ===== BƯỚC 3: QUERY MEMBER PROFILE TỪ DATABASE =====
      // Lấy thông tin member (member_id, region, trust_score...)
      // Cần để xác nhận user tồn tại và lấy member_id
      const member = await this.memberRepo.findOne({ where: { user_id: userId } });

      if (!member) {
        // User không có member profile → Từ chối (có thể chưa complete registration)
        this.logger.warn(`[handleConnection] Member not found for userId=${userId}`);
        client.disconnect();
        return;
      }

      // ===== BƯỚC 4: LƯU SESSION INFO VÀO CLIENT.DATA =====
      // Socket.IO cho phép lưu data vào client.data (giống session)
      // Giúp các handlers khác (handleSendMessage, handleTyping...) 
      // truy cập memberId/userId mà không cần query lại DB
      client.data.memberId = member.member_id;  // VD: "member-abc-123"
      client.data.userId = userId;              // VD: "user-xyz-456"
      
      // Lưu vào Map để tracking online users
      // Key: memberId, Value: socketId
      // Dùng để emit tin nhắn: server.to(socketId).emit(...)
      this.onlineUsers.set(member.member_id, client.id);

      // ===== BƯỚC 5: UPDATE DATABASE - ĐÁNH DẤU ONLINE =====
      // Update bảng members:
      // - is_online = true  → User đang online
      // - last_seen_at = now → Thời gian kết nối gần nhất
      await this.memberRepo.update(
        { member_id: member.member_id },
        { is_online: true, last_seen_at: new Date() }
      );

      // ===== BƯỚC 6: JOIN VÀO ROOM CÁ NHÂN =====
      // Room giống như "channel" trong chat
      // Mỗi user có 1 room riêng: "user:member-abc-123"
      // Khi gửi tin nhắn → emit vào room của receiver:
      // server.to('user:member-abc-123').emit('message:new', data)
      // → Chỉ người trong room mới nhận được (bảo mật)
      client.join(`user:${member.member_id}`);

      this.logger.log(
        `[handleConnection] Client connected: ${client.id}, memberId=${member.member_id}`,
      );

      // ===== BƯỚC 7: BROADCAST ONLINE STATUS =====
      // Thông báo cho TẤT CẢ CLIENTS KHÁC rằng user này vừa online
      // client.broadcast.emit() = gửi cho tất cả trừ chính client này
      // Các clients khác sẽ nhận event 'user:online' → Update UI hiện "● Online"
      client.broadcast.emit('user:online', {
        member_id: member.member_id,
        timestamp: new Date()
      });

      // ===== BƯỚC 8: GỬI DANH SÁCH ONLINE USERS CHO CLIENT MỚI =====
      // Client vừa kết nối cần biết ai đang online
      // Lấy tất cả keys trong onlineUsers Map → Array of memberIds
      const onlineUserIds = Array.from(this.onlineUsers.keys());
      client.emit('users:online', { member_ids: onlineUserIds });
      
    } catch (error) {
      // ❌ XẢY RA LỖI (VD: JWT invalid, DB query fail) → NGẮT KẾT NỐI
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
   * ============================================
   * EVENT HANDLER: message:send
   * ============================================
   * Xử lý khi client gửi tin nhắn qua WebSocket
   * 
   * FLOW:
   * 1. Lấy userId/memberId từ client.data (đã set trong handleConnection)
   * 2. Gọi MessagesService.sendMessage() để lưu DB
   * 3. Emit 'message:sent' cho người gửi (confirmation - hiện ✓)
   * 4. Emit 'message:new' vào room của người nhận (real-time delivery)
   * 
   * LƯU Ý:
   * - Tin nhắn được persist vào DB TRƯỚC KHI emit (tránh mất data)
   * - Nếu receiver offline → Tin nhắn vẫn lưu DB, khi online sẽ load
   * - Gateway chỉ lo networking, business logic ở Service
   * ============================================
   */
  @SubscribeMessage('message:send')
  async handleSendMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() dto: SendMessageDto,  // { receiver_id, content, conversation_id? }
  ) {
    try {
      // ===== BƯỚC 1: LẤY THÔNG TIN NGƯỜI GỬI =====
      // client.data đã được set trong handleConnection
      // Chứa userId và memberId của người đang gửi tin nhắn
      const userId = client.data.userId;       // VD: "user-xyz-456"
      const memberId = client.data.memberId;   // VD: "member-abc-123"

      if (!userId || !memberId) {
        // ❌ CLIENT CHƯA AUTHENTICATE → TỪ CHỐI
        // Không nên xảy ra nếu handleConnection đã verify token
        return { error: 'Unauthorized' };
      }

      // ===== BƯỚC 2: LƯU TIN NHẮN VÀO DATABASE =====
      // Gọi MessagesService.sendMessage() để:
      // - Tìm/tạo Conversation giữa 2 users
      // - Tạo Message record trong DB
      // - Update conversation.last_message_at
      // → Tin nhắn được persist ngay, không mất nếu server crash
      const result = await this.messagesService.sendMessage(userId, dto);
      // result = { message: {...}, conversation: {...} }

      // ===== BƯỚC 3: GỬI CONFIRMATION CHO NGƯỜI GỬI =====
      // Emit event 'message:sent' CHỈ cho client đang gửi
      // client.emit() chỉ gửi cho 1 client cụ thể
      // Mục đích: Báo cho người gửi biết tin nhắn đã được lưu thành công
      // Frontend sẽ hiện "✓" (single check mark) khi nhận event này
      client.emit('message:sent', result);

      // ===== BƯỚC 4: GỬI REAL-TIME CHO NGƯỜI NHẬN =====
      // Lấy memberId của người nhận từ result
      const receiverId = result.message.receiver.member_id;
      
      // Emit event 'message:new' vào ROOM của người nhận
      // this.server.to('user:member-xyz') → Gửi cho tất cả sockets trong room đó
      // (Thường chỉ có 1 socket, trừ khi user mở nhiều tabs)
      // 
      // ⚠️ NẾU RECEIVER OFFLINE:
      // - Tin nhắn không mất, đã lưu DB rồi
      // - Khi receiver online lại → Load từ DB qua getMessages()
      // - Có thể thêm Push Notification (Firebase/OneSignal) ở đây
      this.server.to(`user:${receiverId}`).emit('message:new', result);

      // ===== BƯỚC 5: RETURN RESULT CHO CLIENT =====
      // Socket.IO cho phép return value, client có thể await
      // VD: const result = await socket.emitWithAck('message:send', data);
      return result;
      
    } catch (error) {
      // ❌ XẢY RA LỖI (VD: Receiver không tồn tại, DB connection fail)
      this.logger.error(`[handleSendMessage] Error: ${error.message}`);
      return { error: error.message };  // Trả lỗi cho client
    }
  }

  /**
   * ============================================
   * EVENT HANDLER: typing:start
   * ============================================
   * Hiển thị trạng thái "Đang gõ..." khi user đang soạn tin nhắn
   * 
   * KHÔNG LƯU DB vì chỉ là trạng thái tạm thời
   * 
   * FLOW:
   * - Frontend emit khi user gõ vào input (onChange event)
   * - Gateway forward event vào room của receiver
   * - Receiver thấy "Đang gõ..." indicator
   * - Tự động tắt sau 3s không gõ (logic ở frontend)
   * ============================================
   */
  @SubscribeMessage('typing:start')
  handleTypingStart(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { conversation_id: string; receiver_id: string },
  ) {
    // Lấy memberId của người đang gõ từ client.data
    const memberId = client.data.memberId;

    if (memberId) {
      // Emit event 'typing:start' vào room của người nhận
      // CHỈ người nhận thấy, không broadcast cho tất cả (tối ưu bandwidth)
      // Payload gồm:
      // - conversation_id: Hộp thoại nào đang có người gõ
      // - member_id: Ai đang gõ (để frontend biết hiển thị tên)
      this.server.to(`user:${data.receiver_id}`).emit('typing:start', {
        conversation_id: data.conversation_id,
        member_id: memberId,  // Để frontend biết ai đang gõ
      });
    }
  }

  /**
   * ============================================
   * EVENT HANDLER: typing:stop
   * ============================================
   * Tắt indicator "Đang gõ..."
   * 
   * GỌI KHI:
   * - User dừng gõ > 3 giây (timeout ở frontend)
   * - User gửi tin nhắn (đã hoàn thành gõ)
   * - User rời khỏi conversation (unmount component)
   * ============================================
   */
  @SubscribeMessage('typing:stop')
  handleTypingStop(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { conversation_id: string; receiver_id: string },
  ) {
    const memberId = client.data.memberId;

    if (memberId) {
      // Emit 'typing:stop' để tắt indicator "Đang gõ..."
      this.server.to(`user:${data.receiver_id}`).emit('typing:stop', {
        conversation_id: data.conversation_id,
        member_id: memberId,
      });
    }
  }

  /**
   * ============================================
   * EVENT HANDLER: message:read
   * ============================================
   * Đánh dấu tin nhắn đã đọc và thông báo cho người gửi
   * 
   * FLOW:
   * 1. Update DB: is_read = true, read_at = NOW()
   * 2. Emit 'message:status' cho sender → Hiển thị ✓✓ xanh
   * 
   * KHI NÀO GỌI:
   * - User mở conversation → Mark tất cả unread messages
   * - Message xuất hiện trên màn hình → Mark individual message
   * 
   * TƯƠNG TỰ WHATSAPP:
   * ✓ (sent) → ✓✓ (delivered) → ✓✓ xanh (read)
   * ============================================
   */
  @SubscribeMessage('message:read')
  async handleMarkRead(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { message_ids: string[]; sender_id: string },
  ) {
    try {
      // Lấy memberId của người đọc tin nhắn
      const memberId = client.data.memberId;

      if (!memberId) {
        // ❌ CHƯA AUTHENTICATE → TỪ CHỐI
        return { error: 'Unauthorized' };
      }

      // ===== BƯỚC 1: UPDATE DATABASE - ĐÁNH DẤU is_read = true =====
      // Gọi service để update messages table:
      // UPDATE messages SET is_read = true, read_at = NOW()
      // WHERE message_id IN (message_ids) AND receiver_id = memberId
      // → Chỉ update tin nhắn mà user này là receiver (bảo mật)
      const result = await this.messagesService.markMessagesAsRead(memberId, data.message_ids);

      // ===== BƯỚC 2: NOTIFY SENDER VỀ READ STATUS =====
      // Thông báo cho người gửi biết tin nhắn đã được đọc
      // Emit vào room của sender để update UI (hiển thị ✓✓ xanh)
      if (data.sender_id) {
        this.server.to(`user:${data.sender_id}`).emit('message:status', {
          message_ids: data.message_ids,  // Array of message IDs đã đọc
          status: 'read',                 // Status: 'sent' | 'delivered' | 'read'
          read_at: new Date()             // Thời gian đọc
        });
      }

      return result;  // Return success response cho client
      
    } catch (error) {
      this.logger.error(`[handleMarkRead] Error: ${error.message}`);
      return { error: error.message };
    }
  }

  /**
   * ============================================
   * HELPER METHOD: emitMessageDelivered
   * ============================================
   * Gửi thông báo "delivered" cho người gửi
   * (Khi tin nhắn đã được gửi đến receiver's device)
   * 
   * Hiện tại chưa dùng - có thể implement sau
   * ============================================
   */
  emitMessageDelivered(receiverId: string, messageId: string, senderId: string) {
    this.server.to(`user:${senderId}`).emit('message:status', {
      message_ids: [messageId],
      status: 'delivered',  // ✓✓ (2 check marks xám)
      delivered_at: new Date()
    });
  }

  /**
   * ============================================
   * HELPER METHOD: isUserOnline
   * ============================================
   * Kiểm tra user có đang online không
   * 
   * SỬ DỤNG:
   * - Trước khi gửi tin nhắn → Biết có real-time delivery không
   * - Hiển thị status "● Online" trong UI
   * - Quyết định có cần push notification không
   * ============================================
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