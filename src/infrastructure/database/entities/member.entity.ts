import { Entity, PrimaryColumn, Column, CreateDateColumn, UpdateDateColumn, OneToOne, JoinColumn } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { User } from './user.entity';
import { PersonalLibrary } from './personal-library.entity';
@Entity('members')
export class Member {
  @OneToOne(() => PersonalLibrary, (library) => library.member)
  library: PersonalLibrary;
  @PrimaryColumn('varchar', { length: 36 })
  member_id: string;

  @Column('varchar', { length: 36 })
  user_id: string;

  @OneToOne(() => User, user => user.member)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ nullable: true, length: 100 })
  region: string;

  @Column({ nullable: true, length: 20 })
  phone: string;

  @Column({ type: 'text', nullable: true })
  address: string;

  @Column({ type: 'text', nullable: true })
  bio: string;

  @Column({ type: 'decimal', precision: 3, scale: 2, default: 0.00 })
  trust_score: number;

  @Column({ type: 'decimal', precision: 2, scale: 1, default: 0.0 })
  average_rating: number;

  @Column({ default: false })
  is_verified: boolean;

  @Column({ default: false })
  is_online: boolean;

  @Column({ type: 'timestamp', nullable: true })
  last_seen_at: Date;

  @Column({ type: 'json', nullable: true })
  notification_settings: any;

  @Column({ type: 'timestamp', nullable: true })
  verification_date: Date;

  @Column({ default: 0 })
  total_exchanges: number;

  @Column({ default: 0 })
  completed_exchanges: number;

  @Column({ default: 0 })
  cancelled_exchanges: number;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  constructor() {
    this.member_id = uuidv4();
  }
}