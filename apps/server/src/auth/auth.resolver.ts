import { Resolver, Mutation, Query, Args } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import {
  RegisterPhoneInput,
  RequestOtpInput,
  RequestOtpResponse,
  VerifyOtpInput,
  VerifyOtpResponse,
  AuthUser,
} from './dto/auth.dto';
import { GqlAuthGuard } from './guard/gql-auth.guard';
import { CurrentUser } from './decorator/current-user.decorator';

@Resolver()
export class AuthResolver {
  constructor(private readonly auth: AuthService) {}

  @Mutation(() => RequestOtpResponse)
  async requestOtp(
    @Args('input') input: RequestOtpInput,
  ): Promise<RequestOtpResponse> {
    return await this.auth.requestOtp(input.email, input.name);
  }

  @Mutation(() => VerifyOtpResponse)
  async verifyOtp(
    @Args('input') input: VerifyOtpInput,
  ): Promise<VerifyOtpResponse> {
    return await this.auth.verifyOtp(input.email, input.code);
  }

  @Query(() => AuthUser)
  @UseGuards(GqlAuthGuard)
  async me(@CurrentUser() user: any) {
    return await this.auth.getUserWithWallet(user.userId);
  }

  @Mutation(() => String)
  @UseGuards(GqlAuthGuard)
  async registerPhone(
    @Args('input') input: RegisterPhoneInput,
    @CurrentUser() user: any,
  ) {
    const result = await this.auth.registerPhone(user.userId, input.phone);
    return result.message;
  }
}
