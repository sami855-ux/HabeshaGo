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
    // Load OTP TTL from env or default to 10 minutes
    this.OTP_TTL_MIN = Number(cfg.get('OTP_EXPIRY_MINUTES') || 10);
  }

  /** Generate a 6-digit OTP */
  private generateOtp(): string {
    return String(randomInt(0, 1000000)).padStart(6, '0');
  }

  /** Generate a secure random token (refresh token) */
  private generateRandomToken(): string {
    return randomBytes(48).toString('hex');
  }

  /** Parse refresh expiry string (like "30d") to minutes */
  private parseRefreshExpiry(raw: string | undefined): number {
    if (!raw) return 7 * 24 * 60; // default 7 days

    if (raw.endsWith('d')) return parseInt(raw) * 24 * 60;
    if (raw.endsWith('h')) return parseInt(raw) * 60;
    return parseInt(raw); // assume minutes
  }

  /** STEP 1: Request OTP */
  async requestOtp(email: string, name?: string) {
    if (!email) throw new BadRequestException('Email is required');
    const normalized = email.toLowerCase().trim();

    let user = await this.prisma.user.findUnique({
      where: { email: normalized },
    });

    const otp = this.generateOtp();
    const codeHash = await bcrypt.hash(otp, 10);
    const expiresAt = addMinutes(new Date(), this.OTP_TTL_MIN);

    // Save OTP record
    const otpRecord = await this.prisma.otpCode.create({
      data: {
        email: normalized,
        codeHash,
        expiresAt,
        user: user ? { connect: { id: user.id } } : undefined,
      },
    });

    // Send OTP via email
    await this.mailer.sendOtpEmail(normalized, otp);

    // Create user if not exists
    if (!user && name) {
      user = await this.prisma.user.create({
        data: { email: normalized, name },
      });
      await this.prisma.otpCode.update({
        where: { id: otpRecord.id },
        data: { userId: user.id },
      });
    }

    return { success: true, expiresAt };
  }

  /** STEP 2: Verify OTP and issue tokens */
  async verifyOtp(email: string, code: string) {
    if (!email || !code)
      throw new BadRequestException('Email and OTP code required');

    const normalized = email.toLowerCase().trim();

    // Find most recent unused OTP
    const otp = await this.prisma.otpCode.findFirst({
      where: {
        email: normalized,
        used: false,
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: 'desc' },
    });

    if (!otp) throw new ForbiddenException('Invalid or expired OTP');

    const matched = await bcrypt.compare(code, otp.codeHash);
    if (!matched) throw new ForbiddenException('Invalid or expired OTP');

    // Mark OTP as used
    await this.prisma.otpCode.update({
      where: { id: otp.id },
      data: { used: true },
    });

    // Find or create user
    let user =
      (otp.userId &&
        (await this.prisma.user.findUnique({ where: { id: otp.userId } }))) ||
      (await this.prisma.user.findUnique({ where: { email: normalized } })) ||
      (await this.prisma.user.create({ data: { email: normalized } }));

    // Mark email as verified
    await this.prisma.user.update({
      where: { id: user.id },
      data: { emailVerified: true },
    });

    // Issue JWT access token
    const payload = { sub: user.id, email: user.email, role: user.role };
    const accessToken = await this.jwt.signAsync(payload, {
      expiresIn: this.cfg.get('JWT_EXPIRES_IN') || '15m',
    });

    // Issue refresh token
    const refreshRaw = this.generateRandomToken();
    const refreshHash = await bcrypt.hash(refreshRaw, 10);

    const refreshExpiryMinutes = this.parseRefreshExpiry(
      this.cfg.get('REFRESH_EXPIRES_MIN') as string,
    );

    const refreshExpires = addMinutes(new Date(), refreshExpiryMinutes);

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
}
