// src/infrastructure/database/entities/book-match-pair.entity.ts
import {
  Entity,
  PrimaryColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { ExchangeSuggestion } from './exchange-suggestion.entity';
import { Book } from './book.entity';

export type PairDirection = 'THEY_WANT_FROM_ME' | 'I_WANT_FROM_THEM';

@Entity('book_match_pairs')
export class BookMatchPair {
  @PrimaryColumn('varchar', { length: 36 })
  pair_id: string;

  @Column('varchar', { length: 36 })
  suggestion_id: string;

  @Column('varchar', { length: 36, nullable: true })
  book_a_id: string | null; // có thể NULL

  @Column('varchar', { length: 36, nullable: true })
  book_b_id: string | null; // có thể NULL

  @Column({
    type: 'enum',
    enum: ['THEY_WANT_FROM_ME', 'I_WANT_FROM_THEM'],
    default: 'THEY_WANT_FROM_ME',
  })
  pair_direction: PairDirection;

  @Column('varchar', { length: 255, nullable: true })
  match_reason: string;

  @Column('decimal', { precision: 4, scale: 3, default: 0.0 })
  match_score: number;

  @CreateDateColumn()
  created_at: Date;

  @ManyToOne(() => ExchangeSuggestion, (sugg) => sugg.match_pairs, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'suggestion_id' })
  suggestion: ExchangeSuggestion;

  @ManyToOne(() => Book, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'book_a_id' })
  book_a: Book;

  @ManyToOne(() => Book, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'book_b_id' })
  book_b: Book;
}
