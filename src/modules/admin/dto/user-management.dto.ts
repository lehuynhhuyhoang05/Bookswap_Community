// ============================================================
// src/modules/admin/dto/user-management.dto.ts
// DTOs cho User Management
// ============================================================
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsEnum, IsOptional, IsInt, Min, Max, IsIn } from 'class-validator';
import { Type } from 'class-transformer';
import { UserRole, AccountStatus } from '../../../infrastructure/database/entities/user.entity';

// DTO query danh sách users
export class QueryUsersDto {
  @ApiPropertyOptional({ example: 1, description: 'Trang hiện tại' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ example: 20, description: 'Số lượng mỗi trang' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 20;

  @ApiPropertyOptional({ example: 'MEMBER', enum: UserRole, description: 'Lọc theo role' })
  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;

  @ApiPropertyOptional({ example: 'ACTIVE', enum: AccountStatus, description: 'Lọc theo trạng thái' })
  @IsOptional()
  @IsEnum(AccountStatus)
  status?: AccountStatus;

  @ApiPropertyOptional({ example: 'alice@test.com', description: 'Tìm kiếm theo email hoặc tên' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ example: 'created_at', description: 'Sắp xếp theo field', enum: ['created_at', 'email', 'full_name'] })
  @IsOptional()
  @IsIn(['created_at', 'email', 'full_name'])
  sortBy?: string = 'created_at';

  @ApiPropertyOptional({ example: 'DESC', description: 'Thứ tự sắp xếp', enum: ['ASC', 'DESC'] })
  @IsOptional()
  @IsIn(['ASC', 'DESC'])
  sortOrder?: 'ASC' | 'DESC' = 'DESC';
}

// DTO lock user
export class LockUserDto {
  @ApiProperty({ example: 'Vi phạm quy định cộng đồng', description: 'Lý do khóa tài khoản' })
  @IsString()
  reason: string;

  @ApiPropertyOptional({ example: 7, description: 'Số ngày khóa (để trống = vĩnh viễn)' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  duration?: number;
}

// DTO unlock user
export class UnlockUserDto {
  @ApiPropertyOptional({ example: 'Người dùng đã khắc phục vi phạm', description: 'Lý do mở khóa' })
  @IsOptional()
  @IsString()
  reason?: string;
}

// DTO delete user
export class DeleteUserDto {
  @ApiProperty({ example: 'Tài khoản giả mạo', description: 'Lý do xóa tài khoản' })
  @IsString()
  reason: string;
}

// DTO update role
export class UpdateUserRoleDto {
  @ApiProperty({ example: 'ADMIN', enum: UserRole, description: 'Role mới' })
  @IsEnum(UserRole)
  role: UserRole;

  @ApiPropertyOptional({ example: 'Promote thành admin', description: 'Lý do thay đổi role' })
  @IsOptional()
  @IsString()
  reason?: string;
}

// DTO update user info by admin
export class UpdateUserInfoDto {
  @ApiPropertyOptional({ example: 'John Doe', description: 'Tên đầy đủ' })
  @IsOptional()
  @IsString()
  full_name?: string;

  @ApiPropertyOptional({ example: 'john@example.com', description: 'Email' })
  @IsOptional()
  @IsString()
  email?: string;

  @ApiPropertyOptional({ example: '0901234567', description: 'Số điện thoại' })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({ example: 'Ho Chi Minh', description: 'Khu vực' })
  @IsOptional()
  @IsString()
  region?: string;

  @ApiPropertyOptional({ example: 'Bio của user', description: 'Giới thiệu' })
  @IsOptional()
  @IsString()
  bio?: string;

  @ApiPropertyOptional({ example: 'Update thông tin theo yêu cầu user', description: 'Lý do cập nhật' })
  @IsOptional()
  @IsString()
  reason?: string;
}

// Response DTO
export class UserDetailResponseDto {
  user_id: string;
  email: string;
  full_name: string;
  role: UserRole;
  account_status: AccountStatus;
  member_id?: string;
  trust_score?: number;
  total_exchanges?: number;
  created_at: Date;
  last_login_at?: Date;
}
