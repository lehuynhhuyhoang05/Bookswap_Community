// src/modules/auth/services/auth.service.ts
import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  BadRequestException,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { JwtService, JwtSignOptions } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan } from 'typeorm';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { v4 as uuidv4 } from 'uuid';

import {
  User,
  AuthProvider,
  UserRole,
  AccountStatus, // ✅ dùng enum thay vì string
} from '../../../infrastructure/database/entities/user.entity';
import { Member } from '../../../infrastructure/database/entities/member.entity';
import { PasswordResetToken } from '../../../infrastructure/database/entities/password-reset-token.entity';
import { EmailVerificationToken } from '../../../infrastructure/database/entities/email-verification-token.entity';
import { TokenBlacklist } from '../../../infrastructure/database/entities/token-blacklist.entity';
import { EmailService } from '../../../infrastructure/external-services/email/email.service';
import {
  RegisterDto,
  LoginDto,
  ForgotPasswordDto,
  ResetPasswordDto,
} from '../dto/auth.dto';

type JwtClaims = { sub: string; email: string; role: UserRole; memberId?: string };

// ------------------ helpers ------------------
function durationToSeconds(v: string | number | undefined, fallbackSec: number): number {
  if (typeof v === 'number') return v;
  if (typeof v !== 'string') return fallbackSec;
  const m = /^(\d+)([smhd])?$/.exec(v.trim()); // e.g. 3600, 15m, 12h, 7d
  if (!m) return fallbackSec;
  const n = parseInt(m[1], 10);
  const unit = m[2] as 's' | 'm' | 'h' | 'd' | undefined;
  switch (unit) {
    case 's': return n;
    case 'm': return n * 60;
    case 'h': return n * 3600;
    case 'd': return n * 86400;
    default:  return n; // no unit = seconds
  }
}

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
    @InjectRepository(Member) private memberRepository: Repository<Member>,
    @InjectRepository(PasswordResetToken) private resetTokenRepository: Repository<PasswordResetToken>,
    @InjectRepository(EmailVerificationToken) private emailVerifyRepo: Repository<EmailVerificationToken>,
    @InjectRepository(TokenBlacklist) private tokenBlacklistRepo: Repository<TokenBlacklist>,
    private jwtService: JwtService,
    private emailService: EmailService,
    private configService: ConfigService,
  ) {}

  // =========================================================
  // JWT helpers
  // =========================================================
  private signAccessToken(payload: JwtClaims): { token: string; expiresInSec: number } {
  const expiresRaw = this.configService.get<string | number>('JWT_EXPIRATION') ?? '7d';
  const expires: string | number = expiresRaw;
    const issuer  = this.configService.get<string>('JWT_ISSUER');
    const audience= this.configService.get<string>('JWT_AUDIENCE');

    const opts: JwtSignOptions = {
      expiresIn: expires as any,
      ...(issuer && { issuer }),
      ...(audience && { audience }),
      // algorithm: 'HS256',
    };
    const token = this.jwtService.sign(payload, opts);
    const expiresInSec = durationToSeconds(expires, 7 * 24 * 3600);
    return { token, expiresInSec };
  }

  private signRefreshToken(payload: JwtClaims): { token: string; expiresInSec: number } {
  const expiresRaw = this.configService.get<string | number>('JWT_REFRESH_EXPIRATION') ?? '30d';
  const expires: string | number = expiresRaw;
    const secret  = this.configService.get<string>('JWT_REFRESH_SECRET');
    const issuer  = this.configService.get<string>('JWT_ISSUER');
    const audience= this.configService.get<string>('JWT_AUDIENCE');

    const opts: JwtSignOptions = {
      secret,
      expiresIn: expires as any,
      ...(issuer && { issuer }),
      ...(audience && { audience }),
    };
    const token = this.jwtService.sign(payload, opts);
    const expiresInSec = durationToSeconds(expires, 30 * 24 * 3600);
    return { token, expiresInSec };
  }

  // =========================================================
  // Misc helpers
  // =========================================================
  async validateUser(userId: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { user_id: userId } });
  }

  /** Dùng cho JwtStrategy/LibraryController để map nhanh user -> member */
  async findMemberIdByUserId(userId: string): Promise<string | undefined> {
    const mem = await this.memberRepository.findOne({
      where: { user_id: userId },
      select: ['member_id'],
    });
    return mem?.member_id;
  }

  private generateToken(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  private async issueEmailVerificationTokenAndSend(user: User) {
    await this.emailVerifyRepo.update(
      { user_id: user.user_id, is_used: false },
      { is_used: true },
    );

    const token = this.generateToken();
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24h

    const rec = this.emailVerifyRepo.create({
      user_id: user.user_id,
      token,
      expires_at: expiresAt,
    });
    await this.emailVerifyRepo.save(rec);

    // Try to send email, but don't fail registration if email fails
    try {
      await this.emailService.sendVerificationEmail(
        user.email,
        token,
        user.full_name,
      );
    } catch (error) {
      this.logger.warn(`Failed to send verification email to ${user.email}: ${error.message}`);
      // Continue with registration even if email fails
    }
  }

  // =========================================================
  // Register
  // =========================================================
  async register(registerDto: RegisterDto) {
    const existingUser = await this.userRepository.findOne({ where: { email: registerDto.email } });
    if (existingUser) throw new ConflictException('Email already registered');

    const hashedPassword = await bcrypt.hash(registerDto.password, 10);
    const user = this.userRepository.create({
      email: registerDto.email,
      password_hash: hashedPassword,
      full_name: registerDto.full_name,
      auth_provider: AuthProvider.LOCAL,
      role: UserRole.MEMBER,
      is_email_verified: false,
      account_status: AccountStatus.ACTIVE, // ✅ enum, không phải string
    } as Partial<User>);
    const savedUser = await this.userRepository.save(user);

    const member = this.memberRepository.create({ user_id: savedUser.user_id } as Partial<Member>);
    await this.memberRepository.save(member);

    await this.issueEmailVerificationTokenAndSend(savedUser);

    const payload: JwtClaims = {
      sub: savedUser.user_id,
      email: savedUser.email,
      role: savedUser.role,
      memberId: member.member_id,
    };

    const { token: access_token,  expiresInSec: access_expires }  = this.signAccessToken(payload);
    const { token: refresh_token, expiresInSec: _refresh_expires } = this.signRefreshToken(payload);

    return {
      access_token,
      refresh_token,
      token_type: 'Bearer',
      expires_in: access_expires,
      user: {
        user_id: savedUser.user_id,
        email: savedUser.email,
        full_name: savedUser.full_name,
        role: savedUser.role,
        is_email_verified: savedUser.is_email_verified,
      },
    };
  }

  // =========================================================
  // Login
  // =========================================================
  async login(loginDto: LoginDto) {
    const user = await this.userRepository.findOne({ where: { email: loginDto.email } });
    if (!user || !user.password_hash) throw new UnauthorizedException('Invalid credentials');

    const ok = await bcrypt.compare(loginDto.password, user.password_hash);
    if (!ok) throw new UnauthorizedException('Invalid credentials');

    if (user.account_status !== AccountStatus.ACTIVE) {
      throw new UnauthorizedException('User not found or inactive');
    }

    user.last_login_at = new Date();
    await this.userRepository.save(user);

    const payload: JwtClaims = { sub: user.user_id, email: user.email, role: user.role };
    // attach memberId when available to avoid a DB lookup in JwtStrategy
    try {
      const memId = await this.findMemberIdByUserId(user.user_id);
      if (memId) (payload as any).memberId = memId;
    } catch {}
    const { token: access_token, expiresInSec: access_expires } = this.signAccessToken(payload);
    const { token: refresh_token } = this.signRefreshToken(payload);

    return {
      access_token,
      refresh_token,
      token_type: 'Bearer',
      expires_in: access_expires,
      user: {
        user_id: user.user_id,
        email: user.email,
        full_name: user.full_name,
        role: user.role,
        is_email_verified: user.is_email_verified,
      },
    };
  }

  // =========================================================
  // Forgot / Reset Password
  // =========================================================
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
    } as Partial<PasswordResetToken>);
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

    await this.emailService.sendPasswordChangedNotification(
      tokenRecord.user.email,
      tokenRecord.user.full_name,
    );
    return { message: 'Password reset successfully' };
  }

  // =========================================================
  // Verify Email
  // =========================================================
  async verifyEmail(token: string) {
    const record = await this.emailVerifyRepo.findOne({
      where: { token, is_used: false, expires_at: MoreThan(new Date()) },
      relations: ['user'],
    });
    if (!record) throw new BadRequestException('Invalid or expired token');

    await this.userRepository.update(
      { user_id: record.user_id },
      { is_email_verified: true, email_verified_at: new Date() as any },
    );

    record.is_used = true;
    await this.emailVerifyRepo.save(record);

    return { message: 'Email verified successfully' };
  }

  // =========================================================
  // GET /auth/me
  // =========================================================
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
        'account_status',
      ],
    });
    if (!user) throw new NotFoundException('User not found');

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
      account_status: user.account_status,
      member: memberProfile,
    };
  }

  // =========================================================
  // PATCH /auth/profile - Update user profile
  // =========================================================
  async updateProfile(userId: string, updateData: any) {
    const user = await this.userRepository.findOne({ 
      where: { user_id: userId },
      relations: ['member']
    });
    
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Update user table fields
    if (updateData.full_name !== undefined) {
      user.full_name = updateData.full_name;
    }
    if (updateData.avatar_url !== undefined) {
      user.avatar_url = updateData.avatar_url;
    }

    await this.userRepository.save(user);

    // Update member table fields if user is a MEMBER
    if (user.role === UserRole.MEMBER) {
      let member = user.member;
      
      if (!member) {
        // Create member profile if doesn't exist
        member = this.memberRepository.create({
          member_id: uuidv4(),
          user_id: userId,
        });
      }

      if (updateData.phone !== undefined) {
        member.phone = updateData.phone;
      }
      if (updateData.address !== undefined) {
        member.address = updateData.address;
      }
      if (updateData.bio !== undefined) {
        member.bio = updateData.bio;
      }
      if (updateData.region !== undefined) {
        member.region = updateData.region;
      }

      await this.memberRepository.save(member);
    }

    // Return updated profile
    return this.getProfile(userId);
  }

  // =========================================================
  // POST /auth/refresh
  // =========================================================
  async refreshAccessToken(refreshToken: string) {
    try {
      const payload = this.jwtService.verify(refreshToken, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      }) as { sub: string };

      // Check blacklist
      const isBlacklisted = await this.tokenBlacklistRepo.findOne({
        where: { token: refreshToken, expires_at: MoreThan(new Date()) },
      });
      if (isBlacklisted) throw new UnauthorizedException('Token has been revoked');

      const user = await this.userRepository.findOne({ where: { user_id: payload.sub } });
      if (!user || user.account_status !== AccountStatus.ACTIVE) {
        throw new UnauthorizedException('User not found or inactive');
      }

      const { token: access_token, expiresInSec } = this.signAccessToken({
        sub: user.user_id,
        email: user.email,
        role: user.role,
      });

      return {
        access_token,
        token_type: 'Bearer',
        expires_in: expiresInSec,
      };
    } catch (error: any) {
      if (error?.name === 'TokenExpiredError') {
        throw new UnauthorizedException('Refresh token expired');
      }
      if (error?.name === 'JsonWebTokenError') {
        throw new UnauthorizedException('Invalid refresh token');
      }
      throw error;
    }
  }

  // =========================================================
  // POST /auth/logout
  // =========================================================
  async logout(userId: string, accessToken: string) {
    try {
      const decoded = this.jwtService.decode(accessToken) as any;
      if (!decoded || !decoded.exp) throw new BadRequestException('Invalid token');

      const expiresAt = new Date(decoded.exp * 1000);

      const blacklistEntry = this.tokenBlacklistRepo.create({
        token: accessToken,
        user_id: userId,
        expires_at: expiresAt,
      } as Partial<TokenBlacklist>);

      await this.tokenBlacklistRepo.save(blacklistEntry);

      return { message: 'Logout successful', success: true };
    } catch {
      throw new BadRequestException('Failed to logout');
    }
  }

  // =========================================================
  // Blacklist helpers
  // =========================================================
  async isTokenBlacklisted(token: string): Promise<boolean> {
    const blacklisted = await this.tokenBlacklistRepo.findOne({
      where: { token, expires_at: MoreThan(new Date()) },
    });
    return !!blacklisted;
  }

  async cleanupExpiredBlacklistTokens(): Promise<void> {
    await this.tokenBlacklistRepo
      .createQueryBuilder()
      .delete()
      .where('expires_at < :now', { now: new Date() })
      .execute();
  }
}
