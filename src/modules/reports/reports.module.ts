// ============================================================
// src/modules/reports/reports.module.ts
// Module cho Reports (Members tạo reports)
// ============================================================
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ViolationReport } from '../../infrastructure/database/entities/violation-report.entity';
import { Member } from '../../infrastructure/database/entities/member.entity';
import { ReportsController } from './reports.controller';
import { ReportsService } from './reports.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([ViolationReport, Member]),
  ],
  controllers: [ReportsController],
  providers: [ReportsService],
  exports: [ReportsService],
})
export class ReportsModule {}
