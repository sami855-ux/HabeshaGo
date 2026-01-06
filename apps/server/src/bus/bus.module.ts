import { Module } from '@nestjs/common';
import { BusService } from './bus.service';
import { BusController } from './bus.controller';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  controllers: [BusController],
  providers: [BusService, PrismaService],
  exports: [BusService],
})
export class BusModule {}
