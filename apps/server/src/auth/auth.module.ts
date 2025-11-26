import { Module } from '@nestjs/common';
import { AuthModule as BetterAuthModule } from '@thallesp/nestjs-better-auth';
import { PrismaModule } from 'src/prisma/prisma.module';
import { auth } from '../../lib/better-auth';

@Module({
  imports: [
    PrismaModule,
    BetterAuthModule.forRootAsync({
      useFactory: () => ({
        auth,
      }),
    }),
  ],
  controllers: [],
  providers: [],
  exports: [],
})
export class AuthModule {}
