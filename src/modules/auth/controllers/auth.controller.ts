import {
  Controller,
  Post,
  Get,
  Body,
  HttpCode,
  HttpStatus,
  Query,
  Header,
  UseGuards,
  Req,
  Headers,
} from '@nestjs/common';
import { 
  ApiTags, 
  ApiOperation, 
  ApiResponse,
  ApiBearerAuth
} from '@nestjs/swagger';
import { AuthService } from '../services/auth.service';
import {
  RegisterDto,
  LoginDto,
  ForgotPasswordDto,
  ResetPasswordDto,
  RefreshTokenDto,
  UserProfileResponseDto,
} from '../dto/auth.dto';
import { Public } from '../../../common/decorators/public.decorator';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('register')
  @ApiOperation({ summary: 'Register new user' })
  @ApiResponse({ status: 201, description: 'User registered successfully' })
  @ApiResponse({ status: 409, description: 'Email already exists' })
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Login user' })
  @ApiResponse({ status: 200, description: 'Login successful' })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Public()
  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Request password reset' })
  @ApiResponse({ status: 200, description: 'Reset email sent if user exists' })
  async forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
    return this.authService.forgotPassword(forgotPasswordDto);
  }

  @Public()
  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Reset password with token' })
  @ApiResponse({ status: 200, description: 'Password reset successfully' })
  @ApiResponse({ status: 400, description: 'Invalid or expired token' })
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    return this.authService.resetPassword(resetPasswordDto);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('bearer')
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiResponse({ 
    status: 200, 
    description: 'Profile retrieved successfully',
    type: UserProfileResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getProfile(@Req() req) {
    return this.authService.getProfile(req.user.userId);
  }

  @Post('refresh')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Refresh access token' })
  @ApiResponse({ 
    status: 200, 
    description: 'Token refreshed successfully',
    schema: {
      type: 'object',
      properties: {
        access_token: { type: 'string', example: 'eyJhbGc...' },
        token_type: { type: 'string', example: 'Bearer' },
        expires_in: { type: 'string', example: '7d' },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Invalid or expired refresh token' })
  async refreshToken(@Body() refreshTokenDto: RefreshTokenDto) {
    return this.authService.refreshAccessToken(refreshTokenDto.refresh_token);
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('bearer')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Logout user' })
  @ApiResponse({ 
    status: 200, 
    description: 'Logout successful',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Logout successful' },
        success: { type: 'boolean', example: true },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async logout(@Req() req, @Headers('authorization') authorization: string) {
    // Extract token from "Bearer <token>"
    const token = authorization?.replace('Bearer ', '');
    
    if (!token) {
      return { message: 'No token provided', success: false };
    }

    return this.authService.logout(req.user.userId, token);
  }

  // CLICK xác thực -> hiện trang HTML "OK, login đi"
  @Public()
  @Get('verify-email')
  @ApiOperation({ summary: 'Verify email by token' })
  @ApiResponse({ status: 200, description: 'HTML OK page' })
  @Header('Content-Type', 'text/html; charset=utf-8')
  async verifyEmail(@Query('token') token: string): Promise<string> {
    await this.authService.verifyEmail(token);
    const loginUrl =
      process.env.FRONTEND_URL?.replace(/\/+$/, '') + '/login' ||
      'http://localhost:5173/login';
    return `
<!DOCTYPE html><html lang="vi"><head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>Xác thực thành công</title>
<style>
  body{margin:0;font-family:Inter,system-ui,Segoe UI,Roboto,Arial,sans-serif;background:#0f172a;color:#e2e8f0;display:flex;align-items:center;justify-content:center;min-height:100vh}
  .card{max-width:560px;background:#111827;border:1px solid #1f2937;border-radius:16px;padding:32px;box-shadow:0 10px 30px rgba(0,0,0,.35);text-align:center}
  h1{font-size:24px;margin:0 0 8px;line-height:1.3}
  p{color:#9ca3af;margin:0 0 24px}
  .ok{display:inline-flex;align-items:center;justify-content:center;width:64px;height:64px;border-radius:50%;background:#16a34a1a;border:1px solid #16a34a33;margin-bottom:16px}
  .ok svg{width:32px;height:32px}
  .btn{display:inline-block;padding:12px 20px;border-radius:10px;border:1px solid #334155;background:#0ea5e9;color:#fff;text-decoration:none;font-weight:600}
  .btn:hover{filter:brightness(.95)}
  .sub{font-size:12px;color:#94a3b8;margin-top:14px}
</style>
</head><body>
  <div class="card">
    <div class="ok" aria-hidden="true">
      <svg viewBox="0 0 24 24" fill="none"><path d="M20 7L9 18l-5-5" stroke="#22c55e" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
    </div>
    <h1>Xác thực email thành công</h1>
    <p>Tài khoản của bạn đã được kích hoạt. Bạn có thể đăng nhập ngay bây giờ.</p>
    <a class="btn" href="${loginUrl}">Đăng nhập</a>
    <div class="sub">Nếu nút không hoạt động, hãy truy cập: <code>${loginUrl}</code></div>
  </div>
</body></html>`;
  }
  @Public()
@Get('reset-password')
@Header('Content-Type', 'text/html')
@ApiOperation({ summary: 'Open reset password page by token (HTML)' })
@ApiResponse({ status: 200, description: 'Reset password page' })
openResetPasswordPage(@Query('token') token: string) {
  const html = `<!doctype html>
<html lang="vi"><head><meta charset="utf-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>Đặt lại mật khẩu</title>
<style>
  body{font-family:system-ui,-apple-system,Segoe UI,Roboto,Arial,sans-serif;background:#f5f7fb;margin:0;padding:0;color:#222}
  .card{max-width:480px;margin:8vh auto;background:#fff;border-radius:16px;box-shadow:0 10px 30px rgba(0,0,0,.08);overflow:hidden}
  .head{padding:24px 28px;background:linear-gradient(135deg,#f093fb,#f5576c);color:#fff}
  .body{padding:24px 28px}
  label{display:block;font-size:14px;margin:12px 0 6px}
  input{width:100%;padding:12px 14px;border:1px solid #e5e7eb;border-radius:10px;font-size:14px;outline:none}
  button{margin-top:18px;width:100%;padding:12px 14px;border:0;border-radius:10px;background:#f5576c;color:#fff;font-weight:600;cursor:pointer}
  .note{font-size:12px;color:#6b7280;margin-top:12px}
  .msg{margin-top:14px;font-size:14px}
  .ok{color:#16a34a}.err{color:#dc2626}
</style>
</head>
<body>
  <div class="card">
    <div class="head"><h2>Đặt lại mật khẩu</h2></div>
    <div class="body">
      <p>Nhập mật khẩu mới cho tài khoản của bạn.</p>
      <form id="f">
        <input type="hidden" name="token" value="${token ?? ''}"/>
        <label>Mật khẩu mới</label>
        <input id="pw" type="password" placeholder="••••••••" required minlength="6"/>
        <label>Nhập lại mật khẩu</label>
        <input id="pw2" type="password" placeholder="••••••••" required minlength="6"/>
        <button type="submit">Cập nhật mật khẩu</button>
        <div id="msg" class="msg"></div>
        <div class="note">Sau khi cập nhật thành công, bạn có thể đăng nhập.</div>
      </form>
    </div>
  </div>
<script>
  const f = document.getElementById('f');
  f.addEventListener('submit', async (e) => {
    e.preventDefault();
    const token = f.querySelector('input[name="token"]').value;
    const p1 = document.getElementById('pw').value;
    const p2 = document.getElementById('pw2').value;
    const msg = document.getElementById('msg');
    msg.textContent='';

    if(!token){ msg.textContent='Token không hợp lệ.'; msg.className='msg err'; return; }
    if(p1!==p2){ msg.textContent='Mật khẩu nhập lại không khớp.'; msg.className='msg err'; return; }

    try{
      const r = await fetch('/auth/reset-password', {
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body: JSON.stringify({ token, new_password: p1 })
      });
      const data = await r.json();
      if(r.ok){
        msg.textContent='✅ Cập nhật mật khẩu thành công. Bạn có thể đăng nhập!';
        msg.className='msg ok';
      }else{
        msg.textContent=data?.message || 'Có lỗi xảy ra, vui lòng thử lại.';
        msg.className='msg err';
      }
    }catch(err){
      msg.textContent='Không thể kết nối máy chủ.';
      msg.className='msg err';
    }
  });
</script>
</body></html>`;
  return html;
}
}
