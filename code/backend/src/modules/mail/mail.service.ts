import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as SibApiV3Sdk from 'sib-api-v3-sdk';

@Injectable()
export class MailService {
  private readonly apiInstance: SibApiV3Sdk.TransactionalEmailsApi;

  constructor(private readonly config: ConfigService) {
    const client = (SibApiV3Sdk.ApiClient as any).instance;

    const configuredKey = this.config.get<string>('mail.apiKey');
    if (!configuredKey) {
      throw new Error('mail.apiKey is not configured');
    }

    // some SDK versions expose authentications keys as 'api-key' or 'apiKey'
    const auths = client.authentications || {};
    if (auths['api-key']) {
      auths['api-key'].apiKey = configuredKey;
    } else if (auths['apiKey']) {
      auths['apiKey'].apiKey = configuredKey;
    } else {
      // create the expected structure if missing
      client.authentications = { ...auths, 'api-key': { apiKey: configuredKey } };
    }

    this.apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();
  }

  async sendMail(to: string, subject: string, html: string): Promise<void> {
    
    const email = new SibApiV3Sdk.SendSmtpEmail();

    email.sender = {
      name: this.config.get<string>('mail.fromName')!,
      email: this.config.get<string>('mail.from')!,
    };

    email.to = [{ email: to }];

    email.subject = subject;

    email.htmlContent = html;

    await this.apiInstance.sendTransacEmail(email);
  }
  async sendOtp(email: string, otp: string) {
    try {
      const res = await this.sendMail(
        email,
        'Reset password',
        `
      <h2>Restaurant Ordering System</h2>

      <p>Your OTP:</p>

      <h1>${otp}</h1>

      <p>This OTP expires in 5 minutes.</p>
    `,
      );
      console.log(res);
    } catch (error: any) {
      console.error('Status:', error?.response?.status);
      console.error('Body:', error?.response?.body);
      console.error(error);
      throw error;
    }
  }
}
