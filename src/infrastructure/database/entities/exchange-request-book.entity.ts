import {
  Entity,
  PrimaryColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { ExchangeRequest } from './exchange-request.entity';
import { Book } from './book.entity';

export enum BookType {
  OFFERED = 'OFFERED',
  REQUESTED = 'REQUESTED',
}

@Entity('exchange_request_books')
export class ExchangeRequestBook {
  @PrimaryColumn('varchar', { length: 36 })
  exchange_request_book_id: string;

  @Column('varchar', { length: 36 })
  request_id: string;

  @Column('varchar', { length: 36 })
  book_id: string;

  @Column('boolean')
  offered_by_requester: boolean;

  @Column({
    type: 'enum',
    enum: BookType,
  })
  book_type: BookType;

  @CreateDateColumn()
  created_at: Date;

  // Relations
  @ManyToOne(() => ExchangeRequest, (req) => req.request_books, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'request_id' })
  request: ExchangeRequest;

  @ManyToOne(() => Book, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'book_id' })
  book: Book;
}