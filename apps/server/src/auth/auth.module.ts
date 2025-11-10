import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { AuthResolver } from './auth.resolver';
import { PrismaService } from 'src/prisma/prisma.service';
import { PrismaModule } from 'src/prisma/prisma.module';
import { JwtStrategy } from './jwt.strategy';
import { OtpService } from 'src/otp/otp.service';
import { SmsService } from 'src/otp/sms.service';
import { OAuthController } from './oauth.controller';
import { GoogleStrategy } from './social/google.strategy';

@Module({
  imports: [
    PrismaModule,
    PassportModule,
    JwtModule.register({ secret: process.env.JWT_SECRET }),
  ],
  providers: [
    AuthService,
    AuthResolver,
    PrismaService,
    JwtStrategy,
    OtpService,
    SmsService,
    GoogleStrategy,
  ],
  controllers: [OAuthController],
  exports: [AuthService],
})
export class AuthModule {}
