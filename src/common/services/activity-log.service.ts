// ============================================================
// src/common/services/activity-log.service.ts
// Service để tracking user activities
// ============================================================
import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserActivityLog, UserActivityAction } from '../../infrastructure/database/entities/user-activity-log.entity';

@Injectable()
export class ActivityLogService {
  private readonly logger = new Logger(ActivityLogService.name);

  constructor(
    @InjectRepository(UserActivityLog)
    private activityLogRepo: Repository<UserActivityLog>,
  ) {}

  /**
   * Log user activity
   */
  async logActivity(data: {
    user_id: string;
    action: UserActivityAction | string;
    entity_type?: string;
    entity_id?: string;
    metadata?: Record<string, any>;
    ip_address?: string;
    user_agent?: string;
  }) {
    try {
      const log = this.activityLogRepo.create({
        user_id: data.user_id,
        action: data.action,
        entity_type: data.entity_type || null,
        entity_id: data.entity_id || null,
        metadata: data.metadata || null,
        ip_address: data.ip_address || null,
        user_agent: data.user_agent || null,
      });

      await this.activityLogRepo.save(log);
      
      this.logger.debug(`User activity logged: ${data.user_id} - ${data.action}`);
    } catch (err) {
      // Không làm fail request chính nếu logging lỗi
      this.logger.warn(
        `Failed to log user activity (user=${data.user_id}, action=${data.action}): ${err?.message || err}`,
      );
    }
  }

  /**
   * Lấy activities của 1 user (dành cho admin)
   */
  async getUserActivities(
    userId: string,
    options?: {
      page?: number;
      limit?: number;
      action?: string;
      startDate?: Date;
      endDate?: Date;
    },
  ) {
    const page = options?.page ?? 1;
    const limit = options?.limit ?? 50;

    const qb = this.activityLogRepo
      .createQueryBuilder('log')
      .where('log.user_id = :userId', { userId })
      .skip((page - 1) * limit)
      .take(limit);

    // Filter theo action
    if (options?.action) {
      qb.andWhere('log.action = :action', { action: options.action });
    }

    // Filter theo date range
    if (options?.startDate) {
      qb.andWhere('log.created_at >= :startDate', { startDate: options.startDate });
    }

    if (options?.endDate) {
      qb.andWhere('log.created_at <= :endDate', { endDate: options.endDate });
    }

    qb.orderBy('log.created_at', 'DESC');

    const [items, total] = await qb.getManyAndCount();

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Lấy thống kê activities của user
   */
  async getUserActivityStats(userId: string, days: number = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Count by action
    const actionCounts = await this.activityLogRepo
      .createQueryBuilder('log')
      .select('log.action', 'action')
      .addSelect('COUNT(*)', 'count')
      .where('log.user_id = :userId', { userId })
      .andWhere('log.created_at >= :startDate', { startDate })
      .groupBy('log.action')
      .orderBy('count', 'DESC')
      .getRawMany();

    // Count by day
    const dailyActivity = await this.activityLogRepo
      .createQueryBuilder('log')
      .select('DATE(log.created_at)', 'date')
      .addSelect('COUNT(*)', 'count')
      .where('log.user_id = :userId', { userId })
      .andWhere('log.created_at >= :startDate', { startDate })
      .groupBy('DATE(log.created_at)')
      .orderBy('date', 'ASC')
      .getRawMany();

    return {
      action_counts: actionCounts,
      daily_activity: dailyActivity,
      period_days: days,
    };
  }
}
