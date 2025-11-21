// src/infrastructure/database/entities/conversation.entity.ts
import {
  Entity,
  Column,
  PrimaryColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
  CreateDateColumn,
} from 'typeorm';
import { Member } from './member.entity';
import { ExchangeRequest } from './exchange-request.entity';
import { Message } from './message.entity';

@Entity('conversations')
export class Conversation {
  @PrimaryColumn('varchar', { length: 36 })
  conversation_id: string;

  @Column('varchar', { length: 36, nullable: true })
  exchange_request_id: string | null;

  @Column('varchar', { length: 36 })
  member_a_id: string;

  @Column('varchar', { length: 36 })
  member_b_id: string;

  @Column('int', { default: 0 })
  total_messages: number;

  @Column('timestamp', { nullable: true })
  last_message_at: Date;

  @CreateDateColumn()
  created_at: Date;

  @ManyToOne(() => ExchangeRequest)
  @JoinColumn({ name: 'exchange_request_id' })
  exchange_request: ExchangeRequest;

  @ManyToOne(() => Member)
  @JoinColumn({ name: 'member_a_id' })
  member_a: Member;

  @ManyToOne(() => Member)
  @JoinColumn({ name: 'member_b_id' })
  member_b: Member;

  @OneToMany(() => Message, (message) => message.conversation)
  messages: Message[];
}