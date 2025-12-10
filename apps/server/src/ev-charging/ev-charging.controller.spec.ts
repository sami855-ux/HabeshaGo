import { Test, TestingModule } from '@nestjs/testing';
import { EvChargingController } from './ev-charging.controller';
import { EvChargingService } from './ev-charging.service';

describe('EvChargingController', () => {
  let controller: EvChargingController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EvChargingController],
      providers: [EvChargingService],
    }).compile();

    controller = module.get<EvChargingController>(EvChargingController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
