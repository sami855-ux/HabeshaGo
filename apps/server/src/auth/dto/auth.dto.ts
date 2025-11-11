import {
  Field,
  InputType,
  ObjectType,
  Int,
  registerEnumType,
} from '@nestjs/graphql';
import { UserRole } from '@prisma/client';

registerEnumType(UserRole, {
  name: 'UserRole',
  description: 'User role type',
});

@InputType()
export class RequestOtpInput {
  @Field()
  email: string ;

  @Field({ nullable: true })
  name?: string;
}

@ObjectType()
export class RequestOtpResponse {
  @Field()
  success: boolean;

  @Field(() => Date) // GraphQL Date type
  expiresAt: Date;
}

@InputType()
export class VerifyOtpInput {
  @Field()
  email: string;

  @Field()
  code: string;
}

@ObjectType()
export class AuthUser {
  @Field(() => Int)
  id: number;

  @Field(() => String, { nullable: true }) // allow null
  email?: string | null;

  @Field(() => String, { nullable: true })
  name?: string | null;

  @Field(() => String, { nullable: true })
  phone?: string | null;

  @Field(() => UserRole) // add this
  role: UserRole;
}

@ObjectType()
export class VerifyOtpResponse {
  @Field()
  message: string;

  @Field()
  accessToken: string;

  @Field()
  refreshToken: string;

  @Field(() => AuthUser)
  user: AuthUser;
}
