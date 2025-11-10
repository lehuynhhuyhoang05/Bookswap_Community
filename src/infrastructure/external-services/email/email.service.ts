// src/infrastructure/external-services/email/email.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MailService, type MailDataRequired } from '@sendgrid/mail';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private readonly sg: MailService;

  constructor(private readonly config: ConfigService) {
    this.sg = new MailService();
    const key = this.config.get<string>('SENDGRID_API_KEY');
    if (key) {
      this.sg.setApiKey(key);
      this.logger.log('SendGrid initialized.');
    } else {
      this.logger.warn('Missing SENDGRID_API_KEY — emails will fail.');
    }
  }

  // ---- Helpers ----
  private fromEmail(): string {
    // Có thể đặt dạng "BookSwap Community <no-reply@bookswap.local>"
    return this.config.get<string>('SENDGRID_FROM_EMAIL', 'BookSwap Community <no-reply@bookswap.local>');
  }
  private replyTo(): string {
    return this.config.get<string>('SENDGRID_REPLY_TO', this.fromEmail());
  }
  private appUrl(): string {
    return this.config.get<string>('APP_URL', 'http://localhost:3000');
  }
  private esc(s: string) {
    return String(s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }
  private build(to: string, subject: string, html: string, text?: string): MailDataRequired {
    return {
      to,
      from: this.fromEmail(),
      replyTo: this.replyTo(),
      subject,
      html,
      ...(text ? { text } : {}),
      trackingSettings: {
        // Tránh SendGrid rewrite link gây sai chữ ký hoặc param
        clickTracking: { enable: false, enableText: false },
      },
    };
  }

  // ---- 1) Verification Email ----
  async sendVerificationEmail(email: string, token: string, userName: string) {
    const url = `${this.appUrl()}/auth/verify-email?token=${encodeURIComponent(token)}`;

    const html = `<!DOCTYPE html>
<html><head><meta charset="utf-8" />
<style>
body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
.container { max-width: 600px; margin: 0 auto; padding: 20px; }
.header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
.content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
.button { display: inline-block; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
.footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
.link { word-break: break-all; color: #667eea; }
</style></head>
<body>
  <div class="container">
    <div class="header">
      <h1>📚 BookSwap Community</h1>
    </div>
    <div class="content">
      <h2>Xin chào ${this.esc(userName)}!</h2>
      <p>Cảm ơn bạn đã đăng ký tài khoản tại BookSwap Community.</p>
      <p>Vui lòng nhấn vào nút bên dưới để xác thực email của bạn:</p>
      <div style="text-align: center;">
        <a href="${url}" class="button">Xác thực Email</a>
      </div>
      <p style="color: #666; font-size: 14px;">Hoặc copy link sau vào trình duyệt:</p>
      <p class="link">${url}</p>
      <p style="margin-top: 30px; color: #999;">Link này sẽ hết hạn sau 24 giờ.</p>
    </div>
    <div class="footer">
      <p>© 2025 BookSwap Community. All rights reserved.</p>
    </div>
  </div>
</body></html>`;

    const text = `Xin chào ${userName},\n\nHãy xác thực email của bạn bằng liên kết sau:\n${url}\n\nNếu không phải bạn yêu cầu, vui lòng bỏ qua email này.`;

    try {
      await this.sg.send(this.build(email, 'Xác thực tài khoản BookSwap Community', html, text));
      this.logger.log(`Verification email sent to ${email}`);
    } catch (error: any) {
      this.logger.error(`Failed to send verification email: ${error?.message || error}`);
      throw error;
    }
  }

  // ---- 2) Password Reset Email ----
  async sendPasswordResetEmail(email: string, token: string, userName: string) {
    const url = `${this.appUrl()}/auth/reset-password?token=${encodeURIComponent(token)}`;

    const html = `<!DOCTYPE html>
<html><head><meta charset="utf-8" />
<style>
body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
.container { max-width: 600px; margin: 0 auto; padding: 20px; }
.header { background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
.content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
.button { display: inline-block; padding: 12px 30px; background: #f5576c; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
.warning { background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; }
.footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
.link { word-break: break-all; color: #f5576c; }
</style></head>
<body>
  <div class="container">
    <div class="header">
      <h1>🔐 Đặt lại mật khẩu</h1>
    </div>
    <div class="content">
      <h2>Xin chào ${this.esc(userName)}!</h2>
      <p>Chúng tôi nhận được yêu cầu đặt lại mật khẩu cho tài khoản của bạn.</p>
      <p>Nhấn vào nút bên dưới để tạo mật khẩu mới:</p>
      <div style="text-align: center;">
        <a href="${url}" class="button">Đặt lại mật khẩu</a>
      </div>
      <p style="color: #666; font-size: 14px;">Hoặc copy link sau vào trình duyệt:</p>
      <p class="link">${url}</p>
      <div class="warning">
        <strong>⚠️ Lưu ý:</strong> Link này chỉ có hiệu lực trong 1 giờ. Nếu bạn không yêu cầu đặt lại mật khẩu, vui lòng bỏ qua email này.
      </div>
    </div>
    <div class="footer">
      <p>© 2025 BookSwap Community. All rights reserved.</p>
    </div>
  </div>
</body></html>`;

    const text = `Xin chào ${userName},\n\nBạn vừa yêu cầu đặt lại mật khẩu.\nLiên kết đặt lại:\n${url}\n\nNếu không phải bạn, hãy bỏ qua email này. (Link hiệu lực 1 giờ)`;

    try {
      await this.sg.send(this.build(email, 'Đặt lại mật khẩu - BookSwap Community', html, text));
      this.logger.log(`Password reset email sent to ${email}`);
    } catch (error: any) {
      this.logger.error(`Failed to send reset email: ${error?.message || error}`);
      throw error;
    }
  }

  // ---- 3) Password Changed Notification ----
  async sendPasswordChangedNotification(email: string, userName: string) {
    const html = `<!DOCTYPE html>
<html><head><meta charset="utf-8" />
<style>
body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
.container { max-width: 600px; margin: 0 auto; padding: 20px; }
.header { background: linear-gradient(135deg, #a8edea 0%, #fed6e3 100%); color: #333; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
.content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
.success { background: #d4edda; border-left: 4px solid #28a745; padding: 15px; margin: 20px 0; }
.footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
</style></head>
<body>
  <div class="container">
    <div class="header">
      <h1>✅ Mật khẩu đã được cập nhật</h1>
    </div>
    <div class="content">
      <h2>Xin chào ${this.esc(userName)}!</h2>
      <div class="success">
        <strong>✓ Thành công!</strong> Mật khẩu của bạn đã được thay đổi.
      </div>
      <p>Nếu bạn không thực hiện thay đổi này, vui lòng liên hệ với chúng tôi ngay lập tức.</p>
      <p style="margin-top: 30px;">
        <strong>Email hỗ trợ:</strong> support@bookswap.com<br/>
        <strong>Hotline:</strong> 1900-xxxx
      </p>
    </div>
    <div class="footer">
      <p>© 2025 BookSwap Community. All rights reserved.</p>
    </div>
  </div>
</body></html>`;

    const text = `Xin chào ${userName},\n\nMật khẩu của bạn đã được thay đổi thành công.\nNếu đây không phải là bạn, hãy liên hệ hỗ trợ ngay.`;

    try {
      await this.sg.send(this.build(email, 'Mật khẩu đã được thay đổi - BookSwap Community', html, text));
      this.logger.log(`Password changed notification sent to ${email}`);
    } catch (error: any) {
      this.logger.error(`Failed to send notification: ${error?.message || error}`);
    }
  }
}
