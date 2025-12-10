import { Test, TestingModule } from '@nestjs/testing';
import { BusPositionController } from './bus-position.controller';
import { BusPositionService } from './bus-position.service';

describe('BusPositionController', () => {
  let controller: BusPositionController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BusPositionController],
      providers: [BusPositionService],
    }).compile();

    controller = module.get<BusPositionController>(BusPositionController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
