import { Module } from '@nestjs/common';

import { UserController } from './users.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { UserService } from './users.service';

@Module({
  imports: [PrismaModule],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService],
})
export class UsersModule {}
