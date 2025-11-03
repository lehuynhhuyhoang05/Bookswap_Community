// src/infrastructure/database/entities/message-reaction.entity.ts
import {
  Entity,
  Column,
  PrimaryColumn,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  Unique,
} from 'typeorm';
import { Message } from './message.entity';
import { Member } from './member.entity';

@Entity('message_reactions')
@Unique('unique_member_message_emoji', ['message_id', 'member_id', 'emoji'])
export class MessageReaction {
  @PrimaryColumn('varchar', { length: 36 })
  reaction_id: string;

  @Column('varchar', { length: 36 })
  message_id: string;

  @Column('varchar', { length: 36 })
  member_id: string;

  @Column('varchar', { length: 10 })
  emoji: string;

  @CreateDateColumn()
  created_at: Date;

  @ManyToOne(() => Message, (message) => message.reactions)
  @JoinColumn({ name: 'message_id' })
  message: Message;

  @ManyToOne(() => Member)
  @JoinColumn({ name: 'member_id' })
  member: Member;
}
