// ============================================================
// src/infrastructure/database/entities/violation-report.entity.ts
// Entity lưu báo cáo vi phạm từ members
// ============================================================
import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
} from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { Member } from './member.entity';

export enum ReportType {
  INAPPROPRIATE_CONTENT = 'INAPPROPRIATE_CONTENT',
  SPAM = 'SPAM',
  HARASSMENT = 'HARASSMENT',
  FRAUD = 'FRAUD',
  FAKE_PROFILE = 'FAKE_PROFILE',
  OTHER = 'OTHER',
}

export enum ReportStatus {
  PENDING = 'PENDING',
  IN_REVIEW = 'IN_REVIEW',
  RESOLVED = 'RESOLVED',
  DISMISSED = 'DISMISSED',
}

export enum ReportPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL',
}

@Entity('violation_reports')
@Index('idx_report_status', ['status', 'priority', 'created_at'])
@Index('idx_report_target', ['reported_item_type', 'reported_item_id'])
export class ViolationReport {
  @PrimaryColumn('varchar', { length: 36 })
  report_id: string;

  @Column('varchar', { length: 36 })
  reporter_id: string;

  @ManyToOne(() => Member)
  @JoinColumn({ name: 'reporter_id' })
  reporter: Member;

  @Column('varchar', { length: 36 })
  reported_member_id: string; // Member bị report

  @ManyToOne(() => Member)
  @JoinColumn({ name: 'reported_member_id' })
  reportedMember: Member;

  // DB schema dùng VARCHAR thay vì ENUM
  @Column('varchar', { length: 100, nullable: true })
  report_type: string;

  // DB schema dùng reported_item_type/id chứ không phải target_type/id
  @Column('varchar', { length: 50, nullable: true })
  reported_item_type: string; // 'USER', 'BOOK', 'REVIEW', 'MESSAGE'

  @Column('varchar', { length: 36, nullable: true })
  reported_item_id: string;

  @Column('text')
  description: string;

  @Column({
    type: 'enum',
    enum: ReportStatus,
    default: ReportStatus.PENDING,
  })
  status: ReportStatus;

  @Column({
    type: 'enum',
    enum: ReportPriority,
    default: ReportPriority.MEDIUM,
  })
  priority: ReportPriority;

  @Column('varchar', { length: 36, nullable: true })
  resolved_by: string; // admin_id (DB schema dùng resolved_by không phải assigned_to)

  @Column({ type: 'text', nullable: true })
  resolution: string;

  @Column({ type: 'timestamp', nullable: true })
  resolved_at: Date;

  @CreateDateColumn()
  created_at: Date;

  constructor() {
    this.report_id = uuidv4();
  }
}
