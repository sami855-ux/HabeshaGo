import {
  Field,
  InputType,
  ObjectType,
  Int,
  registerEnumType,
} from '@nestjs/graphql';
import { UserRole } from '@prisma/client';
import { Wallet } from './wallet.dto';

registerEnumType(UserRole, { name: 'UserRole' });

@InputType()
export class RequestOtpInput {
  @Field() email: string;
  @Field({ nullable: true }) name?: string;
}

@ObjectType()
export class RequestOtpResponse {
  @Field() success: boolean;
  @Field(() => Date) expiresAt: Date;
}

@InputType()
export class VerifyOtpInput {
  @Field() email: string;
  @Field() code: string;
}

@ObjectType()
export class AuthUser {
  @Field(() => Int) id: number;
  @Field(() => String, { nullable: true }) email?: string | null;
  @Field(() => String, { nullable: true }) name?: string | null;
  @Field(() => String, { nullable: true }) phone?: string | null;
  @Field(() => UserRole) role: UserRole;
  @Field(() => Wallet, { nullable: true }) wallet?: Wallet | null;
}

@ObjectType()
export class VerifyOtpResponse {
  @Field() message: string;
  @Field() accessToken: string;
  @Field() refreshToken: string;
  @Field(() => AuthUser) user: AuthUser;
}

@InputType()
export class RegisterPhoneInput {
  @Field() phone: string;
}
