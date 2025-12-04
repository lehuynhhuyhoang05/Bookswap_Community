// src/infrastructure/database/entities/book-wanted.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  JoinColumn,
  Index,
} from 'typeorm';
import { PersonalLibrary } from './personal-library.entity';

// Tình trạng sách tối thiểu chấp nhận được
export enum PreferredCondition {
  ANY = 'ANY',           // Chấp nhận mọi tình trạng
  FAIR_UP = 'FAIR_UP',   // Từ Khá trở lên
  GOOD_UP = 'GOOD_UP',   // Từ Tốt trở lên
  VERY_GOOD_UP = 'VERY_GOOD_UP', // Từ Rất tốt trở lên
  LIKE_NEW = 'LIKE_NEW', // Chỉ sách như mới
}

@Entity('books_wanted')
@Index(['library_id', 'isbn'], { unique: true })
export class BookWanted {
  @PrimaryGeneratedColumn('uuid')
  wanted_id: string;

  @Column({ type: 'varchar', length: 36 })
  library_id: string;

  @ManyToOne(() => PersonalLibrary, (library) => library.wanted_books, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'library_id' })
  library: PersonalLibrary;

  @Column({ type: 'varchar', length: 255, nullable: true })
  title: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  author: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  @Index()
  isbn: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  google_books_id: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  category: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  cover_image_url: string;

  @Column({
    type: 'enum',
    enum: PreferredCondition,
    default: PreferredCondition.ANY,
  })
  preferred_condition: PreferredCondition;

  @Column({ type: 'varchar', length: 50, nullable: true })
  language: string;

  @Column({ type: 'int', default: 5 })
  priority: number; // 1-10 (1: thấp, 10: cao)

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  added_at: Date;

  @CreateDateColumn()
  created_at: Date;
}