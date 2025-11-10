import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, IsNull } from 'typeorm';
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

  /**
   * Create a single notification
   */
  async create(memberId: string, type: string, payload?: any) {
    const rec = this.notificationRepo.create({
      notification_id: uuidv4(),
      member_id: memberId,
      notification_type: type,
      payload: payload ?? null,
      is_read: false,
    });

    const saved = await this.notificationRepo.save(rec);

    // Emit realtime event to room `user:{memberId}`
    try {
      this.messagesGateway.server?.to(`user:${memberId}`).emit('notification:new', {
        notification_id: saved.notification_id,
        type: saved.notification_type,
        payload: saved.payload,
        is_read: saved.is_read,
        created_at: saved.created_at,
      });
    } catch (_) {
      // Ignore emit errors in background
    }

    return saved;
  }

  /**
   * Bulk create notifications (for fan-out scenarios)
   */
  async createMany(items: Array<{ memberId: string; type: string; payload?: any }>) {
    const records = items.map((i) =>
      this.notificationRepo.create({
        notification_id: uuidv4(),
        member_id: i.memberId,
        notification_type: i.type,
        payload: i.payload ?? null,
        is_read: false,
      }),
    );

    const saved = await this.notificationRepo.save(records);

    // Emit realtime for each notification
    for (const s of saved) {
      try {
        this.messagesGateway.server?.to(`user:${s.member_id}`).emit('notification:new', {
          notification_id: s.notification_id,
          type: s.notification_type,
          payload: s.payload,
          is_read: s.is_read,
          created_at: s.created_at,
        });
      } catch (_) {}
    }

    return saved.length;
  }

  /**
   * Query notifications with filtering and pagination
   */
  async findForMember(
    memberId: string,
    page = 1,
    pageSize = 20,
    opts?: { type?: string; onlyUnread?: boolean },
  ) {
    // Cap pageSize at 100 to prevent heavy queries
    const limitedPageSize = Math.min(pageSize, 100);

    const qb = this.notificationRepo
      .createQueryBuilder('n')
      .where('n.member_id = :memberId', { memberId })
      .andWhere('n.deleted_at IS NULL')
      .orderBy('n.created_at', 'DESC')
      .skip((page - 1) * limitedPageSize)
      .take(limitedPageSize);

    if (opts?.type) {
      qb.andWhere('n.notification_type = :type', { type: opts.type });
    }

    if (opts?.onlyUnread) {
      qb.andWhere('n.is_read = false');
    }

    const [items, total] = await qb.getManyAndCount();
    return { items, total, page, pageSize: limitedPageSize };
  }

  /**
   * Get unread notification count for member
   */
  async unreadCount(memberId: string) {
    const count = await this.notificationRepo.count({
      where: {
        member_id: memberId,
        is_read: false,
        deleted_at: IsNull(),
      },
    });
    return { unread: count };
  }

  /**
   * Mark a single notification as read (with strict member ownership check)
   */
  async markRead(notificationId: string, memberId: string) {
    const result = await this.notificationRepo.update(
      {
        notification_id: notificationId,
        member_id: memberId,
        is_read: false,
      },
      {
        is_read: true,
        read_at: () => 'CURRENT_TIMESTAMP',
      },
    );

    if (result.affected === 0) {
      // Check if notification exists and belongs to member
      const exists = await this.notificationRepo.findOne({
        where: { notification_id: notificationId },
      });

      if (!exists || exists.member_id !== memberId) {
        throw new NotFoundException('Notification not found for this member');
      }
      // Already read, return existing record
    }

    return this.notificationRepo.findOneOrFail({
      where: { notification_id: notificationId, member_id: memberId },
    });
  }

  /**
   * Mark all unread notifications as read for member
   */
  async markAllRead(memberId: string) {
    await this.notificationRepo
      .createQueryBuilder()
      .update(Notification)
      .set({
        is_read: true,
        read_at: () => 'CURRENT_TIMESTAMP',
      })
      .where('member_id = :memberId', { memberId })
      .andWhere('is_read = false')
      .andWhere('deleted_at IS NULL')
      .execute();

    return { success: true };
  }

  /**
   * Archive (soft delete) a notification
   */
  async archive(notificationId: string, memberId: string) {
    const result = await this.notificationRepo.update(
      {
        notification_id: notificationId,
        member_id: memberId,
        deleted_at: IsNull(),
      },
      {
        deleted_at: () => 'CURRENT_TIMESTAMP',
      },
    );

    if (result.affected === 0) {
      throw new NotFoundException('Notification not found for this member');
    }

    return { success: true };
  }
}
