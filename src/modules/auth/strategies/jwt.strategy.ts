// src/modules/auth/strategies/jwt.strategy.ts
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy, StrategyOptions } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';
import { AuthService } from '../services/auth.service';
import { AccountStatus } from '../../../infrastructure/database/entities/user.entity';

export type UserRole = 'GUEST' | 'MEMBER' | 'ADMIN';

export interface JwtPayload {
  sub: string;               // user id
  email: string;
  role: UserRole;
  iat?: number;
  exp?: number;
  // bạn có thể thêm: iss, aud, jti...
}

export interface JwtAuthResult {
  userId: string;
  email: string;
  role: UserRole;
  // có thể gắn thêm claim nhẹ để downstream dùng nhanh:
  // permissions?: string[];
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    private readonly config: ConfigService,
    private readonly authService: AuthService,
  ) {
    const secret = config.get<string>('JWT_SECRET');
    if (!secret) throw new Error('JWT_SECRET is not defined');

    const options: StrategyOptions = {
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: secret,
      passReqToCallback: true, // cần để nhận req trong validate
      algorithms: ['HS256'],   // khớp với thuật toán bạn ký token
    };

    // (tuỳ chọn) khai báo issuer/audience nếu bạn dùng khi ký token
    const issuer = config.get<string>('JWT_ISSUER');
    const audience = config.get<string>('JWT_AUDIENCE');
    if (issuer) (options as any).issuer = issuer;
    if (audience) (options as any).audience = audience;

    // (tuỳ chọn) nới clock skew vài giây để tránh lệch thời gian
    (options as any).jsonWebTokenOptions = { clockTolerance: 5 };

    super(options);
  }

  // validate(req, payload) vì đã bật passReqToCallback
  async validate(req: Request, payload: JwtPayload): Promise<JwtAuthResult> {
    // 1) Lấy raw token
    const token = ExtractJwt.fromAuthHeaderAsBearerToken()(req);
    if (!token) {
      throw new UnauthorizedException('No token provided');
    }

    // 2) Kiểm tra blacklist (đã logout/revoked)
    const isBlacklisted = await this.authService.isTokenBlacklisted(token);
    if (isBlacklisted) {
      throw new UnauthorizedException('Token has been revoked');
    }

    // 3) Tìm user & kiểm tra trạng thái
    const user = await this.authService.validateUser(payload.sub);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }
    // tuỳ theo entity của bạn: user.status / user.account_status / user.is_active...
    const status: AccountStatus = user.account_status ?? user.status ?? 'ACTIVE';
    if (status !== 'ACTIVE') {
      throw new UnauthorizedException('Account is not active');
    }

    // (tuỳ chọn) kiểm tra role hợp lệ với claim
    if (payload.role && !['GUEST', 'MEMBER', 'ADMIN'].includes(payload.role)) {
      throw new UnauthorizedException('Invalid role');
    }

    // 4) Trả về object gọn cho Request.user
    return {
      userId: payload.sub,
      email: payload.email,
      role: payload.role,
    };
  }
}
