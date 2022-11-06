import { Test, TestingModule } from '@nestjs/testing';
import { RasppiController } from './rasppi.controller';

describe('RasppiController', () => {
  let controller: RasppiController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RasppiController],
    }).compile();

    controller = module.get<RasppiController>(RasppiController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
