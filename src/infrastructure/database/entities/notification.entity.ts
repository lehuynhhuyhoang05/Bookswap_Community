import { Entity, PrimaryColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, Index } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { Member } from './member.entity';

@Entity('notifications')
@Index('idx_notifications_member_created', ['member_id', 'created_at'])
@Index('idx_notifications_member_isread', ['member_id', 'is_read'])
export class Notification {
  @PrimaryColumn('varchar', { length: 36 })
  notification_id: string;

  @Column('varchar', { length: 36 })
  member_id: string;

  @ManyToOne(() => Member)
  @JoinColumn({ name: 'member_id' })
  member: Member;

  @Column({ length: 64, nullable: false })
  notification_type: string;

  // JSON payload for flexible content storage
  @Column({ type: 'json', nullable: true })
  payload: Record<string, any> | null;

  @Column({ default: false })
  is_read: boolean;

  @Column({ type: 'timestamp', nullable: true })
  read_at: Date;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  // Soft delete support
  @Column({ type: 'timestamp', nullable: true })
  deleted_at: Date | null;

  constructor() {
    this.notification_id = uuidv4();
  }
}
