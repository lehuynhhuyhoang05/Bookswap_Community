import {
  Entity,
  PrimaryColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { Exchange } from './exchange.entity';
import { Book } from './book.entity';
import { Member } from './member.entity';

@Entity('exchange_books')
export class ExchangeBook {
  @PrimaryColumn('varchar', { length: 36 })
  exchange_book_id: string;

  @Column('varchar', { length: 36 })
  exchange_id: string;

  @Column('varchar', { length: 36 })
  book_id: string;

  @Column('varchar', { length: 36 })
  from_member_id: string;

  @Column('varchar', { length: 36 })
  to_member_id: string;

  @Column('int', { nullable: true })
  exchange_order: number;

  @CreateDateColumn()
  created_at: Date;

  // Relations
  @ManyToOne(() => Exchange, (ex) => ex.exchange_books, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'exchange_id' })
  exchange: Exchange;

  @ManyToOne(() => Book, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'book_id' })
  book: Book;

  @ManyToOne(() => Member, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'from_member_id' })
  from_member: Member;

  @ManyToOne(() => Member, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'to_member_id' })
  to_member: Member;
}
