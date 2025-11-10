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
import { ExchangeRequestBook } from './exchange-request-book.entity';
import { Exchange } from './exchange.entity';
import { Conversation } from './conversation.entity';

export enum ExchangeRequestStatus {
  PENDING = 'PENDING',
  ACCEPTED = 'ACCEPTED',
  REJECTED = 'REJECTED',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

@Entity('exchange_requests')
export class ExchangeRequest {
  @PrimaryColumn('varchar', { length: 36 })
  request_id: string;

  @Column('varchar', { length: 36 })
  requester_id: string;

  @Column('varchar', { length: 36 })
  receiver_id: string;

  @Column({
    type: 'enum',
    enum: ExchangeRequestStatus,
    default: ExchangeRequestStatus.PENDING,
  })
  status: ExchangeRequestStatus;

  @Column('text', { nullable: true })
  message: string;

  @Column('text', { nullable: true })
  rejection_reason: string;

  @Column('timestamp', { nullable: true })
  responded_at: Date;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  // Relations
  @ManyToOne(() => Member, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'requester_id' })
  requester: Member;

  @ManyToOne(() => Member, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'receiver_id' })
  receiver: Member;

  @OneToMany(() => ExchangeRequestBook, (erb) => erb.request)
  request_books: ExchangeRequestBook[];

  @OneToOne(() => Exchange, (ex) => ex.request)
  exchange: Exchange;

  @OneToOne(() => Conversation, (conv) => conv.exchange_request)
  conversation: Conversation;
}