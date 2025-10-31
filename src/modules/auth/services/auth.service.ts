import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan } from 'typeorm';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';

import { User, AuthProvider, UserRole } from '../../../infrastructure/database/entities/user.entity';
import { Member } from '../../../infrastructure/database/entities/member.entity';
import { PasswordResetToken } from '../../../infrastructure/database/entities/password-reset-token.entity';
import { EmailVerificationToken } from '../../../infrastructure/database/entities/email-verification-token.entity';
import { TokenBlacklist } from '../../../infrastructure/database/entities/token-blacklist.entity';
import { EmailService } from '../../../infrastructure/external-services/email/email.service';
import { RegisterDto, LoginDto, ForgotPasswordDto, ResetPasswordDto } from '../dto/auth.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
    @InjectRepository(Member) private memberRepository: Repository<Member>,
    @InjectRepository(PasswordResetToken) private resetTokenRepository: Repository<PasswordResetToken>,
    @InjectRepository(EmailVerificationToken) private emailVerifyRepo: Repository<EmailVerificationToken>,
     @InjectRepository(TokenBlacklist) 
    private tokenBlacklistRepo: Repository<TokenBlacklist>,
    private jwtService: JwtService,
    private emailService: EmailService,
    private configService: ConfigService,
  ) {}

  /** -------- Register -------- */
  async register(registerDto: RegisterDto) {
    const existingUser = await this.userRepository.findOne({ where: { email: registerDto.email } });
    if (existingUser) {
      throw new ConflictException('Email already registered');
    }

    const hashedPassword = await bcrypt.hash(registerDto.password, 10);
    const user = this.userRepository.create({
      email: registerDto.email,
      password_hash: hashedPassword,
      full_name: registerDto.full_name,
      auth_provider: AuthProvider.LOCAL,
      role: UserRole.MEMBER,
      is_email_verified: false,
    });
    const savedUser = await this.userRepository.save(user);

    const member = this.memberRepository.create({ user_id: savedUser.user_id });
    await this.memberRepository.save(member);

    // tạo token xác thực 24h & gửi email
    await this.issueEmailVerificationTokenAndSend(savedUser);

    const payload = { sub: savedUser.user_id, email: savedUser.email, role: savedUser.role };
    
    const access_token = this.jwtService.sign(payload, {
      expiresIn: this.configService.get('JWT_EXPIRATION') || '7d',
    });

    const refresh_token = this.jwtService.sign(payload, {
      secret: this.configService.get('JWT_REFRESH_SECRET'),
      expiresIn: this.configService.get('JWT_REFRESH_EXPIRATION') || '30d',
    });

    return {
      access_token,
      refresh_token,
      user: {
        user_id: savedUser.user_id,
        email: savedUser.email,
        full_name: savedUser.full_name,
        role: savedUser.role,
        is_email_verified: savedUser.is_email_verified,
      },
    };
  }

  /** -------- Login -------- */
  async login(loginDto: LoginDto) {
    const user = await this.userRepository.findOne({ where: { email: loginDto.email } });
    if (!user || !user.password_hash) {
      throw new UnauthorizedException('Invalid credentials');
    }
    const ok = await bcrypt.compare(loginDto.password, user.password_hash);
    if (!ok) {
      throw new UnauthorizedException('Invalid credentials');
    }
    user.last_login_at = new Date();
    await this.userRepository.save(user);

    const payload = { sub: user.user_id, email: user.email, role: user.role };
    
    const access_token = this.jwtService.sign(payload, {
      expiresIn: this.configService.get('JWT_EXPIRATION') || '7d',
    });

    const refresh_token = this.jwtService.sign(payload, {
      secret: this.configService.get('JWT_REFRESH_SECRET'),
      expiresIn: this.configService.get('JWT_REFRESH_EXPIRATION') || '30d',
    });

    return {
      access_token,
      refresh_token,
      user: {
        user_id: user.user_id,
        email: user.email,
        full_name: user.full_name,
        role: user.role,
        is_email_verified: user.is_email_verified,
      },
    };
  }

  /** -------- Forgot / Reset Password -------- */
  async forgotPassword(forgotPasswordDto: ForgotPasswordDto) {
    const user = await this.userRepository.findOne({ where: { email: forgotPasswordDto.email } });
    if (!user) return { message: 'If the email exists, a reset link will be sent' };

    await this.resetTokenRepository.update(
      { user_id: user.user_id, is_used: false },
      { is_used: true },
    );

    const resetToken = this.generateToken();
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1h

    const token = this.resetTokenRepository.create({
      user_id: user.user_id,
      token: resetToken,
      expires_at: expiresAt,
    });
    await this.resetTokenRepository.save(token);

    await this.emailService.sendPasswordResetEmail(user.email, resetToken, user.full_name);
    return { message: 'If the email exists, a reset link will be sent' };
  }

  async resetPassword(resetPasswordDto: ResetPasswordDto) {
    const tokenRecord = await this.resetTokenRepository.findOne({
      where: {
        token: resetPasswordDto.token,
        is_used: false,
        expires_at: MoreThan(new Date()),
      },
      relations: ['user'],
    });
    if (!tokenRecord) throw new BadRequestException('Invalid or expired token');

    const hashedPassword = await bcrypt.hash(resetPasswordDto.new_password, 10);
    await this.userRepository.update({ user_id: tokenRecord.user_id }, { password_hash: hashedPassword });

    tokenRecord.is_used = true;
    await this.resetTokenRepository.save(tokenRecord);

    await this.emailService.sendPasswordChangedNotification(tokenRecord.user.email, tokenRecord.user.full_name);
    return { message: 'Password reset successfully' };
  }

  /** -------- Verify Email (GET /auth/verify-email?token=...) -------- */
  async verifyEmail(token: string) {
    const record = await this.emailVerifyRepo.findOne({
      where: { token, is_used: false, expires_at: MoreThan(new Date()) },
      relations: ['user'],
    });
    if (!record) throw new BadRequestException('Invalid or expired token');

    // set verified
    await this.userRepository.update(
      { user_id: record.user_id },
      { is_email_verified: true, email_verified_at: new Date() as any },
    );

    // mark token used
    record.is_used = true;
    await this.emailVerifyRepo.save(record);

    return { message: 'Email verified successfully' };
  }

  /** -------- GET /auth/me -------- */
  async getProfile(userId: string) {
    const user = await this.userRepository.findOne({
      where: { user_id: userId },
      select: [
        'user_id',
        'email',
        'full_name',
        'avatar_url',
        'role',
        'is_email_verified',
        'email_verified_at',
        'last_login_at',
      ],
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Get member profile if role is MEMBER
    let memberProfile: Member | null = null;
    if (user.role === UserRole.MEMBER) {
      memberProfile = await this.memberRepository.findOne({
        where: { user_id: userId },
        select: [
          'member_id',
          'region',
          'phone',
          'bio',
          'trust_score',
          'average_rating',
          'is_verified',
          'total_exchanges',
          'completed_exchanges',
        ],
      });
    }

    return {
      user_id: user.user_id,
      email: user.email,
      full_name: user.full_name,
      avatar_url: user.avatar_url,
      role: user.role,
      is_email_verified: user.is_email_verified,
      email_verified_at: user.email_verified_at,
      last_login_at: user.last_login_at,
      member: memberProfile,
    };
  }

  /** -------- POST /auth/refresh -------- */
  async refreshAccessToken(refreshToken: string) {
    try {
      // Verify refresh token với secret riêng
      const payload = this.jwtService.verify(refreshToken, {
        secret: this.configService.get('JWT_REFRESH_SECRET'),
      });

      // Check if token is blacklisted
      const isBlacklisted = await this.tokenBlacklistRepo.findOne({
        where: { 
          token: refreshToken,
          expires_at: MoreThan(new Date()),
        },
      });

      if (isBlacklisted) {
        throw new UnauthorizedException('Token has been revoked');
      }

      // Check if user still exists and is active
      const user = await this.userRepository.findOne({
        where: { user_id: payload.sub },
      });

      if (!user || user.account_status !== 'ACTIVE') {
        throw new UnauthorizedException('User not found or inactive');
      }

      // Generate new access token
      const newPayload = {
        sub: user.user_id,
        email: user.email,
        role: user.role,
      };

      const access_token = this.jwtService.sign(newPayload, {
        expiresIn: this.configService.get('JWT_EXPIRATION') || '7d',
      });

      return {
        access_token,
        token_type: 'Bearer',
        expires_in: '7d',
      };
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        throw new UnauthorizedException('Refresh token expired');
      }
      if (error.name === 'JsonWebTokenError') {
        throw new UnauthorizedException('Invalid refresh token');
      }
      throw error;
    }
  }

  /** -------- POST /auth/logout -------- */
  async logout(userId: string, accessToken: string) {
    try {
      // Decode token để lấy expiration time
      const decoded = this.jwtService.decode(accessToken) as any;
      
      if (!decoded || !decoded.exp) {
        throw new BadRequestException('Invalid token');
      }

      // Thêm token vào blacklist
      const expiresAt = new Date(decoded.exp * 1000);
      
      const blacklistEntry = this.tokenBlacklistRepo.create({
        token: accessToken,
        user_id: userId,
        expires_at: expiresAt,
      });

      await this.tokenBlacklistRepo.save(blacklistEntry);

      return {
        message: 'Logout successful',
        success: true,
      };
    } catch (error) {
      throw new BadRequestException('Failed to logout');
    }
  }

  /** -------- Helper: Check if token is blacklisted -------- */
  async isTokenBlacklisted(token: string): Promise<boolean> {
    const blacklisted = await this.tokenBlacklistRepo.findOne({
      where: {
        token,
        expires_at: MoreThan(new Date()),
      },
    });

    return !!blacklisted;
  }

  /** -------- Cleanup expired blacklist tokens (run by cron) -------- */
  async cleanupExpiredBlacklistTokens(): Promise<void> {
    await this.tokenBlacklistRepo
      .createQueryBuilder()
      .delete()
      .where('expires_at < :now', { now: new Date() })
      .execute();
  }

  /** -------- Helpers -------- */
  async validateUser(userId: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { user_id: userId } });
  }

  private generateToken(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  private async issueEmailVerificationTokenAndSend(user: User) {
    // vô hiệu các token cũ còn active
    await this.emailVerifyRepo.update({ user_id: user.user_id, is_used: false }, { is_used: true });

    const token = this.generateToken();
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24h

    const rec = this.emailVerifyRepo.create({
      user_id: user.user_id,
      token,
      expires_at: expiresAt,
    });
    await this.emailVerifyRepo.save(rec);

    await this.emailService.sendVerificationEmail(user.email, token, user.full_name);
  }
}
