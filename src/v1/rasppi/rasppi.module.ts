import { Module } from '@nestjs/common';
import { RasppiService } from './rasppi.service';
import { RasppiController } from './rasppi.controller';

@Module({
  controllers: [RasppiController],
  providers: [RasppiService]
})
export class RasppiModule {}
