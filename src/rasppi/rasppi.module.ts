import { Module } from '@nestjs/common';
import { RasppiService } from './rasppi.service';
import { RasppiController } from './rasppi.controller';

@Module({
  providers: [RasppiService],
  controllers: [RasppiController]
})
export class RasppiModule {}
