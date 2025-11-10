// ============================================================
// src/infrastructure/database/entities/audit-log.entity.ts
// Entity lưu nhật ký mọi hành động của admin
// ============================================================
import { Entity, Column, PrimaryColumn, CreateDateColumn, Index, ManyToOne, JoinColumn } from 'typeorm';
import { Admin } from './admin.entity';
import { v4 as uuidv4 } from 'uuid';

export enum AuditAction {
  LOCK_USER = 'LOCK_USER',
  UNLOCK_USER = 'UNLOCK_USER',
  DELETE_USER = 'DELETE_USER',
  UPDATE_ROLE = 'UPDATE_ROLE',
  REMOVE_BOOK = 'REMOVE_BOOK',
  RESTORE_BOOK = 'RESTORE_BOOK',
  REMOVE_REVIEW = 'REMOVE_REVIEW',
  RESOLVE_REPORT = 'RESOLVE_REPORT',
  DISMISS_REPORT = 'DISMISS_REPORT',
  CANCEL_EXCHANGE = 'CANCEL_EXCHANGE',
  REMOVE_MESSAGE = 'REMOVE_MESSAGE',
}

@Entity('audit_logs')
@Index('idx_audit_admin', ['admin_id', 'created_at'])
@Index('idx_audit_entity', ['entity_type', 'entity_id'])
export class AuditLog {
  @PrimaryColumn('varchar', { length: 36 })
  log_id: string;

  @Column('varchar', { length: 36 })
  admin_id: string;

  // Sử dụng VARCHAR thay vì ENUM để match với DB schema hiện tại
  @Column('varchar', { length: 100, nullable: true })
  action: string;

  @Column('varchar', { length: 50, nullable: true })
  entity_type: string; // 'USER', 'BOOK', 'REVIEW', 'REPORT'

  @Column('varchar', { length: 36, nullable: true })
  entity_id: string;

  // DB schema dùng old_values/new_values (plural), không phải old_value/new_value
  @Column({ type: 'json', nullable: true, name: 'old_values' })
  old_value: any;

  @Column({ type: 'json', nullable: true, name: 'new_values' })
  new_value: any;

  @Column('varchar', { length: 45, nullable: true })
  ip_address: string;

  @Column({ type: 'text', nullable: true })
  user_agent: string;

  @CreateDateColumn()
  created_at: Date;

  // Relations
  @ManyToOne(() => Admin, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'admin_id' })
  admin: Admin;

  constructor() {
    this.log_id = uuidv4();
  }
}
