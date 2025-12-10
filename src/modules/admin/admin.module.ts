// ============================================================
// src/modules/admin/admin.module.ts
// Admin Module - Quản lý toàn bộ Admin System
// ============================================================
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../../infrastructure/database/entities/user.entity';
import { NotificationsModule } from '../notifications/notifications.module';
import { Member } from '../../infrastructure/database/entities/member.entity';
import { Book } from '../../infrastructure/database/entities/book.entity';
import { Review } from '../../infrastructure/database/entities/review.entity';
import { Exchange } from '../../infrastructure/database/entities/exchange.entity';
import { ExchangeBook } from '../../infrastructure/database/entities/exchange-book.entity';
import { ViolationReport } from '../../infrastructure/database/entities/violation-report.entity';
import { AuditLog } from '../../infrastructure/database/entities/audit-log.entity';
import { Admin } from '../../infrastructure/database/entities/admin.entity';
import { Message } from '../../infrastructure/database/entities/message.entity';
import { Conversation } from '../../infrastructure/database/entities/conversation.entity';
import { UserActivityLog } from '../../infrastructure/database/entities/user-activity-log.entity';
import { TrustScoreHistory } from '../../infrastructure/database/entities/trust-score-history.entity';
import { AdminController } from './controllers/admin.controller';
import { ReportsController } from './controllers/reports.controller';
import { AdminService } from './services/admin.service';
import { ActivityLogService } from '../../common/services/activity-log.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
      Member,
      Book,
      Review,
      Exchange,
      ExchangeBook,
      ViolationReport,
      AuditLog,
      Admin,
      Message,
      Conversation,
      UserActivityLog,
      TrustScoreHistory,
    ]),
    NotificationsModule, // For sending notifications when reports are resolved
  ],
  controllers: [AdminController, ReportsController],
  providers: [AdminService, ActivityLogService],
  exports: [AdminService, ActivityLogService], // Export ActivityLogService để các module khác có thể log user activities
})
export class AdminModule {}
