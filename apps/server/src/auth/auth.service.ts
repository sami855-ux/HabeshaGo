import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import crypto from 'crypto';
import dayjs from 'dayjs';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
  ) {}

  private hashToken(token: string) {
    return crypto.createHash('sha256').update(token).digest('hex');
  }

  parseExpires(exp: string | undefined) {
    if (!exp) return 1000 * 60 * 60 * 24 * 30;
    if (exp.endsWith('d')) return parseInt(exp) * 24 * 60 * 60 * 1000;
    if (exp.endsWith('m')) return parseInt(exp) * 60 * 1000;
    if (exp.endsWith('s')) return parseInt(exp) * 1000;
    return parseInt(exp) * 1000;
  }

  async issueTokens(userId: number, email?: string) {
    const payload = { sub: userId, email };
    const accessToken = this.jwt.sign(payload, {
      expiresIn: process.env.JWT_ACCESS_EXPIRES || '15m',
    });
    const refreshToken = this.jwt.sign(
      { sub: userId },
      { expiresIn: process.env.JWT_REFRESH_EXPIRES || '30d' },
    );

    const tokenHash = this.hashToken(refreshToken);
    const expiresAt = new Date(
      Date.now() + this.parseExpires(process.env.JWT_REFRESH_EXPIRES),
    );
    await this.prisma.refreshToken.create({
      data: { tokenHash, expiresAt, userId },
    });

    return { accessToken, refreshToken };
  }

  async signupWithEmail(name: string, email: string, password: string) {
    const hashed = await bcrypt.hash(password, 10);
    const user = await this.prisma.user.create({
      data: { name, email, password: hashed },
    });
    return this.issueTokens(user.id, user.email ?? undefined);
  }

  async loginWithEmail(email: string, password: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user || !user.password)
      throw new UnauthorizedException('Invalid credentials');
    const ok = await bcrypt.compare(password, user.password);
    if (!ok) throw new UnauthorizedException('Invalid credentials');
    return this.issueTokens(user.id, user.email ?? undefined);
  }

  async refresh(refreshToken: string) {
    try {
      const payload: any = this.jwt.verify(refreshToken, {
        secret: process.env.JWT_SECRET,
      });
      const userId = payload.sub;
      const hash = this.hashToken(refreshToken);
      const found = await this.prisma.refreshToken.findFirst({
        where: { userId, tokenHash: hash },
      });
      if (!found || found.expiresAt < new Date())
        throw new UnauthorizedException('Invalid refresh token');
      // optional: delete old refresh token to rotate
      await this.prisma.refreshToken.delete({ where: { id: found.id } });
      return this.issueTokens(userId);
    } catch (e) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async revokeRefresh(userId: number) {
    await this.prisma.refreshToken.deleteMany({ where: { userId } });
    return true;
  }
}
