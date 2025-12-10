import { Test, TestingModule } from '@nestjs/testing';
import { EvChargingService } from './ev-charging.service';

describe('EvChargingService', () => {
  let service: EvChargingService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [EvChargingService],
    }).compile();

    service = module.get<EvChargingService>(EvChargingService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
