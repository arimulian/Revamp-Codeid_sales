import { Module } from '@nestjs/common';
import { MailService } from './mail.service';
import { ConfigModule } from '@nestjs/config';
import { MailerModule } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { join } from 'path';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    MailerModule.forRoot({
      transport: {
        host: 'smtp.mailgun.org',
        port: 587,
        auth: {
          user: 'postmaster@sandbox94bf1023102b44c4b619f76e1f84b897.mailgun.org',
          pass: '9067316c909955af802d8d8a26a011fe-28e9457d-b1fa3ecf',
        },
        defaults: {
          from: '"No Reply" <noreply@codeid.com>',
        },
      },
      template: {
        dir: join(__dirname, './templates'),
        adapter: new HandlebarsAdapter(),
        options: {
          strict: true,
        },
      },
    }),
  ],
  providers: [MailService],
})
export class MailModule {}
