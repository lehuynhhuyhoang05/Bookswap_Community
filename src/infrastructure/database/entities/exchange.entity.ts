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

  @Column('varchar', { length: 500, nullable: true })
  meeting_location: string;

  @Column('timestamp', { nullable: true })
  meeting_time: Date;

  @Column('text', { nullable: true })
  meeting_notes: string;

  @Column({
    type: 'enum',
    enum: ['USER_CANCELLED', 'NO_SHOW', 'BOTH_NO_SHOW', 'DISPUTE', 'ADMIN_CANCELLED'],
    nullable: true,
  })
  cancellation_reason: string;

  @Column('text', { nullable: true })
  cancellation_details: string;

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