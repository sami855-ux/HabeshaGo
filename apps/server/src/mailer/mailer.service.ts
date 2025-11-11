import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailerService {
  private transporter: nodemailer.Transporter;

  constructor() {
    if (process.env.NODE_ENV === 'production') {
      this.transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT || 587),
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });
    }
  }

  async sendOtpEmail(to: string, otp: string) {
    if (process.env.NODE_ENV !== 'production') {
      console.log(`[DEV OTP] To: ${to}, OTP: ${otp}`);
      return;
    }

    await this.transporter.sendMail({
      from: process.env.FROM_EMAIL,
      to,
      subject: 'Your OTP Code',
      text: `Your OTP is ${otp}`,
    });
  }
}
