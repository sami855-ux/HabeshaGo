import { InputType, Field } from '@nestjs/graphql';

@InputType()
export class VerifyOtpInput {
  @Field()
  code: string;

  @Field({ nullable: true })
  email?: string;

  @Field({ nullable: true })
  phone?: string;
}
