import {
  Entity,
  PrimaryColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { Member } from './member.entity';
import { User } from './user.entity';

export enum TrustScoreSource {
  SYSTEM = 'SYSTEM',
  ADMIN = 'ADMIN',
  AUTO = 'AUTO',
}

@Entity('trust_score_history')
export class TrustScoreHistory {
  @PrimaryColumn('uuid')
  change_id: string;

  @Column('uuid')
  member_id: string;

  @Column('decimal', { precision: 5, scale: 2 })
  old_score: number;

  @Column('decimal', { precision: 5, scale: 2 })
  new_score: number;

  @Column('decimal', { precision: 5, scale: 2 })
  change_amount: number;

  @Column('varchar', { length: 255 })
  reason: string;

  @Column({
    type: 'enum',
    enum: TrustScoreSource,
    default: TrustScoreSource.SYSTEM,
  })
  source: TrustScoreSource;

  @Column('uuid', { nullable: true })
  admin_id: string | null;

  @Column('json', { nullable: true })
  metadata: any;

  @CreateDateColumn()
  created_at: Date;

  // Relations
  @ManyToOne(() => Member, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'member_id' })
  member: Member;

  @ManyToOne(() => User, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'admin_id' })
  admin: User | null;
}
