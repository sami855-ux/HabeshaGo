import { Test, TestingModule } from '@nestjs/testing';
import { BusPositionService } from './bus-position.service';

describe('BusPositionService', () => {
  let service: BusPositionService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [BusPositionService],
    }).compile();

    service = module.get<BusPositionService>(BusPositionService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
