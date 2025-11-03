// src/infrastructure/database/entities/exchange-suggestion.entity.ts
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

// Tránh inline type, dễ tái dùng & cho phép null
export type ScoreBreakdown = {
  book_match: number;
  trust_score: number;
  exchange_history: number;
  rating: number;
  geographic: number;
  verification: number;
  priority: number;
  condition: number;
};

// Transformer để DECIMAL -> number (TypeORM mặc định trả string)
const decimalToNumber = {
  to: (value?: number | null) => value, // lưu nguyên
  from: (value?: string | null) => (value == null ? null : Number(value)),
};

@Entity('exchange_suggestions')
export class ExchangeSuggestion {
  @PrimaryColumn('varchar', { length: 36 })
  suggestion_id: string;

  @Column('varchar', { length: 36 })
  member_a_id: string;

  @Column('varchar', { length: 36 })
  member_b_id: string;

  // MySQL DECIMAL(4,3) => tối đa 9.999. Nếu bạn có thể > 9.999 thì nâng precision.
  @Column('decimal', {
    precision: 4,
    scale: 3,
    default: 0.0,
    transformer: decimalToNumber,
  })
  match_score: number;

  @Column('int', { default: 0 })
  total_matching_books: number;

  @Column('boolean', { default: false })
  is_viewed: boolean;

  @Column('timestamp', { nullable: true })
  viewed_at: Date | null;

  @Column('timestamp', { nullable: true })
  expired_at: Date | null;

  // ✨ NEW: JSON, cho phép null để không bắt buộc phải set ngay
  @Column('json', { nullable: true })
  score_breakdown: ScoreBreakdown | null;

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
