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

@Entity('book_match_pairs')
export class BookMatchPair {
  @PrimaryColumn('varchar', { length: 36 })
  pair_id: string;

  @Column('varchar', { length: 36 })
  suggestion_id: string;

  @Column('varchar', { length: 36 })
  book_a_id: string;

  @Column('varchar', { length: 36 })
  book_b_id: string;

  @Column('varchar', { length: 255, nullable: true })
  match_reason: string;

  @Column('decimal', { precision: 4, scale: 3, default: 0.0 })
  match_score: number;

  @CreateDateColumn()
  created_at: Date;

  // Relations
  @ManyToOne(() => ExchangeSuggestion, (sugg) => sugg.match_pairs, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'suggestion_id' })
  suggestion: ExchangeSuggestion;

  @ManyToOne(() => Book, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'book_a_id' })
  book_a: Book;

  @ManyToOne(() => Book, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'book_b_id' })
  book_b: Book;
}