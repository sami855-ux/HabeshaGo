import { Resolver, Query, Args } from '@nestjs/graphql';
import { UsersService } from './user.service';
import { User as UserModel } from '@prisma/client';

@Resolver('User')
export class UsersResolver {
  constructor(private usersService: UsersService) {}

  @Query(() => String)
  hello() {
    return 'hello';
  }
}
