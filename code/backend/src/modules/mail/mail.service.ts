import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class MailService {
  constructor(private readonly mailerService: MailerService) {}

  async sendOtp(email: string, otp: string): Promise<void> {
    await this.mailerService.sendMail({
      to: email,
      subject: 'Xác thực OTP',
      html: `
        <h2>Xác thực OTP</h2>
        <p>Mã OTP của bạn là:</p>
        <h1>${otp}</h1>
        <p>Mã OTP này sẽ hết hạn sau 1 phút.</p>
      `,
    });
    
  }
}
