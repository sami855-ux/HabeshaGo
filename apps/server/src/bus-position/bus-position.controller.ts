import { Controller } from '@nestjs/common';
import { BusPositionService } from './bus-position.service';

@Controller('bus-position')
export class BusPositionController {
  constructor(private readonly busPositionService: BusPositionService) {}
}
