import {
  Entity,
  PrimaryColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Member } from './member.entity';
import { Exchange } from './exchange.entity';

@Entity('reviews')
export class Review {
  @PrimaryColumn('varchar', { length: 36 })
  review_id: string;

  @Column('varchar', { length: 36 })
  exchange_id: string;

  @Column('varchar', { length: 36 })
  reviewer_id: string;

  @Column('varchar', { length: 36 })
  reviewee_id: string;

  @Column('int')
  rating: number;

  @Column('text', { nullable: true })
  comment: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  // Relations
  @ManyToOne(() => Exchange, exchange => exchange.reviews, {
    onDelete: 'CASCADE'
  })
  @JoinColumn({ name: 'exchange_id' })
  exchange: Exchange;

  @ManyToOne(() => Member, {
    onDelete: 'CASCADE'
  })
  @JoinColumn({ name: 'reviewer_id' })
  reviewer: Member;

  @ManyToOne(() => Member, {
    onDelete: 'CASCADE'
  })
  @JoinColumn({ name: 'reviewee_id' })
  reviewee: Member;
}