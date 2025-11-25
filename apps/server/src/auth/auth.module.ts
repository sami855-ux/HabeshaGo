import { Module } from '@nestjs/common';
import { AuthModule as BetterAuthModule } from '@thallesp/nestjs-better-auth';

import { auth } from '../../lib/better-auth';
import { PrismaModule } from 'src/prisma/prisma.module';

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
