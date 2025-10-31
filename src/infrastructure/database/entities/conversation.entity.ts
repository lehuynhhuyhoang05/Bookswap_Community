import {
  Entity,
  PrimaryColumn,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ExchangeRequest } from './exchange-request.entity';
import { Member } from './member.entity';

export enum MessageType {
  TEXT = 'TEXT',
  IMAGE = 'IMAGE',
}

@Entity('conversations')
export class Conversation {
  @PrimaryColumn('varchar', { length: 36 })
  conversation_id: string;

  @Column('varchar', { length: 36 })
  request_id: string;

  @Column('varchar', { length: 36 })
  member_a_id: string;

  @Column('varchar', { length: 36 })
  member_b_id: string;

  @Column('boolean', { default: true })
  is_active: boolean;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  // Relations
  @ManyToOne(() => ExchangeRequest, request => request.conversation, {
    onDelete: 'CASCADE'
  })
  @JoinColumn({ name: 'request_id' })
  request: ExchangeRequest;

  @ManyToOne(() => Member, {
    onDelete: 'CASCADE'
  })
  @JoinColumn({ name: 'member_a_id' })
  member_a: Member;

  @ManyToOne(() => Member, {
    onDelete: 'CASCADE'
  })
  @JoinColumn({ name: 'member_b_id' })
  member_b: Member;

  @OneToMany(() => Message, message => message.conversation)
  messages: Message[];
    exchange_request: any;
}

@Entity('messages')
export class Message {
  @PrimaryColumn('varchar', { length: 36 })
  message_id: string;

  @Column('varchar', { length: 36 })
  conversation_id: string;

  @Column('varchar', { length: 36 })
  sender_id: string;

  @Column({
    type: 'enum',
    enum: MessageType,
    default: MessageType.TEXT
  })
  type: MessageType;

  @Column('text')
  content: string;

  @Column('boolean', { default: false })
  is_read: boolean;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  // Relations
  @ManyToOne(() => Conversation, conversation => conversation.messages, {
    onDelete: 'CASCADE'
  })
  @JoinColumn({ name: 'conversation_id' })
  conversation: Conversation;

  @ManyToOne(() => Member, {
    onDelete: 'CASCADE'
  })
  @JoinColumn({ name: 'sender_id' })
  sender: Member;
}