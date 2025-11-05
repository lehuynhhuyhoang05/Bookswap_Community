// src/modules/auth/services/auth.service.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConflictException, UnauthorizedException, NotFoundException, BadRequestException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

import { AuthService } from './auth.service';
import { User, AuthProvider, UserRole, AccountStatus } from '../../../infrastructure/database/entities/user.entity';
import { Member } from '../../../infrastructure/database/entities/member.entity';
import { PasswordResetToken } from '../../../infrastructure/database/entities/password-reset-token.entity';
import { EmailVerificationToken } from '../../../infrastructure/database/entities/email-verification-token.entity';
import { TokenBlacklist } from '../../../infrastructure/database/entities/token-blacklist.entity';
import { EmailService } from '../../../infrastructure/external-services/email/email.service';
import { RegisterDto, LoginDto, ForgotPasswordDto, ResetPasswordDto } from '../dto/auth.dto';

// Mock bcrypt
jest.mock('bcrypt');

describe('AuthService', () => {
  let service: AuthService;
  let userRepository: Repository<User>;
  let memberRepository: Repository<Member>;
  let resetTokenRepository: Repository<PasswordResetToken>;
  let emailVerifyRepo: Repository<EmailVerificationToken>;
  let tokenBlacklistRepo: Repository<TokenBlacklist>;
  let jwtService: JwtService;
  let emailService: EmailService;
  let configService: ConfigService;

  // Mock repositories
  const mockUserRepository = {
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    update: jest.fn(),
  };

  const mockMemberRepository = {
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
  };

  const mockResetTokenRepository = {
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    update: jest.fn(),
  };

  const mockEmailVerifyRepo = {
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    update: jest.fn(),
  };

  const mockTokenBlacklistRepo = {
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
  };

  const mockJwtService = {
    sign: jest.fn(),
    verify: jest.fn(),
    decode: jest.fn(),
  };

  const mockEmailService = {
    sendVerificationEmail: jest.fn(),
    sendPasswordResetEmail: jest.fn(),
    sendPasswordChangedNotification: jest.fn(),
  };

  const mockConfigService = {
    get: jest.fn((key: string) => {
      const config: Record<string, any> = {
        JWT_EXPIRATION: '7d',
        JWT_REFRESH_EXPIRATION: '30d',
        JWT_SECRET: 'test-secret',
        JWT_REFRESH_SECRET: 'test-refresh-secret',
        JWT_ISSUER: 'bookswap',
        JWT_AUDIENCE: 'bookswap-users',
      };
      return config[key];
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: getRepositoryToken(User), useValue: mockUserRepository },
        { provide: getRepositoryToken(Member), useValue: mockMemberRepository },
        { provide: getRepositoryToken(PasswordResetToken), useValue: mockResetTokenRepository },
        { provide: getRepositoryToken(EmailVerificationToken), useValue: mockEmailVerifyRepo },
        { provide: getRepositoryToken(TokenBlacklist), useValue: mockTokenBlacklistRepo },
        { provide: JwtService, useValue: mockJwtService },
        { provide: EmailService, useValue: mockEmailService },
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
    memberRepository = module.get<Repository<Member>>(getRepositoryToken(Member));
    resetTokenRepository = module.get<Repository<PasswordResetToken>>(getRepositoryToken(PasswordResetToken));
    emailVerifyRepo = module.get<Repository<EmailVerificationToken>>(getRepositoryToken(EmailVerificationToken));
    tokenBlacklistRepo = module.get<Repository<TokenBlacklist>>(getRepositoryToken(TokenBlacklist));
    jwtService = module.get<JwtService>(JwtService);
    emailService = module.get<EmailService>(EmailService);
    configService = module.get<ConfigService>(ConfigService);

    // Clear all mocks before each test
    jest.clearAllMocks();

    // Setup default bcrypt mocks
    (bcrypt.hash as jest.Mock).mockResolvedValue('hashedPassword');
    (bcrypt.compare as jest.Mock).mockResolvedValue(true);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('register', () => {
    const registerDto: RegisterDto = {
      email: 'test@example.com',
      password: 'Password123',
      full_name: 'Test User',
    };

    it('should successfully register a new user', async () => {
      // Arrange
      const mockUser = {
        user_id: 'user-123',
        email: registerDto.email,
        full_name: registerDto.full_name,
        role: UserRole.MEMBER,
        is_email_verified: false,
        account_status: AccountStatus.ACTIVE,
        password_hash: 'hashed-password',
      };

      const mockMember = {
        member_id: 'member-123',
        user_id: mockUser.user_id,
      };

      mockUserRepository.findOne.mockResolvedValue(null); // No existing user
      mockUserRepository.create.mockReturnValue(mockUser);
      mockUserRepository.save.mockResolvedValue(mockUser);
      mockMemberRepository.create.mockReturnValue(mockMember);
      mockMemberRepository.save.mockResolvedValue(mockMember);
      mockEmailVerifyRepo.update.mockResolvedValue({ affected: 0 });
      mockEmailVerifyRepo.create.mockReturnValue({});
      mockEmailVerifyRepo.save.mockResolvedValue({});
      mockEmailService.sendVerificationEmail.mockResolvedValue(undefined);
      mockJwtService.sign.mockReturnValue('mock-jwt-token');

      // Act
      const result = await service.register(registerDto);

      // Assert
      expect(mockUserRepository.findOne).toHaveBeenCalledWith({ 
        where: { email: registerDto.email } 
      });
      expect(mockUserRepository.create).toHaveBeenCalled();
      expect(mockUserRepository.save).toHaveBeenCalled();
      expect(mockMemberRepository.create).toHaveBeenCalled();
      expect(mockMemberRepository.save).toHaveBeenCalled();
      expect(mockEmailService.sendVerificationEmail).toHaveBeenCalled();
      expect(result).toHaveProperty('access_token');
      expect(result).toHaveProperty('refresh_token');
      expect(result).toHaveProperty('user');
      expect(result.user.email).toBe(registerDto.email);
    });

    it('should throw ConflictException if email already exists', async () => {
      // Arrange
      const existingUser = {
        user_id: 'existing-123',
        email: registerDto.email,
      };
      mockUserRepository.findOne.mockResolvedValue(existingUser);

      // Act & Assert
      await expect(service.register(registerDto)).rejects.toThrow(ConflictException);
      await expect(service.register(registerDto)).rejects.toThrow('Email already registered');
      expect(mockUserRepository.save).not.toHaveBeenCalled();
    });

    it('should hash the password before saving', async () => {
      // Arrange
      const mockUser = {
        user_id: 'user-123',
        email: registerDto.email,
        password_hash: 'hashed-password',
      };

      mockUserRepository.findOne.mockResolvedValue(null);
      mockUserRepository.create.mockImplementation((dto: any) => {
        // Verify password is hashed (not plain text)
        expect(dto.password_hash).toBeDefined();
        expect(dto.password_hash).not.toBe(registerDto.password);
        return mockUser;
      });
      mockUserRepository.save.mockResolvedValue(mockUser);
      mockMemberRepository.create.mockReturnValue({ member_id: 'member-123' });
      mockMemberRepository.save.mockResolvedValue({ member_id: 'member-123' });
      mockEmailVerifyRepo.update.mockResolvedValue({ affected: 0 });
      mockEmailVerifyRepo.create.mockReturnValue({});
      mockEmailVerifyRepo.save.mockResolvedValue({});
      mockEmailService.sendVerificationEmail.mockResolvedValue(undefined);
      mockJwtService.sign.mockReturnValue('mock-jwt-token');

      // Act
      await service.register(registerDto);

      // Assert
      expect(mockUserRepository.create).toHaveBeenCalled();
      const createCall = mockUserRepository.create.mock.calls[0][0];
      expect(createCall.password_hash).toBeDefined();
      expect(createCall.password_hash).not.toBe(registerDto.password);
    });
  });

  describe('login', () => {
    const loginDto: LoginDto = {
      email: 'test@example.com',
      password: 'Password123',
    };

    it('should successfully login with valid credentials', async () => {
      // Arrange
      const hashedPassword = await bcrypt.hash(loginDto.password, 10);
      const mockUser = {
        user_id: 'user-123',
        email: loginDto.email,
        password_hash: hashedPassword,
        full_name: 'Test User',
        role: UserRole.MEMBER,
        is_email_verified: true,
        account_status: AccountStatus.ACTIVE,
        last_login_at: new Date(),
      };

      mockUserRepository.findOne.mockResolvedValue(mockUser);
      mockUserRepository.save.mockResolvedValue(mockUser);
      mockMemberRepository.findOne.mockResolvedValue({ member_id: 'member-123' });
      mockJwtService.sign.mockReturnValue('mock-jwt-token');

      // Act
      const result = await service.login(loginDto);

      // Assert
      expect(mockUserRepository.findOne).toHaveBeenCalledWith({ 
        where: { email: loginDto.email } 
      });
      expect(mockUserRepository.save).toHaveBeenCalled();
      expect(result).toHaveProperty('access_token');
      expect(result).toHaveProperty('refresh_token');
      expect(result.user.email).toBe(loginDto.email);
    });

    it('should throw UnauthorizedException if user not found', async () => {
      // Arrange
      mockUserRepository.findOne.mockResolvedValue(null);

      // Act & Assert
      await expect(service.login(loginDto)).rejects.toThrow(UnauthorizedException);
      await expect(service.login(loginDto)).rejects.toThrow('Invalid credentials');
    });

    it('should throw UnauthorizedException if password is incorrect', async () => {
      // Arrange
      const hashedPassword = await bcrypt.hash('WrongPassword123', 10);
      const mockUser = {
        user_id: 'user-123',
        email: loginDto.email,
        password_hash: hashedPassword,
        account_status: AccountStatus.ACTIVE,
      };

      mockUserRepository.findOne.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false); // Override: password doesn't match

      // Act & Assert
      await expect(service.login(loginDto)).rejects.toThrow(UnauthorizedException);
      await expect(service.login(loginDto)).rejects.toThrow('Invalid credentials');
    });

    it('should throw UnauthorizedException if account is not active', async () => {
      // Arrange
      const hashedPassword = await bcrypt.hash(loginDto.password, 10);
      const mockUser = {
        user_id: 'user-123',
        email: loginDto.email,
        password_hash: hashedPassword,
        account_status: AccountStatus.LOCKED, // Not active
      };

      mockUserRepository.findOne.mockResolvedValue(mockUser);

      // Act & Assert
      await expect(service.login(loginDto)).rejects.toThrow(UnauthorizedException);
      await expect(service.login(loginDto)).rejects.toThrow('User not found or inactive');
    });

    it('should update last_login_at timestamp', async () => {
      // Arrange
      const hashedPassword = await bcrypt.hash(loginDto.password, 10);
      const mockUser = {
        user_id: 'user-123',
        email: loginDto.email,
        password_hash: hashedPassword,
        account_status: AccountStatus.ACTIVE,
        last_login_at: new Date('2024-01-01'),
      };

      mockUserRepository.findOne.mockResolvedValue(mockUser);
      mockUserRepository.save.mockResolvedValue(mockUser);
      mockMemberRepository.findOne.mockResolvedValue({ member_id: 'member-123' });
      mockJwtService.sign.mockReturnValue('mock-jwt-token');

      // Act
      await service.login(loginDto);

      // Assert
      expect(mockUserRepository.save).toHaveBeenCalled();
      expect(mockUser.last_login_at).not.toEqual(new Date('2024-01-01'));
    });
  });

  describe('validateUser', () => {
    it('should return user if exists', async () => {
      // Arrange
      const mockUser = {
        user_id: 'user-123',
        email: 'test@example.com',
      };
      mockUserRepository.findOne.mockResolvedValue(mockUser);

      // Act
      const result = await service.validateUser('user-123');

      // Assert
      expect(result).toEqual(mockUser);
      expect(mockUserRepository.findOne).toHaveBeenCalledWith({ 
        where: { user_id: 'user-123' } 
      });
    });

    it('should return null if user does not exist', async () => {
      // Arrange
      mockUserRepository.findOne.mockResolvedValue(null);

      // Act
      const result = await service.validateUser('non-existent-id');

      // Assert
      expect(result).toBeNull();
    });
  });

  describe('findMemberIdByUserId', () => {
    it('should return member_id if member exists', async () => {
      // Arrange
      const mockMember = { member_id: 'member-123' };
      mockMemberRepository.findOne.mockResolvedValue(mockMember);

      // Act
      const result = await service.findMemberIdByUserId('user-123');

      // Assert
      expect(result).toBe('member-123');
      expect(mockMemberRepository.findOne).toHaveBeenCalledWith({
        where: { user_id: 'user-123' },
        select: ['member_id'],
      });
    });

    it('should return undefined if member does not exist', async () => {
      // Arrange
      mockMemberRepository.findOne.mockResolvedValue(null);

      // Act
      const result = await service.findMemberIdByUserId('user-123');

      // Assert
      expect(result).toBeUndefined();
    });
  });

  describe('forgotPassword', () => {
    const forgotPasswordDto: ForgotPasswordDto = {
      email: 'test@example.com',
    };

    it('should send reset email if user exists', async () => {
      // Arrange
      const mockUser = {
        user_id: 'user-123',
        email: forgotPasswordDto.email,
        full_name: 'Test User',
      };

      mockUserRepository.findOne.mockResolvedValue(mockUser);
      mockResetTokenRepository.update.mockResolvedValue({ affected: 0 });
      mockResetTokenRepository.create.mockReturnValue({});
      mockResetTokenRepository.save.mockResolvedValue({});
      mockEmailService.sendPasswordResetEmail.mockResolvedValue(undefined);

      // Act
      const result = await service.forgotPassword(forgotPasswordDto);

      // Assert
      expect(mockUserRepository.findOne).toHaveBeenCalledWith({ 
        where: { email: forgotPasswordDto.email } 
      });
      expect(mockResetTokenRepository.save).toHaveBeenCalled();
      expect(mockEmailService.sendPasswordResetEmail).toHaveBeenCalled();
      expect(result).toHaveProperty('message');
    });

    it('should return generic message if user does not exist (security)', async () => {
      // Arrange
      mockUserRepository.findOne.mockResolvedValue(null);

      // Act
      const result = await service.forgotPassword(forgotPasswordDto);

      // Assert
      expect(result).toEqual({ 
        message: 'If the email exists, a reset link will be sent' 
      });
      expect(mockEmailService.sendPasswordResetEmail).not.toHaveBeenCalled();
    });
  });

  // =========================================================
  // resetPassword
  // =========================================================
  describe('resetPassword', () => {
    const resetPasswordDto: ResetPasswordDto = {
      token: 'valid-reset-token-123',
      new_password: 'NewSecurePass123!',
    };

    it('should reset password successfully with valid token', async () => {
      // Arrange
      const mockTokenRecord = {
        user_id: 'user-123',
        token: resetPasswordDto.token,
        is_used: false,
        expires_at: new Date(Date.now() + 3600000), // 1 hour from now
        user: {
          email: 'test@example.com',
          full_name: 'Test User',
        },
      };

      mockResetTokenRepository.findOne.mockResolvedValue(mockTokenRecord);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed-new-password');
      mockUserRepository.update.mockResolvedValue({ affected: 1 });
      mockResetTokenRepository.save.mockResolvedValue({ ...mockTokenRecord, is_used: true });
      mockEmailService.sendPasswordChangedNotification = jest.fn().mockResolvedValue(undefined);

      // Act
      const result = await service.resetPassword(resetPasswordDto);

      // Assert
      expect(mockResetTokenRepository.findOne).toHaveBeenCalled();
      expect(bcrypt.hash).toHaveBeenCalledWith(resetPasswordDto.new_password, 10);
      expect(mockUserRepository.update).toHaveBeenCalledWith(
        { user_id: mockTokenRecord.user_id },
        { password_hash: 'hashed-new-password' }
      );
      expect(mockResetTokenRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({ is_used: true })
      );
      expect(mockEmailService.sendPasswordChangedNotification).toHaveBeenCalledWith(
        mockTokenRecord.user.email,
        mockTokenRecord.user.full_name
      );
      expect(result).toEqual({ message: 'Password reset successfully' });
    });

    it('should throw BadRequestException if token is invalid', async () => {
      // Arrange
      mockResetTokenRepository.findOne.mockResolvedValue(null);

      // Act & Assert
      await expect(service.resetPassword(resetPasswordDto)).rejects.toThrow(
        BadRequestException
      );
      await expect(service.resetPassword(resetPasswordDto)).rejects.toThrow(
        'Invalid or expired token'
      );
    });

    it('should throw BadRequestException if token is expired', async () => {
      // Arrange
      const expiredTokenRecord = {
        token: resetPasswordDto.token,
        is_used: false,
        expires_at: new Date(Date.now() - 3600000), // 1 hour ago
      };

      mockResetTokenRepository.findOne.mockResolvedValue(null); // MoreThan filter will exclude expired

      // Act & Assert
      await expect(service.resetPassword(resetPasswordDto)).rejects.toThrow(
        BadRequestException
      );
    });

    it('should throw BadRequestException if token is already used', async () => {
      // Arrange
      mockResetTokenRepository.findOne.mockResolvedValue(null); // is_used: false filter will exclude

      // Act & Assert
      await expect(service.resetPassword(resetPasswordDto)).rejects.toThrow(
        BadRequestException
      );
    });
  });

  // =========================================================
  // verifyEmail
  // =========================================================
  describe('verifyEmail', () => {
    const verifyToken = 'valid-verify-token-abc123';

    it('should verify email successfully with valid token', async () => {
      // Arrange
      const mockVerifyRecord = {
        user_id: 'user-456',
        token: verifyToken,
        is_used: false,
        expires_at: new Date(Date.now() + 86400000), // 24 hours from now
        user: {
          email: 'newuser@example.com',
          full_name: 'New User',
        },
      };

      mockEmailVerifyRepo.findOne.mockResolvedValue(mockVerifyRecord);
      mockUserRepository.update.mockResolvedValue({ affected: 1 });
      mockEmailVerifyRepo.save.mockResolvedValue({ ...mockVerifyRecord, is_used: true });

      // Act
      const result = await service.verifyEmail(verifyToken);

      // Assert
      expect(mockEmailVerifyRepo.findOne).toHaveBeenCalled();
      expect(mockUserRepository.update).toHaveBeenCalledWith(
        { user_id: mockVerifyRecord.user_id },
        expect.objectContaining({ 
          is_email_verified: true,
          email_verified_at: expect.any(Date) 
        })
      );
      expect(mockEmailVerifyRepo.save).toHaveBeenCalledWith(
        expect.objectContaining({ is_used: true })
      );
      expect(result).toEqual({ message: 'Email verified successfully' });
    });

    it('should throw BadRequestException if token is invalid or expired', async () => {
      // Arrange
      mockEmailVerifyRepo.findOne.mockResolvedValue(null);

      // Act & Assert
      await expect(service.verifyEmail(verifyToken)).rejects.toThrow(
        BadRequestException
      );
      await expect(service.verifyEmail(verifyToken)).rejects.toThrow(
        'Invalid or expired token'
      );
    });
  });

  // =========================================================
  // refreshAccessToken
  // =========================================================
  describe('refreshAccessToken', () => {
    const refreshToken = 'valid-refresh-token-xyz';

    it('should return new access token with valid refresh token', async () => {
      // Arrange
      const mockPayload = { sub: 'user-789', email: 'user@test.com' };
      const mockUser = {
        user_id: 'user-789',
        email: 'user@test.com',
        role: UserRole.MEMBER,
        account_status: AccountStatus.ACTIVE,
      };

      mockJwtService.verify.mockReturnValue(mockPayload);
      mockTokenBlacklistRepo.findOne.mockResolvedValue(null); // Not blacklisted
      mockUserRepository.findOne.mockResolvedValue(mockUser);
      mockJwtService.sign.mockReturnValue('new-access-token-123');

      // Act
      const result = await service.refreshAccessToken(refreshToken);

      // Assert
      expect(mockJwtService.verify).toHaveBeenCalledWith(
        refreshToken,
        expect.objectContaining({ secret: 'test-refresh-secret' })
      );
      expect(mockTokenBlacklistRepo.findOne).toHaveBeenCalled();
      expect(mockUserRepository.findOne).toHaveBeenCalledWith({ 
        where: { user_id: mockPayload.sub } 
      });
      expect(mockJwtService.sign).toHaveBeenCalled();
      expect(result).toHaveProperty('access_token');
      expect(result).toHaveProperty('token_type', 'Bearer');
      expect(result).toHaveProperty('expires_in');
    });

    it('should throw UnauthorizedException if refresh token is blacklisted', async () => {
      // Arrange
      const mockPayload = { sub: 'user-789' };
      mockJwtService.verify.mockReturnValue(mockPayload);
      mockTokenBlacklistRepo.findOne.mockResolvedValue({ token: refreshToken }); // Blacklisted

      // Act & Assert
      await expect(service.refreshAccessToken(refreshToken)).rejects.toThrow(
        UnauthorizedException
      );
      await expect(service.refreshAccessToken(refreshToken)).rejects.toThrow(
        'Token has been revoked'
      );
    });

    it('should throw UnauthorizedException if user not found', async () => {
      // Arrange
      const mockPayload = { sub: 'user-999' };
      mockJwtService.verify.mockReturnValue(mockPayload);
      mockTokenBlacklistRepo.findOne.mockResolvedValue(null);
      mockUserRepository.findOne.mockResolvedValue(null);

      // Act & Assert
      await expect(service.refreshAccessToken(refreshToken)).rejects.toThrow(
        UnauthorizedException
      );
      await expect(service.refreshAccessToken(refreshToken)).rejects.toThrow(
        'User not found or inactive'
      );
    });

    it('should throw UnauthorizedException if refresh token is expired', async () => {
      // Arrange
      mockJwtService.verify.mockImplementation(() => {
        const error: any = new Error('jwt expired');
        error.name = 'TokenExpiredError';
        throw error;
      });

      // Act & Assert
      await expect(service.refreshAccessToken(refreshToken)).rejects.toThrow(
        UnauthorizedException
      );
      await expect(service.refreshAccessToken(refreshToken)).rejects.toThrow(
        'Refresh token expired'
      );
    });
  });

  // =========================================================
  // logout
  // =========================================================
  describe('logout', () => {
    const userId = 'user-logout-123';
    const accessToken = 'valid-access-token';

    it('should logout successfully and blacklist token', async () => {
      // Arrange
      const mockDecoded = {
        sub: userId,
        exp: Math.floor(Date.now() / 1000) + 3600, // Expires in 1 hour
      };

      mockJwtService.decode.mockReturnValue(mockDecoded);
      mockTokenBlacklistRepo.create.mockReturnValue({
        token: accessToken,
        user_id: userId,
        expires_at: new Date(mockDecoded.exp * 1000),
      });
      mockTokenBlacklistRepo.save.mockResolvedValue({});

      // Act
      const result = await service.logout(userId, accessToken);

      // Assert
      expect(mockJwtService.decode).toHaveBeenCalledWith(accessToken);
      expect(mockTokenBlacklistRepo.create).toHaveBeenCalled();
      expect(mockTokenBlacklistRepo.save).toHaveBeenCalled();
      expect(result).toEqual({ message: 'Logout successful', success: true });
    });

    it('should throw BadRequestException if token is invalid', async () => {
      // Arrange
      mockJwtService.decode.mockReturnValue(null);

      // Act & Assert
      await expect(service.logout(userId, accessToken)).rejects.toThrow(
        BadRequestException
      );
    });
  });

  // =========================================================
  // isTokenBlacklisted
  // =========================================================
  describe('isTokenBlacklisted', () => {
    const token = 'test-token-123';

    it('should return true if token is blacklisted', async () => {
      // Arrange
      mockTokenBlacklistRepo.findOne.mockResolvedValue({ token });

      // Act
      const result = await service.isTokenBlacklisted(token);

      // Assert
      expect(result).toBe(true);
    });

    it('should return false if token is not blacklisted', async () => {
      // Arrange
      mockTokenBlacklistRepo.findOne.mockResolvedValue(null);

      // Act
      const result = await service.isTokenBlacklisted(token);

      // Assert
      expect(result).toBe(false);
    });
  });
});
