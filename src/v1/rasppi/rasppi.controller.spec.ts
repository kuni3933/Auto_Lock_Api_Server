import { Test, TestingModule } from '@nestjs/testing';
import { RasppiController } from './rasppi.controller';
import { RasppiService } from './rasppi.service';

describe('RasppiController', () => {
  let controller: RasppiController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RasppiController],
      providers: [RasppiService],
    }).compile();

    controller = module.get<RasppiController>(RasppiController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
