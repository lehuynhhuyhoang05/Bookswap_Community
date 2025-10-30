import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan } from 'typeorm';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';

import { User, AuthProvider, UserRole } from '../../../infrastructure/database/entities/user.entity';
import { Member } from '../../../infrastructure/database/entities/member.entity';
import { PasswordResetToken } from '../../../infrastructure/database/entities/password-reset-token.entity';
import { EmailVerificationToken } from '../../../infrastructure/database/entities/email-verification-token.entity';

import { EmailService } from '../../../infrastructure/external-services/email/email.service';
import { RegisterDto, LoginDto, ForgotPasswordDto, ResetPasswordDto } from '../dto/auth.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
    @InjectRepository(Member) private memberRepository: Repository<Member>,
    @InjectRepository(PasswordResetToken) private resetTokenRepository: Repository<PasswordResetToken>,
    @InjectRepository(EmailVerificationToken) private emailVerifyRepo: Repository<EmailVerificationToken>,
    private jwtService: JwtService,
    private emailService: EmailService,
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
    return {
      access_token: this.jwtService.sign(payload),
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
    return {
      access_token: this.jwtService.sign(payload),
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
