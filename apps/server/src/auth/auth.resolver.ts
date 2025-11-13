import { Resolver, Mutation, Query, Args } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import {
  RequestOtpInput,
  RequestOtpResponse,
  VerifyOtpInput,
  VerifyOtpResponse,
} from './dto/auth.dto';
import { GqlAuthGuard } from './guard/gql-auth.guard';
import { CurrentUser } from './decorator/current-user.decorator';

@Resolver()
export class AuthResolver {
  constructor(private readonly auth: AuthService) {}

  // Request OTP
  @Mutation(() => RequestOtpResponse)
  async requestOtp(
    @Args('input') input: RequestOtpInput,
  ): Promise<RequestOtpResponse> {
    const result = await this.auth.requestOtp(input.email, input.name);
    return { success: result.success, expiresAt: result.expiresAt };
  }

  // Verify OTP
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

  // Protected route example: Get current user info
  @Query(() => String)
  @UseGuards(GqlAuthGuard)
  async me(@CurrentUser() user: any) {
    return `Hello ${user.email}, your ID is ${user.userId}`;
  }
}
