import {
  Entity,
  PrimaryColumn,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { Member } from './member.entity';
import { BookMatchPair } from './book-match-pair.entity';

@Entity('exchange_suggestions')
export class ExchangeSuggestion {
  @PrimaryColumn('varchar', { length: 36 })
  suggestion_id: string;

  @Column('varchar', { length: 36 })
  member_a_id: string;

  @Column('varchar', { length: 36 })
  member_b_id: string;

  @Column('decimal', { precision: 4, scale: 3, default: 0.0 })
  match_score: number;

  @Column('int', { default: 0 })
  total_matching_books: number;

  @Column('boolean', { default: false })
  is_viewed: boolean;

  @Column('timestamp', { nullable: true })
  viewed_at: Date;

  @Column('timestamp', { nullable: true })
  expired_at: Date;

  @CreateDateColumn()
  created_at: Date;

  // Relations
  @ManyToOne(() => Member, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'member_a_id' })
  member_a: Member;

  @ManyToOne(() => Member, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'member_b_id' })
  member_b: Member;

  @OneToMany(() => BookMatchPair, (pair) => pair.suggestion)
  match_pairs: BookMatchPair[];
}
