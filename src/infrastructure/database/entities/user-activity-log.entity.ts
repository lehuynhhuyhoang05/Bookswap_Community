// ============================================================
// src/infrastructure/database/entities/user-activity-log.entity.ts
// Entity để tracking mọi hành động của users (không phải admin)
// ============================================================
import { Entity, Column, PrimaryColumn, CreateDateColumn, Index, ManyToOne, JoinColumn } from 'typeorm';
import { User } from './user.entity';
import { v4 as uuidv4 } from 'uuid';

export enum UserActivityAction {
  LOGIN = 'LOGIN',
  LOGOUT = 'LOGOUT',
  REGISTER = 'REGISTER',
  CREATE_BOOK = 'CREATE_BOOK',
  UPDATE_BOOK = 'UPDATE_BOOK',
  DELETE_BOOK = 'DELETE_BOOK',
  CREATE_EXCHANGE_REQUEST = 'CREATE_EXCHANGE_REQUEST',
  ACCEPT_EXCHANGE_REQUEST = 'ACCEPT_EXCHANGE_REQUEST',
  REJECT_EXCHANGE_REQUEST = 'REJECT_EXCHANGE_REQUEST',
  CANCEL_EXCHANGE_REQUEST = 'CANCEL_EXCHANGE_REQUEST',
  CONFIRM_EXCHANGE = 'CONFIRM_EXCHANGE',
  SEND_MESSAGE = 'SEND_MESSAGE',
  CREATE_REVIEW = 'CREATE_REVIEW',
  CREATE_REPORT = 'CREATE_REPORT',
  UPDATE_PROFILE = 'UPDATE_PROFILE',
  ADD_WANTED_BOOK = 'ADD_WANTED_BOOK',
  REMOVE_WANTED_BOOK = 'REMOVE_WANTED_BOOK',
}

@Entity('user_activity_logs')
@Index('idx_user_activity_user', ['user_id', 'created_at'])
@Index('idx_user_activity_action', ['action'])
@Index('idx_user_activity_created', ['created_at'])
export class UserActivityLog {
  @PrimaryColumn('varchar', { length: 36 })
  log_id: string;

  @Column('varchar', { length: 36 })
  user_id: string;

  @Column('varchar', { length: 100 })
  action: string;

  @Column('varchar', { length: 50, nullable: true })
  entity_type: string | null; // 'BOOK', 'EXCHANGE', 'MESSAGE', 'REVIEW', etc.

  @Column('varchar', { length: 36, nullable: true })
  entity_id: string | null;

  @Column({ type: 'json', nullable: true })
  metadata: Record<string, any> | null; // Thông tin chi tiết về action

  @Column('varchar', { length: 45, nullable: true })
  ip_address: string | null;

  @Column({ type: 'text', nullable: true })
  user_agent: string | null;

  @CreateDateColumn()
  created_at: Date;

  // Relations
  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  constructor() {
    if (!this.log_id) {
      this.log_id = uuidv4();
    }
  }
}
