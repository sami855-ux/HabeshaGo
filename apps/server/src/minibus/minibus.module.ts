import { Module } from '@nestjs/common';
import { MinibusService } from './minibus.service';
import { MinibusController } from './minibus.controller';

@Module({
  controllers: [MinibusController],
  providers: [MinibusService],
})
export class MinibusModule {}
