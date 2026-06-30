import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class MailService {
  constructor(private readonly mailerService: MailerService) {}

  async sendOtp(email: string, otp: string): Promise<void> {
    await this.mailerService.sendMail({
      to: email,
      subject: 'Password Verification OTP',
      html: `
        <h2>Password Verification</h2>
        <p>Your OTP is:</p>
        <h1>${otp}</h1>
        <p>This code will expire in 1 minutes.</p>
      `,
    });
    
  }
}
