import { Entity, PrimaryColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { Member } from './member.entity';

@Entity('notifications')
export class Notification {
  @PrimaryColumn('varchar', { length: 36 })
  notification_id: string;

  @Column('varchar', { length: 36 })
  member_id: string;

  @ManyToOne(() => Member)
  @JoinColumn({ name: 'member_id' })
  member: Member;

  @Column({ length: 50, nullable: true })
  notification_type: string;

  @Column({ length: 255, nullable: true })
  title: string;

  @Column({ type: 'text', nullable: true })
  content: string;

  @Column({ length: 50, nullable: true })
  reference_type: string;

  @Column({ length: 36, nullable: true })
  reference_id: string;

  @Column({ default: false })
  is_read: boolean;

  @Column({ type: 'timestamp', nullable: true })
  read_at: Date;

  @CreateDateColumn()
  created_at: Date;

  constructor() {
    this.notification_id = uuidv4();
  }
}
