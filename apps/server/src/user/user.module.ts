import { Module } from '@nestjs/common';
import { UsersService } from './user.service';
import { UsersResolver } from './user.resolver';
import { PrismaService } from 'src/prisma/prisma.service';
import { MailerModule } from 'src/mailer/mailer.module';

@Module({
  imports: [MailerModule],
  providers: [UsersResolver, UsersService, PrismaService],
  exports: [UsersService],
})
export class UserModule {}
