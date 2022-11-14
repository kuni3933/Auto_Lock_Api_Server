import { Controller, Get } from '@nestjs/common';
import { V1Service } from './v1.service';
@Controller('v1')
export class V1Controller {
  constructor(private readonly v1Service: V1Service) {}

  @Get()
  findAll() {
    return this.v1Service.getHello();
  }
}
