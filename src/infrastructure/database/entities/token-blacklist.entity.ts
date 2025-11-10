import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
} from 'typeorm';

@Entity('token_blacklist')
export class TokenBlacklist {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'text' })
  @Index()
  token: string;

  @Column({ type: 'varchar', length: 36 })
  @Index()
  user_id: string;

  @Column({ type: 'timestamp' })
  @Index()
  expires_at: Date;

  @CreateDateColumn()
  created_at: Date;
}