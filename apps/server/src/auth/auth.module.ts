import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthResolver } from './auth.resolver';
import { SocialAuthService } from './social-auth.service';
import { SocialAuthResolver } from './social-auth.resolver';
import { PrismaService } from '../prisma/prisma.service';
import { MailerService } from '../mailer/mailer.service';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtStrategy } from './strategy/jwt.strategy';
import { GoogleStrategy } from './strategy/google.strategy';

@Module({
  imports: [
    ConfigModule,
    PassportModule,
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (cfg: ConfigService) => ({
        secret: cfg.get('JWT_SECRET'),
        signOptions: { expiresIn: cfg.get('JWT_EXPIRES_IN') || '15m' },
      }),
    }),
  ],
  providers: [
    AuthService,
    AuthResolver,
    SocialAuthService,
    SocialAuthResolver,
    PrismaService,
    MailerService,
    JwtStrategy,
    GoogleStrategy,
  ],
})
export class AuthModule {}
