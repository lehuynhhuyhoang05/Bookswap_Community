// src/infrastructure/database/entities/personal-library.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
  JoinColumn,
} from 'typeorm';
import { Member } from './member.entity';
import { BookWanted } from './book-wanted.entity';

@Entity('personal_libraries')
export class PersonalLibrary {
  @PrimaryGeneratedColumn('uuid')
  library_id: string;

  @Column({ type: 'varchar', length: 36 })
  member_id: string;

  @OneToOne(() => Member, (member) => member.library)
  @JoinColumn({ name: 'member_id' })
  member: Member;

  @OneToMany(() => BookWanted, (wanted) => wanted.library)
  wanted_books: BookWanted[];

  @Column({ type: 'int', default: 0 })
  total_owned_books: number;

  @Column({ type: 'int', default: 0 })
  total_wanted_books: number;

  @Column({ type: 'timestamp', nullable: true })
  last_updated: Date;

  @CreateDateColumn()
  created_at: Date;
}