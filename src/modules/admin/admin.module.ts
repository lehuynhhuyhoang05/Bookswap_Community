// ============================================================
// src/modules/admin/admin.module.ts
// Admin Module - Quản lý toàn bộ Admin System
// ============================================================
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../../infrastructure/database/entities/user.entity';
import { Member } from '../../infrastructure/database/entities/member.entity';
import { Book } from '../../infrastructure/database/entities/book.entity';
import { Review } from '../../infrastructure/database/entities/review.entity';
import { Exchange } from '../../infrastructure/database/entities/exchange.entity';
import { ViolationReport } from '../../infrastructure/database/entities/violation-report.entity';
import { AuditLog } from '../../infrastructure/database/entities/audit-log.entity';
import { AdminController } from './controllers/admin.controller';
import { ReportsController } from './controllers/reports.controller';
import { AdminService } from './services/admin.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
      Member,
      Book,
      Review,
      Exchange,
      ViolationReport,
      AuditLog,
    ]),
  ],
  controllers: [AdminController, ReportsController],
  providers: [AdminService],
  exports: [AdminService], // Export để các module khác có thể dùng nếu cần
})
export class AdminModule {}
