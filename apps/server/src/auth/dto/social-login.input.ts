import { InputType, Field } from '@nestjs/graphql';

@InputType()
export class SocialLoginInput {
  @Field()
  provider: string;

  @Field()
  token: string;
}
