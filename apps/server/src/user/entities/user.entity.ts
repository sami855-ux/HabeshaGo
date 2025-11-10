import { ObjectType, Field, Int, registerEnumType } from '@nestjs/graphql';
import { UserRole } from '@prisma/client';

registerEnumType(UserRole, { name: 'UserRole' });

@ObjectType()
export class User {
  @Field(() => Int) id: number;
  @Field() name: string;
  @Field({ nullable: true }) email?: string | null;
  password?: string;
  @Field({ nullable: true }) phone?: string | null;
  @Field(() => UserRole) role: UserRole;
  @Field() createdAt: Date;
  @Field() updatedAt: Date;
}
