import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-google-oauth20';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(private prisma: PrismaService) {
    super({
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL,
      scope: ['profile', 'email'],
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: any,
    done: Function,
  ) {
    const provider = 'google';
    const providerId = profile.id;
    let account = await this.prisma.account
      .findUnique({
        where: { provider_providerId_unique: { provider, providerId } },
      })
      .catch(() => null);

    let user;
    if (!account) {
      const email = profile.emails?.[0]?.value;
      user = await this.prisma.user.create({
        data: {
          name: profile.displayName || 'Google User',
          email: email ?? undefined,
          emailVerified: !!email,
        },
      });
      await this.prisma.account.create({
        data: {
          provider,
          providerId,
          email: email ?? undefined,
          userId: user.id,
        },
      });
    } else {
      user = await this.prisma.user.findUnique({
        where: { id: account.userId },
      });
    }

    done(null, user);
  }
}
