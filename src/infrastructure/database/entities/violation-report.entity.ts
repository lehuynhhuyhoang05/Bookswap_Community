// ============================================================
// src/infrastructure/database/entities/violation-report.entity.ts
// Entity lưu báo cáo vi phạm từ members
// ============================================================
import { Entity, Column, PrimaryColumn, CreateDateColumn, UpdateDateColumn, Index, ManyToOne, JoinColumn } from 'typeorm';
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
@Index('idx_report_target', ['target_type', 'target_id'])
export class ViolationReport {
  @PrimaryColumn('varchar', { length: 36 })
  report_id: string;

  @Column('varchar', { length: 36 })
  reporter_id: string;

  @ManyToOne(() => Member)
  @JoinColumn({ name: 'reporter_id' })
  reporter: Member;

  @Column({
    type: 'enum',
    enum: ReportType,
  })
  report_type: ReportType;

  @Column('varchar', { length: 50 })
  target_type: string; // 'USER', 'BOOK', 'REVIEW', 'MESSAGE'

  @Column('varchar', { length: 36 })
  target_id: string;

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
    default: ReportPriority.LOW,
  })
  priority: ReportPriority;

  @Column('varchar', { length: 36, nullable: true })
  assigned_to: string; // admin_id

  @Column({ type: 'text', nullable: true })
  resolution: string;

  @Column({ type: 'text', nullable: true })
  action_taken: string;

  @Column({ type: 'timestamp', nullable: true })
  resolved_at: Date;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  constructor() {
    this.report_id = uuidv4();
  }
}
