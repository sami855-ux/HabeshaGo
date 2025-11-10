import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import dayjs from 'dayjs';
import crypto from 'crypto';
import { SmsService } from './sms.service';
import nodemailer from 'nodemailer';

@Injectable()
export class OtpService {
  constructor(
    private prisma: PrismaService,
    private sms: SmsService,
  ) {}

  private async sendEmail(to: string, subject: string, text: string) {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: +(process.env.SMTP_PORT || 587),
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    });
    await transporter.sendMail({
      from: process.env.SMTP_USER,
      to,
      subject,
      text,
    });
  }

  private generateCode() {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  async createAndSendOtpToPhone(phone: string) {
    const code = this.generateCode();
    const codeHash = await bcrypt.hash(code, 10);
    const expiresAt = dayjs().add(5, 'minute').toDate();

    await this.prisma.otpCode.create({ data: { phone, codeHash, expiresAt } });
    await this.sms.sendSms(phone, `Your verification code is ${code}`);
    return true;
  }

  async createAndSendOtpToEmail(email: string) {
    const code = this.generateCode();
    const codeHash = await bcrypt.hash(code, 10);
    const expiresAt = dayjs().add(10, 'minute').toDate();

    await this.prisma.otpCode.create({ data: { email, codeHash, expiresAt } });
    await this.sendEmail(
      email,
      'Your verification code',
      `Your verification code: ${code}`,
    );
    return true;
  }

  async verifyOtp({
    code,
    email,
    phone,
  }: {
    code: string;
    email?: string;
    phone?: string;
  }) {
    const where: any = {};
    if (email) where.email = email;
    if (phone) where.phone = phone;
    const otp = await this.prisma.otpCode.findFirst({
      where: { ...where, used: false },
      orderBy: { createdAt: 'desc' },
    });
    if (!otp || dayjs().isAfter(otp.expiresAt))
      throw new BadRequestException('OTP invalid or expired');

    const ok = await bcrypt.compare(code, otp.codeHash);
    if (!ok) throw new BadRequestException('Invalid code');

    await this.prisma.otpCode.update({
      where: { id: otp.id },
      data: { used: true },
    });

    // find or create user
    let user = null;
    if (email) user = await this.prisma.user.findUnique({ where: { email } });
    if (phone && !user)
      user = await this.prisma.user.findUnique({ where: { phone } });

    if (!user) {
      user = await this.prisma.user.create({
        data: {
          name: email ?? phone ?? 'User',
          email: email ?? undefined,
          phone: phone ?? undefined,
          phoneVerified: !!phone,
          emailVerified: !!email,
        },
      });
    } else {
      // mark verified
      const data: any = {};
      if (phone) data.phoneVerified = true;
      if (email) data.emailVerified = true;
      await this.prisma.user.update({ where: { id: user.id }, data });
    }

    return user;
  }
}
