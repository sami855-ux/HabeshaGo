import { Module } from '@nestjs/common';
import { BusService } from './bus.service';
import { BusController } from './bus.controller';
import { PrismaService } from 'src/prisma/prisma.service';

@Module({
  controllers: [BusController],
  providers: [BusService, PrismaService],
})
export class BusModule {}
