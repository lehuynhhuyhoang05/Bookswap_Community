// ============================================================
// src/infrastructure/database/entities/review.entity.ts
// ============================================================
import {
  Entity,
  Column,
  PrimaryColumn,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  BeforeInsert,
} from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { Member } from './member.entity';
import { Exchange } from './exchange.entity';

@Entity('reviews')
@Index('uq_reviews_once_per_exchange', ['exchange', 'reviewer'], { unique: true })
@Index('idx_reviews_reviewee_time', ['reviewee', 'created_at'])
export class Review {
  @PrimaryColumn({ type: 'varchar', length: 36 })
  review_id: string;

  @ManyToOne(() => Exchange, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'exchange_id' })
  exchange: Exchange;

  @Column({ type: 'varchar', length: 36 })
  exchange_id: string;

  @ManyToOne(() => Member, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'reviewer_id' })
  reviewer: Member;

  @Column({ type: 'varchar', length: 36 })
  reviewer_id: string;

  @ManyToOne(() => Member, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'reviewee_id' })
  reviewee: Member;

  @Column({ type: 'varchar', length: 36 })
  reviewee_id: string;

  @Column({ type: 'int' })
  rating: number; // 1-5 stars

  @Column({ type: 'text', nullable: true })
  comment: string;

  @Column({ type: 'decimal', precision: 3, scale: 2, default: 0.0 })
  trust_score_impact: number;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @BeforeInsert()
  generateId() {
    if (!this.review_id) {
      this.review_id = uuidv4();
    }
  }
}