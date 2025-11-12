import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { addMinutes } from 'date-fns';

@Injectable()
export class SocialAuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
    private readonly cfg: ConfigService,
  ) {}

  private parseRefreshExpiry(raw: string | undefined): number {
    if (!raw) return 7 * 24 * 60; // default 7 days
    if (raw.endsWith('d')) return parseInt(raw) * 24 * 60;
    if (raw.endsWith('h')) return parseInt(raw) * 60;
    return parseInt(raw);
  }

  async validateSocialUser(profile: any, provider: 'google' | 'apple') {
    if (!profile?.email) throw new BadRequestException('Email not found');

    // Check if user exists
    let user = await this.prisma.user.findUnique({
      where: { email: profile.email },
    });

    if (!user) {
      user = await this.prisma.user.create({
        data: {
          email: profile.email,
          name: profile.name,
          emailVerified: true,
          provider,
        },
      });
    }

    // Issue JWT access token
    const payload = { sub: user.id, email: user.email, role: user.role };
    const accessToken = await this.jwt.signAsync(payload, {
      expiresIn: this.cfg.get('JWT_EXPIRES_IN') || '15m',
    });

    // Issue refresh token
    const refreshRaw = Math.random().toString(36).slice(2); // simple random token
    const refreshExpires = addMinutes(
      new Date(),
      this.parseRefreshExpiry(this.cfg.get('REFRESH_EXPIRES_MIN') as string),
    );

    await this.prisma.refreshToken.create({
      data: {
        tokenHash: refreshRaw,
        expiresAt: refreshExpires,
        user: { connect: { id: user.id } },
      },
    });

    return { accessToken, refreshToken: refreshRaw, user };
  }
}
