import { Resolver, Mutation, Args } from '@nestjs/graphql';
import { AuthService } from './auth.service';
import { OtpService } from 'src/otp/otp.service';
import { SmsService } from 'src/otp/sms.service';
import { SendOtpInput } from './dto/send-otp.input';
import { VerifyOtpInput } from './dto/verify-otp.input';
import { SocialLoginInput } from './dto/social-login.input';
import { AuthResponse } from './dto/auth-response';

@Resolver()
export class AuthResolver {
  constructor(
    private auth: AuthService,
    private otp: OtpService,
    private sms: SmsService,
  ) {}

  // send OTP to phone or email
  @Mutation(() => String)
  async sendOtp(@Args('input') input: SendOtpInput) {
    if (!input.email && !input.phone)
      throw new Error('email or phone required');
    if (input.phone) {
      await this.otp.createAndSendOtpToPhone(input.phone);
      return 'OTP sent to phone';
    }
    await this.otp.createAndSendOtpToEmail(input.email);
    return 'OTP sent to email';
  }

  // verify OTP and issue tokens
  @Mutation(() => AuthResponse)
  async verifyOtp(@Args('input') input: VerifyOtpInput) {
    const user = await this.otp.verifyOtp({
      code: input.code,
      email: input.email,
      phone: input.phone,
    });
    return this.auth.issueTokens(user.id, user.email ?? undefined);
  }

  // email/password signup/login
  @Mutation(() => AuthResponse)
  async signup(
    @Args('name') name: string,
    @Args('email') email: string,
    @Args('password') password: string,
  ) {
    return this.auth.signupWithEmail(name, email, password);
  }

  @Mutation(() => AuthResponse)
  async login(
    @Args('email') email: string,
    @Args('password') password: string,
  ) {
    return this.auth.loginWithEmail(email, password);
  }

  // refresh token
  @Mutation(() => AuthResponse)
  async refresh(@Args('refreshToken') refreshToken: string) {
    return this.auth.refresh(refreshToken);
  }
}
