import {
  Injectable,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { MailerService } from '../mailer/mailer.service';
import { randomInt, randomBytes } from 'crypto';
import * as bcrypt from 'bcrypt';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { addMinutes } from 'date-fns';

@Injectable()
export class AuthService {
  private readonly OTP_TTL_MIN: number;

  constructor(
    private readonly prisma: PrismaService,
    private readonly mailer: MailerService,
    private readonly cfg: ConfigService,
    private readonly jwt: JwtService,
  ) {
    this.OTP_TTL_MIN = Number(cfg.get('OTP_EXPIRY_MINUTES') || 10);
  }

  private generateOtp(): string {
    return String(randomInt(0, 1000000)).padStart(6, '0');
  }

  private generateRandomToken(): string {
    return randomBytes(48).toString('hex');
  }

  private parseRefreshExpiry(raw: string | undefined): number {
    if (!raw) return 7 * 24 * 60;
    if (raw.endsWith('d')) return parseInt(raw) * 24 * 60;
    if (raw.endsWith('h')) return parseInt(raw) * 60;
    return parseInt(raw);
  }

  async requestOtp(email: string, name?: string) {
    if (!email) throw new BadRequestException('Email is required');
    const normalized = email.toLowerCase().trim();

    let user = await this.prisma.user.findUnique({
      where: { email: normalized },
    });

    const otp = this.generateOtp();
    const codeHash = await bcrypt.hash(otp, 10);
    const expiresAt = addMinutes(new Date(), this.OTP_TTL_MIN);

    const otpRecord = await this.prisma.otpCode.create({
      data: {
        email: normalized,
        codeHash,
        expiresAt,
        user: user ? { connect: { id: user.id } } : undefined,
      },
    });

    await this.mailer.sendOtpEmail(normalized, otp);

    if (!user && name) {
      user = await this.prisma.user.create({
        data: { email: normalized, name },
      });
      await this.prisma.otpCode.update({
        where: { id: otpRecord.id },
        data: { userId: user.id },
      });

      // Create wallet automatically
      await this.prisma.wallet.create({
        data: { userId: user.id, balance: 0, currency: 'ETB' },
      });
    }

    return { success: true, expiresAt };
  }

  async verifyOtp(email: string, code: string) {
    if (!email || !code)
      throw new BadRequestException('Email and OTP code required');

    const normalized = email.toLowerCase().trim();
    const otp = await this.prisma.otpCode.findFirst({
      where: { email: normalized, used: false, expiresAt: { gt: new Date() } },
      orderBy: { createdAt: 'desc' },
    });

    if (!otp) throw new ForbiddenException('Invalid or expired OTP');

    const matched = await bcrypt.compare(code, otp.codeHash);
    if (!matched) throw new ForbiddenException('Invalid or expired OTP');

    await this.prisma.otpCode.update({
      where: { id: otp.id },
      data: { used: true },
    });

    let user =
      (otp.userId &&
        (await this.prisma.user.findUnique({
          where: { id: otp.userId },
          include: { wallet: true },
        }))) ||
      (await this.prisma.user.findUnique({
        where: { email: normalized },
        include: { wallet: true },
      })) ||
      (await this.prisma.user.create({ data: { email: normalized } }));

    await this.prisma.user.update({
      where: { id: user.id },
      data: { emailVerified: true },
    });

    const payload = { sub: user.id, email: user.email, role: user.role };
    const accessToken = await this.jwt.signAsync(payload, {
      expiresIn: this.cfg.get('JWT_EXPIRES_IN') || '15m',
    });

    const refreshRaw = this.generateRandomToken();
    const refreshHash = await bcrypt.hash(refreshRaw, 10);
    const refreshExpires = addMinutes(
      new Date(),
      this.parseRefreshExpiry(this.cfg.get('REFRESH_EXPIRES_MIN')),
    );

    await this.prisma.refreshToken.create({
      data: {
        tokenHash: refreshHash,
        expiresAt: refreshExpires,
        user: { connect: { id: user.id } },
      },
    });

    return {
      message: 'OTP verified successfully',
      accessToken,
      refreshToken: refreshRaw,
      user,
    };
  }

  async registerPhone(userId: number, phone: string) {
    if (!phone) throw new BadRequestException('Phone number required');

    const user = await this.prisma.user.update({
      where: { id: userId },
      data: { phone, phoneVerified: true },
      include: { wallet: true },
    });

    // create wallet if missing
    if (!user.wallet)
      await this.prisma.wallet.create({
        data: { userId: user.id, balance: 0, currency: 'ETB' },
      });

    return { message: 'Phone registered successfully', user };
  }

  async getUserWithWallet(userId: number) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { wallet: true },
    });
    if (!user) throw new BadRequestException('User not found');
    return user;
  }
}
