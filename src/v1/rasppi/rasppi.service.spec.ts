import { Test, TestingModule } from '@nestjs/testing';
import { RasppiService } from './rasppi.service';

describe('RasppiService', () => {
  let service: RasppiService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RasppiService],
    }).compile();

    service = module.get<RasppiService>(RasppiService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
