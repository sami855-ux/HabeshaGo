import { Test, TestingModule } from '@nestjs/testing';
import { MinibusService } from './minibus.service';

describe('MinibusService', () => {
  let service: MinibusService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MinibusService],
    }).compile();

    service = module.get<MinibusService>(MinibusService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
