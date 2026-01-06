import { Controller, Get, Param } from '@nestjs/common';
import { UserService } from './users.service';
import { User } from '@prisma/client';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  // GET /users/:id
  @Get(':id')
  async getUser(@Param('id') id: string): Promise<User> {
    return this.userService.getUserById(id);
  }
}
