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

  @Column({ type: 'int', default: 0 })
  priority: number; // 0-10

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  added_at: Date;

  @CreateDateColumn()
  created_at: Date;
}