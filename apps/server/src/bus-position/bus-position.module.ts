import { Module } from '@nestjs/common';
import { BusPositionService } from './bus-position.service';
import { BusPositionController } from './bus-position.controller';

@Module({
  controllers: [BusPositionController],
  providers: [BusPositionService],
})
export class BusPositionModule {}
