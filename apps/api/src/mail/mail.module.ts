import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MailerModule } from '@nestjs-modules/mailer';

import { MailService } from './mail.service';

@Module({
  imports: [
    MailerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        transport: {
          host: 'smtp.ethereal.email',
          port: 587,
          secure: false,
          service: 'gmail',
          auth: {
            user: config.getOrThrow<string>('MAIL_USER'),
            pass: config.getOrThrow<string>('MAIL_PASS'),
          },
          tls: {
            rejectUnauthorized: false,
            minVersion: 'TLSv1.2',
          },
        },
        defaults: {
          from: `"no-reply" <${config.get<string>('MAIL_USER')}>`,
        },
      }),
    }),
  ],
  providers: [MailService],
  exports: [MailService],
})
export class MailModule {}
