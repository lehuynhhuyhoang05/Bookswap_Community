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
  };

  const mockEmailService = {
    sendVerificationEmail: jest.fn(),
    sendPasswordResetEmail: jest.fn(),
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
});
