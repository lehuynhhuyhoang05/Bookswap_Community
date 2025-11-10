// src/infrastructure/database/entities/message.entity.ts
import {
  Entity,
  Column,
  PrimaryColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { Conversation } from './conversation.entity';
import { Member } from './member.entity';
import { MessageReaction } from './message-reaction.entity';

@Entity('messages')
export class Message {
  @PrimaryColumn('varchar', { length: 36 })
  message_id: string;

  @Column('varchar', { length: 36 })
  conversation_id: string;

  @Column('varchar', { length: 36 })
  sender_id: string;

  @Column('varchar', { length: 36 })
  receiver_id: string;

  @Column('text', { nullable: true })
  content: string;

  @Column('boolean', { default: false })
  is_read: boolean;

  @Column('timestamp', { nullable: true })
  read_at: Date;

  @Column('timestamp', { default: () => 'CURRENT_TIMESTAMP' })
  sent_at: Date;

  @Column('timestamp', { nullable: true })
  deleted_at: Date | null;

  @CreateDateColumn()
  created_at: Date;

  @ManyToOne(() => Conversation, (conversation) => conversation.messages)
  @JoinColumn({ name: 'conversation_id' })
  conversation: Conversation;

  @ManyToOne(() => Member)
  @JoinColumn({ name: 'sender_id' })
  sender: Member;

  @ManyToOne(() => Member)
  @JoinColumn({ name: 'receiver_id' })
  receiver: Member;

  @OneToMany(() => MessageReaction, (reaction) => reaction.message, { cascade: true })
  reactions: MessageReaction[];
}