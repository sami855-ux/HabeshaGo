import { ObjectType, Field, Float } from '@nestjs/graphql';

@ObjectType()
export class Wallet {
  @Field()
  id: number;

  @Field(() => Float)
  balance: number;

  @Field()
  currency: string;
}
