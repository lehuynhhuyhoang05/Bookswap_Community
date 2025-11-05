// ============================================================
// src/infrastructure/database/entities/audit-log.entity.ts
// Entity lưu nhật ký mọi hành động của admin
// ============================================================
import { Entity, Column, PrimaryColumn, CreateDateColumn, Index } from 'typeorm';
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
}

@Entity('audit_logs')
@Index('idx_audit_admin', ['admin_id', 'created_at'])
@Index('idx_audit_entity', ['entity_type', 'entity_id'])
export class AuditLog {
  @PrimaryColumn('varchar', { length: 36 })
  log_id: string;

  @Column('varchar', { length: 36 })
  admin_id: string;

  @Column('varchar', { length: 100 })
  admin_email: string;

  @Column({
    type: 'enum',
    enum: AuditAction,
  })
  action: AuditAction;

  @Column('varchar', { length: 50 })
  entity_type: string; // 'USER', 'BOOK', 'REVIEW', 'REPORT'

  @Column('varchar', { length: 36 })
  entity_id: string;

  @Column({ type: 'json', nullable: true })
  old_value: any;

  @Column({ type: 'json', nullable: true })
  new_value: any;

  @Column('varchar', { length: 100, nullable: true })
  ip_address: string;

  @Column({ type: 'text', nullable: true })
  reason: string;

  @CreateDateColumn()
  created_at: Date;

  constructor() {
    this.log_id = uuidv4();
  }
}
