// ============================================================
// src/infrastructure/database/entities/admin.entity.ts
// Entity cho bảng admins - quản lý thông tin và quyền hạn admin
// ============================================================
import { Entity, Column, PrimaryColumn, CreateDateColumn, OneToOne, JoinColumn } from 'typeorm';
import { User } from './user.entity';
import { v4 as uuidv4 } from 'uuid';

@Entity('admins')
export class Admin {
  @PrimaryColumn('varchar', { length: 36 })
  admin_id: string;

  @Column('varchar', { length: 36, unique: true })
  user_id: string;

  @Column('int', { default: 1 })
  admin_level: number; // 1 = Admin thường, 2 = Super Admin, 3 = Root Admin

  @Column('json', { nullable: true })
  permissions: Record<string, any> | null; // JSON object chứa permissions chi tiết

  @Column('timestamp', { default: () => 'CURRENT_TIMESTAMP' })
  admin_since: Date;

  @CreateDateColumn()
  created_at: Date;

  // Relations
  @OneToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  constructor() {
    if (!this.admin_id) {
      this.admin_id = uuidv4();
    }
  }
}
