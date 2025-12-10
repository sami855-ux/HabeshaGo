import { Controller } from '@nestjs/common';
import { EvChargingService } from './ev-charging.service';

@Controller('ev-charging')
export class EvChargingController {
  constructor(private readonly evChargingService: EvChargingService) {}
}
