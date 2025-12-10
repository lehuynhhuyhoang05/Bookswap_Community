import { Entity, PrimaryColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { Member } from './member.entity';

export enum BookCondition {
  LIKE_NEW = 'LIKE_NEW',
  VERY_GOOD = 'VERY_GOOD',
  GOOD = 'GOOD',
  FAIR = 'FAIR',
  POOR = 'POOR',
}

export enum BookStatus {
  AVAILABLE = 'AVAILABLE',
  EXCHANGING = 'EXCHANGING',
  REMOVED = 'REMOVED',
}

@Entity('books')
export class Book {
  @PrimaryColumn('varchar', { length: 36 })
  book_id: string;

  @Column('varchar', { length: 36 })
  owner_id: string;

  @ManyToOne(() => Member, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'owner_id' })
  owner: Member;

  @Column({ length: 255 })
  title: string;

  @Column({ nullable: true, length: 255 })
  author: string;

  @Column({ nullable: true, length: 20 })
  isbn: string;

  @Column({ nullable: true, length: 100 })
  google_books_id: string;

  @Column({ nullable: true, length: 255 })
  publisher: string;

  @Column({ type: 'date', nullable: true })
  publish_date: Date;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ nullable: true, length: 100 })
  category: string;

  @Column({ length: 50, default: 'vi' })
  language: string;

  @Column({ type: 'int', nullable: true })
  page_count: number;

  @Column({ nullable: true, length: 500 })
  cover_image_url: string;

  @Column({ type: 'json', nullable: true })
  user_photos: string[]; // URLs of photos taken by user to verify real book ownership

  @Column({
    type: 'enum',
    enum: BookCondition,
    nullable: true,
  })
  book_condition: BookCondition;

  @Column({
    type: 'enum',
    enum: BookStatus,
    default: BookStatus.AVAILABLE,
  })
  status: BookStatus;

  @Column({ type: 'int', default: 0 })
  views: number;

  @Column({ type: 'timestamp', nullable: true })
  deleted_at: Date;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  constructor() {
    this.book_id = uuidv4();
  }
}