import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { UserService } from './user.service';
import { User } from './entities/user.entity';
import { CreateUserInput } from './dto/create-user.input';

@Resolver(() => User)
export class UserResolver {
  constructor(private readonly userService: UserService) {}

  // --- Mutation: Register a new user ---
  @Mutation(() => User)
  async createUser(@Args('data') data: CreateUserInput): Promise<User> {
    return this.userService.create(data);
  }

  // --- Query: Get all users ---
  @Query(() => [User])
  async users(): Promise<User[]> {
    return this.userService.findAll();
  }

  // --- Query: Get one user by ID ---
  @Query(() => User, { nullable: true })
  async user(
    @Args('id', { type: () => Int }) id: number,
  ): Promise<User | null> {
    return this.userService.findOne(id);
  }
}
