import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Notification } from '../../../infrastructure/database/entities/notification.entity';
import { v4 as uuidv4 } from 'uuid';
import { MessagesGateway } from '../../messages/gateways/messages/messages.gateway';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(Notification)
    private readonly notificationRepo: Repository<Notification>,
    private readonly dataSource: DataSource,
    private readonly messagesGateway: MessagesGateway,
  ) {}

  async create(memberId: string, type: string, payload?: any) {
    const rec = this.notificationRepo.create({
      notification_id: uuidv4(),
      member_id: memberId,
      notification_type: type,
      // store payload as JSON string in content (schema currently uses text)
      content: payload ? JSON.stringify(payload) : null,
      is_read: false,
    } as Partial<Notification>);

    const saved = await this.notificationRepo.save(rec);

    // Emit realtime via existing MessagesGateway (if user connected)
    try {
      this.messagesGateway.server?.to(`user:${memberId}`).emit('notification:new', saved);
    } catch (e) {
      // ignore emit errors in background
    }

    return saved;
  }

  async findForMember(memberId: string, page = 1, pageSize = 20) {
    const [items, total] = await this.notificationRepo.findAndCount({
      where: { member_id: memberId },
      order: { created_at: 'DESC' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    });
    return { items, total, page, pageSize };
  }

  async markRead(notificationId: string, memberId: string) {
    const n = await this.notificationRepo.findOne({ where: { notification_id: notificationId } });
    if (!n) throw new NotFoundException('Notification not found');
    if (n.member_id !== memberId) throw new NotFoundException('Notification not found for this member');
    n.is_read = true;
    n.read_at = new Date();
    await this.notificationRepo.save(n);
    return n;
  }

  async markAllRead(memberId: string) {
    await this.notificationRepo.update({ member_id: memberId, is_read: false }, { is_read: true, read_at: new Date() });
    return { success: true };
  }
}
