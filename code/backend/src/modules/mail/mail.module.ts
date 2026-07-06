// mail.module.ts

import { Module } from '@nestjs/common';
import { MailerModule } from '@nestjs-modules/mailer';
import { MailService } from './mail.service';

@Module({
  imports: [
    MailerModule.forRoot({
      transport: {
        host: 'smtp.gmail.com', 
        port: 587,
        secure: false,
        auth: {
          user: process.env.MAIL_USER || 'duongvantra2004@gmail.com',
          pass: process.env.MAIL_PASS || 'nxmxbxpjahmdlfab',
        },
      },
      defaults: {
        from: `"Restaurant Ordering" <${process.env.MAIL_USER}>`,
      },
    }),
  ],
  providers: [MailService],
  exports: [MailService],
})
export class MailModule {}
