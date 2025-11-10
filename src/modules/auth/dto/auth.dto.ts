import { IsEmail, IsString, MinLength, IsNotEmpty, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterDto {
  @ApiProperty({ example: 'user@example.com', description: 'Email address' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ 
    example: 'Password123', 
    description: 'Password (min 8 chars, must contain uppercase, lowercase, and number)',
    minLength: 8 
  })
  @IsString()
  @MinLength(8)
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, {
    message: 'Password must contain at least one uppercase letter, one lowercase letter, and one number'
  })
  password: string;

  @ApiProperty({ example: 'John Doe', description: 'Full name' })
  @IsString()
  @IsNotEmpty()
  full_name: string;
}

export class LoginDto {
  @ApiProperty({ example: 'user@example.com' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ example: 'Password123' })
  @IsString()
  @IsNotEmpty()
  password: string;
}

export class ForgotPasswordDto {
  @ApiProperty({ example: 'user@example.com', description: 'Registered email address' })
  @IsEmail()
  @IsNotEmpty()
  email: string;
}

export class ResetPasswordDto {
  @ApiProperty({ example: 'token-from-email' })
  @IsString()
  @IsNotEmpty()
  token: string;

  @ApiProperty({ example: 'NewPassword123', minLength: 8 })
  @IsString()
  @MinLength(8)
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, {
    message: 'Password must contain at least one uppercase letter, one lowercase letter, and one number'
  })
  new_password: string;
}

export class VerifyEmailDto {
  @ApiProperty({ example: 'token-from-email' })
  @IsString()
  @IsNotEmpty()
  token: string;
}
export class RefreshTokenDto {
  @ApiProperty({
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    description: 'Refresh token received from login/register',
  })
  @IsString()
  refresh_token: string;
}

export class UserProfileResponseDto {
  @ApiProperty({ example: 'user-uuid-123' })
  user_id: string;

  @ApiProperty({ example: 'john@example.com' })
  email: string;

  @ApiProperty({ example: 'John Doe' })
  full_name: string;

  @ApiProperty({ example: 'https://example.com/avatar.jpg', nullable: true })
  avatar_url?: string;

  @ApiProperty({ example: 'MEMBER', enum: ['GUEST', 'MEMBER', 'ADMIN'] })
  role: string;

  @ApiProperty({ example: true })
  is_email_verified: boolean;

  @ApiProperty({ example: '2025-01-15T10:30:00Z', nullable: true })
  email_verified_at?: string;

  @ApiProperty({ example: '2025-01-20T14:25:00Z', nullable: true })
  last_login_at?: string;

  @ApiProperty({ 
    description: 'Member profile data',
    required: false,
    type: Object,
  })
  member?: {
    member_id: string;
    region?: string;
    phone?: string;
    bio?: string;
    trust_score: number;
    average_rating: number;
    is_verified: boolean;
    total_exchanges: number;
    completed_exchanges: number;
  };
}