import { Module } from '@nestjs/common';
import { EvChargingService } from './ev-charging.service';
import { EvChargingController } from './ev-charging.controller';

@Module({
  controllers: [EvChargingController],
  providers: [EvChargingService],
})
export class EvChargingModule {}
