import { Controller } from '@nestjs/common';
import { MinibusService } from './minibus.service';

@Controller('minibus')
export class MinibusController {
  constructor(private readonly minibusService: MinibusService) {}
}
