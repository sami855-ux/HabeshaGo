// import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { PrismaModule } from './prisma/prisma.module';
// import { GraphQLModule } from '@nestjs/graphql';
import { ConfigModule } from '@nestjs/config';
import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
// import { join } from 'path';

import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { AuthGuard } from '@thallesp/nestjs-better-auth';
import { BusModule } from './bus/bus.module';
import { CloudinaryModule } from './cloudinary/cloudinary.module';

@Module({
  imports: [
    // GraphQLModule.forRoot<ApolloDriverConfig>({
    //   driver: ApolloDriver,
    //   autoSchemaFile: join(process.cwd(), 'src/graphql/schema.gql'),
    // }),

    // AuthModule,
    UsersModule,
    BusModule,
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    CloudinaryModule,
  ],
  controllers: [],
  providers: [
    // {
    //   provide: APP_GUARD,
    //   useClass: AuthGuard,
    // },
  ],
})
export class AppModule {}
