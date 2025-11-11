import { Resolver, Mutation, Args } from '@nestjs/graphql';
import { AuthService } from './auth.service';
import {
  RequestOtpInput,
  RequestOtpResponse,
  VerifyOtpInput,
  VerifyOtpResponse,
} from './dto/auth.dto';

@Resolver()
export class AuthResolver {
  constructor(private readonly auth: AuthService) {}

  @Mutation(() => RequestOtpResponse)
  async requestOtp(
    @Args('input') input: RequestOtpInput,
  ): Promise<RequestOtpResponse> {
    const result = await this.auth.requestOtp(input.email, input.name);
    return { success: result.success, expiresAt: result.expiresAt };
  }

  @Mutation(() => VerifyOtpResponse)
  async verifyOtp(
    @Args('input') input: VerifyOtpInput,
  ): Promise<VerifyOtpResponse> {
    const result = await this.auth.verifyOtp(input.email, input.code);
    return {
      message: result.message,
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
      user: result.user,
    };
  }
}
