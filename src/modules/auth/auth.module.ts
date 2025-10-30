import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';

import { AuthController } from './controllers/auth.controller';
import { AuthService } from './services/auth.service';
import { JwtStrategy } from './strategies/jwt.strategy';

import { User } from '../../infrastructure/database/entities/user.entity';
import { Member } from '../../infrastructure/database/entities/member.entity';
import { PasswordResetToken } from '../../infrastructure/database/entities/password-reset-token.entity';
import { EmailVerificationToken } from '../../infrastructure/database/entities/email-verification-token.entity';
import { EmailService } from '../../infrastructure/external-services/email/email.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Member, PasswordResetToken, EmailVerificationToken]),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'dev_secret',
      signOptions: { expiresIn: '7d' },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, EmailService],
  exports: [AuthService],
})
export class AuthModule {}
