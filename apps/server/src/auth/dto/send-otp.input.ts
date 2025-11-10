import { InputType, Field } from '@nestjs/graphql';

@InputType()
export class SendOtpInput {
  @Field({ nullable: true })
  email?: string;

  @Field({ nullable: true })
  phone?: string;
}
