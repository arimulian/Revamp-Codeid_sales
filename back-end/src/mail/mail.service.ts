import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';

@Injectable()
export class MailService {
  constructor(private readonly mailer: MailerService) {}

  async sendMail(user: string) {
    this.mailer.sendMail({
      to: user, // list of receivers
      from: 'no-reply@codeid.com', // sender address
      subject: 'Test Email', // Subject line
      template: 'mails', // Relative or absolute path to template
    });
  }
}
