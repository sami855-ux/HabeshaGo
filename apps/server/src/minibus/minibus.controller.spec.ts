import { Test, TestingModule } from '@nestjs/testing';
import { MinibusController } from './minibus.controller';
import { MinibusService } from './minibus.service';

describe('MinibusController', () => {
  let controller: MinibusController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MinibusController],
      providers: [MinibusService],
    }).compile();

    controller = module.get<MinibusController>(MinibusController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
