import {
  Entity,
  PrimaryColumn,
  Column,
  ManyToOne,
  OneToMany,
  OneToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Member } from './member.entity';
import { ExchangeRequest } from './exchange-request.entity';
import { ExchangeBook } from './exchange-book.entity';
import { Review } from './review.entity';

export enum ExchangeStatus {
  PENDING = 'PENDING',
  ACCEPTED = 'ACCEPTED',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  EXPIRED = 'EXPIRED',
}

export enum CancellationReason {
  USER_CANCELLED = 'USER_CANCELLED',
  AUTO_EXPIRED = 'AUTO_EXPIRED',
  DISPUTE = 'DISPUTE',
  NO_SHOW = 'NO_SHOW',
  BOTH_NO_SHOW = 'BOTH_NO_SHOW',
  ADMIN_CANCELLED = 'ADMIN_CANCELLED',
}

@Entity('exchanges')
export class Exchange {
  @PrimaryColumn('varchar', { length: 36 })
  exchange_id: string;

  @Column('varchar', { length: 36 })
  request_id: string;

  @Column('varchar', { length: 36 })
  member_a_id: string;

  @Column('varchar', { length: 36 })
  member_b_id: string;

  @Column({
    type: 'enum',
    enum: ExchangeStatus,
    default: ExchangeStatus.PENDING,
  })
  status: ExchangeStatus;

  @Column('boolean', { default: false })
  member_a_confirmed: boolean;

  @Column('boolean', { default: false })
  member_b_confirmed: boolean;

  @Column('timestamp', { nullable: true })
  confirmed_by_a_at: Date;

  @Column('timestamp', { nullable: true })
  confirmed_by_b_at: Date;

  @Column('timestamp', { nullable: true })
  completed_at: Date;

  @Column('timestamp', { nullable: true })
  cancelled_at: Date;

  @Column('varchar', { length: 100, nullable: true })
  cancelled_by: string; // member_id who cancelled

  @Column({
    type: 'enum',
    enum: CancellationReason,
    nullable: true,
  })
  cancellation_reason: CancellationReason;

  @Column('text', { nullable: true })
  cancellation_note: string;

  @Column('timestamp', { nullable: true })
  expires_at: Date; // Auto-cancel if not confirmed by this date

  @Column('varchar', { length: 500, nullable: true })
  meeting_location: string;

  @Column('timestamp', { nullable: true })
  meeting_time: Date;

  @Column('text', { nullable: true })
  meeting_notes: string;

  @Column('varchar', { length: 36, nullable: true })
  meeting_updated_by: string; // member_id who last updated meeting info

  @Column('timestamp', { nullable: true })
  meeting_updated_at: Date;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  // Relations
  @OneToOne(() => ExchangeRequest, (req) => req.exchange, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'request_id' })
  request: ExchangeRequest;

  @ManyToOne(() => Member, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'member_a_id' })
  member_a: Member;

  @ManyToOne(() => Member, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'member_b_id' })
  member_b: Member;

  @OneToMany(() => ExchangeBook, (eb) => eb.exchange)
  exchange_books: ExchangeBook[];

  @OneToMany(() => Review, (review) => review.exchange)
  reviews: Review[];
}